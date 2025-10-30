import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getRequestMetadata } from "@/lib/adminMiddleware";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const { session } = authCheck;
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "30");

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

    // Daily stats for charts (last 30 days)
    const dailyUsers: any[] = [];
    const dailyRevenue: any[] = [];
    const dailyPicks: any[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const [userCount, pickCount, revenue] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: { gte: dayStart, lte: dayEnd },
          },
        }),
        prisma.pick.count({
          where: {
            createdAt: { gte: dayStart, lte: dayEnd },
          },
        }),
        prisma.purchase.aggregate({
          where: {
            createdAt: { gte: dayStart, lte: dayEnd },
          },
          _sum: { amount: true },
        }),
      ]);

      const dateStr = dayStart.toISOString().split("T")[0];
      dailyUsers.push({ date: dateStr, count: userCount });
      dailyPicks.push({ date: dateStr, count: pickCount });
      dailyRevenue.push({ date: dateStr, amount: revenue._sum.amount || 0 });
    }

    await logAudit({
      userId: session.user.id,
      action: "VIEW_ANALYTICS",
      resource: "ANALYTICS",
      success: true,
      ...getRequestMetadata(req),
      details: { days },
    });

    return NextResponse.json({
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
    });
  } catch (error: any) {
    console.error("Error fetching analytics:", error);

    await logAudit({
      userId: session.user.id,
      action: "VIEW_ANALYTICS",
      resource: "ANALYTICS",
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
