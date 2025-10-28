import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { pickIds } = await request.json()

    if (!Array.isArray(pickIds) || pickIds.length === 0) {
      return NextResponse.json({ error: 'Invalid pickIds' }, { status: 400 })
    }

    // Get stats for all picks
    const [likes, comments, picks, unlocks, userLikes, userBookmarks, userPurchases] = await Promise.all([
      // Get like counts grouped by pickId
      prisma.like.groupBy({
        by: ['pickId'],
        where: { pickId: { in: pickIds } },
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
      // Get user's likes
      session?.user?.id
        ? prisma.like.findMany({
            where: { userId: session.user.id, pickId: { in: pickIds } },
            select: { pickId: true },
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

    // Create maps for quick lookup
    const likeMap = new Map(likes.map((l) => [l.pickId, l._count]))
    const commentMap = new Map(comments.map((c) => [c.pickId, c._count]))
    const viewMap = new Map(picks.map((p) => [p.id, p.viewCount]))
    const unlockMap = new Map(unlocks.map((u) => [u.pickId, u._count]))
    const userLikeSet = new Set(userLikes.map((l) => l.pickId))
    const userBookmarkSet = new Set(userBookmarks.map((b) => b.pickId))
    const userPurchaseSet = new Set(userPurchases.map((p) => p.pickId))

    // Build response object
    const stats = pickIds.reduce((acc, pickId) => {
      acc[pickId] = {
        likes: likeMap.get(pickId) || 0,
        comments: commentMap.get(pickId) || 0,
        views: viewMap.get(pickId) || 0,
        unlocks: unlockMap.get(pickId) || 0,
        isLiked: userLikeSet.has(pickId),
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
