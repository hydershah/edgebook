import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrSetCache, CacheKeys } from '@/lib/cache'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Cache for 5 minutes (trending data changes frequently but not every second)
    const trendingSports = await getOrSetCache(
      CacheKeys.trendingSports(),
      300,
      async () => {
        // Get date ranges for current and previous periods (last 7 days vs previous 7 days)
        const now = new Date()
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const previous14Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

        // Use groupBy for efficient aggregation (runs on database, not in memory)
        const [recentSports, previousSports] = await Promise.all([
          // Get picks count by sport for the last 7 days
          prisma.pick.groupBy({
            by: ['sport'],
            where: {
              createdAt: {
                gte: last7Days,
              },
            },
            _count: {
              sport: true,
            },
          }),
          // Get picks count by sport for the previous 7 days (8-14 days ago)
          prisma.pick.groupBy({
            by: ['sport'],
            where: {
              createdAt: {
                gte: previous14Days,
                lt: last7Days,
              },
            },
            _count: {
              sport: true,
            },
          }),
        ])

        // Create maps for quick lookup
        const recentCounts = new Map(
          recentSports.map((item) => [item.sport, item._count.sport])
        )
        const previousCounts = new Map(
          previousSports.map((item) => [item.sport, item._count.sport])
        )

        // Calculate trending sports with percentage change
        const sports = Array.from(recentCounts.entries())
          .map(([sport, recentCount]) => {
            const previousCount = previousCounts.get(sport) || 0
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

        return sports
      }
    )

    return NextResponse.json(trendingSports)
  } catch (error) {
    console.error('Error fetching trending sports:', error)
    return NextResponse.json({ error: 'Failed to fetch trending sports' }, { status: 500 })
  }
}
