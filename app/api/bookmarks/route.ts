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

    // Fetch purchases for premium content protection
    const premiumPickIds = bookmarks
      .filter(b => b.pick.isPremium)
      .map(b => b.pick.id)

    const purchasedPickIds = new Set<string>()
    if (premiumPickIds.length > 0) {
      const purchases = await prisma.purchase.findMany({
        where: {
          userId: session.user.id,
          pickId: { in: premiumPickIds },
        },
        select: { pickId: true },
      })
      purchases.forEach(p => purchasedPickIds.add(p.pickId))
    }

    // Transform the data to match the format expected by PickCard
    const picks = bookmarks.map((bookmark) => {
      const pick = bookmark.pick
      const userLike = pick.likes[0]
      const isBookmarked = pick.bookmarks.length > 0
      const isOwner = session.user.id === pick.userId
      const hasPurchased = purchasedPickIds.has(pick.id)

      // SECURITY: Completely hide content for premium picks that haven't been purchased
      const shouldHideContent = pick.isPremium && !isOwner && !hasPurchased

      return {
        id: pick.id,
        user: pick.user,
        pickType: pick.pickType,
        sport: pick.sport,
        matchup: pick.matchup,
        details: shouldHideContent ? '' : pick.details,
        odds: shouldHideContent ? null : pick.odds,
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
          isUnlocked: hasPurchased,
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
