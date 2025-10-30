import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getRequestMetadata } from "@/lib/adminMiddleware";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import {
  ReportStatus,
  ReportPriority,
  ReportTargetType,
  ReportReason,
} from "@prisma/client";
import { z } from "zod";

const createReportSchema = z.object({
  targetType: z.nativeEnum(ReportTargetType),
  targetId: z.string(),
  reason: z.nativeEnum(ReportReason),
  description: z.string().optional(),
  priority: z.nativeEnum(ReportPriority).optional(),
});

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
    const status = searchParams.get("status") as ReportStatus | null;
    const priority = searchParams.get("priority") as ReportPriority | null;
    const targetType = searchParams.get("targetType") as ReportTargetType | null;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: any = {};

    if (status && Object.values(ReportStatus).includes(status)) {
      where.status = status;
    }

    if (priority && Object.values(ReportPriority).includes(priority)) {
      where.priority = priority;
    }

    if (targetType && Object.values(ReportTargetType).includes(targetType)) {
      where.targetType = targetType;
    }

    // Special sorting for priority + created (show high priority first, then by date)
    let orderBy: any;
    if (sortBy === "priority") {
      orderBy = [
        { priority: sortOrder === "asc" ? "asc" : "desc" },
        { createdAt: "desc" },
      ];
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    // Get total count
    const total = await prisma.report.count({ where });

    // Get reports with related data
    const reports = await prisma.report.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Enrich reports with target data
    const enrichedReports = await Promise.all(
      reports.map(async (report) => {
        let targetData = null;

        switch (report.targetType) {
          case "PICK":
            targetData = await prisma.pick.findUnique({
              where: { id: report.targetId },
              select: {
                id: true,
                matchup: true,
                sport: true,
                details: true,
                status: true,
                moderationStatus: true,
                user: {
                  select: { id: true, username: true, email: true },
                },
              },
            });
            break;
          case "COMMENT":
            targetData = await prisma.comment.findUnique({
              where: { id: report.targetId },
              select: {
                id: true,
                content: true,
                isHidden: true,
                user: {
                  select: { id: true, username: true, email: true },
                },
                pick: {
                  select: { id: true, matchup: true },
                },
              },
            });
            break;
          case "USER":
            targetData = await prisma.user.findUnique({
              where: { id: report.targetId },
              select: {
                id: true,
                username: true,
                email: true,
                role: true,
                accountStatus: true,
                flagCount: true,
              },
            });
            break;
          case "TRANSACTION":
            targetData = await prisma.transaction.findUnique({
              where: { id: report.targetId },
              select: {
                id: true,
                type: true,
                amount: true,
                status: true,
                user: {
                  select: { id: true, username: true, email: true },
                },
              },
            });
            break;
        }

        return {
          ...report,
          target: targetData,
        };
      })
    );

    // Get stats
    const stats = await prisma.report.groupBy({
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

    // Get priority stats for pending reports
    const priorityStats = await prisma.report.groupBy({
      by: ["priority"],
      where: { status: ReportStatus.PENDING },
      _count: true,
    });

    const priorityCounts = priorityStats.reduce(
      (acc, stat) => {
        acc[stat.priority] = stat._count;
        return acc;
      },
      {} as Record<string, number>
    );

    await logAudit({
      userId: session.user.id,
      action: "LIST_REPORTS",
      resource: "REPORT",
      success: true,
      ...getRequestMetadata(req),
      details: { page, limit, filters: { status, priority, targetType } },
    });

    return NextResponse.json({
      reports: enrichedReports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total,
        byStatus: statusStats,
        pendingByPriority: priorityCounts,
      },
    });
  } catch (error: any) {
    console.error("Error fetching reports:", error);

    await logAudit({
      userId: session.user.id,
      action: "LIST_REPORTS",
      resource: "REPORT",
      success: false,
      ...getRequestMetadata(req),
      details: { error: error.message },
    });

    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

// Create admin-initiated report
export async function POST(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const { session } = authCheck;

  try {
    const body = await req.json();
    const validatedData = createReportSchema.parse(body);

    // Verify target exists
    let targetExists = false;
    switch (validatedData.targetType) {
      case "PICK":
        targetExists = !!(await prisma.pick.findUnique({
          where: { id: validatedData.targetId },
        }));
        break;
      case "COMMENT":
        targetExists = !!(await prisma.comment.findUnique({
          where: { id: validatedData.targetId },
        }));
        break;
      case "USER":
        targetExists = !!(await prisma.user.findUnique({
          where: { id: validatedData.targetId },
        }));
        break;
      case "TRANSACTION":
        targetExists = !!(await prisma.transaction.findUnique({
          where: { id: validatedData.targetId },
        }));
        break;
    }

    if (!targetExists) {
      return NextResponse.json({ error: "Target not found" }, { status: 404 });
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        targetType: validatedData.targetType,
        targetId: validatedData.targetId,
        reason: validatedData.reason,
        description: validatedData.description,
        priority: validatedData.priority || ReportPriority.MEDIUM,
        status: ReportStatus.PENDING,
      },
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // Increment report count on target if applicable
    if (validatedData.targetType === "PICK") {
      await prisma.pick.update({
        where: { id: validatedData.targetId },
        data: { reportCount: { increment: 1 } },
      });
    } else if (validatedData.targetType === "COMMENT") {
      await prisma.comment.update({
        where: { id: validatedData.targetId },
        data: { reportCount: { increment: 1 } },
      });
    } else if (validatedData.targetType === "USER") {
      await prisma.user.update({
        where: { id: validatedData.targetId },
        data: { flagCount: { increment: 1 } },
      });
    }

    await logAudit({
      userId: session.user.id,
      action: "CREATE_REPORT",
      resource: "REPORT",
      resourceId: report.id,
      success: true,
      ...getRequestMetadata(req),
      details: validatedData,
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating report:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    await logAudit({
      userId: session.user.id,
      action: "CREATE_REPORT",
      resource: "REPORT",
      success: false,
      ...getRequestMetadata(req),
      details: { error: error.message },
    });

    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
