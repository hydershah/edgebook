import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/profile";
import PickCard from "@/components/PickCard";
import Link from "next/link";
import {
  Target,
  TrendingUp,
  Trophy,
  Calendar,
  Users,
  Sparkles,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const profile = await getUserProfile(session.user.id, session.user.id);

  if (!profile) {
    redirect("/feed");
  }

  const hasAvatar = Boolean(profile.user.avatar);
  const hasBio = Boolean(profile.user.bio);
  const profileNeedsSetup = !hasAvatar || !hasBio;
  const memberSince = new Date(profile.user.createdAt);

  return (
    <div className="grid grid-cols-12">
      {/* Main Feed Area - Center */}
      <div className="col-span-12 lg:col-span-7">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        </div>

        {/* Profile Header Card - Social Media Style */}
        <div className="px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {profile.user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.user.avatar}
                  alt={profile.user.name ?? "User"}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-white"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-2xl font-bold ring-4 ring-white">
                  {profile.user.name?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {profile.user.name ?? "Unnamed User"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    @{profile.user.name?.toLowerCase().replace(/\s+/g, "") || "user"}
                  </p>
                </div>
                <Link
                  href="/profile/settings"
                  className="px-5 py-2 rounded-full bg-white/60 backdrop-blur-sm text-sm font-bold hover:bg-white/80 hover:shadow-lg hover:shadow-black/5 transition-all duration-300"
                >
                  Edit Profile
                </Link>
              </div>

              {profile.user.bio ? (
                <p className="text-gray-900 mt-3">{profile.user.bio}</p>
              ) : (
                profileNeedsSetup && (
                  <p className="text-gray-500 text-sm mt-3">
                    Add a bio so people know what makes your edge unique.{" "}
                    <Link
                      href="/profile/settings"
                      className="text-primary font-medium hover:underline"
                    >
                      Update profile
                    </Link>
                  </p>
                )
              )}

              <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>Joined {memberSince.toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 text-sm">
                <Link
                  href={`/profile/${profile.user.id}/following`}
                  className="hover:underline"
                >
                  <span className="font-bold text-gray-900">
                    {profile.following.toLocaleString()}
                  </span>{" "}
                  <span className="text-gray-600">Following</span>
                </Link>
                <Link
                  href={`/profile/${profile.user.id}/followers`}
                  className="hover:underline"
                >
                  <span className="font-bold text-gray-900">
                    {profile.followers.toLocaleString()}
                  </span>{" "}
                  <span className="text-gray-600">Followers</span>
                </Link>
              </div>

              {profileNeedsSetup && (
                <div className="mt-4 p-4 bg-gradient-to-r from-amber-50/80 to-orange-50/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-amber-500/10">
                  <p className="flex items-center gap-2 text-sm font-medium text-amber-900">
                    <Sparkles size={16} className="text-amber-600" />
                    Complete your profile setup for better visibility
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-3 px-6 pb-6">
          {profile.recentPicks.length === 0 ? (
            <div className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6 shadow-lg shadow-black/5">
                <Target className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No picks yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start sharing your predictions and build your edge
              </p>
              <Link
                href="/createpick"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark hover:shadow-2xl hover:shadow-primary/30 text-white font-bold rounded-full transition-all duration-300 shadow-lg shadow-primary/20"
              >
                Create Your First Pick
              </Link>
            </div>
          ) : (
            <>
              {profile.recentPicks.map((pick) => (
                <div key={pick.id} className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 overflow-hidden">
                  <PickCard pick={pick} />
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Right Sidebar - Stats */}
      <div className="hidden lg:block lg:col-span-5 px-6 py-4">
        <div className="sticky top-4 space-y-4">
          {/* Quick Stats */}
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-5 shadow-xl shadow-black/5">
            <h3 className="font-bold text-gray-900 mb-4">Your Stats</h3>
            <div className="space-y-4">
              <StatRow
                icon={<Target className="text-primary" size={18} />}
                label="Total Picks"
                value={profile.stats.totalPicks.toLocaleString()}
              />
              <StatRow
                icon={<Trophy className="text-yellow-500" size={18} />}
                label="Win Rate"
                value={`${profile.stats.accuracy}%`}
                subtext={`${profile.stats.won}W / ${profile.stats.lost}L`}
              />
              <StatRow
                icon={<TrendingUp className="text-emerald-500" size={18} />}
                label="Record"
                value={profile.stats.winLossRecord}
              />
            </div>
            <Link
              href="/dashboard/stats"
              className="block mt-4 text-sm text-primary hover:underline font-medium"
            >
              View detailed stats →
            </Link>
          </div>

          {/* Performance by Sport */}
          {profile.performanceBySport.length > 0 && (
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-5 shadow-xl shadow-black/5">
              <h3 className="font-bold text-gray-900 mb-4">Top Sports</h3>
              <div className="space-y-3">
                {profile.performanceBySport.slice(0, 3).map((sport) => (
                  <div
                    key={sport.sport}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {sport.sport.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sport.totalPicks} picks
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {sport.winRate}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/dashboard/stats"
                className="block mt-4 text-sm text-primary hover:underline font-medium"
              >
                View all sports →
              </Link>
            </div>
          )}

          {/* Earnings Summary */}
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-5 shadow-xl shadow-black/5">
            <h3 className="font-bold text-gray-900 mb-4">Earnings</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Net Revenue</p>
                <p className="text-2xl font-bold text-emerald-600">
                  ${profile.earnings.netRevenue.toFixed(2)}
                </p>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Earned</span>
                  <span className="font-medium text-gray-900">
                    ${profile.earnings.totalRevenue.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">Platform Fees</span>
                  <span className="font-medium text-red-600">
                    -${profile.earnings.platformFees.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <Link
              href="/dashboard/earnings"
              className="block mt-4 text-sm text-primary hover:underline font-medium"
            >
              View earnings →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="font-bold text-gray-900">{value}</p>
        {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
      </div>
    </div>
  );
}
