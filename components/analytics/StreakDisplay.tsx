"use client";

import { TrendingUp, TrendingDown, Award } from "lucide-react";

interface StreakDisplayProps {
  current: {
    type: "win" | "loss" | "none";
    count: number;
  };
  longest: {
    wins: number;
    losses: number;
  };
}

export default function StreakDisplay({ current, longest }: StreakDisplayProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Current Streak */}
      <div
        className={`p-6 rounded-xl ${
          current.type === "win"
            ? "bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200"
            : current.type === "loss"
            ? "bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200"
            : "bg-gray-50 border-2 border-gray-200"
        }`}
      >
        <div className="flex items-center gap-3 mb-2">
          {current.type === "win" ? (
            <TrendingUp className="text-emerald-600" size={24} />
          ) : current.type === "loss" ? (
            <TrendingDown className="text-red-600" size={24} />
          ) : (
            <Award className="text-gray-400" size={24} />
          )}
          <h3 className="text-sm font-medium text-gray-600">Current Streak</h3>
        </div>
        <div className="flex items-baseline gap-2">
          <p
            className={`text-4xl font-bold ${
              current.type === "win"
                ? "text-emerald-700"
                : current.type === "loss"
                ? "text-red-700"
                : "text-gray-400"
            }`}
          >
            {current.count}
          </p>
          <p
            className={`text-lg font-medium ${
              current.type === "win"
                ? "text-emerald-600"
                : current.type === "loss"
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            {current.type === "none"
              ? "No streak"
              : current.type === "win"
              ? "wins"
              : "losses"}
          </p>
        </div>
      </div>

      {/* Longest Win Streak */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <div className="flex items-center gap-3 mb-2">
          <Award className="text-blue-600" size={24} />
          <h3 className="text-sm font-medium text-gray-600">
            Longest Win Streak
          </h3>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-4xl font-bold text-blue-700">{longest.wins}</p>
          <p className="text-lg font-medium text-blue-600">wins</p>
        </div>
      </div>

      {/* Longest Loss Streak */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
        <div className="flex items-center gap-3 mb-2">
          <TrendingDown className="text-orange-600" size={24} />
          <h3 className="text-sm font-medium text-gray-600">
            Longest Loss Streak
          </h3>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-4xl font-bold text-orange-700">{longest.losses}</p>
          <p className="text-lg font-medium text-orange-600">losses</p>
        </div>
      </div>
    </div>
  );
}
