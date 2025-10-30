"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Bookmark,
  BarChart3,
  DollarSign,
  Settings,
  Plus,
  User,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Picks", href: "/dashboard/picks", icon: Target },
  { name: "Saved", href: "/dashboard/saved", icon: Bookmark },
  { name: "Stats", href: "/dashboard/stats", icon: BarChart3 },
  { name: "Earnings", href: "/dashboard/earnings", icon: DollarSign },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/profile/settings", icon: Settings },
];

export default function DashboardSidebar({ user }: { user: any }) {
  const pathname = usePathname();

  return (
    <div className="sticky top-6 h-[calc(100vh-3rem)]">
      <div className="flex flex-col h-full py-6 bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/5 px-4">
        {/* Navigation */}
        <nav className="flex-1">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-4 px-4 py-3 text-lg font-medium rounded-2xl
                    transition-all duration-300
                    ${
                      isActive
                        ? "bg-primary/10 text-primary font-bold shadow-lg shadow-primary/10"
                        : "text-gray-700 hover:bg-white/80 hover:shadow-md hover:shadow-black/5"
                    }
                  `}
                >
                  <Icon className="h-6 w-6" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Create Pick Button */}
          <div className="mt-6">
            <Link
              href="/createpick"
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-primary to-primary-dark hover:shadow-2xl hover:shadow-primary/30 text-white font-bold px-6 py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-primary/20"
            >
              <Plus size={20} />
              Create Pick
            </Link>
          </div>
        </nav>

        {/* User Info */}
        <div className="pt-6 mt-6 border-t border-white/20">
          <Link
            href={`/profile/${user?.id}`}
            className="flex items-center gap-3 hover:bg-white/80 rounded-2xl p-3 transition-all duration-300 hover:shadow-md hover:shadow-black/5"
          >
            <div className="flex-shrink-0">
              {user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-sm text-gray-500 truncate">
                @{user?.name?.toLowerCase().replace(/\s+/g, "") || "user"}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
