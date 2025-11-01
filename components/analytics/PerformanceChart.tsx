"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface PerformanceChartProps {
  data: Array<{
    date: string;
    winRate: number;
    picks: number;
    won: number;
    lost: number;
    revenue: number;
  }>;
  metric: "winRate" | "revenue" | "picks";
}

export default function PerformanceChart({
  data,
  metric = "winRate",
}: PerformanceChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getMetricConfig = () => {
    switch (metric) {
      case "winRate":
        return {
          dataKey: "winRate",
          name: "Win Rate",
          color: "#3b82f6",
          unit: "%",
          yAxisDomain: [0, 100],
        };
      case "revenue":
        return {
          dataKey: "revenue",
          name: "Revenue",
          color: "#10b981",
          unit: "$",
          yAxisDomain: [0, "auto"] as [number, string],
        };
      case "picks":
        return {
          dataKey: "picks",
          name: "Picks",
          color: "#8b5cf6",
          unit: "",
          yAxisDomain: [0, "auto"] as [number, string],
        };
    }
  };

  const config = getMetricConfig();

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No data available for this time period
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
        />
        <YAxis
          domain={config.yAxisDomain}
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
          formatter={(value: number) => [
            `${config.unit === "$" ? "$" : ""}${value.toFixed(
              config.unit === "$" ? 2 : 0
            )}${config.unit === "%" ? "%" : ""}`,
            config.name,
          ]}
          labelFormatter={(label) => new Date(label).toLocaleDateString()}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey={config.dataKey}
          stroke={config.color}
          strokeWidth={3}
          dot={{ fill: config.color, r: 4 }}
          activeDot={{ r: 6 }}
          name={config.name}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
