"use client";

import { useEffect, useState } from "react";
import KPICard from "@/components/admin/KPICard";
import {
  Users,
  DollarSign,
  Flag,
  AlertCircle,
  TrendingUp,
  FileText,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import Link from "next/link";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading analytics:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 mt-1">
          Monitor platform metrics and activity
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Total Users"
          value={analytics?.users?.total?.toLocaleString() || "0"}
          icon={Users}
          color="blue"
          trend={{
            value: analytics?.users?.new || 0,
            label: "new this month",
            isPositive: true,
          }}
        />
        <KPICard
          title="Total Revenue"
          value={`$${(analytics?.revenue?.total || 0).toFixed(2)}`}
          icon={DollarSign}
          color="green"
          trend={{
            value: 12.5,
            label: "vs last month",
            isPositive: true,
          }}
        />
        <KPICard
          title="Pending Reports"
          value={analytics?.moderation?.pendingReports || 0}
          icon={Flag}
          color="yellow"
        />
        <KPICard
          title="Active Disputes"
          value={analytics?.moderation?.byStatus?.OPEN || 0}
          icon={AlertCircle}
          color="red"
        />
        <KPICard
          title="Total Picks"
          value={analytics?.content?.totalPicks?.toLocaleString() || "0"}
          icon={FileText}
          color="purple"
          trend={{
            value: analytics?.content?.newPicks || 0,
            label: "new this month",
            isPositive: true,
          }}
        />
        <KPICard
          title="Active Users"
          value={analytics?.users?.active || 0}
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Stats */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              User Statistics
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Low Trust Score Users
              </span>
              <span className="font-semibold text-gray-900">
                {analytics?.users?.lowTrust || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Banned Users
              </span>
              <StatusBadge status="BANNED" type="user" />
              <span className="font-semibold text-gray-900">
                {analytics?.users?.banned || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Suspended Users
              </span>
              <span className="font-semibold text-gray-900">
                {analytics?.users?.suspended || 0}
              </span>
            </div>
            <Link
              href="/admin/users"
              className="block w-full text-center py-2 text-sm font-medium text-primary hover:text-blue-700"
            >
              View All Users →
            </Link>
          </div>
        </div>

        {/* Moderation Queue */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Moderation Queue
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {Object.entries(analytics?.moderation?.byStatus || {}).map(
              ([status, count]: [string, any]) => (
                <div
                  key={status}
                  className="flex justify-between items-center"
                >
                  <StatusBadge status={status} type="report" />
                  <span className="font-semibold text-gray-900">
                    {count}
                  </span>
                </div>
              )
            )}
            <Link
              href="/admin/moderation"
              className="block w-full text-center py-2 text-sm font-medium text-primary hover:text-blue-700"
            >
              View Moderation Queue →
            </Link>
          </div>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Revenue Overview
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${(analytics?.revenue?.total || 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Platform Fees
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${(analytics?.revenue?.totalFees || 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Total Transactions
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {analytics?.revenue?.transactionCount || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Recent Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${(analytics?.revenue?.recentRevenue || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/moderation"
          className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <h4 className="font-semibold text-yellow-900">
            Review Reports
          </h4>
          <p className="text-sm text-yellow-700 mt-1">
            {analytics?.moderation?.pendingReports || 0} reports waiting
          </p>
        </Link>
        <Link
          href="/admin/payouts"
          className="p-4 bg-green-50 border border-green-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <h4 className="font-semibold text-green-900">
            Approve Payouts
          </h4>
          <p className="text-sm text-green-700 mt-1">
            Review pending creator payouts
          </p>
        </Link>
        <Link
          href="/admin/disputes"
          className="p-4 bg-red-50 border border-red-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <h4 className="font-semibold text-red-900">
            Resolve Disputes
          </h4>
          <p className="text-sm text-red-700 mt-1">
            Handle pick result disputes
          </p>
        </Link>
      </div>
    </div>
  );
}
