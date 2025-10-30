import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get date ranges for current and previous periods (last 7 days vs previous 7 days)
    const now = new Date()
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const previous14Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    // Get picks for the last 7 days
    const recentPicks = await prisma.pick.findMany({
      where: {
        createdAt: {
          gte: last7Days,
        },
      },
      select: {
        sport: true,
      },
    })

    // Get picks for the previous 7 days (8-14 days ago)
    const previousPicks = await prisma.pick.findMany({
      where: {
        createdAt: {
          gte: previous14Days,
          lt: last7Days,
        },
      },
      select: {
        sport: true,
      },
    })

    // Count picks by sport for recent period
    const recentCounts: Record<string, number> = {}
    recentPicks.forEach((pick) => {
      recentCounts[pick.sport] = (recentCounts[pick.sport] || 0) + 1
    })

    // Count picks by sport for previous period
    const previousCounts: Record<string, number> = {}
    previousPicks.forEach((pick) => {
      previousCounts[pick.sport] = (previousCounts[pick.sport] || 0) + 1
    })

    // Calculate trending sports with percentage change
    const trendingSports = Object.entries(recentCounts)
      .map(([sport, recentCount]) => {
        const previousCount = previousCounts[sport] || 0
        let trend = 0

        if (previousCount > 0) {
          trend = Math.round(((recentCount - previousCount) / previousCount) * 100)
        } else if (recentCount > 0) {
          trend = 100 // If there were no picks before, show 100% growth
        }

        return {
          sport,
          picks: recentCount,
          trend: trend > 0 ? `+${trend}%` : `${trend}%`,
          trendValue: trend,
        }
      })
      .sort((a, b) => b.picks - a.picks) // Sort by number of picks
      .slice(0, 4) // Top 4 sports

    return NextResponse.json(trendingSports)
  } catch (error) {
    console.error('Error fetching trending sports:', error)
    return NextResponse.json({ error: 'Failed to fetch trending sports' }, { status: 500 })
  }
}
