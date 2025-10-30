import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get users with at least 5 picks
    const users = await prisma.user.findMany({
      where: {
        picks: {
          some: {},
        },
      },
      include: {
        picks: {
          select: {
            status: true,
            confidence: true,
          },
        },
        _count: {
          select: {
            picks: true,
          },
        },
      },
    })

    // Calculate stats for each user
    const usersWithStats = users
      .filter((user) => user._count.picks >= 5)
      .map((user) => {
        const totalPicks = user._count.picks
        const wonPicks = user.picks.filter((p) => p.status === 'WON').length
        const lostPicks = user.picks.filter((p) => p.status === 'LOST').length
        const settledPicks = wonPicks + lostPicks

        const winRate = settledPicks > 0 ? (wonPicks / settledPicks) * 100 : 0

        // Simple ROI calculation (can be enhanced)
        const roi = settledPicks > 0 ? ((wonPicks - lostPicks) / settledPicks) * 100 : 0

        return {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          stats: {
            totalPicks,
            winRate: Math.round(winRate),
            roi: Math.round(roi),
          },
        }
      })
      .sort((a, b) => b.stats.winRate - a.stats.winRate)
      .slice(0, 10)

    return NextResponse.json(usersWithStats)
  } catch (error) {
    console.error('Error fetching trending users:', error)
    return NextResponse.json({ error: 'Failed to fetch trending users' }, { status: 500 })
  }
}
