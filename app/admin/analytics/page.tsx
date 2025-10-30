"use client";

import { useEffect, useState, useCallback } from "react";
import KPICard from "@/components/admin/KPICard";
import { Users, DollarSign, FileText, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?days=${period}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
    setLoading(false);
  }, [period]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Platform performance metrics
          </p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Users"
          value={analytics?.users?.total?.toLocaleString() || "0"}
          icon={Users}
          color="blue"
        />
        <KPICard
          title="Active Users"
          value={analytics?.users?.active || 0}
          icon={TrendingUp}
          color="green"
        />
        <KPICard
          title="Total Revenue"
          value={`$${(analytics?.revenue?.total || 0).toFixed(2)}`}
          icon={DollarSign}
          color="green"
        />
        <KPICard
          title="Total Picks"
          value={analytics?.content?.totalPicks?.toLocaleString() || "0"}
          icon={FileText}
          color="purple"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Analytics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            User Analytics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                New Users
              </span>
              <span className="font-semibold text-gray-900">
                {analytics?.users?.new || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Low Trust Users
              </span>
              <span className="font-semibold text-gray-900">
                {analytics?.users?.lowTrust || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Banned
              </span>
              <span className="font-semibold text-red-600">
                {analytics?.users?.banned || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Suspended
              </span>
              <span className="font-semibold text-yellow-600">
                {analytics?.users?.suspended || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Revenue Analytics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Analytics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Total Revenue
              </span>
              <span className="font-semibold text-gray-900">
                ${(analytics?.revenue?.total || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Platform Fees
              </span>
              <span className="font-semibold text-gray-900">
                ${(analytics?.revenue?.totalFees || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Recent Revenue
              </span>
              <span className="font-semibold text-green-600">
                ${(analytics?.revenue?.recentRevenue || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Transaction Count
              </span>
              <span className="font-semibold text-gray-900">
                {analytics?.revenue?.transactionCount || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Content Analytics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Content Analytics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Total Picks
              </span>
              <span className="font-semibold text-gray-900">
                {analytics?.content?.totalPicks || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                New Picks
              </span>
              <span className="font-semibold text-gray-900">
                {analytics?.content?.newPicks || 0}
              </span>
            </div>
            {Object.entries(analytics?.content?.byStatus || {}).map(
              ([status, count]: [string, any]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {status}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {count}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Moderation Analytics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Moderation Analytics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Pending Reports
              </span>
              <span className="font-semibold text-yellow-600">
                {analytics?.moderation?.pendingReports || 0}
              </span>
            </div>
            {Object.entries(analytics?.moderation?.byStatus || {}).map(
              ([status, count]: [string, any]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {status}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {count}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
