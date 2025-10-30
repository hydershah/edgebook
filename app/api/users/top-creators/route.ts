import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrSetCache, CacheKeys } from '@/lib/cache'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Cache for 1 hour (win rates change slowly)
    const topCreators = await getOrSetCache(
      CacheKeys.topCreators(),
      3600,
      async () => {
        // Use SQL aggregation instead of loading all picks into memory
        const usersWithStats = await prisma.$queryRaw<
          Array<{
            id: string
            name: string | null
            avatar: string | null
            wonPicks: bigint
            totalGradedPicks: bigint
            followerCount: bigint
          }>
        >`
          SELECT
            u.id,
            u.name,
            u.avatar,
            COUNT(CASE WHEN p.status = 'WON' THEN 1 END) as wonPicks,
            COUNT(*) as totalGradedPicks,
            (SELECT COUNT(*) FROM "Follow" f WHERE f."followingId" = u.id) as followerCount
          FROM "User" u
          INNER JOIN "Pick" p ON p."userId" = u.id
          WHERE p.status IN ('WON', 'LOST')
          GROUP BY u.id, u.name, u.avatar
          HAVING COUNT(*) >= 3
          ORDER BY
            (COUNT(CASE WHEN p.status = 'WON' THEN 1 END)::float / COUNT(*)::float) DESC,
            (SELECT COUNT(*) FROM "Follow" f WHERE f."followingId" = u.id) DESC
          LIMIT 3
        `

        // Transform the results
        return usersWithStats.map((user) => {
          const wonPicks = Number(user.wonPicks)
          const totalGradedPicks = Number(user.totalGradedPicks)
          const winRate = (wonPicks / totalGradedPicks) * 100

          return {
            id: user.id,
            name: user.name || 'Anonymous',
            avatar: user.avatar,
            winRate: Math.round(winRate),
            followerCount: Number(user.followerCount),
            pickCount: totalGradedPicks,
          }
        })
      }
    )

    return NextResponse.json(topCreators)
  } catch (error) {
    console.error('Error fetching top creators:', error)
    return NextResponse.json({ error: 'Failed to fetch top creators' }, { status: 500 })
  }
}
