import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getRequestMetadata } from "@/lib/adminMiddleware";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { UserRole, AccountStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const { session } = authCheck;
  const { searchParams } = new URL(req.url);

  try {
    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") as UserRole | null;
    const status = searchParams.get("status") as AccountStatus | null;
    const verified = searchParams.get("verified");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: any = {};

    // Search by email, username, or name
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filter by role
    if (role && Object.values(UserRole).includes(role)) {
      where.role = role;
    }

    // Filter by account status
    if (status && Object.values(AccountStatus).includes(status)) {
      where.accountStatus = status;
    }

    // Filter by verified status
    if (verified === "true") {
      where.isVerified = true;
    } else if (verified === "false") {
      where.isVerified = false;
    }

    // Build order by
    const orderBy: any = {};
    if (sortBy === "revenue") {
      // Special handling for revenue - will aggregate separately
      orderBy.createdAt = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        role: true,
        isVerified: true,
        accountStatus: true,
        trustScore: true,
        flagCount: true,
        warningCount: true,
        createdAt: true,
        updatedAt: true,
        banReason: true,
        bannedAt: true,
        suspendedUntil: true,
        _count: {
          select: {
            picks: true,
            purchases: true,
            reports: true,
          },
        },
      },
    });

    // Get platform stats
    const stats = await prisma.user.groupBy({
      by: ["accountStatus"],
      _count: true,
    });

    const statusStats = stats.reduce(
      (acc, stat) => {
        acc[stat.accountStatus] = stat._count;
        return acc;
      },
      {} as Record<string, number>
    );

    // Log the action
    await logAudit({
      userId: session.user.id,
      action: "LIST_USERS",
      resource: "USER",
      success: true,
      ...getRequestMetadata(req),
      details: { page, limit, search, filters: { role, status, verified } },
    });

    return NextResponse.json({
      users,
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
    console.error("Error fetching users:", error);

    await logAudit({
      userId: session.user.id,
      action: "LIST_USERS",
      resource: "USER",
      success: false,
      ...getRequestMetadata(req),
      details: { error: error.message },
    });

    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
