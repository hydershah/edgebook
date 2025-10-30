import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sportradarService, type SportLeague } from '@/lib/services/sportradar';
import { PickResultService } from '@/lib/services/sportradar/pick-result.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/sportradar/sync-results
 * Syncs game results from Sportradar to update pick statuses
 *
 * This endpoint should be called by a cron job to periodically update game results.
 * It fetches all picks with sportradarGameId and updates their game status and scores.
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication to ensure only authorized sources can trigger this
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find all picks with sportradarGameId that are still PENDING or in active games
    const activePicks = await prisma.pick.findMany({
      where: {
        sportradarGameId: { not: null },
        OR: [
          { gameStatus: { in: ['scheduled', 'inprogress', 'created'] } },
          { gameStatus: null },
          { resultDetermined: false },
        ],
      },
      select: {
        id: true,
        sportradarGameId: true,
        sport: true,
        gameStatus: true,
        status: true,
        homeTeam: true,
        awayTeam: true,
        homeScore: true,
        awayScore: true,
        predictionType: true,
        predictedWinner: true,
        spreadValue: true,
        spreadTeam: true,
        totalValue: true,
        totalPrediction: true,
        resultDetermined: true,
      },
    });

    console.log(`Found ${activePicks.length} active picks to sync`);

    const updates: Array<{
      pickId: string;
      success: boolean;
      error?: string;
    }> = [];

    // Process each pick
    for (const pick of activePicks) {
      if (!pick.sportradarGameId) continue;

      try {
        // Fetch game details from Sportradar
        const gameDetails = await sportradarService.getGameDetails(
          pick.sport as SportLeague,
          pick.sportradarGameId
        );

        if (!gameDetails) {
          updates.push({
            pickId: pick.id,
            success: false,
            error: 'Game not found in Sportradar',
          });
          continue;
        }

        // Check if game is complete and determine result
        const isComplete = PickResultService.isGameComplete(gameDetails.status);
        let resultData = {};

        if (isComplete && !pick.resultDetermined &&
            gameDetails.homeScore !== null && gameDetails.awayScore !== null &&
            pick.predictionType && pick.homeTeam && pick.awayTeam) {

          // Determine pick result
          const result = PickResultService.determineResult({
            predictionType: pick.predictionType as any,
            predictedWinner: pick.predictedWinner,
            spreadValue: pick.spreadValue,
            spreadTeam: pick.spreadTeam,
            totalValue: pick.totalValue,
            totalPrediction: pick.totalPrediction,
            homeTeam: gameDetails.homeTeam,
            awayTeam: gameDetails.awayTeam,
            homeScore: gameDetails.homeScore ?? 0,
            awayScore: gameDetails.awayScore ?? 0,
          });

          resultData = {
            status: result.status,
            resultDetermined: result.resultDetermined,
            resultNotes: result.resultNotes,
          };

          console.log(
            `Pick ${pick.id} result: ${result.status} - ${result.resultNotes}`
          );
        }

        // Update pick with latest game data and result
        await prisma.pick.update({
          where: { id: pick.id },
          data: {
            homeTeam: gameDetails.homeTeam,
            awayTeam: gameDetails.awayTeam,
            gameStatus: gameDetails.status,
            homeScore: gameDetails.homeScore || null,
            awayScore: gameDetails.awayScore || null,
            updatedAt: new Date(),
            ...resultData,
          },
        });

        updates.push({
          pickId: pick.id,
          success: true,
          ...(Object.keys(resultData).length > 0 && { result: resultData }),
        } as any);

        console.log(
          `Updated pick ${pick.id}: ${gameDetails.status} - ${gameDetails.homeTeam} ${gameDetails.homeScore} vs ${gameDetails.awayTeam} ${gameDetails.awayScore}`
        );
      } catch (error) {
        console.error(`Error syncing pick ${pick.id}:`, error);
        updates.push({
          pickId: pick.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = updates.filter((u) => u.success).length;
    const failCount = updates.filter((u) => !u.success).length;

    return NextResponse.json({
      success: true,
      message: 'Game results synced successfully',
      stats: {
        total: activePicks.length,
        success: successCount,
        failed: failCount,
      },
      updates,
    });
  } catch (error) {
    console.error('Error syncing game results:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync game results',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sportradar/sync-results
 * Returns information about the sync endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/sportradar/sync-results',
    method: 'POST',
    description: 'Syncs game results from Sportradar to update pick statuses',
    authentication: 'Bearer token in Authorization header (if CRON_SECRET is set)',
    usage: 'Should be called by a cron job every 5-10 minutes during game times',
  });
}
