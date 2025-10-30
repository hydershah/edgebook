import { NextRequest, NextResponse } from 'next/server';
import { sportradarService, type SportLeague } from '@/lib/services/sportradar';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sportradar/schedule/[league]
 * Returns upcoming games for a specific league (next 7 days)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { league: string } }
) {
  try {
    const { league } = params;

    // Validate league
    const validLeagues: SportLeague[] = ['NBA', 'MLB', 'NHL', 'NFL'];
    const upperLeague = league.toUpperCase();

    if (!validLeagues.includes(upperLeague as SportLeague)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid league',
          message: `League must be one of: ${validLeagues.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const games = await sportradarService.getUpcomingGames(upperLeague as SportLeague);

    return NextResponse.json({
      success: true,
      data: games,
      league: upperLeague,
      count: games.length,
    });
  } catch (error) {
    console.error('Error fetching league schedule:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch league schedule',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
