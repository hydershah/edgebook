/**
 * Sport-Specific Betting Rules
 * Defines which prediction types are available for each sport
 */

export type Sport = 'NFL' | 'NBA' | 'MLB' | 'NHL' | 'SOCCER' | 'COLLEGE_FOOTBALL' | 'COLLEGE_BASKETBALL';
export type PredictionType = 'WINNER' | 'SPREAD' | 'TOTAL';

export interface SportBettingRules {
  allowedPredictionTypes: PredictionType[];
  spreadLabel: string;
  totalLabel: string;
  winnerLabel: string;
  typicalSpreadRange?: [number, number]; // [min, max]
  typicalTotalRange?: [number, number]; // [min, max]
}

/**
 * Betting rules for each sport
 */
export const SPORT_BETTING_RULES: Record<Sport, SportBettingRules> = {
  // American Football (NFL & College Football)
  NFL: {
    allowedPredictionTypes: ['WINNER', 'SPREAD', 'TOTAL'],
    spreadLabel: 'Point Spread',
    totalLabel: 'Total Points (Over/Under)',
    winnerLabel: 'Moneyline (Winner)',
    typicalSpreadRange: [-14, 14],
    typicalTotalRange: [35, 65],
  },
  COLLEGE_FOOTBALL: {
    allowedPredictionTypes: ['WINNER', 'SPREAD', 'TOTAL'],
    spreadLabel: 'Point Spread',
    totalLabel: 'Total Points (Over/Under)',
    winnerLabel: 'Moneyline (Winner)',
    typicalSpreadRange: [-35, 35], // College can have larger spreads
    typicalTotalRange: [40, 80],
  },

  // Basketball (NBA & College Basketball)
  NBA: {
    allowedPredictionTypes: ['WINNER', 'SPREAD', 'TOTAL'],
    spreadLabel: 'Point Spread',
    totalLabel: 'Total Points (Over/Under)',
    winnerLabel: 'Moneyline (Winner)',
    typicalSpreadRange: [-15, 15],
    typicalTotalRange: [200, 250],
  },
  COLLEGE_BASKETBALL: {
    allowedPredictionTypes: ['WINNER', 'SPREAD', 'TOTAL'],
    spreadLabel: 'Point Spread',
    totalLabel: 'Total Points (Over/Under)',
    winnerLabel: 'Moneyline (Winner)',
    typicalSpreadRange: [-20, 20],
    typicalTotalRange: [120, 180],
  },

  // Baseball (MLB)
  MLB: {
    allowedPredictionTypes: ['WINNER', 'TOTAL'], // MLB rarely uses spread
    spreadLabel: 'Run Line', // Usually fixed at ±1.5
    totalLabel: 'Total Runs (Over/Under)',
    winnerLabel: 'Moneyline (Winner)',
    typicalTotalRange: [6, 12],
  },

  // Hockey (NHL)
  NHL: {
    allowedPredictionTypes: ['WINNER', 'TOTAL'], // NHL uses puck line but less common
    spreadLabel: 'Puck Line', // Usually fixed at ±1.5
    totalLabel: 'Total Goals (Over/Under)',
    winnerLabel: 'Moneyline (Winner)',
    typicalTotalRange: [5, 7],
  },

  // Soccer
  SOCCER: {
    allowedPredictionTypes: ['WINNER', 'TOTAL'], // Soccer typically doesn't use spread
    spreadLabel: 'Goal Line',
    totalLabel: 'Total Goals (Over/Under)',
    winnerLabel: 'Match Result (1X2)',
    typicalTotalRange: [1.5, 4.5],
  },
};

/**
 * Get allowed prediction types for a sport
 */
export function getAllowedPredictionTypes(sport: Sport): PredictionType[] {
  return SPORT_BETTING_RULES[sport]?.allowedPredictionTypes || ['WINNER'];
}

/**
 * Check if a prediction type is allowed for a sport
 */
export function isPredictionTypeAllowed(sport: Sport, predictionType: PredictionType): boolean {
  const allowed = getAllowedPredictionTypes(sport);
  return allowed.includes(predictionType);
}

/**
 * Get betting rules for a sport
 */
export function getSportBettingRules(sport: Sport): SportBettingRules {
  return SPORT_BETTING_RULES[sport] || {
    allowedPredictionTypes: ['WINNER'],
    spreadLabel: 'Spread',
    totalLabel: 'Total',
    winnerLabel: 'Winner',
  };
}

/**
 * Validate a pick's prediction type for a sport
 */
export function validatePrediction(
  sport: Sport,
  predictionType: PredictionType,
  data: {
    spreadValue?: number | null;
    totalValue?: number | null;
    predictedWinner?: string | null;
  }
): { valid: boolean; error?: string } {
  // Check if prediction type is allowed
  if (!isPredictionTypeAllowed(sport, predictionType)) {
    return {
      valid: false,
      error: `${predictionType} predictions are not available for ${sport}`,
    };
  }

  // Validate required fields for each prediction type
  switch (predictionType) {
    case 'WINNER':
      if (!data.predictedWinner) {
        return { valid: false, error: 'Predicted winner is required' };
      }
      break;

    case 'SPREAD':
      if (data.spreadValue === null || data.spreadValue === undefined) {
        return { valid: false, error: 'Spread value is required' };
      }
      break;

    case 'TOTAL':
      if (data.totalValue === null || data.totalValue === undefined) {
        return { valid: false, error: 'Total value is required' };
      }
      if (data.totalValue <= 0) {
        return { valid: false, error: 'Total value must be positive' };
      }
      break;
  }

  return { valid: true };
}

/**
 * Get display labels for a sport
 */
export function getSportLabels(sport: Sport) {
  const rules = getSportBettingRules(sport);
  return {
    spread: rules.spreadLabel,
    total: rules.totalLabel,
    winner: rules.winnerLabel,
  };
}
