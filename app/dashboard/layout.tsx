import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-8 py-6">
          {/* Left Sidebar - Twitter-like navigation */}
          <div className="col-span-3 xl:col-span-2">
            <DashboardSidebar user={session.user} />
          </div>

          {/* Main Content Area - Center feed */}
          <main className="col-span-9 xl:col-span-10">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/5 overflow-hidden">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
