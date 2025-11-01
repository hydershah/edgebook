import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cache, CacheKeys } from '@/lib/cache'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Parse request body with error handling
    let body
    let pickIds: string[]

    try {
      const text = await request.text()
      if (!text || text.trim() === '') {
        console.error('Empty request body received')
        return NextResponse.json({ error: 'Request body is empty' }, { status: 400 })
      }
      body = JSON.parse(text)
      pickIds = body.pickIds
    } catch (error) {
      console.error('Error parsing request body:', error)
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    if (!Array.isArray(pickIds) || pickIds.length === 0) {
      console.error('Invalid pickIds:', pickIds)
      return NextResponse.json({ error: 'Invalid pickIds array' }, { status: 400 })
    }

    // Limit batch size to prevent abuse
    if (pickIds.length > 100) {
      return NextResponse.json({ error: 'Too many pickIds. Maximum 100 allowed.' }, { status: 400 })
    }

    // Try to get cached aggregated stats (non-user-specific)
    const cacheKey = CacheKeys.pickStatsMany(pickIds)
    let aggregatedStats = cache.get<{
      upvotes: Array<{ pickId: string; _count: number }>
      downvotes: Array<{ pickId: string; _count: number }>
      comments: Array<{ pickId: string; _count: number }>
      picks: Array<{ id: string; viewCount: number }>
      unlocks: Array<{ pickId: string; _count: number }>
    }>(cacheKey)

    if (!aggregatedStats) {
      // Cache miss - fetch aggregated stats
      const [upvotes, downvotes, comments, picks, unlocks] = await Promise.all([
        // Get upvote counts grouped by pickId
        prisma.like.groupBy({
          by: ['pickId'],
          where: { pickId: { in: pickIds }, voteType: 'UPVOTE' },
          _count: true,
        }),
        // Get downvote counts grouped by pickId
        prisma.like.groupBy({
          by: ['pickId'],
          where: { pickId: { in: pickIds }, voteType: 'DOWNVOTE' },
          _count: true,
        }),
        // Get comment counts grouped by pickId
        prisma.comment.groupBy({
          by: ['pickId'],
          where: { pickId: { in: pickIds } },
          _count: true,
        }),
        // Get view counts from picks
        prisma.pick.findMany({
          where: { id: { in: pickIds } },
          select: { id: true, viewCount: true },
        }),
        // Get unlock counts grouped by pickId
        prisma.purchase.groupBy({
          by: ['pickId'],
          where: { pickId: { in: pickIds } },
          _count: true,
        }),
      ])

      aggregatedStats = { upvotes, downvotes, comments, picks, unlocks }

      // Cache for 2 minutes (stats change but not every second)
      cache.set(cacheKey, aggregatedStats, 120)
    }

    // Always fetch user-specific data fresh (can't be cached globally)
    const [userVotes, userBookmarks, userPurchases] = await Promise.all([
      // Get user's votes
      session?.user?.id
        ? prisma.like.findMany({
            where: { userId: session.user.id, pickId: { in: pickIds } },
            select: { pickId: true, voteType: true },
          })
        : [],
      // Get user's bookmarks
      session?.user?.id
        ? prisma.bookmark.findMany({
            where: { userId: session.user.id, pickId: { in: pickIds } },
            select: { pickId: true },
          })
        : [],
      // Get user's purchases
      session?.user?.id
        ? prisma.purchase.findMany({
            where: { userId: session.user.id, pickId: { in: pickIds } },
            select: { pickId: true },
          })
        : [],
    ])

    const { upvotes, downvotes, comments, picks, unlocks } = aggregatedStats

    // Create maps for quick lookup
    const upvoteMap = new Map(upvotes.map((l) => [l.pickId, l._count]))
    const downvoteMap = new Map(downvotes.map((l) => [l.pickId, l._count]))
    const commentMap = new Map(comments.map((c) => [c.pickId, c._count]))
    const viewMap = new Map(picks.map((p) => [p.id, p.viewCount]))
    const unlockMap = new Map(unlocks.map((u) => [u.pickId, u._count]))
    const userVoteMap = new Map(userVotes.map((v) => [v.pickId, v.voteType]))
    const userBookmarkSet = new Set(userBookmarks.map((b) => b.pickId))
    const userPurchaseSet = new Set(userPurchases.map((p) => p.pickId))

    // Build response object
    const stats = pickIds.reduce((acc, pickId) => {
      const upvoteCount = upvoteMap.get(pickId) || 0
      const downvoteCount = downvoteMap.get(pickId) || 0
      acc[pickId] = {
        upvotes: upvoteCount,
        downvotes: downvoteCount,
        score: upvoteCount - downvoteCount,
        comments: commentMap.get(pickId) || 0,
        views: viewMap.get(pickId) || 0,
        unlocks: unlockMap.get(pickId) || 0,
        userVoteType: userVoteMap.get(pickId) || null,
        isBookmarked: userBookmarkSet.has(pickId),
        isUnlocked: userPurchaseSet.has(pickId),
      }
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching bulk stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
