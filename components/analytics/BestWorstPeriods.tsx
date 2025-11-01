"use client";

import { Trophy, TrendingDown, Calendar } from "lucide-react";

interface PeriodData {
  period: string;
  picks: number;
  won: number;
  lost: number;
  winRate: number;
}

interface BestWorstPeriodsProps {
  bestMonths: PeriodData[];
  worstMonths: PeriodData[];
  bestDaysOfWeek: PeriodData[];
  worstDaysOfWeek: PeriodData[];
}

export default function BestWorstPeriods({
  bestMonths,
  worstMonths,
  bestDaysOfWeek,
  worstDaysOfWeek,
}: BestWorstPeriodsProps) {
  const PeriodCard = ({
    title,
    data,
    type,
    icon: Icon,
  }: {
    title: string;
    data: PeriodData[];
    type: "best" | "worst";
    icon: any;
  }) => {
    if (data.length === 0) {
      return (
        <div className="p-6 rounded-xl bg-gray-50 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Icon
              className={type === "best" ? "text-emerald-600" : "text-red-600"}
              size={20}
            />
            <h4 className="font-semibold text-gray-900">{title}</h4>
          </div>
          <p className="text-sm text-gray-500">Not enough data yet</p>
        </div>
      );
    }

    return (
      <div
        className={`p-6 rounded-xl border-2 ${
          type === "best"
            ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200"
            : "bg-gradient-to-br from-red-50 to-orange-50 border-red-200"
        }`}
      >
        <div className="flex items-center gap-2 mb-4">
          <Icon
            className={type === "best" ? "text-emerald-600" : "text-red-600"}
            size={20}
          />
          <h4 className="font-semibold text-gray-900">{title}</h4>
        </div>

        <div className="space-y-3">
          {data.map((item, index) => (
            <div
              key={item.period}
              className="flex items-center justify-between p-3 bg-white/60 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    type === "best" ? "bg-emerald-600" : "bg-red-600"
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.period}</p>
                  <p className="text-xs text-gray-600">
                    {item.won}-{item.lost} ({item.picks} picks)
                  </p>
                </div>
              </div>
              <div
                className={`text-xl font-bold ${
                  type === "best" ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {item.winRate}%
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-primary" />
          Best & Worst Performance Periods
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Identify patterns in your performance over time
        </p>
      </div>

      {/* Months */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PeriodCard
          title="Best Months"
          data={bestMonths}
          type="best"
          icon={Trophy}
        />
        <PeriodCard
          title="Worst Months"
          data={worstMonths}
          type="worst"
          icon={TrendingDown}
        />
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PeriodCard
          title="Best Days of Week"
          data={bestDaysOfWeek}
          type="best"
          icon={Trophy}
        />
        <PeriodCard
          title="Worst Days of Week"
          data={worstDaysOfWeek}
          type="worst"
          icon={TrendingDown}
        />
      </div>

      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Insight:</span> Use these patterns to
          identify when you perform best. Consider posting more picks during your
          strong periods and being more selective during weaker ones.
        </p>
      </div>
    </div>
  );
}
