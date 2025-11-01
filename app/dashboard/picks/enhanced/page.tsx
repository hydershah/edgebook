"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PickCard from "@/components/PickCard";
import PicksFilter, { FilterOptions } from "@/components/filters/PicksFilter";
import Link from "next/link";
import { Plus, Target } from "lucide-react";

interface Pick {
  id: string;
  user: {
    id: string;
    name: string | null;
    avatar?: string | null;
  };
  pickType: string;
  sport: string;
  matchup: string;
  details: string;
  odds?: string | null;
  confidence: number;
  status: string;
  isPremium: boolean;
  price?: number | null;
  createdAt: string;
  gameDate: string;
  lockedAt?: string | null;
}

export default function EnhancedMyPicksPage() {
  const router = useRouter();
  const [picks, setPicks] = useState<Pick[]>([]);
  const [filteredPicks, setFilteredPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({});

  useEffect(() => {
    fetchPicks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, picks]);

  const fetchPicks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/picks/my-picks");
      if (response.ok) {
        const data = await response.json();
        setPicks(data.picks);
        setFilteredPicks(data.picks);
      } else if (response.status === 401) {
        router.push("/auth/signin?callbackUrl=/dashboard/picks");
      }
    } catch (error) {
      console.error("Error fetching picks:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...picks];

    if (filters.sport) {
      filtered = filtered.filter((pick) => pick.sport === filters.sport);
    }

    if (filters.status) {
      filtered = filtered.filter((pick) => pick.status === filters.status);
    }

    if (filters.confidence) {
      filtered = filtered.filter((pick) => pick.confidence === filters.confidence);
    }

    if (filters.pickType) {
      filtered = filtered.filter((pick) => pick.pickType === filters.pickType);
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(
        (pick) => new Date(pick.createdAt) >= fromDate
      );
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((pick) => new Date(pick.createdAt) <= toDate);
    }

    setFilteredPicks(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your picks...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Picks</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {filteredPicks.length} of {picks.length} picks
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PicksFilter onFilterChange={setFilters} />
            <Link
              href="/createpick"
              className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark hover:shadow-2xl hover:shadow-primary/30 text-white font-bold rounded-full transition-all duration-300 flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <Plus size={18} />
              Create Pick
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-4 gap-8">
          <StatItem
            label="Total Picks"
            value={filteredPicks.length.toLocaleString()}
          />
          <StatItem
            label="Pending"
            value={filteredPicks
              .filter((p) => p.status === "PENDING")
              .length.toLocaleString()}
            color="text-yellow-600"
          />
          <StatItem
            label="Won"
            value={filteredPicks
              .filter((p) => p.status === "WON")
              .length.toLocaleString()}
            color="text-green-600"
          />
          <StatItem
            label="Lost"
            value={filteredPicks
              .filter((p) => p.status === "LOST")
              .length.toLocaleString()}
            color="text-red-600"
          />
        </div>
      </div>

      {/* Picks List */}
      {filteredPicks.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6 shadow-xl shadow-black/5">
            <Target className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {picks.length === 0 ? "No picks yet" : "No picks match your filters"}
          </h3>
          <p className="text-gray-500 mb-6">
            {picks.length === 0
              ? "Start sharing your predictions and build your edge"
              : "Try adjusting your filters to see more picks"}
          </p>
          {picks.length === 0 && (
            <Link
              href="/createpick"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark hover:shadow-2xl hover:shadow-primary/30 text-white font-bold rounded-full transition-all duration-300 shadow-lg shadow-primary/20"
            >
              <Plus size={20} />
              Create Your First Pick
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3 px-6 pb-6">
          {filteredPicks.map((pick) => (
            <div
              key={pick.id}
              className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 overflow-hidden"
            >
              <PickCard pick={pick} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatItem({
  label,
  value,
  color = "text-gray-900",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
