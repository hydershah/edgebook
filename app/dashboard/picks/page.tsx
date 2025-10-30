import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PickCard from "@/components/PickCard";
import Link from "next/link";
import { Plus, Target } from "lucide-react";

export default async function MyPicksPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboard/picks");
  }

  const picks = await prisma.pick.findMany({
    where: { userId: session.user.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Picks</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              All your predictions in one place
            </p>
          </div>
          <Link
            href="/createpick"
            className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark hover:shadow-2xl hover:shadow-primary/30 text-white font-bold rounded-full transition-all duration-300 flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            Create Pick
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-4 gap-8">
          <StatItem
            label="Total Picks"
            value={picks.length.toLocaleString()}
          />
          <StatItem
            label="Pending"
            value={picks.filter((p) => p.status === "PENDING").length.toLocaleString()}
            color="text-yellow-600"
          />
          <StatItem
            label="Won"
            value={picks.filter((p) => p.status === "WON").length.toLocaleString()}
            color="text-green-600"
          />
          <StatItem
            label="Lost"
            value={picks.filter((p) => p.status === "LOST").length.toLocaleString()}
            color="text-red-600"
          />
        </div>
      </div>

      {/* Picks List */}
      {picks.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6 shadow-xl shadow-black/5">
            <Target className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No picks yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start sharing your predictions and build your edge
          </p>
          <Link
            href="/createpick"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark hover:shadow-2xl hover:shadow-primary/30 text-white font-bold rounded-full transition-all duration-300 shadow-lg shadow-primary/20"
          >
            <Plus size={20} />
            Create Your First Pick
          </Link>
        </div>
      ) : (
        <div className="space-y-3 px-6 pb-6">
          {picks.map((pick) => (
            <div key={pick.id} className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 overflow-hidden">
              <PickCard
                pick={{
                  ...pick,
                  createdAt: pick.createdAt.toISOString(),
                  gameDate: pick.gameDate.toISOString(),
                  lockedAt: pick.lockedAt?.toISOString() ?? null,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatItem({
  label,
  value,
  color = "text-gray-900",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
