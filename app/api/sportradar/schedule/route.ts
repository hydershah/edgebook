import { NextResponse } from 'next/server';
import { sportradarService } from '@/lib/services/sportradar';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sportradar/schedule
 * Returns upcoming games for all leagues (next 7 days)
 */
export async function GET() {
  try {
    const games = await sportradarService.getAllUpcomingGames();

    return NextResponse.json({
      success: true,
      data: games,
      count: games.length,
    });
  } catch (error) {
    console.error('Error fetching upcoming games:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch upcoming games',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
