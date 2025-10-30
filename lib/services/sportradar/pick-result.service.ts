/**
 * Pick Result Determination Service
 * Automatically determines if a pick won, lost, or pushed based on game results
 */

export type PredictionType = 'WINNER' | 'SPREAD' | 'TOTAL';

export type PickStatus = 'WON' | 'LOST' | 'PUSH' | 'PENDING';

export interface PickData {
  predictionType: PredictionType;
  predictedWinner?: string | null;
  spreadValue?: number | null;
  spreadTeam?: string | null;
  totalValue?: number | null;
  totalPrediction?: string | null;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
}

export interface ResultDetermination {
  status: PickStatus;
  resultNotes: string;
  resultDetermined: boolean;
}

export class PickResultService {
  /**
   * Determines the result of a pick based on game outcome
   */
  static determineResult(pick: PickData): ResultDetermination {
    // Validate we have scores
    if (pick.homeScore === null || pick.awayScore === null ||
        pick.homeScore === undefined || pick.awayScore === undefined) {
      return {
        status: 'PENDING',
        resultNotes: 'Game scores not available yet',
        resultDetermined: false,
      };
    }

    switch (pick.predictionType) {
      case 'WINNER':
        return this.determineWinnerResult(pick);
      case 'SPREAD':
        return this.determineSpreadResult(pick);
      case 'TOTAL':
        return this.determineTotalResult(pick);
      default:
        return {
          status: 'PENDING',
          resultNotes: 'Unknown prediction type',
          resultDetermined: false,
        };
    }
  }

  /**
   * Determines result for WINNER predictions
   */
  private static determineWinnerResult(pick: PickData): ResultDetermination {
    if (!pick.predictedWinner) {
      return {
        status: 'PENDING',
        resultNotes: 'No predicted winner specified',
        resultDetermined: false,
      };
    }

    const actualWinner = pick.homeScore > pick.awayScore ? pick.homeTeam :
                        pick.awayScore > pick.homeScore ? pick.awayTeam : null;

    // Handle tie/overtime
    if (actualWinner === null) {
      return {
        status: 'PUSH',
        resultNotes: `Game ended in a tie: ${pick.homeTeam} ${pick.homeScore} - ${pick.awayTeam} ${pick.awayScore}`,
        resultDetermined: true,
      };
    }

    // Check if prediction matches actual winner
    const predictedTeamWon = pick.predictedWinner.toLowerCase() === actualWinner.toLowerCase() ||
                              actualWinner.toLowerCase().includes(pick.predictedWinner.toLowerCase());

    if (predictedTeamWon) {
      return {
        status: 'WON',
        resultNotes: `Correctly predicted ${actualWinner} to win. Final: ${pick.homeTeam} ${pick.homeScore} - ${pick.awayTeam} ${pick.awayScore}`,
        resultDetermined: true,
      };
    } else {
      return {
        status: 'LOST',
        resultNotes: `Predicted ${pick.predictedWinner} to win, but ${actualWinner} won. Final: ${pick.homeTeam} ${pick.homeScore} - ${pick.awayTeam} ${pick.awayScore}`,
        resultDetermined: true,
      };
    }
  }

  /**
   * Determines result for SPREAD predictions
   */
  private static determineSpreadResult(pick: PickData): ResultDetermination {
    if (!pick.spreadTeam || pick.spreadValue === null || pick.spreadValue === undefined) {
      return {
        status: 'PENDING',
        resultNotes: 'Spread information not specified',
        resultDetermined: false,
      };
    }

    // Determine which team is the spread team
    const isHomeTeam = pick.spreadTeam.toLowerCase() === pick.homeTeam.toLowerCase() ||
                       pick.homeTeam.toLowerCase().includes(pick.spreadTeam.toLowerCase());

    // Calculate adjusted scores with spread
    // Spread is from the perspective of the spread team
    // Example: Lakers -5.5 means Lakers need to win by more than 5.5
    let adjustedScore: number;
    let opponentScore: number;

    if (isHomeTeam) {
      adjustedScore = pick.homeScore + pick.spreadValue; // If negative spread, this subtracts
      opponentScore = pick.awayScore;
    } else {
      adjustedScore = pick.awayScore + pick.spreadValue;
      opponentScore = pick.homeScore;
    }

    // Determine result
    if (Math.abs(adjustedScore - opponentScore) < 0.01) {
      // Push (exactly on the spread - rare with .5 spreads)
      return {
        status: 'PUSH',
        resultNotes: `Push on ${pick.spreadTeam} ${pick.spreadValue >= 0 ? '+' : ''}${pick.spreadValue}. Final: ${pick.homeTeam} ${pick.homeScore} - ${pick.awayTeam} ${pick.awayScore}`,
        resultDetermined: true,
      };
    }

    if (adjustedScore > opponentScore) {
      return {
        status: 'WON',
        resultNotes: `${pick.spreadTeam} covered the spread ${pick.spreadValue >= 0 ? '+' : ''}${pick.spreadValue}. Final: ${pick.homeTeam} ${pick.homeScore} - ${pick.awayTeam} ${pick.awayScore}`,
        resultDetermined: true,
      };
    } else {
      return {
        status: 'LOST',
        resultNotes: `${pick.spreadTeam} did not cover the spread ${pick.spreadValue >= 0 ? '+' : ''}${pick.spreadValue}. Final: ${pick.homeTeam} ${pick.homeScore} - ${pick.awayTeam} ${pick.awayScore}`,
        resultDetermined: true,
      };
    }
  }

  /**
   * Determines result for TOTAL (Over/Under) predictions
   */
  private static determineTotalResult(pick: PickData): ResultDetermination {
    if (!pick.totalPrediction || pick.totalValue === null || pick.totalValue === undefined) {
      return {
        status: 'PENDING',
        resultNotes: 'Total information not specified',
        resultDetermined: false,
      };
    }

    const actualTotal = pick.homeScore + pick.awayScore;
    const prediction = pick.totalPrediction.toUpperCase();

    // Check for push (exactly on the total - rare with .5 totals)
    if (Math.abs(actualTotal - pick.totalValue) < 0.01) {
      return {
        status: 'PUSH',
        resultNotes: `Push on total ${pick.totalValue}. Actual total: ${actualTotal} (${pick.homeTeam} ${pick.homeScore} - ${pick.awayTeam} ${pick.awayScore})`,
        resultDetermined: true,
      };
    }

    // Determine if OVER or UNDER hit
    const overHit = actualTotal > pick.totalValue;
    const underHit = actualTotal < pick.totalValue;

    if ((prediction === 'OVER' && overHit) || (prediction === 'UNDER' && underHit)) {
      return {
        status: 'WON',
        resultNotes: `${prediction} ${pick.totalValue} hit. Actual total: ${actualTotal} (${pick.homeTeam} ${pick.homeScore} - ${pick.awayTeam} ${pick.awayScore})`,
        resultDetermined: true,
      };
    } else {
      return {
        status: 'LOST',
        resultNotes: `${prediction} ${pick.totalValue} missed. Actual total: ${actualTotal} (${pick.homeTeam} ${pick.homeScore} - ${pick.awayTeam} ${pick.awayScore})`,
        resultDetermined: true,
      };
    }
  }

  /**
   * Validates if a game is complete and ready for result determination
   */
  static isGameComplete(gameStatus: string | null): boolean {
    if (!gameStatus) return false;

    const completeStatuses = ['complete', 'closed', 'final'];
    return completeStatuses.includes(gameStatus.toLowerCase());
  }

  /**
   * Formats a result for display
   */
  static formatResult(result: ResultDetermination): string {
    const emoji = result.status === 'WON' ? '✅' :
                  result.status === 'LOST' ? '❌' :
                  result.status === 'PUSH' ? '🔄' : '⏳';

    return `${emoji} ${result.status}: ${result.resultNotes}`;
  }
}
