import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getRequestMetadata } from "@/lib/adminMiddleware";
import { prisma } from "@/lib/prisma";
import { logAudit, AuditAction, AuditResource } from "@/lib/audit";
import { ReportStatus, AccountStatus, ModerationStatus } from "@prisma/client";
import { z } from "zod";

const resolveReportSchema = z.object({
  resolution: z.string().min(10, "Resolution must be at least 10 characters"),
  action: z
    .enum([
      "none",
      "remove_content",
      "warn_user",
      "suspend_user",
      "ban_user",
      "dismiss",
    ])
    .default("none"),
  notes: z.string().optional(),
  actionDetails: z
    .object({
      suspensionDays: z.number().optional(),
      banReason: z.string().optional(),
      warningMessage: z.string().optional(),
    })
    .optional(),
});

export async function POST(
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
    const validatedData = resolveReportSchema.parse(body);

    // Get report
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reporter: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.status === ReportStatus.RESOLVED) {
      return NextResponse.json(
        { error: "Report already resolved" },
        { status: 400 }
      );
    }

    // Perform action based on type
    let actionResult: any = null;

    switch (validatedData.action) {
      case "remove_content":
        if (report.targetType === "PICK") {
          actionResult = await prisma.pick.update({
            where: { id: report.targetId },
            data: {
              moderationStatus: ModerationStatus.REMOVED,
              moderatedBy: session.user.id,
              moderatedAt: new Date(),
              moderationNotes: validatedData.resolution,
            },
          });
        } else if (report.targetType === "COMMENT") {
          actionResult = await prisma.comment.update({
            where: { id: report.targetId },
            data: {
              isHidden: true,
              hiddenBy: session.user.id,
              hiddenAt: new Date(),
            },
          });
        }
        break;

      case "warn_user":
        let targetUserId: string | null = null;
        if (report.targetType === "USER") {
          targetUserId = report.targetId;
        } else if (report.targetType === "PICK") {
          const pick = await prisma.pick.findUnique({
            where: { id: report.targetId },
            select: { userId: true },
          });
          targetUserId = pick?.userId || null;
        } else if (report.targetType === "COMMENT") {
          const comment = await prisma.comment.findUnique({
            where: { id: report.targetId },
            select: { userId: true },
          });
          targetUserId = comment?.userId || null;
        }

        if (targetUserId) {
          actionResult = await prisma.user.update({
            where: { id: targetUserId },
            data: {
              warningCount: { increment: 1 },
              lastWarningAt: new Date(),
              trustScore: { decrement: 10 },
            },
          });

          await logAudit({
            userId: session.user.id,
            action: AuditAction.WARN_USER,
            resource: AuditResource.USER,
            resourceId: targetUserId,
            success: true,
            ...getRequestMetadata(req),
            details: {
              reason: validatedData.resolution,
              viaReport: reportId,
            },
          });
        }
        break;

      case "suspend_user":
        let suspendUserId: string | null = null;
        if (report.targetType === "USER") {
          suspendUserId = report.targetId;
        } else if (report.targetType === "PICK") {
          const pick = await prisma.pick.findUnique({
            where: { id: report.targetId },
            select: { userId: true },
          });
          suspendUserId = pick?.userId || null;
        } else if (report.targetType === "COMMENT") {
          const comment = await prisma.comment.findUnique({
            where: { id: report.targetId },
            select: { userId: true },
          });
          suspendUserId = comment?.userId || null;
        }

        if (suspendUserId) {
          const suspensionDays = validatedData.actionDetails?.suspensionDays || 7;
          const suspendedUntil = new Date();
          suspendedUntil.setDate(suspendedUntil.getDate() + suspensionDays);

          actionResult = await prisma.user.update({
            where: { id: suspendUserId },
            data: {
              accountStatus: AccountStatus.SUSPENDED,
              suspensionReason: validatedData.resolution,
              suspendedUntil,
              suspendedBy: session.user.id,
            },
          });

          // Cancel sessions
          await prisma.session.deleteMany({
            where: { userId: suspendUserId },
          });

          await logAudit({
            userId: session.user.id,
            action: AuditAction.SUSPEND_USER,
            resource: AuditResource.USER,
            resourceId: suspendUserId,
            success: true,
            ...getRequestMetadata(req),
            details: {
              reason: validatedData.resolution,
              suspendedUntil,
              viaReport: reportId,
            },
          });
        }
        break;

      case "ban_user":
        let banUserId: string | null = null;
        if (report.targetType === "USER") {
          banUserId = report.targetId;
        } else if (report.targetType === "PICK") {
          const pick = await prisma.pick.findUnique({
            where: { id: report.targetId },
            select: { userId: true },
          });
          banUserId = pick?.userId || null;
        } else if (report.targetType === "COMMENT") {
          const comment = await prisma.comment.findUnique({
            where: { id: report.targetId },
            select: { userId: true },
          });
          banUserId = comment?.userId || null;
        }

        if (banUserId) {
          actionResult = await prisma.user.update({
            where: { id: banUserId },
            data: {
              accountStatus: AccountStatus.BANNED,
              banReason:
                validatedData.actionDetails?.banReason || validatedData.resolution,
              bannedAt: new Date(),
              bannedBy: session.user.id,
            },
          });

          // Cancel sessions
          await prisma.session.deleteMany({
            where: { userId: banUserId },
          });

          await logAudit({
            userId: session.user.id,
            action: AuditAction.BAN_USER,
            resource: AuditResource.USER,
            resourceId: banUserId,
            success: true,
            ...getRequestMetadata(req),
            details: {
              reason: validatedData.resolution,
              viaReport: reportId,
            },
          });
        }
        break;

      case "dismiss":
      case "none":
        // No action taken
        break;
    }

    // Update report status
    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        status:
          validatedData.action === "dismiss"
            ? ReportStatus.DISMISSED
            : ReportStatus.RESOLVED,
        resolution: validatedData.resolution,
        reviewedBy: session.user.id,
        reviewNotes: validatedData.notes,
        resolvedAt: new Date(),
      },
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
      action: AuditAction.RESOLVE_REPORT,
      resource: AuditResource.REPORT,
      resourceId: reportId,
      success: true,
      ...getRequestMetadata(req),
      details: {
        action: validatedData.action,
        resolution: validatedData.resolution,
        targetType: report.targetType,
        targetId: report.targetId,
      },
    });

    // TODO: Send notification to reporter about resolution
    // TODO: Send notification to target user if action was taken

    return NextResponse.json({
      report: updatedReport,
      actionResult,
      message: "Report resolved successfully",
    });
  } catch (error: any) {
    console.error("Error resolving report:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    await logAudit({
      userId: session.user.id,
      action: AuditAction.RESOLVE_REPORT,
      resource: AuditResource.REPORT,
      resourceId: reportId,
      success: false,
      ...getRequestMetadata(req),
      details: { error: error.message },
    });

    return NextResponse.json(
      { error: "Failed to resolve report" },
      { status: 500 }
    );
  }
}
