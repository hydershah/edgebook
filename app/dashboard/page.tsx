import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardStats } from "@/lib/profile";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Target,
  Eye,
  ShoppingCart,
  Award,
  Users,
  UserPlus,
  Percent,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const stats = await getDashboardStats(session.user.id);

  return (
    <div className="px-6 py-6">
      {/* Header with Create Pick Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Overview</h1>
          <p className="text-gray-600 mt-1">Track your performance and revenue</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Primary CTA - Create Pick */}
          <Link
            href="/createpick"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 hover:shadow-2xl hover:shadow-primary/30 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-primary/20"
          >
            <Plus size={20} />
            Create a Pick
          </Link>

          {/* Secondary CTAs */}
          {stats.overview.netRevenue >= 50 && (
            <Link
              href="/dashboard/earnings"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white border-2 border-emerald-500 text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-all"
            >
              <DollarSign size={20} />
              Withdraw Earnings
            </Link>
          )}

          <Link
            href={`/profile/${session.user.id}`}
            className="inline-flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            <Eye size={20} />
            View Profile
          </Link>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={<DollarSign className="text-emerald-600" size={24} />}
          label="Net Revenue"
          value={`$${stats.overview.netRevenue.toFixed(2)}`}
          subtext={`$${stats.overview.totalRevenue.toFixed(2)} total earned`}
          trend="up"
          iconBg="bg-emerald-50"
        />
        <MetricCard
          icon={<Award className="text-primary" size={24} />}
          label="Win Rate"
          value={`${stats.overview.winRate}%`}
          subtext={`${stats.overview.won}W / ${stats.overview.lost}L`}
          trend={stats.overview.winRate >= 55 ? "up" : "down"}
          iconBg="bg-blue-50"
        />
        <MetricCard
          icon={<Target className="text-purple-600" size={24} />}
          label="Total Picks"
          value={stats.overview.totalPicks.toLocaleString()}
          subtext={`${stats.overview.pending} pending`}
          iconBg="bg-purple-50"
        />
        <MetricCard
          icon={<ShoppingCart className="text-orange-600" size={24} />}
          label="Total Sales"
          value={stats.overview.totalSales.toLocaleString()}
          subtext={`${stats.paidVsFree.paid.total} paid picks`}
          iconBg="bg-orange-50"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <MetricCard
          icon={<Eye className="text-indigo-600" size={20} />}
          label="Total Views"
          value={stats.overview.totalViews.toLocaleString()}
          iconBg="bg-indigo-50"
          compact
        />
        <MetricCard
          icon={<Users className="text-pink-600" size={20} />}
          label="Followers"
          value={stats.overview.followers.toLocaleString()}
          iconBg="bg-pink-50"
          compact
        />
        <MetricCard
          icon={<UserPlus className="text-teal-600" size={20} />}
          label="Following"
          value={stats.overview.following.toLocaleString()}
          iconBg="bg-teal-50"
          compact
        />
      </div>

      {/* Paid vs Free Performance */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Percent size={20} className="text-primary" />
          Paid vs Free Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Paid Picks */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border-2 border-emerald-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Paid Picks</h3>
              <div className="px-3 py-1 bg-emerald-600 text-white text-sm font-bold rounded-full">
                Premium
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Win Rate</span>
                <span className="text-2xl font-bold text-emerald-600">
                  {stats.paidVsFree.paid.winRate}%
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total Picks</span>
                <span className="font-semibold text-gray-900">
                  {stats.paidVsFree.paid.total}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Record</span>
                <span className="font-semibold text-gray-900">
                  {stats.paidVsFree.paid.won}W - {stats.paidVsFree.paid.lost}L
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Settled</span>
                <span className="font-semibold text-gray-900">
                  {stats.paidVsFree.paid.settled}
                </span>
              </div>
            </div>
          </div>

          {/* Free Picks */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Free Picks</h3>
              <div className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
                Free
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Win Rate</span>
                <span className="text-2xl font-bold text-blue-600">
                  {stats.paidVsFree.free.winRate}%
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total Picks</span>
                <span className="font-semibold text-gray-900">
                  {stats.paidVsFree.free.total}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Record</span>
                <span className="font-semibold text-gray-900">
                  {stats.paidVsFree.free.won}W - {stats.paidVsFree.free.lost}L
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Settled</span>
                <span className="font-semibold text-gray-900">
                  {stats.paidVsFree.free.settled}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Units/Confidence Breakdown */}
      {stats.unitBreakdown.length > 0 && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            Performance by Confidence Level (Units)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.unitBreakdown.map((unit) => (
              <div
                key={unit.units}
                className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl font-bold text-primary">
                    {unit.units}U
                  </span>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      unit.winRate >= 55
                        ? "bg-emerald-100 text-emerald-700"
                        : unit.winRate >= 50
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {unit.winRate}%
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-semibold">{unit.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Record</span>
                    <span className="font-semibold">
                      {unit.won}-{unit.lost}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Settled</span>
                    <span className="font-semibold">{unit.settled}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue Breakdown */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <DollarSign size={20} className="text-emerald-600" />
          Revenue Breakdown
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.overview.totalRevenue.toFixed(2)}
              </p>
            </div>
            <ArrowUpRight className="text-emerald-600" size={32} />
          </div>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-blue-50 rounded-xl border-2 border-primary">
            <div>
              <p className="text-sm text-gray-600 mb-1">Net Revenue</p>
              <p className="text-3xl font-bold text-primary">
                ${stats.overview.netRevenue.toFixed(2)}
              </p>
            </div>
            <DollarSign className="text-primary" size={40} />
          </div>
        </div>
        <Link
          href="/dashboard/earnings"
          className="block mt-4 text-center text-primary hover:underline font-semibold"
        >
          View detailed earnings →
        </Link>
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  trend?: "up" | "down";
  iconBg: string;
  compact?: boolean;
}

function MetricCard({
  icon,
  label,
  value,
  subtext,
  trend,
  iconBg,
  compact = false,
}: MetricCardProps) {
  return (
    <div
      className={`bg-white/60 backdrop-blur-sm rounded-xl shadow-lg shadow-black/5 ${
        compact ? "p-4" : "p-6"
      } hover:shadow-xl transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`${iconBg} p-2 rounded-lg`}>{icon}</div>
            <p className={`text-gray-600 ${compact ? "text-sm" : "text-base"}`}>
              {label}
            </p>
          </div>
          <p
            className={`font-bold text-gray-900 ${
              compact ? "text-xl" : "text-3xl"
            } mb-1`}
          >
            {value}
          </p>
          {subtext && (
            <p className="text-xs text-gray-500">{subtext}</p>
          )}
        </div>
        {trend && (
          <div
            className={`${
              trend === "up" ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpRight size={20} />
            ) : (
              <ArrowDownRight size={20} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
