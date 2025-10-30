import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get users with at least 3 graded picks
    const users = await prisma.user.findMany({
      where: {
        picks: {
          some: {
            status: {
              in: ['WON', 'LOST'],
            },
          },
        },
      },
      include: {
        picks: {
          where: {
            status: {
              in: ['WON', 'LOST'],
            },
          },
          select: {
            status: true,
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: 50, // Get top 50 to filter and sort
    })

    // Calculate stats for each user
    const usersWithStats = users
      .filter((user) => user.picks.length >= 3) // At least 3 graded picks
      .map((user) => {
        const wonPicks = user.picks.filter((p) => p.status === 'WON').length
        const totalGradedPicks = user.picks.length
        const winRate = (wonPicks / totalGradedPicks) * 100

        return {
          id: user.id,
          name: user.name || 'Anonymous',
          avatar: user.avatar,
          winRate: Math.round(winRate),
          followerCount: user._count.followers,
          pickCount: totalGradedPicks,
        }
      })
      .sort((a, b) => {
        // Sort by win rate first, then by follower count as tiebreaker
        if (b.winRate !== a.winRate) {
          return b.winRate - a.winRate
        }
        return b.followerCount - a.followerCount
      })
      .slice(0, 3) // Top 3 creators

    return NextResponse.json(usersWithStats)
  } catch (error) {
    console.error('Error fetching top creators:', error)
    return NextResponse.json({ error: 'Failed to fetch top creators' }, { status: 500 })
  }
}
