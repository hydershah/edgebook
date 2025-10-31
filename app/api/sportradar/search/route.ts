import { NextRequest, NextResponse } from 'next/server';
import { sportradarService, type SportLeague } from '@/lib/services/sportradar';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sportradar/search?q=lakers&league=NBA
 * Searches for games by team name
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const league = searchParams.get('league')?.toUpperCase();

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query is required',
          message: 'Please provide a search query using the "q" parameter',
        },
        { status: 400 }
      );
    }

    const searchTerm = query.toLowerCase().trim();
    let allGames;

    // If league is specified, search only that league
    if (league) {
      const validLeagues: SportLeague[] = ['NBA', 'MLB', 'NHL', 'NFL', 'NCAAFB', 'NCAAMB'];
      if (!validLeagues.includes(league as SportLeague)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid league',
            message: `League must be one of: ${validLeagues.join(', ')}`,
          },
          { status: 400 }
        );
      }

      allGames = await sportradarService.getUpcomingGames(league as SportLeague);
    } else {
      // Search all leagues
      allGames = await sportradarService.getAllUpcomingGames();
    }

    // Filter games by search term
    const matchingGames = allGames.filter((game) => {
      const homeTeamMatch = game.homeTeam.toLowerCase().includes(searchTerm);
      const awayTeamMatch = game.awayTeam.toLowerCase().includes(searchTerm);
      const venueMatch = game.venue?.toLowerCase().includes(searchTerm) || false;

      return homeTeamMatch || awayTeamMatch || venueMatch;
    });

    return NextResponse.json({
      success: true,
      query: query,
      league: league || 'ALL',
      data: matchingGames,
      count: matchingGames.length,
    });
  } catch (error) {
    console.error('Error searching games:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search games',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
