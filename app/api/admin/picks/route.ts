import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getRequestMetadata } from "@/lib/adminMiddleware";
import { prisma } from "@/lib/prisma";
import { logAudit, AuditAction, AuditResource } from "@/lib/audit";
import { Sport, PickStatus, ModerationStatus } from "@prisma/client";

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
    const sport = searchParams.get("sport") as Sport | null;
    const status = searchParams.get("status") as PickStatus | null;
    const moderationStatus = searchParams.get("moderationStatus") as ModerationStatus | null;
    const userId = searchParams.get("userId");
    const minReports = parseInt(searchParams.get("minReports") || "0");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: any = {};

    if (sport && Object.values(Sport).includes(sport)) {
      where.sport = sport;
    }

    if (status && Object.values(PickStatus).includes(status)) {
      where.status = status;
    }

    if (moderationStatus && Object.values(ModerationStatus).includes(moderationStatus)) {
      where.moderationStatus = moderationStatus;
    }

    if (userId) {
      where.userId = userId;
    }

    if (minReports > 0) {
      where.reportCount = { gte: minReports };
    }

    const orderBy: any = { [sortBy]: sortOrder };

    const total = await prisma.pick.count({ where });

    const picks = await prisma.pick.findMany({
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
        _count: {
          select: {
            purchases: true,
            comments: true,
            likes: true,
            disputes: true,
          },
        },
      },
    });

    // Get moderation stats
    const stats = await prisma.pick.groupBy({
      by: ["moderationStatus"],
      _count: true,
    });

    const moderationStats = stats.reduce(
      (acc, stat) => {
        acc[stat.moderationStatus] = stat._count;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get picks needing attention
    const needsAttention = await prisma.pick.count({
      where: {
        OR: [
          { reportCount: { gte: 3 } },
          { moderationStatus: "PENDING_REVIEW" },
          { moderationStatus: "FLAGGED" },
        ],
      },
    });

    await logAudit({
      userId: session.user.id,
      action: AuditAction.LIST_PICKS,
      resource: AuditResource.PICK,
      success: true,
      ...getRequestMetadata(req),
      details: { page, limit, filters: { sport, status, moderationStatus } },
    });

    return NextResponse.json({
      picks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total,
        byModerationStatus: moderationStats,
        needsAttention,
      },
    });
  } catch (error: any) {
    console.error("Error fetching picks:", error);

    await logAudit({
      userId: session.user.id,
      action: AuditAction.LIST_PICKS,
      resource: AuditResource.PICK,
      success: false,
      ...getRequestMetadata(req),
      details: { error: error.message },
    });

    return NextResponse.json(
      { error: "Failed to fetch picks" },
      { status: 500 }
    );
  }
}
