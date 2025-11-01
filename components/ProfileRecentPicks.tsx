"use client";

import { useState, useMemo } from "react";
import PickCard from "./PickCard";
import PicksFilter, { FilterOptions } from "./filters/PicksFilter";
import { Target } from "lucide-react";

interface Pick {
  id: string;
  userId: string;
  pickType: string;
  sport: string;
  matchup: string;
  details: string | null;
  odds: string | null;
  mediaUrl: string | null;
  gameDate: string;
  lockedAt: string | null;
  confidence: number;
  status: string;
  isPremium: boolean;
  price: number | null;
  createdAt: string;
  updatedAt?: Date | string;
  viewCount?: number;
  sportradarGameId?: string | null;
  homeTeam?: string | null;
  awayTeam?: string | null;
  gameStatus?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  venue?: string | null;
  predictionType?: 'WINNER' | 'SPREAD' | 'TOTAL' | null;
  predictedWinner?: string | null;
  spreadValue?: number | null;
  spreadTeam?: string | null;
  totalValue?: number | null;
  totalPrediction?: string | null;
  resultDetermined?: boolean;
  resultNotes?: string | null;
  moderationStatus?: string;
  reportCount?: number;
  moderatedBy?: string | null;
  moderatedAt?: Date | string | null;
  moderationNotes?: string | null;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}

interface ProfileRecentPicksProps {
  picks: Pick[];
  sports?: string[];
}

export default function ProfileRecentPicks({
  picks,
  sports,
}: ProfileRecentPicksProps) {
  const [filters, setFilters] = useState<FilterOptions>({});

  // Get unique sports from picks if not provided
  const availableSports = useMemo(() => {
    if (sports) return sports;
    return Array.from(new Set(picks.map((pick) => pick.sport)));
  }, [picks, sports]);

  // Filter picks based on selected filters
  const filteredPicks = useMemo(() => {
    return picks.filter((pick) => {
      // Sport filter
      if (filters.sport && pick.sport !== filters.sport) {
        return false;
      }

      // Status filter
      if (filters.status && pick.status !== filters.status) {
        return false;
      }

      // Confidence filter
      if (filters.confidence && pick.confidence !== filters.confidence) {
        return false;
      }

      // Pick type filter
      if (filters.pickType && pick.pickType !== filters.pickType) {
        return false;
      }

      // Date range filter (using createdAt)
      if (filters.dateFrom) {
        const pickDate = new Date(pick.createdAt);
        const fromDate = new Date(filters.dateFrom);
        if (pickDate < fromDate) {
          return false;
        }
      }

      if (filters.dateTo) {
        const pickDate = new Date(pick.createdAt);
        const toDate = new Date(filters.dateTo);
        // Set to end of day for inclusive filtering
        toDate.setHours(23, 59, 59, 999);
        if (pickDate > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [picks, filters]);

  return (
    <div className="mt-8">
      {/* Header with Filter */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xl font-bold text-gray-900">Recent Picks</h2>
        <PicksFilter
          onFilterChange={setFilters}
          sports={availableSports}
          pickTypes={["MONEYLINE", "SPREAD", "TOTAL", "PROP"]}
        />
      </div>

      {/* Picks List */}
      {filteredPicks.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/5 p-16 text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">
            {picks.length === 0
              ? "No picks shared yet"
              : "No picks match your filters"}
          </p>
          {picks.length > 0 && filteredPicks.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your filter settings
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPicks.map((pick) => (
            <div
              key={pick.id}
              className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 overflow-hidden"
            >
              <PickCard pick={pick} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}