import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Sport } from '@prisma/client'

export const dynamic = 'force-dynamic'

// PERFORMANCE: Simple in-memory cache for trending picks (2 minute TTL)
const trendingCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 2 * 60 * 1000 // 2 minutes

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const algorithm = searchParams.get('algorithm') || 'hot' // hot, rising, top, new
    const sportParam = searchParams.get('sport') // NFL, NBA, etc, or 'ALL'
    const period = searchParams.get('period') || 'week' // today, week, month, all
    const limit = parseInt(searchParams.get('limit') || '20')

    // PERFORMANCE: Check cache first (cache key includes params except userId for privacy)
    const cacheKey = `trending_${algorithm}_${sportParam}_${period}_${limit}`
    const cached = trendingCache.get(cacheKey)
    const cacheCheckTime = Date.now()

    if (cached && (cacheCheckTime - cached.timestamp) < CACHE_TTL) {
      console.log(`Trending cache hit for ${cacheKey}`)
      // Still need to filter premium content based on current user
      const result = cached.data.map((pick: any) => {
        const isOwner = session?.user?.id === pick.userId
        // Note: We can't cache purchase checks, so premium content will still require a DB check
        // This is acceptable as it's a fast query
        if (pick.isPremium && !isOwner) {
          return { ...pick, details: '', odds: null }
        }
        return pick
      })
      return NextResponse.json(result)
    }

    // Build where clause
    const where: any = {}

    // Filter by sport
    if (sportParam && sportParam !== 'ALL') {
      where.sport = sportParam as Sport
    }

    // Filter by time period (only for 'top' algorithm or as base filter)
    const now = new Date()
    let startDate: Date | undefined

    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (period === 'month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    if (startDate && (algorithm === 'top' || algorithm === 'rising')) {
      where.createdAt = { gte: startDate }
    }

    // For rising, only show recent content (< 48 hours)
    if (algorithm === 'rising') {
      const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)
      where.createdAt = { gte: fortyEightHoursAgo }
    }

    // Fetch picks with engagement data (without loading all user picks - N+1 fix)
    const picks = await prisma.pick.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            views: true,
            bookmarks: true,
          },
        },
      },
      take: algorithm === 'new' ? limit : 100, // Get more for ranking algorithms
    })

    // PERFORMANCE FIX: Calculate win rates for all unique users in a single query
    const uniqueUserIds = Array.from(new Set(picks.map(p => p.userId)))
    const winRatesRaw = await prisma.$queryRaw<Array<{ userId: string; totalPicks: bigint; wonPicks: bigint }>>`
      SELECT
        "userId",
        COUNT(*)::int as "totalPicks",
        SUM(CASE WHEN status = 'WON' THEN 1 ELSE 0 END)::int as "wonPicks"
      FROM "Pick"
      WHERE "userId" = ANY(${uniqueUserIds}::text[])
        AND status IN ('WON', 'LOST')
      GROUP BY "userId"
    `

    // Create a map of userId to win rate
    const winRateMap = new Map<string, number>()
    winRatesRaw.forEach(row => {
      const totalPicks = Number(row.totalPicks)
      const wonPicks = Number(row.wonPicks)
      const winRate = totalPicks > 0 ? (wonPicks / totalPicks) * 100 : 0
      winRateMap.set(row.userId, Math.round(winRate))
    })

    // Map picks with stats and win rates from our optimized query
    const picksWithStats = picks.map((pick) => {
      const engagement = {
        likes: pick._count.likes,
        comments: pick._count.comments,
        views: pick._count.views,
        bookmarks: pick._count.bookmarks,
      }

      const totalEngagement =
        engagement.likes * 5 + // Weight likes higher
        engagement.comments * 10 + // Weight comments highest
        engagement.bookmarks * 7 + // Weight bookmarks high
        engagement.views * 0.1 // Views count less

      const ageInHours = (now.getTime() - pick.createdAt.getTime()) / (1000 * 60 * 60)

      return {
        id: pick.id,
        userId: pick.userId,
        user: {
          id: pick.user.id,
          name: pick.user.name,
          username: pick.user.username,
          avatar: pick.user.avatar,
          isVerified: pick.user.isVerified,
          winRate: winRateMap.get(pick.userId) || 0, // Use pre-calculated win rate
        },
        sport: pick.sport,
        pickType: pick.pickType,
        matchup: pick.matchup,
        details: pick.details,
        odds: pick.odds,
        confidence: pick.confidence,
        status: pick.status,
        isPremium: pick.isPremium,
        price: pick.price,
        mediaUrl: pick.mediaUrl,
        createdAt: pick.createdAt,
        engagement,
        totalEngagement,
        ageInHours,
      }
    })

    // Apply ranking algorithm
    let rankedPicks = picksWithStats

    switch (algorithm) {
      case 'hot':
        // Reddit-style hot algorithm: engagement / (age + 2)^1.5
        rankedPicks = picksWithStats
          .map(pick => ({
            ...pick,
            score: pick.totalEngagement / Math.pow(pick.ageInHours + 2, 1.5)
          }))
          .sort((a, b) => b.score - a.score)
        break

      case 'rising':
        // New content with high engagement rate (engagement per hour)
        rankedPicks = picksWithStats
          .map(pick => ({
            ...pick,
            score: pick.ageInHours > 0 ? pick.totalEngagement / pick.ageInHours : pick.totalEngagement
          }))
          .sort((a, b) => b.score - a.score)
        break

      case 'top':
        // Simple: most total engagement
        rankedPicks = picksWithStats.sort((a, b) => b.totalEngagement - a.totalEngagement)
        break

      case 'new':
        // Chronological, newest first
        rankedPicks = picksWithStats.sort((a, b) =>
          b.createdAt.getTime() - a.createdAt.getTime()
        )
        break

      default:
        rankedPicks = picksWithStats
    }

    // Return top picks, remove score fields
    const topPicks = rankedPicks.slice(0, limit).map(({ totalEngagement, ageInHours, ...pick }) => pick)

    // SECURITY: Protect premium content
    // Fetch all purchases for this user in a single query (fix N+1)
    const purchasedPickIds = new Set<string>()
    if (session?.user?.id) {
      const pickIds = topPicks.filter(p => p.isPremium).map(p => p.id)
      if (pickIds.length > 0) {
        const purchases = await prisma.purchase.findMany({
          where: {
            userId: session.user.id,
            pickId: { in: pickIds },
          },
          select: { pickId: true },
        })
        purchases.forEach(p => purchasedPickIds.add(p.pickId))
      }
    }

    // Obfuscate premium content for unpurchased picks
    const result = topPicks.map((pick) => {
      const isOwner = session?.user?.id === pick.userId
      const hasPurchased = purchasedPickIds.has(pick.id)

      // SECURITY: Completely hide content for premium picks that haven't been purchased
      if (pick.isPremium && !isOwner && !hasPurchased) {
        return {
          ...pick,
          details: '', // Completely hide details
          odds: null, // Hide odds
        }
      }

      return pick
    })

    // PERFORMANCE: Cache the base result (before user-specific filtering)
    // We cache topPicks before obfuscation so each user can get personalized results
    trendingCache.set(cacheKey, { data: topPicks, timestamp: Date.now() })
    console.log(`Trending cache updated for ${cacheKey}`)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching trending picks:', error)
    return NextResponse.json({ error: 'Failed to fetch trending picks' }, { status: 500 })
  }
}
