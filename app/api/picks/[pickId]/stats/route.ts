import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PERFORMANCE: Aggressive caching for stats (30 second TTL)
const statsCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 30 * 1000 // 30 seconds

export async function GET(
  request: NextRequest,
  { params }: { params: { pickId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { pickId } = params

    // PERFORMANCE: Check cache for base stats (non-user-specific data)
    const cacheKey = `stats_${pickId}`
    const cached = statsCache.get(cacheKey)
    const now = Date.now()

    let baseStats: any

    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      // Use cached base stats
      baseStats = cached.data
    } else {
      // Fetch base stats (not user-specific)
      const [upvoteCount, downvoteCount, commentCount, viewCount, unlockCount] = await Promise.all([
        prisma.like.count({ where: { pickId, voteType: 'UPVOTE' } }),
        prisma.like.count({ where: { pickId, voteType: 'DOWNVOTE' } }),
        prisma.comment.count({ where: { pickId } }),
        prisma.pick.findUnique({ where: { id: pickId }, select: { viewCount: true } }),
        prisma.purchase.count({ where: { pickId } }),
      ])

      baseStats = {
        upvotes: upvoteCount,
        downvotes: downvoteCount,
        score: upvoteCount - downvoteCount,
        comments: commentCount,
        views: viewCount?.viewCount || 0,
        unlocks: unlockCount,
      }

      // Cache base stats
      statsCache.set(cacheKey, { data: baseStats, timestamp: now })
    }

    // Fetch user-specific data if logged in (can't cache this)
    let userVote = null
    let isBookmarked = false
    let isUnlocked = false

    if (session?.user?.id) {
      const [vote, bookmark, purchase] = await Promise.all([
        prisma.like.findUnique({
          where: { userId_pickId: { userId: session.user.id, pickId } },
        }),
        prisma.bookmark.findUnique({
          where: { userId_pickId: { userId: session.user.id, pickId } },
        }),
        prisma.purchase.findUnique({
          where: { userId_pickId: { userId: session.user.id, pickId } },
        }),
      ])
      userVote = vote
      isBookmarked = !!bookmark
      isUnlocked = !!purchase
    }

    return NextResponse.json({
      ...baseStats,
      userVoteType: userVote?.voteType || null,
      isBookmarked,
      isUnlocked,
    })
  } catch (error) {
    console.error('Error fetching pick stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
