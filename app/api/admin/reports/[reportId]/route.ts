import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getRequestMetadata } from "@/lib/adminMiddleware";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { ReportStatus, ReportPriority } from "@prisma/client";
import { z } from "zod";

const updateReportSchema = z.object({
  status: z.nativeEnum(ReportStatus).optional(),
  priority: z.nativeEnum(ReportPriority).optional(),
  reviewNotes: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { reportId: string } }
) {
  const authCheck = await requireAdmin(req);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const { reportId } = params;

  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            role: true,
            accountStatus: true,
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

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Get target data based on type
    let targetData = null;
    let targetHistory = null;

    switch (report.targetType) {
      case "PICK":
        targetData = await prisma.pick.findUnique({
          where: { id: report.targetId },
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
              },
            },
          },
        });

        // Get other reports on this pick
        targetHistory = await prisma.report.findMany({
          where: {
            targetType: "PICK",
            targetId: report.targetId,
            id: { not: reportId },
          },
          include: {
            reporter: {
              select: { id: true, username: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        });
        break;

      case "COMMENT":
        targetData = await prisma.comment.findUnique({
          where: { id: report.targetId },
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
            pick: {
              select: {
                id: true,
                matchup: true,
                sport: true,
              },
            },
          },
        });

        targetHistory = await prisma.report.findMany({
          where: {
            targetType: "COMMENT",
            targetId: report.targetId,
            id: { not: reportId },
          },
          include: {
            reporter: {
              select: { id: true, username: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        });
        break;

      case "USER":
        targetData = await prisma.user.findUnique({
          where: { id: report.targetId },
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
            avatar: true,
            role: true,
            accountStatus: true,
            trustScore: true,
            flagCount: true,
            warningCount: true,
            createdAt: true,
            _count: {
              select: {
                picks: true,
                purchases: true,
                reports: true,
              },
            },
          },
        });

        targetHistory = await prisma.report.findMany({
          where: {
            targetType: "USER",
            targetId: report.targetId,
            id: { not: reportId },
          },
          include: {
            reporter: {
              select: { id: true, username: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        });
        break;

      case "TRANSACTION":
        targetData = await prisma.transaction.findUnique({
          where: { id: report.targetId },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                accountStatus: true,
              },
            },
          },
        });

        targetHistory = await prisma.report.findMany({
          where: {
            targetType: "TRANSACTION",
            targetId: report.targetId,
            id: { not: reportId },
          },
          include: {
            reporter: {
              select: { id: true, username: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        });
        break;
    }

    return NextResponse.json({
      report,
      target: targetData,
      history: targetHistory,
    });
  } catch (error: any) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { reportId: string } }
) {
  const authCheck = await requireAdmin(req);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const { session } = authCheck;
  const { reportId } = params;

  try {
    const body = await req.json();
    const validatedData = updateReportSchema.parse(body);

    const currentReport = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!currentReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // If changing to UNDER_REVIEW or RESOLVED, set reviewer
    const updateData: any = { ...validatedData };
    if (
      validatedData.status &&
      (validatedData.status === ReportStatus.UNDER_REVIEW ||
        validatedData.status === ReportStatus.RESOLVED)
    ) {
      updateData.reviewedBy = session.user.id;
    }

    if (validatedData.status === ReportStatus.RESOLVED) {
      updateData.resolvedAt = new Date();
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: updateData,
      include: {
        reporter: {
          select: { id: true, username: true, email: true },
        },
        reviewer: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "UPDATE_REPORT",
      resource: "REPORT",
      resourceId: reportId,
      success: true,
      ...getRequestMetadata(req),
      details: {
        changes: validatedData,
        before: currentReport,
      },
    });

    return NextResponse.json({ report: updatedReport });
  } catch (error: any) {
    console.error("Error updating report:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    await logAudit({
      userId: session.user.id,
      action: "UPDATE_REPORT",
      resource: "REPORT",
      resourceId: reportId,
      success: false,
      ...getRequestMetadata(req),
      details: { error: error.message },
    });

    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}
