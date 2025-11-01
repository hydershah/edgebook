"use client";

import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface BetSizingSimulation {
  strategy: string;
  totalProfit: number;
  roi: number;
  maxDrawdown: number;
  unitsWon: number;
}

interface BetSizingSimulatorProps {
  simulations: BetSizingSimulation[];
}

export default function BetSizingSimulator({
  simulations,
}: BetSizingSimulatorProps) {
  if (simulations.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-black/5">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Bet Sizing Impact
        </h3>
        <p className="text-gray-600 text-center py-8">
          Not enough settled picks to simulate bet sizing strategies
        </p>
      </div>
    );
  }

  const getStrategyDescription = (strategy: string) => {
    switch (strategy.toLowerCase()) {
      case "flat":
        return "Bet the same amount (1 unit) on every pick";
      case "confidence":
        return "Bet units equal to your confidence level (1-5 units)";
      case "conservative":
        return "Always bet 0.5 units regardless of confidence";
      case "aggressive":
        return "Bet 2x your confidence level (2-10 units)";
      default:
        return "";
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-black/5">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Bet Sizing Impact Analysis
        </h3>
        <p className="text-sm text-gray-600">
          See how different betting strategies would perform with your picks
          (starting with 100 units)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {simulations.map((sim) => (
          <div
            key={sim.strategy}
            className={`p-5 rounded-xl border-2 ${
              sim.totalProfit >= 0
                ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200"
                : "bg-gradient-to-br from-red-50 to-orange-50 border-red-200"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-bold text-gray-900">
                {sim.strategy}
              </h4>
              {sim.totalProfit >= 0 ? (
                <TrendingUp className="text-emerald-600" size={24} />
              ) : (
                <TrendingDown className="text-red-600" size={24} />
              )}
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {getStrategyDescription(sim.strategy)}
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Total Profit</span>
                <span
                  className={`text-xl font-bold ${
                    sim.totalProfit >= 0 ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  {sim.totalProfit >= 0 ? "+" : ""}
                  {sim.totalProfit} units
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">ROI</span>
                <span
                  className={`text-lg font-semibold ${
                    sim.roi >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {sim.roi >= 0 ? "+" : ""}
                  {sim.roi}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Max Drawdown</span>
                <span className="text-lg font-semibold text-orange-600">
                  -{sim.maxDrawdown} units
                </span>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    Final Bankroll
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {(100 + sim.totalProfit).toFixed(2)} units
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Note:</span> These simulations use
          your actual pick history and odds (when available) to show how
          different betting strategies would have performed. Results assume
          standard juice (-110) when odds aren&apos;t specified.
        </p>
      </div>
    </div>
  );
}
