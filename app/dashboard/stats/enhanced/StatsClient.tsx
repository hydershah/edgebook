"use client";

import { useState } from "react";
import PerformanceChart from "@/components/analytics/PerformanceChart";
import TimePeriodFilter from "@/components/analytics/TimePeriodFilter";
import StreakDisplay from "@/components/analytics/StreakDisplay";
import CalendarHeatmap from "@/components/analytics/CalendarHeatmap";
import BestWorstPeriods from "@/components/analytics/BestWorstPeriods";
import PickTypeBreakdown from "@/components/analytics/PickTypeBreakdown";
import BetSizingSimulator from "@/components/analytics/BetSizingSimulator";
import { TrendingUp } from "lucide-react";

interface StatsClientProps {
  initialPeriod: "7d" | "30d" | "3mo" | "1yr" | "all";
  initialPerformanceData: any[];
  streakData: any;
  heatmapData: any[];
  bestWorstPeriods: any;
  pickTypePerformance: any[];
  betSizingSimulations: any[];
  userId: string;
}

export default function StatsClient({
  initialPeriod,
  initialPerformanceData,
  streakData,
  heatmapData,
  bestWorstPeriods,
  pickTypePerformance,
  betSizingSimulations,
  userId,
}: StatsClientProps) {
  const [period, setPeriod] = useState<"7d" | "30d" | "3mo" | "1yr" | "all">(
    initialPeriod
  );
  const [performanceData, setPerformanceData] = useState(
    initialPerformanceData
  );
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<
    "winRate" | "revenue" | "picks"
  >("winRate");

  const handlePeriodChange = async (
    newPeriod: "7d" | "30d" | "3mo" | "1yr" | "all"
  ) => {
    setPeriod(newPeriod);
    setLoading(true);

    try {
      const response = await fetch(
        `/api/analytics/performance?period=${newPeriod}`
      );
      if (response.ok) {
        const data = await response.json();
        setPerformanceData(data.performanceData);
      }
    } catch (error) {
      console.error("Error fetching performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Performance Over Time */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-black/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <TrendingUp className="text-primary" size={20} />
              Performance Over Time
            </h3>
            <p className="text-sm text-gray-600">
              Track your progress and identify trends
            </p>
          </div>
          <div className="flex items-center gap-4">
            <TimePeriodFilter selected={period} onChange={handlePeriodChange} />
          </div>
        </div>

        {/* Metric selector */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setSelectedMetric("winRate")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              selectedMetric === "winRate"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Win Rate
          </button>
          <button
            onClick={() => setSelectedMetric("revenue")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              selectedMetric === "revenue"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setSelectedMetric("picks")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              selectedMetric === "picks"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Pick Volume
          </button>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : (
          <PerformanceChart data={performanceData} metric={selectedMetric} />
        )}
      </div>

      {/* Streak Tracking */}
      <StreakDisplay current={streakData.current} longest={streakData.longest} />

      {/* Calendar Heatmap */}
      <CalendarHeatmap
        data={heatmapData}
        startDate={new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)}
        endDate={new Date()}
      />

      {/* Best/Worst Periods */}
      <BestWorstPeriods
        bestMonths={bestWorstPeriods.bestMonths}
        worstMonths={bestWorstPeriods.worstMonths}
        bestDaysOfWeek={bestWorstPeriods.bestDaysOfWeek}
        worstDaysOfWeek={bestWorstPeriods.worstDaysOfWeek}
      />

      {/* Pick Type Breakdown */}
      <PickTypeBreakdown data={pickTypePerformance} />

      {/* Bet Sizing Simulator */}
      <BetSizingSimulator simulations={betSizingSimulations} />
    </div>
  );
}
