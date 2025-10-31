import { NextRequest, NextResponse } from 'next/server';
import { sportradarService, type SportLeague } from '@/lib/services/sportradar';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sportradar/games/[gameId]?league=NBA
 * Returns live game details with current score
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { gameId } = params;
    const { searchParams } = new URL(request.url);
    const league = searchParams.get('league')?.toUpperCase();

    // Validate league parameter
    const validLeagues: SportLeague[] = ['NBA', 'MLB', 'NHL', 'NFL', 'NCAAFB', 'NCAAMB'];
    if (!league || !validLeagues.includes(league as SportLeague)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or missing league parameter',
          message: `League must be one of: ${validLeagues.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const gameDetails = await sportradarService.getGameDetails(
      league as SportLeague,
      gameId
    );

    if (!gameDetails) {
      return NextResponse.json(
        {
          success: false,
          error: 'Game not found',
          message: `Could not find game with ID ${gameId} in ${league}`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: gameDetails,
    });
  } catch (error) {
    console.error('Error fetching game details:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch game details',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
