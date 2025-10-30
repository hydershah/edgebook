import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getRequestMetadata } from "@/lib/adminMiddleware";
import { prisma } from "@/lib/prisma";
import { logAudit, AuditAction, AuditResource } from "@/lib/audit";

// PERFORMANCE: Simple in-memory cache for analytics data (5 minute TTL)
const analyticsCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function GET(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const { session } = authCheck;
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "30");

  // PERFORMANCE: Check cache first
  const cacheKey = `analytics_${days}`
  const cached = analyticsCache.get(cacheKey)
  const now = Date.now()

  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    console.log(`Analytics cache hit for ${days} days`)
    return NextResponse.json(cached.data)
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // User Analytics
    const totalUsers = await prisma.user.count();
    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: startDate } },
    });
    const activeUsers = await prisma.loginActivity.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: startDate },
        successful: true,
      },
    });

    // Content Analytics
    const totalPicks = await prisma.pick.count();
    const newPicks = await prisma.pick.count({
      where: { createdAt: { gte: startDate } },
    });
    const picksByStatus = await prisma.pick.groupBy({
      by: ["status"],
      _count: true,
    });

    // Revenue Analytics
    const revenueData = await prisma.purchase.aggregate({
      _sum: {
        amount: true,
        platformFee: true,
      },
      _count: true,
    });

    const recentRevenue = await prisma.purchase.aggregate({
      where: { createdAt: { gte: startDate } },
      _sum: {
        amount: true,
        platformFee: true,
      },
      _count: true,
    });

    // Moderation Analytics
    const pendingReports = await prisma.report.count({
      where: { status: "PENDING" },
    });
    const reportsByStatus = await prisma.report.groupBy({
      by: ["status"],
      _count: true,
    });

    // Fraud/Trust Analytics
    const lowTrustUsers = await prisma.user.count({
      where: { trustScore: { lt: 50 } },
    });
    const bannedUsers = await prisma.user.count({
      where: { accountStatus: "BANNED" },
    });
    const suspendedUsers = await prisma.user.count({
      where: { accountStatus: "SUSPENDED" },
    });

    // Daily stats for charts (last 30 days) - Optimized with single queries
    const [dailyUsersRaw, dailyPicksRaw, dailyRevenueRaw] = await Promise.all([
      // Fetch daily user signups
      prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM "User"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")
        ORDER BY date DESC
      `,
      // Fetch daily picks created
      prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM "Pick"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")
        ORDER BY date DESC
      `,
      // Fetch daily revenue
      prisma.$queryRaw<Array<{ date: string; amount: number }>>`
        SELECT DATE("createdAt") as date, COALESCE(SUM(amount), 0)::float as amount
        FROM "Purchase"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")
        ORDER BY date DESC
      `,
    ]);

    // Create a map for quick lookups
    const dailyUsersMap = new Map(
      dailyUsersRaw.map((d) => [d.date.toString(), Number(d.count)])
    );
    const dailyPicksMap = new Map(
      dailyPicksRaw.map((d) => [d.date.toString(), Number(d.count)])
    );
    const dailyRevenueMap = new Map(
      dailyRevenueRaw.map((d) => [d.date.toString(), Number(d.amount)])
    );

    // Fill in all days including those with zero activity
    const dailyUsers: any[] = [];
    const dailyRevenue: any[] = [];
    const dailyPicks: any[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dateStr = dayStart.toISOString().split("T")[0];

      dailyUsers.push({ date: dateStr, count: dailyUsersMap.get(dateStr) || 0 });
      dailyPicks.push({ date: dateStr, count: dailyPicksMap.get(dateStr) || 0 });
      dailyRevenue.push({ date: dateStr, amount: dailyRevenueMap.get(dateStr) || 0 });
    }

    await logAudit({
      userId: session.user.id,
      action: AuditAction.VIEW_ANALYTICS,
      resource: AuditResource.ANALYTICS,
      success: true,
      ...getRequestMetadata(req),
      details: { days },
    });

    const responseData = {
      users: {
        total: totalUsers,
        new: newUsers,
        active: activeUsers.length,
        lowTrust: lowTrustUsers,
        banned: bannedUsers,
        suspended: suspendedUsers,
        daily: dailyUsers,
      },
      content: {
        totalPicks,
        newPicks,
        byStatus: picksByStatus.reduce(
          (acc, item) => {
            acc[item.status] = item._count;
            return acc;
          },
          {} as Record<string, number>
        ),
        daily: dailyPicks,
      },
      revenue: {
        total: revenueData._sum.amount || 0,
        totalFees: revenueData._sum.platformFee || 0,
        recentRevenue: recentRevenue._sum.amount || 0,
        recentFees: recentRevenue._sum.platformFee || 0,
        transactionCount: revenueData._count,
        recentCount: recentRevenue._count,
        daily: dailyRevenue,
      },
      moderation: {
        pendingReports,
        byStatus: reportsByStatus.reduce(
          (acc, item) => {
            acc[item.status] = item._count;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
    };

    // PERFORMANCE: Store in cache
    analyticsCache.set(cacheKey, { data: responseData, timestamp: Date.now() })
    console.log(`Analytics cache updated for ${days} days`)

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Error fetching analytics:", error);

    await logAudit({
      userId: session.user.id,
      action: AuditAction.VIEW_ANALYTICS,
      resource: AuditResource.ANALYTICS,
      success: false,
      ...getRequestMetadata(req),
      details: { error: error.message },
    });

    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
