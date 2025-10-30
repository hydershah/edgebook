import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getRequestMetadata } from "@/lib/adminMiddleware";
import { prisma } from "@/lib/prisma";
import { logAudit, AuditAction, AuditResource } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const { session } = authCheck;
  const { searchParams } = new URL(req.url);

  try {
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");
    const minAmount = parseFloat(searchParams.get("minAmount") || "0");
    const suspicious = searchParams.get("suspicious") === "true";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    if (minAmount > 0) {
      where.amount = { gte: minAmount };
    }

    // Flag suspicious transactions
    if (suspicious) {
      where.OR = [
        { amount: { gte: 500 } }, // Large amounts
        { status: "failed" },
        {
          user: {
            trustScore: { lt: 50 },
          },
        },
      ];
    }

    const orderBy: any = { [sortBy]: sortOrder };

    const total = await prisma.transaction.count({ where });

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            accountStatus: true,
            trustScore: true,
          },
        },
      },
    });

    // Get revenue stats
    const revenueStats = await prisma.transaction.aggregate({
      where: {
        status: "completed",
        type: "purchase",
      },
      _sum: {
        amount: true,
        platformFee: true,
      },
      _count: true,
    });

    // Get today's transactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStats = await prisma.transaction.aggregate({
      where: {
        createdAt: { gte: today },
        status: "completed",
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    await logAudit({
      userId: session.user.id,
      action: AuditAction.LIST_TRANSACTIONS,
      resource: AuditResource.TRANSACTION,
      success: true,
      ...getRequestMetadata(req),
      details: { page, limit, filters: { type, status, suspicious } },
    });

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total,
        totalRevenue: revenueStats._sum.amount || 0,
        totalFees: revenueStats._sum.platformFee || 0,
        todayRevenue: todayStats._sum.amount || 0,
        todayCount: todayStats._count,
      },
    });
  } catch (error: any) {
    console.error("Error fetching transactions:", error);

    await logAudit({
      userId: session.user.id,
      action: AuditAction.LIST_TRANSACTIONS,
      resource: AuditResource.TRANSACTION,
      success: false,
      ...getRequestMetadata(req),
      details: { error: error.message },
    });

    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
