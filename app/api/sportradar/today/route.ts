import { NextResponse } from 'next/server';
import { sportradarService } from '@/lib/services/sportradar';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sportradar/today
 * Returns today's games across all leagues
 */
export async function GET() {
  try {
    const games = await sportradarService.getTodayGames();

    return NextResponse.json({
      success: true,
      data: games,
      date: new Date().toISOString().split('T')[0],
      count: games.length,
    });
  } catch (error) {
    console.error('Error fetching today\'s games:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch today\'s games',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
