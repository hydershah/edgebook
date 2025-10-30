import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getRequestMetadata } from "@/lib/adminMiddleware";
import { prisma } from "@/lib/prisma";
import { logAudit, AuditAction, AuditResource } from "@/lib/audit";
import { PayoutStatus } from "@prisma/client";

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
    const status = searchParams.get("status") as PayoutStatus | null;
    const userId = searchParams.get("userId");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: any = {};

    if (status && Object.values(PayoutStatus).includes(status)) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    const orderBy: any = { [sortBy]: sortOrder };

    const total = await prisma.payoutReview.count({ where });

    const payouts = await prisma.payoutReview.findMany({
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
            stripeAccountId: true,
          },
        },
      },
    });

    // Get pending amount
    const pendingStats = await prisma.payoutReview.aggregate({
      where: {
        status: { in: [PayoutStatus.PENDING, PayoutStatus.UNDER_REVIEW] },
      },
      _sum: {
        netAmount: true,
      },
      _count: true,
    });

    await logAudit({
      userId: session.user.id,
      action: AuditAction.LIST_PAYOUTS,
      resource: AuditResource.PAYOUT,
      success: true,
      ...getRequestMetadata(req),
      details: { page, limit, filters: { status } },
    });

    return NextResponse.json({
      payouts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total,
        pendingAmount: pendingStats._sum.netAmount || 0,
        pendingCount: pendingStats._count,
      },
    });
  } catch (error: any) {
    console.error("Error fetching payouts:", error);

    await logAudit({
      userId: session.user.id,
      action: AuditAction.LIST_PAYOUTS,
      resource: AuditResource.PAYOUT,
      success: false,
      ...getRequestMetadata(req),
      details: { error: error.message },
    });

    return NextResponse.json(
      { error: "Failed to fetch payouts" },
      { status: 500 }
    );
  }
}
