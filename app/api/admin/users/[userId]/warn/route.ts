import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getRequestMetadata } from "@/lib/adminMiddleware";
import { prisma } from "@/lib/prisma";
import { logAudit, AuditAction, AuditResource } from "@/lib/audit";
import { z } from "zod";

const warnUserSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  severity: z.enum(["low", "medium", "high"]).default("medium"),
  message: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const authCheck = await requireAdmin(req);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const { session } = authCheck;
  const { userId } = params;

  try {
    const body = await req.json();
    const { reason, severity, message } = warnUserSchema.parse(body);

    // Get user before warning
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        warningCount: true,
        trustScore: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent warning admins
    if (user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Cannot warn administrators" },
        { status: 403 }
      );
    }

    // Calculate trust score reduction based on severity
    const trustScoreReduction = {
      low: 5,
      medium: 10,
      high: 20,
    }[severity];

    const newTrustScore = Math.max(0, user.trustScore - trustScoreReduction);
    const newWarningCount = user.warningCount + 1;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        warningCount: newWarningCount,
        lastWarningAt: new Date(),
        trustScore: newTrustScore,
      },
      select: {
        id: true,
        email: true,
        username: true,
        warningCount: true,
        trustScore: true,
        lastWarningAt: true,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: AuditAction.WARN_USER,
      resource: AuditResource.USER,
      resourceId: userId,
      success: true,
      ...getRequestMetadata(req),
      details: {
        reason,
        severity,
        message,
        newWarningCount,
        oldTrustScore: user.trustScore,
        newTrustScore,
        warnedUser: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
    });

    // TODO: Send warning notification email to user with reason and message

    // Auto-suspend if warnings exceed threshold
    let autoAction = null;
    if (newWarningCount >= 5) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          accountStatus: "UNDER_REVIEW",
        },
      });

      await logAudit({
        userId: session.user.id,
        action: AuditAction.AUTO_FLAG_USER,
        resource: AuditResource.USER,
        resourceId: userId,
        success: true,
        ...getRequestMetadata(req),
        details: {
          reason: "Exceeded warning threshold",
          warningCount: newWarningCount,
        },
      });

      autoAction = {
        action: "UNDER_REVIEW",
        reason: "Exceeded warning threshold (5+ warnings)",
      };
    }

    return NextResponse.json({
      message: "User warned successfully",
      user: updatedUser,
      autoAction,
    });
  } catch (error: any) {
    console.error("Error warning user:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    await logAudit({
      userId: session.user.id,
      action: AuditAction.WARN_USER,
      resource: AuditResource.USER,
      resourceId: userId,
      success: false,
      ...getRequestMetadata(req),
      details: { error: error.message },
    });

    return NextResponse.json({ error: "Failed to warn user" }, { status: 500 });
  }
}

// Get user's warning history
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const authCheck = await requireAdmin(req);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const { userId } = params;

  try {
    // Get all warnings from audit log
    const warnings = await prisma.auditLog.findMany({
      where: {
        action: "WARN_USER",
        resourceId: userId,
        resource: "USER",
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        details: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // Get current user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        warningCount: true,
        lastWarningAt: true,
        trustScore: true,
        accountStatus: true,
      },
    });

    return NextResponse.json({
      user,
      warnings,
      total: warnings.length,
    });
  } catch (error: any) {
    console.error("Error fetching warning history:", error);
    return NextResponse.json(
      { error: "Failed to fetch warning history" },
      { status: 500 }
    );
  }
}
