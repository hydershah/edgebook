import { prisma } from '@/lib/prisma'
import { PickStatus, Sport } from '@prisma/client'

interface SportPerformance {
  sport: Sport
  totalPicks: number
  won: number
  lost: number
  push: number
  winRate: number
}

export async function getDashboardStats(userId: string) {
  const [
    totalPicks,
    statusCounts,
    paidPicksStats,
    freePicksStats,
    unitBreakdown,
    revenueAgg,
    purchaseCount,
    viewsCount,
    followerCount,
    followingCount
  ] = await Promise.all([
    // Total picks
    prisma.pick.count({ where: { userId } }),

    // Status breakdown
    prisma.pick.groupBy({
      by: ['status'],
      _count: { _all: true },
      where: { userId },
    }),

    // Paid picks performance
    prisma.pick.groupBy({
      by: ['status'],
      _count: { _all: true },
      where: {
        userId,
        isPremium: true
      },
    }),

    // Free picks performance
    prisma.pick.groupBy({
      by: ['status'],
      _count: { _all: true },
      where: {
        userId,
        isPremium: false
      },
    }),

    // Units/confidence breakdown
    prisma.pick.groupBy({
      by: ['confidence', 'status'],
      _count: { _all: true },
      where: { userId },
    }),

    // Revenue stats
    prisma.purchase.aggregate({
      _sum: { amount: true, platformFee: true },
      where: { pick: { userId } },
    }),

    // Purchase count
    prisma.purchase.count({
      where: { pick: { userId } },
    }),

    // Total views
    prisma.pick.aggregate({
      _sum: { viewCount: true },
      where: { userId },
    }),

    // Followers
    prisma.follow.count({ where: { followingId: userId } }),

    // Following
    prisma.follow.count({ where: { followerId: userId } }),
  ])

  // Calculate overall stats
  const won = statusCounts.find((item) => item.status === PickStatus.WON)?._count._all ?? 0
  const lost = statusCounts.find((item) => item.status === PickStatus.LOST)?._count._all ?? 0
  const push = statusCounts.find((item) => item.status === PickStatus.PUSH)?._count._all ?? 0
  const pending = statusCounts.find((item) => item.status === PickStatus.PENDING)?._count._all ?? 0
  const settled = won + lost
  const winRate = settled > 0 ? Math.round((won / settled) * 100) : 0

  // Calculate paid picks stats
  const paidWon = paidPicksStats.find((item) => item.status === PickStatus.WON)?._count._all ?? 0
  const paidLost = paidPicksStats.find((item) => item.status === PickStatus.LOST)?._count._all ?? 0
  const paidSettled = paidWon + paidLost
  const paidWinRate = paidSettled > 0 ? Math.round((paidWon / paidSettled) * 100) : 0
  const paidTotal = paidPicksStats.reduce((sum, item) => sum + item._count._all, 0)

  // Calculate free picks stats
  const freeWon = freePicksStats.find((item) => item.status === PickStatus.WON)?._count._all ?? 0
  const freeLost = freePicksStats.find((item) => item.status === PickStatus.LOST)?._count._all ?? 0
  const freeSettled = freeWon + freeLost
  const freeWinRate = freeSettled > 0 ? Math.round((freeWon / freeSettled) * 100) : 0
  const freeTotal = freePicksStats.reduce((sum, item) => sum + item._count._all, 0)

  // Calculate units breakdown
  const unitsData = [1, 2, 3, 4, 5].map((unit) => {
    const unitPicks = unitBreakdown.filter((item) => item.confidence === unit)
    const unitWon = unitPicks.find((item) => item.status === PickStatus.WON)?._count._all ?? 0
    const unitLost = unitPicks.find((item) => item.status === PickStatus.LOST)?._count._all ?? 0
    const unitTotal = unitPicks.reduce((sum, item) => sum + item._count._all, 0)
    const unitSettled = unitWon + unitLost
    const unitWinRate = unitSettled > 0 ? Math.round((unitWon / unitSettled) * 100) : 0

    return {
      units: unit,
      total: unitTotal,
      won: unitWon,
      lost: unitLost,
      settled: unitSettled,
      winRate: unitWinRate,
    }
  })

  // Calculate revenue
  const totalRevenue = Number(revenueAgg._sum.amount ?? 0)
  const platformFees = Number(revenueAgg._sum.platformFee ?? 0)
  const netRevenue = totalRevenue - platformFees
  const totalViews = Number(viewsCount._sum.viewCount ?? 0)

  return {
    overview: {
      totalPicks,
      won,
      lost,
      push,
      pending,
      settled,
      winRate,
      totalRevenue,
      platformFees,
      netRevenue,
      totalSales: purchaseCount,
      totalViews,
      followers: followerCount,
      following: followingCount,
    },
    paidVsFree: {
      paid: {
        total: paidTotal,
        won: paidWon,
        lost: paidLost,
        settled: paidSettled,
        winRate: paidWinRate,
      },
      free: {
        total: freeTotal,
        won: freeWon,
        lost: freeLost,
        settled: freeSettled,
        winRate: freeWinRate,
      },
    },
    unitBreakdown: unitsData.filter(u => u.total > 0),
  }
}

export async function getUserProfile(userId: string, viewerId?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      bio: true,
      avatar: true,
      instagram: true,
      facebook: true,
      youtube: true,
      twitter: true,
      tiktok: true,
      website: true,
      isPremium: true,
      createdAt: true,
      subscriptionPrice: true,
      subscriptionEnabled: true,
      isVerified: true,
    },
  })

  if (!user) {
    return null
  }

  const [statusCounts, sportCounts, totalPicks, revenueAgg, spendingAgg, followerCount, followingCount, recentPicks, recentTransactions, isFollowing, isSubscribed, subscriberCount, activeSubscriberCount] =
    await Promise.all([
      prisma.pick.groupBy({
        by: ['status'],
        _count: { _all: true },
        where: { userId },
      }),
      prisma.pick.groupBy({
        by: ['sport', 'status'],
        _count: { _all: true },
        where: { userId },
      }),
      prisma.pick.count({ where: { userId } }),
      prisma.purchase.aggregate({
        _sum: { amount: true, platformFee: true },
        where: { pick: { userId } },
      }),
      prisma.purchase.aggregate({
        _sum: { amount: true },
        where: { userId },
      }),
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.follow.count({ where: { followerId: userId } }),
      prisma.pick.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      viewerId
        ? prisma.follow.findFirst({
            where: {
              followerId: viewerId,
              followingId: userId,
            },
            select: { id: true },
          })
        : null,
      viewerId
        ? prisma.subscription.findFirst({
            where: {
              subscriberId: viewerId,
              creatorId: userId,
              status: 'ACTIVE',
            },
            select: { id: true },
          })
        : null,
      prisma.subscription.count({
        where: { creatorId: userId },
      }),
      prisma.subscription.count({
        where: {
          creatorId: userId,
          status: 'ACTIVE',
        },
      }),
    ])

  const won = statusCounts.find((item) => item.status === PickStatus.WON)?._count._all ?? 0
  const lost = statusCounts.find((item) => item.status === PickStatus.LOST)?._count._all ?? 0
  const push = statusCounts.find((item) => item.status === PickStatus.PUSH)?._count._all ?? 0
  const settled = won + lost
  const accuracy = settled > 0 ? Math.round((won / settled) * 100) : 0

  const performanceBySport = sportCounts.reduce<SportPerformance[]>((acc, item) => {
    let sportEntry = acc.find((entry) => entry.sport === item.sport)
    if (!sportEntry) {
      sportEntry = {
        sport: item.sport,
        totalPicks: 0,
        won: 0,
        lost: 0,
        push: 0,
        winRate: 0,
      }
      acc.push(sportEntry)
    }

    sportEntry.totalPicks += item._count._all
    if (item.status === PickStatus.WON) {
      sportEntry.won += item._count._all
    }
    if (item.status === PickStatus.LOST) {
      sportEntry.lost += item._count._all
    }
    if (item.status === PickStatus.PUSH) {
      sportEntry.push += item._count._all
    }

    const settledForSport = sportEntry.won + sportEntry.lost
    sportEntry.winRate = settledForSport > 0 ? Math.round((sportEntry.won / settledForSport) * 100) : 0

    return acc
  }, [])

  performanceBySport.sort((a, b) => b.totalPicks - a.totalPicks)

  const earnings = Number(revenueAgg._sum.amount ?? 0)
  const platformFees = Number(revenueAgg._sum.platformFee ?? 0)
  const spending = Number(spendingAgg._sum.amount ?? 0)
  const netRevenue = earnings - platformFees

  return {
    user: {
      ...user,
      createdAt: user.createdAt.toISOString(),
    },
    stats: {
      totalPicks,
      won,
      lost,
      push,
      settled,
      accuracy,
      winLossRecord: `${won}-${lost}${push > 0 ? `-${push}` : ''}`,
    },
    performanceBySport,
    earnings: {
      totalRevenue: earnings,
      platformFees,
      netRevenue,
      totalSpending: spending,
    },
    socialLinks: {
      instagram: user.instagram,
      facebook: user.facebook,
      youtube: user.youtube,
      twitter: user.twitter,
      tiktok: user.tiktok,
      website: user.website,
    },
    followers: followerCount,
    following: followingCount,
    subscribers: activeSubscriberCount,
    totalSubscribers: subscriberCount,
    recentPicks: recentPicks.map((pick) => ({
      ...pick,
      createdAt: pick.createdAt.toISOString(),
      gameDate: pick.gameDate.toISOString(),
      lockedAt: pick.lockedAt?.toISOString() ?? null,
    })),
    transactions: recentTransactions.map((txn) => ({
      ...txn,
      createdAt: txn.createdAt.toISOString(),
    })),
    viewer: {
      isFollowing: Boolean(isFollowing),
      isSubscribed: Boolean(isSubscribed),
    },
  }
}
