import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's hot picks (pending picks created today)
    const hotPicksCount = await prisma.pick.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
        status: 'PENDING',
      },
    });

    // Fetch number of active creators (users with at least 1 pick today)
    const topCreators = await prisma.user.count({
      where: {
        picks: {
          some: {
            createdAt: {
              gte: today,
              lt: tomorrow,
            },
          },
        },
      },
    });

    // Calculate platform-wide win rate for settled picks today
    const settledPicksToday = await prisma.pick.findMany({
      where: {
        status: {
          in: ['WON', 'LOST'],
        },
        updatedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        status: true,
      },
    });

    let winRate = 0;
    if (settledPicksToday.length > 0) {
      const wonPicks = settledPicksToday.filter(p => p.status === 'WON').length;
      winRate = Math.round((wonPicks / settledPicksToday.length) * 100);
    } else {
      // If no picks settled today, get overall platform win rate
      const allSettledPicks = await prisma.pick.findMany({
        where: {
          status: {
            in: ['WON', 'LOST'],
          },
        },
        select: {
          status: true,
        },
        take: 1000, // Sample last 1000 for performance
      });

      if (allSettledPicks.length > 0) {
        const wonPicks = allSettledPicks.filter(p => p.status === 'WON').length;
        winRate = Math.round((wonPicks / allSettledPicks.length) * 100);
      }
    }

    return NextResponse.json({
      hotPicks: hotPicksCount,
      topCreators: topCreators,
      winRate: winRate || 0,
    });
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    return NextResponse.json(
      {
        // Return fallback values on error
        hotPicks: 0,
        topCreators: 0,
        winRate: 0,
      },
      { status: 200 } // Return 200 to prevent UI errors
    );
  }
}