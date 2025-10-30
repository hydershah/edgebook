"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PickCard from "@/components/PickCard";
import { Bookmark, Loader2 } from "lucide-react";
import Link from "next/link";

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
  bookmarkedAt: string;
  stats: {
    upvotes: number;
    downvotes: number;
    score: number;
    comments: number;
    views: number;
    unlocks: number;
    userVoteType: "UPVOTE" | "DOWNVOTE" | null;
    isBookmarked: boolean;
    isUnlocked: boolean;
  };
}

export default function SavedPage() {
  const router = useRouter();
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/bookmarks");
      if (response.ok) {
        const data = await response.json();
        setPicks(data.picks);
      } else if (response.status === 401) {
        router.push("/auth/signin?callbackUrl=/dashboard/saved");
      } else {
        console.error("Failed to fetch bookmarks");
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your saved picks...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Saved Picks</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Picks you&apos;ve bookmarked for later review
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-4 gap-8">
          <StatItem label="Total Saved" value={picks.length.toLocaleString()} />
          <StatItem
            label="Pending"
            value={picks
              .filter((p) => p.status === "PENDING")
              .length.toLocaleString()}
            color="text-yellow-600"
          />
          <StatItem
            label="Won"
            value={picks
              .filter((p) => p.status === "WON")
              .length.toLocaleString()}
            color="text-green-600"
          />
          <StatItem
            label="Premium"
            value={picks.filter((p) => p.isPremium).length.toLocaleString()}
            color="text-purple-600"
          />
        </div>
      </div>

      {/* Picks List */}
      {picks.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6 shadow-xl shadow-black/5">
            <Bookmark className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No bookmarks yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start saving picks you want to revisit later
          </p>
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark hover:shadow-2xl hover:shadow-primary/30 text-white font-bold rounded-full transition-all duration-300 shadow-lg shadow-primary/20"
          >
            Explore Picks
          </Link>
        </div>
      ) : (
        <div className="space-y-3 px-6 pb-6">
          {picks.map((pick) => (
            <div key={pick.id} className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 overflow-hidden">
              <PickCard
                pick={{
                  id: pick.id,
                  user: pick.user,
                  pickType: pick.pickType,
                  sport: pick.sport,
                  matchup: pick.matchup,
                  details: pick.details,
                  odds: pick.odds,
                  confidence: pick.confidence,
                  status: pick.status,
                  isPremium: pick.isPremium,
                  price: pick.price,
                  createdAt: pick.createdAt,
                  gameDate: pick.gameDate,
                  lockedAt: pick.lockedAt,
                }}
                stats={pick.stats}
                onStatsUpdate={fetchBookmarks}
              />
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
