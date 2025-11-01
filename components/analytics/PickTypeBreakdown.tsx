"use client";

import { Target, DollarSign } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface PickTypePerformance {
  pickType: string;
  totalPicks: number;
  won: number;
  lost: number;
  push: number;
  winRate: number;
  revenue: number;
  avgOdds: string | null;
}

interface PickTypeBreakdownProps {
  data: PickTypePerformance[];
}

export default function PickTypeBreakdown({ data }: PickTypeBreakdownProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-black/5">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Performance by Pick Type
        </h3>
        <p className="text-gray-600 text-center py-8">
          No pick type data available yet
        </p>
      </div>
    );
  }

  const formatPickType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const chartData = data.map((item) => ({
    name: formatPickType(item.pickType),
    winRate: item.winRate,
    picks: item.totalPicks,
  }));

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-black/5">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Target className="text-primary" size={20} />
          Performance by Pick Type
        </h3>
        <p className="text-sm text-gray-600">
          Breakdown of your performance across different bet types
        </p>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value: number, name: string) => [
                `${value}%`,
                name === "winRate" ? "Win Rate" : name,
              ]}
            />
            <Legend />
            <Bar dataKey="winRate" fill="#3b82f6" name="Win Rate %" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
                Pick Type
              </th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">
                Total
              </th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">
                Record
              </th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">
                Win Rate
              </th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                Revenue
              </th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">
                Avg Odds
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.pickType}
                className="border-b border-gray-100 hover:bg-gray-50/50"
              >
                <td className="py-4 px-2">
                  <span className="font-medium text-gray-900">
                    {formatPickType(item.pickType)}
                  </span>
                </td>
                <td className="py-4 px-2 text-center text-gray-900">
                  {item.totalPicks}
                </td>
                <td className="py-4 px-2 text-center">
                  <span className="text-sm text-gray-700">
                    {item.won}-{item.lost}
                    {item.push > 0 && `-${item.push}`}
                  </span>
                </td>
                <td className="py-4 px-2 text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                      item.winRate >= 60
                        ? "bg-emerald-100 text-emerald-800"
                        : item.winRate >= 50
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.winRate}%
                  </span>
                </td>
                <td className="py-4 px-2 text-right">
                  <span className="text-emerald-600 font-semibold">
                    ${item.revenue.toFixed(2)}
                  </span>
                </td>
                <td className="py-4 px-2 text-center">
                  <span className="text-sm text-gray-700">
                    {item.avgOdds ? (
                      <span
                        className={
                          parseInt(item.avgOdds) > 0
                            ? "text-emerald-600"
                            : "text-gray-700"
                        }
                      >
                        {parseInt(item.avgOdds) > 0 ? "+" : ""}
                        {item.avgOdds}
                      </span>
                    ) : (
                      "—"
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
