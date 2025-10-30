import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getRequestMetadata } from "@/lib/adminMiddleware";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const { searchParams } = new URL(req.url);

  try {
    // Validate and sanitize page parameter
    const pageRaw = parseInt(searchParams.get("page") || "1", 10);
    const page = isNaN(pageRaw) ? 1 : Math.max(1, pageRaw);

    // Validate and sanitize limit parameter
    const limitRaw = parseInt(searchParams.get("limit") || "50", 10);
    const limit = isNaN(limitRaw) ? 50 : Math.min(200, Math.max(1, limitRaw));

    // Get optional string parameters (already safe as strings or null)
    const userId = searchParams.get("userId") || undefined;
    const action = searchParams.get("action") || undefined;
    const resource = searchParams.get("resource") || undefined;

    // Validate and normalize success parameter to boolean
    const successParam = searchParams.get("success");
    const success = successParam === "true" ? true :
                   successParam === "false" ? false :
                   undefined;

    // Validate sortOrder parameter
    const sortOrderParam = searchParams.get("sortOrder");
    const sortOrder: "asc" | "desc" =
      sortOrderParam === "asc" || sortOrderParam === "desc" ? sortOrderParam : "desc";

    // Build where clause with validated values
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = { contains: action, mode: "insensitive" };
    }

    if (resource) {
      where.resource = resource;
    }

    if (success !== undefined) {
      where.success = success;
    }

    const total = await prisma.auditLog.count({ where });

    // Calculate skip using validated values
    const skip = (page - 1) * limit;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: sortOrder },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
