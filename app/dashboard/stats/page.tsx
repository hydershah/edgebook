import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/profile";
import { Target, Trophy, TrendingUp, Activity } from "lucide-react";

export default async function StatsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboard/stats");
  }

  const profile = await getUserProfile(session.user.id, session.user.id);

  if (!profile) {
    redirect("/feed");
  }

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Performance Stats</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Detailed analytics and insights into your picks
        </p>
      </div>

      {/* Overall Stats */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Target className="text-primary" size={20} />}
          label="Total Picks"
          value={profile.stats.totalPicks.toLocaleString()}
          subtext="All time"
        />
        <StatCard
          icon={<Trophy className="text-yellow-500" size={20} />}
          label="Win Rate"
          value={`${profile.stats.accuracy}%`}
          subtext={`${profile.stats.won}W / ${profile.stats.lost}L`}
        />
        <StatCard
          icon={<TrendingUp className="text-emerald-500" size={20} />}
          label="Record"
          value={profile.stats.winLossRecord}
          subtext="Win-Loss-Push"
        />
        <StatCard
          icon={<Activity className="text-blue-500" size={20} />}
          label="Settled"
          value={profile.stats.settled.toLocaleString()}
          subtext={`${profile.stats.totalPicks - profile.stats.settled} pending`}
        />
        </div>
      </div>

      {/* Performance by Sport */}
      <div className="px-6 py-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">
          Performance by Sport
        </h2>

        {profile.performanceBySport.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Start posting picks to see your performance breakdown
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {profile.performanceBySport.map((sport) => {
              const settled = sport.won + sport.lost;
              const winRate = settled > 0 ? (sport.won / settled) * 100 : 0;
              const maxWidth = 100;
              const winBarWidth = (sport.won / sport.totalPicks) * maxWidth;
              const lossBarWidth = (sport.lost / sport.totalPicks) * maxWidth;
              const pushBarWidth = (sport.push / sport.totalPicks) * maxWidth;

              return (
                <div
                  key={sport.sport}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 hover:shadow-lg hover:shadow-black/10 transition-all duration-300 shadow-md shadow-black/5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {sport.sport.replace(/_/g, " ")}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {sport.totalPicks} total picks
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {sport.winRate}%
                      </p>
                      <p className="text-sm text-gray-600">Win Rate</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-1 h-3 rounded-full overflow-hidden bg-gray-200 mb-3">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${winBarWidth}%` }}
                      title={`${sport.won} Wins`}
                    />
                    <div
                      className="h-full bg-red-500"
                      style={{ width: `${lossBarWidth}%` }}
                      title={`${sport.lost} Losses`}
                    />
                    {sport.push > 0 && (
                      <div
                        className="h-full bg-gray-400"
                        style={{ width: `${pushBarWidth}%` }}
                        title={`${sport.push} Pushes`}
                      />
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">
                        {sport.won}
                      </p>
                      <p className="text-xs text-gray-600">Wins</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-600">
                        {sport.lost}
                      </p>
                      <p className="text-xs text-gray-600">Losses</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-600">
                        {sport.push}
                      </p>
                      <p className="text-xs text-gray-600">Pushes</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Earnings Summary */}
      <div className="px-6 py-6 border-t border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-6">
          Financial Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-4">Revenue</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Total Earnings</span>
                <span className="font-semibold text-gray-900">
                  {currencyFormatter.format(profile.earnings.totalRevenue)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Platform Fees</span>
                <span className="font-semibold text-red-600">
                  -{currencyFormatter.format(profile.earnings.platformFees)}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Net Revenue</span>
                  <span className="text-xl font-bold text-emerald-600">
                    {currencyFormatter.format(profile.earnings.netRevenue)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-4">Spending</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Total Spending</span>
                <span className="font-semibold text-gray-900">
                  {currencyFormatter.format(profile.earnings.totalSpending)}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    Net Profit/Loss
                  </span>
                  <span
                    className={`text-xl font-bold ${
                      profile.earnings.netRevenue -
                        profile.earnings.totalSpending >=
                      0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {currencyFormatter.format(
                      profile.earnings.netRevenue -
                        profile.earnings.totalSpending
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 hover:shadow-lg hover:shadow-black/10 transition-all duration-300 shadow-md shadow-black/5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{subtext}</p>
    </div>
  );
}
