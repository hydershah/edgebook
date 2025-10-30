'use client';

import { useState, useEffect } from 'react';

type Sport = 'NFL' | 'NBA' | 'MLB' | 'NHL' | 'SOCCER' | 'COLLEGE_FOOTBALL' | 'COLLEGE_BASKETBALL';
type PredictionType = 'WINNER' | 'SPREAD' | 'TOTAL';

interface Game {
  homeTeam: string;
  awayTeam: string;
}

interface PredictionData {
  predictionType: PredictionType;
  predictedWinner?: string;
  spreadValue?: number;
  spreadTeam?: string;
  totalValue?: number;
  totalPrediction?: 'OVER' | 'UNDER';
}

interface PredictionSelectorProps {
  sport: Sport;
  game: Game;
  onPredictionChange: (prediction: PredictionData) => void;
  initialData?: Partial<PredictionData>;
}

// Sport-specific rules
const SPORT_RULES: Record<Sport, {
  allowedTypes: PredictionType[];
  spreadLabel: string;
  totalLabel: string;
  winnerLabel: string;
}> = {
  NFL: {
    allowedTypes: ['WINNER', 'SPREAD', 'TOTAL'],
    spreadLabel: 'Point Spread',
    totalLabel: 'Total Points (Over/Under)',
    winnerLabel: 'Moneyline (Winner)',
  },
  NBA: {
    allowedTypes: ['WINNER', 'SPREAD', 'TOTAL'],
    spreadLabel: 'Point Spread',
    totalLabel: 'Total Points (Over/Under)',
    winnerLabel: 'Moneyline (Winner)',
  },
  MLB: {
    allowedTypes: ['WINNER', 'TOTAL'],
    spreadLabel: 'Run Line',
    totalLabel: 'Total Runs (Over/Under)',
    winnerLabel: 'Moneyline (Winner)',
  },
  NHL: {
    allowedTypes: ['WINNER', 'TOTAL'],
    spreadLabel: 'Puck Line',
    totalLabel: 'Total Goals (Over/Under)',
    winnerLabel: 'Moneyline (Winner)',
  },
  SOCCER: {
    allowedTypes: ['WINNER', 'TOTAL'],
    spreadLabel: 'Goal Line',
    totalLabel: 'Total Goals (Over/Under)',
    winnerLabel: 'Match Result',
  },
  COLLEGE_FOOTBALL: {
    allowedTypes: ['WINNER', 'SPREAD', 'TOTAL'],
    spreadLabel: 'Point Spread',
    totalLabel: 'Total Points (Over/Under)',
    winnerLabel: 'Moneyline (Winner)',
  },
  COLLEGE_BASKETBALL: {
    allowedTypes: ['WINNER', 'SPREAD', 'TOTAL'],
    spreadLabel: 'Point Spread',
    totalLabel: 'Total Points (Over/Under)',
    winnerLabel: 'Moneyline (Winner)',
  },
};

export default function PredictionSelector({
  sport,
  game,
  onPredictionChange,
  initialData,
}: PredictionSelectorProps) {
  const rules = SPORT_RULES[sport];

  const [predictionType, setPredictionType] = useState<PredictionType>(
    initialData?.predictionType || rules.allowedTypes[0]
  );
  const [predictedWinner, setPredictedWinner] = useState(initialData?.predictedWinner || '');
  const [spreadTeam, setSpreadTeam] = useState(initialData?.spreadTeam || '');
  const [spreadValue, setSpreadValue] = useState(initialData?.spreadValue?.toString() || '');
  const [totalValue, setTotalValue] = useState(initialData?.totalValue?.toString() || '');
  const [totalPrediction, setTotalPrediction] = useState<'OVER' | 'UNDER'>(
    initialData?.totalPrediction || 'OVER'
  );

  // Update parent when prediction changes
  useEffect(() => {
    const predictionData: PredictionData = {
      predictionType,
    };

    if (predictionType === 'WINNER' && predictedWinner) {
      predictionData.predictedWinner = predictedWinner;
    }

    if (predictionType === 'SPREAD' && spreadTeam && spreadValue) {
      predictionData.spreadTeam = spreadTeam;
      predictionData.spreadValue = parseFloat(spreadValue);
    }

    if (predictionType === 'TOTAL' && totalValue && totalPrediction) {
      predictionData.totalValue = parseFloat(totalValue);
      predictionData.totalPrediction = totalPrediction;
    }

    onPredictionChange(predictionData);
  }, [predictionType, predictedWinner, spreadTeam, spreadValue, totalValue, totalPrediction, onPredictionChange]);

  // Reset fields when prediction type changes
  useEffect(() => {
    if (predictionType === 'WINNER') {
      if (!predictedWinner) setPredictedWinner(game.homeTeam);
    }
    if (predictionType === 'SPREAD') {
      if (!spreadTeam) setSpreadTeam(game.homeTeam);
    }
  }, [predictionType, game, predictedWinner, spreadTeam]);

  return (
    <div className="space-y-6">
      {/* Prediction Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Prediction Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {rules.allowedTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setPredictionType(type)}
              className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                predictionType === type
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {type === 'WINNER' && rules.winnerLabel}
              {type === 'SPREAD' && rules.spreadLabel}
              {type === 'TOTAL' && rules.totalLabel}
            </button>
          ))}
        </div>
      </div>

      {/* WINNER Prediction */}
      {predictionType === 'WINNER' && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Which team will win?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPredictedWinner(game.awayTeam)}
              className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                predictedWinner === game.awayTeam
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-green-400'
              }`}
            >
              {game.awayTeam}
            </button>
            <button
              type="button"
              onClick={() => setPredictedWinner(game.homeTeam)}
              className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                predictedWinner === game.homeTeam
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-green-400'
              }`}
            >
              {game.homeTeam}
            </button>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Select the team you predict will win the game
          </p>
        </div>
      )}

      {/* SPREAD Prediction */}
      {predictionType === 'SPREAD' && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Team
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSpreadTeam(game.awayTeam)}
                className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  spreadTeam === game.awayTeam
                    ? 'border-green-600 bg-green-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-green-400'
                }`}
              >
                {game.awayTeam}
              </button>
              <button
                type="button"
                onClick={() => setSpreadTeam(game.homeTeam)}
                className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  spreadTeam === game.homeTeam
                    ? 'border-green-600 bg-green-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-green-400'
                }`}
              >
                {game.homeTeam}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="spread-value" className="block text-sm font-medium text-gray-700 mb-2">
              Spread Value
            </label>
            <input
              id="spread-value"
              type="number"
              step="0.5"
              placeholder="e.g., -7.5 or +3.5"
              value={spreadValue}
              onChange={(e) => setSpreadValue(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="mt-2 text-xs text-gray-500">
              <strong>Example:</strong> Lakers -7.5 means Lakers must win by more than 7.5 points
            </p>
          </div>
        </div>
      )}

      {/* TOTAL Prediction */}
      {predictionType === 'TOTAL' && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Over or Under?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTotalPrediction('OVER')}
                className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  totalPrediction === 'OVER'
                    ? 'border-green-600 bg-green-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-green-400'
                }`}
              >
                OVER
              </button>
              <button
                type="button"
                onClick={() => setTotalPrediction('UNDER')}
                className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  totalPrediction === 'UNDER'
                    ? 'border-green-600 bg-green-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-green-400'
                }`}
              >
                UNDER
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="total-value" className="block text-sm font-medium text-gray-700 mb-2">
              Total Value
            </label>
            <input
              id="total-value"
              type="number"
              step="0.5"
              placeholder="e.g., 215.5"
              value={totalValue}
              onChange={(e) => setTotalValue(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="mt-2 text-xs text-gray-500">
              <strong>Example:</strong> Over 215.5 means the combined score must be higher than 215.5
            </p>
          </div>
        </div>
      )}

      {/* Prediction Summary */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm font-medium text-blue-900">Your Prediction:</p>
        <p className="mt-1 text-sm text-blue-700">
          {predictionType === 'WINNER' && predictedWinner && (
            <>{predictedWinner} to win</>
          )}
          {predictionType === 'SPREAD' && spreadTeam && spreadValue && (
            <>
              {spreadTeam} {parseFloat(spreadValue) >= 0 ? '+' : ''}
              {spreadValue}
            </>
          )}
          {predictionType === 'TOTAL' && totalValue && totalPrediction && (
            <>
              {totalPrediction} {totalValue} points
            </>
          )}
          {!predictedWinner && predictionType === 'WINNER' && (
            <span className="text-gray-500">Select a team</span>
          )}
          {(!spreadTeam || !spreadValue) && predictionType === 'SPREAD' && (
            <span className="text-gray-500">Enter spread details</span>
          )}
          {!totalValue && predictionType === 'TOTAL' && (
            <span className="text-gray-500">Enter total value</span>
          )}
        </p>
      </div>
    </div>
  );
}
