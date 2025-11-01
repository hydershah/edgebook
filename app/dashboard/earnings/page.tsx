import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { DollarSign, TrendingUp, Clock, ArrowUpRight, ArrowDownRight, Wallet, BarChart3, Eye, ShoppingCart, Target, Award, TrendingDown } from "lucide-react";
import { PickStatus } from "@prisma/client";
import WithdrawalButton from "./WithdrawalButton";
import MinimumThresholdBanner from "./MinimumThresholdBanner";

export default async function EarningsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboard/earnings");
  }

  const profile = await getUserProfile(session.user.id, session.user.id);

  if (!profile) {
    redirect("/feed");
  }

  // Fetch all transactions
  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Fetch payout history
  const payouts = await prisma.payout.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Calculate pending balance (earnings that haven't been paid out yet)
  const completedPayouts = await prisma.payout.findMany({
    where: {
      userId: session.user.id,
      status: "PAID"
    },
  });

  const totalPaidOut = completedPayouts.reduce((sum, payout) => sum + payout.amount, 0);
  const pendingBalance = profile.earnings.netRevenue - totalPaidOut;

  // Fetch pick-related stats
  const [premiumPicks, freePicks, totalViews, totalSales, recentEarnings] = await Promise.all([
    prisma.pick.count({
      where: { userId: session.user.id, isPremium: true },
    }),
    prisma.pick.count({
      where: { userId: session.user.id, isPremium: false },
    }),
    prisma.pick.aggregate({
      _sum: { viewCount: true },
      where: { userId: session.user.id },
    }),
    prisma.purchase.count({
      where: { pick: { userId: session.user.id } },
    }),
    prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        type: { in: ["PICK_SALE", "SUBSCRIPTION_REVENUE"] },
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      },
      select: { amount: true, createdAt: true },
    }),
  ]);

  const totalViewCount = Number(totalViews._sum.viewCount ?? 0);
  const conversionRate = totalViewCount > 0 ? ((totalSales / totalViewCount) * 100).toFixed(2) : "0.00";
  const avgPickPrice = totalSales > 0 ? (profile.earnings.totalRevenue / totalSales).toFixed(2) : "0.00";

  // Calculate 30-day earnings
  const last30DaysEarnings = recentEarnings.reduce((sum, t) => sum + t.amount, 0);

  // Get best performing sport
  const bestSport = profile.performanceBySport.length > 0
    ? profile.performanceBySport.sort((a, b) => b.winRate - a.winRate)[0]
    : null;

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Earnings Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">
          Track your performance, earnings, and growth
        </p>
      </div>

      {/* Minimum Threshold Banner - Show if balance is below $50 */}
      {pendingBalance < 50 && (
        <div className="px-6 pt-6">
          <MinimumThresholdBanner
            currentBalance={pendingBalance}
            threshold={50}
          />
        </div>
      )}

      {/* Withdrawal Button - Show if balance is above $50 */}
      {pendingBalance >= 50 && (
        <div className="px-6 pt-6">
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-emerald-900">Ready to Withdraw!</h3>
                <p className="text-sm text-emerald-700 mt-1">
                  You have {currencyFormatter.format(pendingBalance)} available for withdrawal.
                </p>
              </div>
              <WithdrawalButton
                availableBalance={pendingBalance}
                minimumThreshold={50}
                userId={session.user.id}
              />
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={<Wallet className="text-emerald-600" size={20} />}
            label="Available Balance"
            value={currencyFormatter.format(pendingBalance)}
            sublabel="Ready to withdraw"
            trend={last30DaysEarnings > 0 ? `+${currencyFormatter.format(last30DaysEarnings)} (30d)` : "No recent earnings"}
            trendUp={last30DaysEarnings > 0}
            highlight
          />
          <MetricCard
            icon={<TrendingUp className="text-blue-600" size={20} />}
            label="Total Earnings"
            value={currencyFormatter.format(profile.earnings.netRevenue)}
            sublabel="All-time revenue"
            trend={`${totalSales} sales`}
          />
          <MetricCard
            icon={<Target className="text-purple-600" size={20} />}
            label="Win Rate"
            value={`${profile.stats.accuracy}%`}
            sublabel={`${profile.stats.won}-${profile.stats.lost} record`}
            trend={bestSport ? `Best: ${bestSport.sport} (${bestSport.winRate}%)` : "No picks yet"}
          />
          <MetricCard
            icon={<ShoppingCart className="text-orange-600" size={20} />}
            label="Conversion Rate"
            value={`${conversionRate}%`}
            sublabel={`${totalSales} / ${totalViewCount.toLocaleString()} views`}
            trend={`Avg: ${currencyFormatter.format(Number(avgPickPrice))}/pick`}
          />
        </div>
      </div>

      {/* Performance & Earnings Overview */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pick Performance */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-white" size={24} />
                <div>
                  <h2 className="text-lg font-semibold text-white">Pick Performance</h2>
                  <p className="text-xs text-blue-100 mt-0.5">Your track record at a glance</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <StatBox
                  label="Total Picks"
                  value={profile.stats.totalPicks.toString()}
                  icon={<BarChart3 size={16} className="text-gray-400" />}
                />
                <StatBox
                  label="Premium Picks"
                  value={premiumPicks.toString()}
                  icon={<Award size={16} className="text-yellow-500" />}
                  highlight
                />
                <StatBox
                  label="Free Picks"
                  value={freePicks.toString()}
                  icon={<Target size={16} className="text-gray-400" />}
                />
                <StatBox
                  label="Total Views"
                  value={totalViewCount.toLocaleString()}
                  icon={<Eye size={16} className="text-blue-500" />}
                />
              </div>

              {/* Win/Loss Visual */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Record</span>
                  <span className="text-sm font-bold text-gray-900">{profile.stats.winLossRecord}</span>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
                  {profile.stats.won > 0 && (
                    <div
                      className="bg-emerald-500"
                      style={{ width: `${(profile.stats.won / profile.stats.settled) * 100}%` }}
                    />
                  )}
                  {profile.stats.lost > 0 && (
                    <div
                      className="bg-red-500"
                      style={{ width: `${(profile.stats.lost / profile.stats.settled) * 100}%` }}
                    />
                  )}
                </div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-emerald-600 font-medium">{profile.stats.won} Won</span>
                  <span className="text-red-600 font-medium">{profile.stats.lost} Lost</span>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <DollarSign className="text-white" size={24} />
                <div>
                  <h2 className="text-lg font-semibold text-white">Revenue Breakdown</h2>
                  <p className="text-xs text-emerald-100 mt-0.5">How your money flows</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-600">Gross Revenue</p>
                  <p className="text-xs text-gray-500 mt-0.5">Before platform fees</p>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {currencyFormatter.format(profile.earnings.totalRevenue)}
                </p>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Withdrawn</p>
                  <p className="text-xs text-gray-500 mt-0.5">Paid to your account</p>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {currencyFormatter.format(totalPaidOut)}
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 bg-emerald-50 -mx-6 px-6 py-4 -mb-6">
                <div>
                  <p className="text-sm font-semibold text-emerald-900">Available Now</p>
                  <p className="text-xs text-emerald-700 mt-0.5">Ready for withdrawal</p>
                </div>
                <p className="text-2xl font-bold text-emerald-600">
                  {currencyFormatter.format(pendingBalance)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payout History */}
      {payouts.length > 0 && (
        <div className="px-6 pb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <ArrowDownRight className="text-white" size={24} />
                <div>
                  <h2 className="text-lg font-semibold text-white">Withdrawal History</h2>
                  <p className="text-xs text-purple-100 mt-0.5">{payouts.length} total withdrawals</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-6 text-sm text-gray-900">
                        {new Date(payout.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-6">
                        <span className="text-sm text-gray-900 capitalize">
                          {payout.method.toLowerCase().replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <PayoutStatusBadge status={payout.status} />
                      </td>
                      <td className="py-3 px-6 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {currencyFormatter.format(payout.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <Clock className="text-white" size={24} />
              <div>
                <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                <p className="text-xs text-orange-100 mt-0.5">
                  {transactions.length === 0 ? "No transactions yet" : `${transactions.length} recent transactions`}
                </p>
              </div>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No transactions yet</p>
              <p className="text-sm text-gray-500 mt-1">Your activity will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.slice(0, 20).map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-6 text-sm text-gray-900 whitespace-nowrap">
                        {new Date(txn.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        <span className="block text-xs text-gray-500">
                          {new Date(txn.createdAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          {txn.type.includes("PURCHASE") || txn.type.includes("SUBSCRIPTION") ? (
                            <ArrowDownRight className="text-red-500" size={16} />
                          ) : (
                            <ArrowUpRight className="text-emerald-500" size={16} />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {formatTransactionType(txn.type)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-sm text-gray-600 max-w-xs truncate">
                        {txn.description || "—"}
                      </td>
                      <td className="py-3 px-6">
                        <TransactionStatusBadge status={txn.status} />
                      </td>
                      <td className="py-3 px-6 text-right">
                        <span
                          className={`text-sm font-semibold ${
                            txn.type.includes("PURCHASE") || txn.type.includes("SUBSCRIPTION")
                              ? "text-red-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {txn.type.includes("PURCHASE") || txn.type.includes("SUBSCRIPTION")
                            ? "−"
                            : "+"}
                          {currencyFormatter.format(txn.amount)}
                        </span>
                        {txn.platformFee && txn.platformFee > 0 && (
                          <span className="block text-xs text-gray-500 mt-1">
                            Fee: {currencyFormatter.format(txn.platformFee)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTransactionType(type: string): string {
  const typeMap: Record<string, string> = {
    PICK_PURCHASE: "Pick Purchase",
    PICK_SALE: "Pick Sale",
    SUBSCRIPTION: "Subscription",
    SUBSCRIPTION_REVENUE: "Subscription Revenue",
    PAYOUT: "Payout",
    REFUND: "Refund",
    PLATFORM_FEE: "Platform Fee",
    ADJUSTMENT: "Adjustment",
  };
  return typeMap[type] || type.replace(/_/g, " ");
}

function MetricCard({
  icon,
  label,
  value,
  sublabel,
  trend,
  trendUp,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel: string;
  trend?: string;
  trendUp?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white border rounded-xl p-5 transition-all duration-200 hover:shadow-lg ${
        highlight
          ? "border-emerald-200 ring-2 ring-emerald-100 shadow-md"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {icon}
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{sublabel}</p>
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
          {trendUp !== undefined && (
            trendUp ? (
              <TrendingUp className="text-emerald-500" size={14} />
            ) : (
              <TrendingDown className="text-gray-400" size={14} />
            )
          )}
          <span className={`text-xs font-medium ${trendUp ? "text-emerald-600" : "text-gray-600"}`}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        highlight ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-xs font-medium text-gray-600">{label}</p>
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function TransactionStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    COMPLETED: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Completed" },
    PENDING: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
    PROCESSING: { bg: "bg-blue-100", text: "text-blue-800", label: "Processing" },
    FAILED: { bg: "bg-red-100", text: "text-red-800", label: "Failed" },
    REFUNDED: { bg: "bg-gray-100", text: "text-gray-800", label: "Refunded" },
    REVERSED: { bg: "bg-purple-100", text: "text-purple-800", label: "Reversed" },
  };

  const config = statusConfig[status] || { bg: "bg-gray-100", text: "text-gray-800", label: status };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

function PayoutStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    PAID: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Paid" },
    PENDING: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
    PROCESSING: { bg: "bg-blue-100", text: "text-blue-800", label: "Processing" },
    UNDER_REVIEW: { bg: "bg-orange-100", text: "text-orange-800", label: "Under Review" },
    APPROVED: { bg: "bg-green-100", text: "text-green-800", label: "Approved" },
    REJECTED: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
    FAILED: { bg: "bg-red-100", text: "text-red-800", label: "Failed" },
  };

  const config = statusConfig[status] || { bg: "bg-gray-100", text: "text-gray-800", label: status };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
