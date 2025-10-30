import Link from "next/link";
import { Calendar, Users, Sparkles } from "lucide-react";

interface ProfileCardProps {
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
    bio: string | null;
    createdAt: Date;
  };
  stats: {
    followers: number;
    following: number;
    totalPicks: number;
  };
  needsSetup?: boolean;
}

export default function ProfileCard({ user, stats, needsSetup = false }: ProfileCardProps) {
  const memberSince = new Date(user.createdAt);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-2xl font-semibold flex-shrink-0">
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar}
              alt={`${user.name ?? "User"} avatar`}
              className="w-full h-full object-cover"
            />
          ) : (
            user.name?.[0]?.toUpperCase() ?? "?"
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900 truncate">
            {user.name ?? "Unnamed Bettor"}
          </h2>
          <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
            <Calendar size={14} />
            Joined {memberSince.toLocaleDateString()}
          </p>

          {user.bio ? (
            <p className="text-gray-700 text-sm mt-3 line-clamp-2">
              {user.bio}
            </p>
          ) : (
            <p className="text-gray-500 text-sm mt-3">
              Add a bio so people know what makes your edge unique.{" "}
              <Link
                href="/profile/settings"
                className="text-primary font-medium hover:underline"
              >
                Update profile
              </Link>
              .
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
            <Link
              href={`/profile/${user.id}/followers`}
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <span className="font-semibold text-gray-900">
                {stats.followers.toLocaleString()}
              </span>
              <span>Followers</span>
            </Link>
            <span className="h-3 w-px bg-gray-300" />
            <Link
              href={`/profile/${user.id}/following`}
              className="hover:text-primary transition-colors"
            >
              <span className="font-semibold text-gray-900">
                {stats.following.toLocaleString()}
              </span>{" "}
              Following
            </Link>
            {stats.totalPicks > 0 && (
              <>
                <span className="h-3 w-px bg-gray-300" />
                <div>
                  <span className="font-semibold text-gray-900">
                    {stats.totalPicks.toLocaleString()}
                  </span>{" "}
                  Picks
                </div>
              </>
            )}
          </div>
        </div>

        <Link href="/profile/settings" className="btn-secondary shrink-0">
          Edit Profile
        </Link>
      </div>

      {needsSetup && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="flex items-center gap-2 text-sm font-medium text-amber-700">
            <Sparkles size={16} className="text-amber-500" />
            Complete your profile setup for better visibility
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4 text-right">
        This is what other users see when they visit your profile.
      </p>
    </div>
  );
}
