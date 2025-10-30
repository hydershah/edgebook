import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getRequestMetadata } from "@/lib/adminMiddleware";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { DisputeStatus } from "@prisma/client";

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
    const status = searchParams.get("status") as DisputeStatus | null;
    const userId = searchParams.get("userId");
    const pickId = searchParams.get("pickId");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: any = {};

    if (status && Object.values(DisputeStatus).includes(status)) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    if (pickId) {
      where.pickId = pickId;
    }

    const orderBy: any = { [sortBy]: sortOrder };

    const total = await prisma.dispute.count({ where });

    const disputes = await prisma.dispute.findMany({
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
          },
        },
        pick: {
          select: {
            id: true,
            matchup: true,
            sport: true,
            status: true,
            gameDate: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    // Get stats
    const stats = await prisma.dispute.groupBy({
      by: ["status"],
      _count: true,
    });

    const statusStats = stats.reduce(
      (acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      },
      {} as Record<string, number>
    );

    await logAudit({
      userId: session.user.id,
      action: "LIST_DISPUTES",
      resource: "DISPUTE",
      success: true,
      ...getRequestMetadata(req),
      details: { page, limit, filters: { status } },
    });

    return NextResponse.json({
      disputes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total,
        byStatus: statusStats,
      },
    });
  } catch (error: any) {
    console.error("Error fetching disputes:", error);

    await logAudit({
      userId: session.user.id,
      action: "LIST_DISPUTES",
      resource: "DISPUTE",
      success: false,
      ...getRequestMetadata(req),
      details: { error: error.message },
    });

    return NextResponse.json(
      { error: "Failed to fetch disputes" },
      { status: 500 }
    );
  }
}
