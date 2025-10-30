import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { DollarSign, TrendingUp, TrendingDown, Clock } from "lucide-react";

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

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  const netProfit =
    profile.earnings.netRevenue - profile.earnings.totalSpending;

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Earnings</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Track your revenue, spending, and transactions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<DollarSign className="text-emerald-500" size={20} />}
          label="Total Earnings"
          value={currencyFormatter.format(profile.earnings.totalRevenue)}
          trend="Revenue from picks"
          trendColor="text-gray-600"
        />
        <SummaryCard
          icon={<TrendingDown className="text-red-500" size={20} />}
          label="Platform Fees"
          value={currencyFormatter.format(profile.earnings.platformFees)}
          trend="Service charges"
          trendColor="text-gray-600"
        />
        <SummaryCard
          icon={<TrendingUp className="text-green-600" size={20} />}
          label="Net Revenue"
          value={currencyFormatter.format(profile.earnings.netRevenue)}
          trend="After fees"
          trendColor="text-gray-600"
        />
        <SummaryCard
          icon={
            <DollarSign
              className={netProfit >= 0 ? "text-emerald-600" : "text-red-600"}
              size={20}
            />
          }
          label="Net Profit"
          value={currencyFormatter.format(netProfit)}
          trend="Revenue minus spending"
          trendColor={netProfit >= 0 ? "text-emerald-600" : "text-red-600"}
        />
        </div>
      </div>

      {/* Financial Overview */}
      <div className="px-6 py-6 border-b border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Breakdown */}
          <div>
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Revenue Breakdown
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
              <div>
                <p className="text-sm text-gray-600">Gross Earnings</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {currencyFormatter.format(profile.earnings.totalRevenue)}
                </p>
              </div>
              <TrendingUp className="text-emerald-600" size={32} />
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
              <div>
                <p className="text-sm text-gray-600">Platform Fees</p>
                <p className="text-2xl font-bold text-red-700">
                  {currencyFormatter.format(profile.earnings.platformFees)}
                </p>
              </div>
              <TrendingDown className="text-red-600" size={32} />
            </div>
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl border-2 border-primary">
              <div>
                <p className="text-sm text-gray-600">Net Revenue</p>
                <p className="text-2xl font-bold text-primary">
                  {currencyFormatter.format(profile.earnings.netRevenue)}
                </p>
              </div>
              <DollarSign className="text-primary" size={32} />
            </div>
          </div>
        </div>

        {/* Spending Summary */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Spending Summary
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm text-gray-600">Total Spending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currencyFormatter.format(profile.earnings.totalSpending)}
                </p>
              </div>
              <DollarSign className="text-gray-600" size={32} />
            </div>
            <div
              className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                netProfit >= 0
                  ? "bg-emerald-50 border-emerald-500"
                  : "bg-red-50 border-red-500"
              }`}
            >
              <div>
                <p className="text-sm text-gray-600">Net Profit/Loss</p>
                <p
                  className={`text-2xl font-bold ${
                    netProfit >= 0 ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  {currencyFormatter.format(netProfit)}
                </p>
              </div>
              {netProfit >= 0 ? (
                <TrendingUp className="text-emerald-600" size={32} />
              ) : (
                <TrendingDown className="text-red-600" size={32} />
              )}
            </div>
            <p className="text-sm text-gray-600 text-center pt-2">
              {netProfit >= 0
                ? "You're in profit! Keep it up."
                : "Focus on high-confidence picks to improve."}
            </p>
          </div>
        </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="px-6 py-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">
          Recent Transactions
        </h2>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6 shadow-lg shadow-black/5">
              <Clock className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500">No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr
                    key={txn.id}
                    className="border-b border-white/30 hover:bg-white/40 transition-colors"
                  >
                    <td className="py-4 px-4 text-sm text-gray-900">
                      {new Date(txn.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-gray-900">
                        {txn.type}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          txn.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : txn.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span
                        className={`text-sm font-semibold ${
                          txn.type.includes("PURCHASE") ||
                          txn.type.includes("SUBSCRIPTION")
                            ? "text-red-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {txn.type.includes("PURCHASE") ||
                        txn.type.includes("SUBSCRIPTION")
                          ? "-"
                          : "+"}
                        {currencyFormatter.format(txn.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  trend,
  trendColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  trendColor: string;
}) {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 hover:shadow-lg hover:shadow-black/10 transition-all duration-300 shadow-md shadow-black/5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className={`text-sm ${trendColor} mt-1`}>{trend}</p>
    </div>
  );
}
