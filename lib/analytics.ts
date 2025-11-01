import { prisma } from '@/lib/prisma'
import { PickStatus, PickType } from '@prisma/client'

export interface TimeFrame {
  start: Date
  end: Date
  label: string
}

export function getTimeFrame(period: '7d' | '30d' | '3mo' | '1yr' | 'all'): TimeFrame {
  const end = new Date()
  let start = new Date()

  switch (period) {
    case '7d':
      start.setDate(end.getDate() - 7)
      return { start, end, label: 'Last 7 Days' }
    case '30d':
      start.setDate(end.getDate() - 30)
      return { start, end, label: 'Last 30 Days' }
    case '3mo':
      start.setMonth(end.getMonth() - 3)
      return { start, end, label: 'Last 3 Months' }
    case '1yr':
      start.setFullYear(end.getFullYear() - 1)
      return { start, end, label: 'Last Year' }
    case 'all':
      start = new Date(0) // Beginning of time
      return { start, end, label: 'All Time' }
  }
}

export interface PerformanceDataPoint {
  date: string
  winRate: number
  picks: number
  won: number
  lost: number
  revenue: number
}

export async function getPerformanceOverTime(
  userId: string,
  period: '7d' | '30d' | '3mo' | '1yr' | 'all'
): Promise<PerformanceDataPoint[]> {
  const { start, end } = getTimeFrame(period)

  const picks = await prisma.pick.findMany({
    where: {
      userId,
      createdAt: {
        gte: start,
        lte: end,
      },
      status: {
        in: [PickStatus.WON, PickStatus.LOST],
      },
    },
    include: {
      purchases: {
        select: {
          amount: true,
          platformFee: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  // Group picks by day
  const dataByDate = new Map<string, {
    picks: number
    won: number
    lost: number
    revenue: number
  }>()

  picks.forEach((pick) => {
    const dateKey = pick.createdAt.toISOString().split('T')[0]
    const existing = dataByDate.get(dateKey) || { picks: 0, won: 0, lost: 0, revenue: 0 }

    existing.picks++
    if (pick.status === PickStatus.WON) existing.won++
    if (pick.status === PickStatus.LOST) existing.lost++

    const pickRevenue = pick.purchases.reduce(
      (sum, p) => sum + (Number(p.amount) - Number(p.platformFee)),
      0
    )
    existing.revenue += pickRevenue

    dataByDate.set(dateKey, existing)
  })

  // Convert to array and calculate win rates
  return Array.from(dataByDate.entries())
    .map(([date, data]) => ({
      date,
      picks: data.picks,
      won: data.won,
      lost: data.lost,
      winRate: data.picks > 0 ? Math.round((data.won / (data.won + data.lost)) * 100) : 0,
      revenue: data.revenue,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export interface StreakData {
  current: {
    type: 'win' | 'loss' | 'none'
    count: number
  }
  longest: {
    wins: number
    losses: number
  }
}

export async function getStreakData(userId: string): Promise<StreakData> {
  const recentPicks = await prisma.pick.findMany({
    where: {
      userId,
      status: {
        in: [PickStatus.WON, PickStatus.LOST],
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      status: true,
    },
  })

  if (recentPicks.length === 0) {
    return {
      current: { type: 'none', count: 0 },
      longest: { wins: 0, losses: 0 },
    }
  }

  // Calculate current streak
  let currentStreakType: 'win' | 'loss' = recentPicks[0].status === PickStatus.WON ? 'win' : 'loss'
  let currentStreakCount = 0

  for (const pick of recentPicks) {
    const isWin = pick.status === PickStatus.WON
    if ((currentStreakType === 'win' && isWin) || (currentStreakType === 'loss' && !isWin)) {
      currentStreakCount++
    } else {
      break
    }
  }

  // Calculate longest streaks
  let longestWinStreak = 0
  let longestLossStreak = 0
  let tempWinStreak = 0
  let tempLossStreak = 0

  for (const pick of recentPicks) {
    if (pick.status === PickStatus.WON) {
      tempWinStreak++
      tempLossStreak = 0
      longestWinStreak = Math.max(longestWinStreak, tempWinStreak)
    } else {
      tempLossStreak++
      tempWinStreak = 0
      longestLossStreak = Math.max(longestLossStreak, tempLossStreak)
    }
  }

  return {
    current: {
      type: currentStreakType,
      count: currentStreakCount,
    },
    longest: {
      wins: longestWinStreak,
      losses: longestLossStreak,
    },
  }
}

export interface CalendarDay {
  date: string
  picks: number
  won: number
  lost: number
  winRate: number
  level: 0 | 1 | 2 | 3 | 4 // Activity level for heatmap color intensity
}

export async function getCalendarHeatmapData(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<CalendarDay[]> {
  const picks = await prisma.pick.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      createdAt: true,
      status: true,
    },
  })

  const dayMap = new Map<string, { picks: number; won: number; lost: number }>()

  picks.forEach((pick) => {
    const dateKey = pick.createdAt.toISOString().split('T')[0]
    const existing = dayMap.get(dateKey) || { picks: 0, won: 0, lost: 0 }

    existing.picks++
    if (pick.status === PickStatus.WON) existing.won++
    if (pick.status === PickStatus.LOST) existing.lost++

    dayMap.set(dateKey, existing)
  })

  const allDays: CalendarDay[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0]
    const data = dayMap.get(dateKey) || { picks: 0, won: 0, lost: 0 }
    const settled = data.won + data.lost
    const winRate = settled > 0 ? Math.round((data.won / settled) * 100) : 0

    // Calculate activity level (0-4) based on number of picks
    let level: 0 | 1 | 2 | 3 | 4 = 0
    if (data.picks > 0) level = 1
    if (data.picks >= 2) level = 2
    if (data.picks >= 4) level = 3
    if (data.picks >= 6) level = 4

    allDays.push({
      date: dateKey,
      picks: data.picks,
      won: data.won,
      lost: data.lost,
      winRate,
      level,
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return allDays
}

export interface BestWorstPeriod {
  period: string
  picks: number
  won: number
  lost: number
  winRate: number
}

export async function getBestWorstPeriods(userId: string): Promise<{
  bestMonths: BestWorstPeriod[]
  worstMonths: BestWorstPeriod[]
  bestDaysOfWeek: BestWorstPeriod[]
  worstDaysOfWeek: BestWorstPeriod[]
}> {
  const picks = await prisma.pick.findMany({
    where: {
      userId,
      status: {
        in: [PickStatus.WON, PickStatus.LOST],
      },
    },
    select: {
      createdAt: true,
      status: true,
    },
  })

  // Group by month
  const monthMap = new Map<string, { picks: number; won: number; lost: number }>()
  // Group by day of week (0 = Sunday, 6 = Saturday)
  const dayOfWeekMap = new Map<number, { picks: number; won: number; lost: number }>()

  picks.forEach((pick) => {
    const date = new Date(pick.createdAt)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const dayOfWeek = date.getDay()

    // Month stats
    const monthData = monthMap.get(monthKey) || { picks: 0, won: 0, lost: 0 }
    monthData.picks++
    if (pick.status === PickStatus.WON) monthData.won++
    else monthData.lost++
    monthMap.set(monthKey, monthData)

    // Day of week stats
    const dayData = dayOfWeekMap.get(dayOfWeek) || { picks: 0, won: 0, lost: 0 }
    dayData.picks++
    if (pick.status === PickStatus.WON) dayData.won++
    else dayData.lost++
    dayOfWeekMap.set(dayOfWeek, dayData)
  })

  // Convert months to array with win rates
  const months = Array.from(monthMap.entries())
    .map(([month, data]) => ({
      period: month,
      picks: data.picks,
      won: data.won,
      lost: data.lost,
      winRate: Math.round((data.won / (data.won + data.lost)) * 100),
    }))
    .filter((m) => m.picks >= 5) // Only include months with 5+ picks
    .sort((a, b) => b.winRate - a.winRate)

  // Convert days to array with win rates
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const days = Array.from(dayOfWeekMap.entries())
    .map(([day, data]) => ({
      period: daysOfWeek[day],
      picks: data.picks,
      won: data.won,
      lost: data.lost,
      winRate: Math.round((data.won / (data.won + data.lost)) * 100),
    }))
    .filter((d) => d.picks >= 3) // Only include days with 3+ picks
    .sort((a, b) => b.winRate - a.winRate)

  return {
    bestMonths: months.slice(0, 3),
    worstMonths: months.slice(-3).reverse(),
    bestDaysOfWeek: days.slice(0, 3),
    worstDaysOfWeek: days.slice(-3).reverse(),
  }
}

export interface PickTypePerformance {
  pickType: string
  totalPicks: number
  won: number
  lost: number
  push: number
  winRate: number
  revenue: number
  avgOdds: string | null
}

export async function getPerformanceByPickType(userId: string): Promise<PickTypePerformance[]> {
  const picks = await prisma.pick.findMany({
    where: { userId },
    include: {
      purchases: {
        select: {
          amount: true,
          platformFee: true,
        },
      },
    },
  })

  const typeMap = new Map<
    string,
    {
      total: number
      won: number
      lost: number
      push: number
      revenue: number
      oddsSum: number
      oddsCount: number
    }
  >()

  picks.forEach((pick) => {
    const type = pick.pickType
    const data = typeMap.get(type) || {
      total: 0,
      won: 0,
      lost: 0,
      push: 0,
      revenue: 0,
      oddsSum: 0,
      oddsCount: 0,
    }

    data.total++
    if (pick.status === PickStatus.WON) data.won++
    if (pick.status === PickStatus.LOST) data.lost++
    if (pick.status === PickStatus.PUSH) data.push++

    const pickRevenue = pick.purchases.reduce(
      (sum, p) => sum + (Number(p.amount) - Number(p.platformFee)),
      0
    )
    data.revenue += pickRevenue

    // Parse odds if available (format: +150 or -110)
    if (pick.odds) {
      const oddsValue = parseFloat(pick.odds.replace(/[^0-9.-]/g, ''))
      if (!isNaN(oddsValue)) {
        data.oddsSum += oddsValue
        data.oddsCount++
      }
    }

    typeMap.set(type, data)
  })

  return Array.from(typeMap.entries())
    .map(([pickType, data]) => ({
      pickType,
      totalPicks: data.total,
      won: data.won,
      lost: data.lost,
      push: data.push,
      winRate: data.won + data.lost > 0 ? Math.round((data.won / (data.won + data.lost)) * 100) : 0,
      revenue: data.revenue,
      avgOdds: data.oddsCount > 0 ? (data.oddsSum / data.oddsCount).toFixed(0) : null,
    }))
    .sort((a, b) => b.totalPicks - a.totalPicks)
}

export interface BetSizingSimulation {
  strategy: string
  totalProfit: number
  roi: number
  maxDrawdown: number
  unitsWon: number
}

export async function simulateBetSizing(userId: string): Promise<BetSizingSimulation[]> {
  const picks = await prisma.pick.findMany({
    where: {
      userId,
      status: {
        in: [PickStatus.WON, PickStatus.LOST],
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
    select: {
      status: true,
      confidence: true,
      odds: true,
    },
  })

  if (picks.length === 0) {
    return []
  }

  const strategies: BetSizingSimulation[] = []

  // Strategy 1: Flat betting (1 unit per pick)
  strategies.push(simulateStrategy(picks, 'flat'))

  // Strategy 2: Confidence-based (bet units = confidence level)
  strategies.push(simulateStrategy(picks, 'confidence'))

  // Strategy 3: Conservative (always 0.5 units)
  strategies.push(simulateStrategy(picks, 'conservative'))

  // Strategy 4: Aggressive (2x confidence)
  strategies.push(simulateStrategy(picks, 'aggressive'))

  return strategies
}

function simulateStrategy(
  picks: Array<{ status: PickStatus; confidence: number; odds: string | null }>,
  strategy: string
): BetSizingSimulation {
  let bankroll = 100 // Start with 100 units
  let maxDrawdown = 0
  let peakBankroll = 100
  let totalUnits = 0

  picks.forEach((pick) => {
    let betSize = 1

    switch (strategy) {
      case 'flat':
        betSize = 1
        break
      case 'confidence':
        betSize = pick.confidence
        break
      case 'conservative':
        betSize = 0.5
        break
      case 'aggressive':
        betSize = pick.confidence * 2
        break
    }

    totalUnits += betSize

    // Calculate payout based on odds (simplified)
    let payout = betSize
    if (pick.odds) {
      const oddsValue = parseFloat(pick.odds.replace(/[^0-9.-]/g, ''))
      if (!isNaN(oddsValue)) {
        if (oddsValue > 0) {
          payout = betSize * (1 + oddsValue / 100)
        } else {
          payout = betSize * (1 + 100 / Math.abs(oddsValue))
        }
      }
    }

    if (pick.status === PickStatus.WON) {
      bankroll += payout - betSize
    } else {
      bankroll -= betSize
    }

    // Track drawdown
    peakBankroll = Math.max(peakBankroll, bankroll)
    const currentDrawdown = peakBankroll - bankroll
    maxDrawdown = Math.max(maxDrawdown, currentDrawdown)
  })

  const totalProfit = bankroll - 100
  const roi = (totalProfit / totalUnits) * 100

  return {
    strategy: strategy.charAt(0).toUpperCase() + strategy.slice(1),
    totalProfit: Math.round(totalProfit * 100) / 100,
    roi: Math.round(roi * 10) / 10,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    unitsWon: Math.round(totalProfit * 100) / 100,
  }
}

export async function getAverageOdds(userId: string): Promise<{
  overall: number | null
  bySport: Array<{ sport: string; avgOdds: number }>
  byPickType: Array<{ pickType: string; avgOdds: number }>
}> {
  const picks = await prisma.pick.findMany({
    where: {
      userId,
      odds: {
        not: null,
      },
    },
    select: {
      odds: true,
      sport: true,
      pickType: true,
    },
  })

  if (picks.length === 0) {
    return { overall: null, bySport: [], byPickType: [] }
  }

  let totalOdds = 0
  let validOddsCount = 0

  const sportOddsMap = new Map<string, { sum: number; count: number }>()
  const pickTypeOddsMap = new Map<string, { sum: number; count: number }>()

  picks.forEach((pick) => {
    if (pick.odds) {
      const oddsValue = parseFloat(pick.odds.replace(/[^0-9.-]/g, ''))
      if (!isNaN(oddsValue)) {
        totalOdds += oddsValue
        validOddsCount++

        // By sport
        const sportData = sportOddsMap.get(pick.sport) || { sum: 0, count: 0 }
        sportData.sum += oddsValue
        sportData.count++
        sportOddsMap.set(pick.sport, sportData)

        // By pick type
        const typeData = pickTypeOddsMap.get(pick.pickType) || { sum: 0, count: 0 }
        typeData.sum += oddsValue
        typeData.count++
        pickTypeOddsMap.set(pick.pickType, typeData)
      }
    }
  })

  return {
    overall: validOddsCount > 0 ? Math.round(totalOdds / validOddsCount) : null,
    bySport: Array.from(sportOddsMap.entries())
      .map(([sport, data]) => ({
        sport,
        avgOdds: Math.round(data.sum / data.count),
      }))
      .sort((a, b) => b.avgOdds - a.avgOdds),
    byPickType: Array.from(pickTypeOddsMap.entries())
      .map(([pickType, data]) => ({
        pickType,
        avgOdds: Math.round(data.sum / data.count),
      }))
      .sort((a, b) => b.avgOdds - a.avgOdds),
  }
}
