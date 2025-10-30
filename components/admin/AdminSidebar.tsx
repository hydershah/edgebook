"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Flag,
  FileText,
  CreditCard,
  DollarSign,
  AlertCircle,
  BarChart3,
  ScrollText,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Moderation", href: "/admin/moderation", icon: Flag },
  { name: "Picks", href: "/admin/picks", icon: FileText },
  { name: "Transactions", href: "/admin/transactions", icon: CreditCard },
  { name: "Payouts", href: "/admin/payouts", icon: DollarSign },
  { name: "Disputes", href: "/admin/disputes", icon: AlertCircle },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({ user }: { user: any }) {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center px-6 border-b border-gray-200">
        <Link href="/admin/dashboard" className="flex items-center">
          <Image
            src="/logos/logo.png"
            alt="EdgeBook Logo"
            width={80}
            height={80}
            className="object-contain"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-lg
                  transition-colors duration-150
                  ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Role Badge */}
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || "Admin"}
            </p>
            <p className="text-xs text-gray-500">
              {(user as any)?.role || "ADMIN"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
