import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Sport } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const algorithm = searchParams.get('algorithm') || 'hot' // hot, rising, top, new
    const sportParam = searchParams.get('sport') // NFL, NBA, etc, or 'ALL'
    const period = searchParams.get('period') || 'week' // today, week, month, all
    const limit = parseInt(searchParams.get('limit') || '20')

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

    // Fetch picks with engagement data
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
            picks: {
              where: {
                status: { in: ['WON', 'LOST'] }
              },
              select: {
                status: true,
              },
            },
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

    // Calculate win rate for each user
    const picksWithStats = picks.map((pick) => {
      const settledPicks = pick.user.picks.filter(p => p.status === 'WON' || p.status === 'LOST')
      const wonPicks = settledPicks.filter(p => p.status === 'WON').length
      const winRate = settledPicks.length > 0 ? (wonPicks / settledPicks.length) * 100 : 0

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
          winRate: Math.round(winRate),
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
    const result = rankedPicks.slice(0, limit).map(({ totalEngagement, ageInHours, ...pick }) => pick)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching trending picks:', error)
    return NextResponse.json({ error: 'Failed to fetch trending picks' }, { status: 500 })
  }
}
