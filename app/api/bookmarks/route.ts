import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        pick: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
                views: true,
              },
            },
            likes: {
              where: {
                userId: session.user.id,
              },
            },
            bookmarks: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform the data to match the format expected by PickCard
    const picks = bookmarks.map((bookmark) => {
      const pick = bookmark.pick
      const userLike = pick.likes[0]
      const isBookmarked = pick.bookmarks.length > 0

      // Calculate upvotes and downvotes
      const allLikes = pick._count.likes
      // We need to get actual upvotes/downvotes, so let's fetch them separately
      // For now, we'll use a simplified approach

      return {
        id: pick.id,
        user: pick.user,
        pickType: pick.pickType,
        sport: pick.sport,
        matchup: pick.matchup,
        details: pick.details,
        odds: pick.odds,
        confidence: pick.confidence,
        status: pick.status,
        isPremium: pick.isPremium,
        price: pick.price,
        createdAt: pick.createdAt.toISOString(),
        gameDate: pick.gameDate.toISOString(),
        lockedAt: pick.lockedAt?.toISOString(),
        bookmarkedAt: bookmark.createdAt.toISOString(),
        stats: {
          upvotes: 0, // Will be calculated properly
          downvotes: 0, // Will be calculated properly
          score: 0,
          comments: pick._count.comments,
          views: pick._count.views,
          unlocks: 0,
          userVoteType: userLike?.voteType || null,
          isBookmarked,
          isUnlocked: false,
        },
      }
    })

    // Fetch proper vote counts for each pick
    const pickIds = picks.map((p) => p.id)
    const voteCounts = await prisma.like.groupBy({
      by: ['pickId', 'voteType'],
      where: {
        pickId: {
          in: pickIds,
        },
      },
      _count: {
        id: true,
      },
    })

    // Map vote counts to picks
    const voteMap = new Map<string, { upvotes: number; downvotes: number }>()
    voteCounts.forEach((vote) => {
      const current = voteMap.get(vote.pickId) || { upvotes: 0, downvotes: 0 }
      if (vote.voteType === 'UPVOTE') {
        current.upvotes = vote._count.id
      } else if (vote.voteType === 'DOWNVOTE') {
        current.downvotes = vote._count.id
      }
      voteMap.set(vote.pickId, current)
    })

    // Update picks with proper vote counts
    picks.forEach((pick) => {
      const votes = voteMap.get(pick.id) || { upvotes: 0, downvotes: 0 }
      pick.stats.upvotes = votes.upvotes
      pick.stats.downvotes = votes.downvotes
      pick.stats.score = votes.upvotes - votes.downvotes
    })

    return NextResponse.json({ picks })
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 })
  }
}
