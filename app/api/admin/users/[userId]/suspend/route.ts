import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getRequestMetadata } from "@/lib/adminMiddleware";
import { prisma } from "@/lib/prisma";
import { logAudit, AuditAction, AuditResource } from "@/lib/audit";
import { AccountStatus } from "@prisma/client";
import { z } from "zod";
import { statusBroadcast } from "@/lib/statusBroadcast";

const suspendUserSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  duration: z.number().min(1).max(365), // days
  hidePicks: z.boolean().optional().default(false),
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
    // Prevent suspending yourself
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot suspend your own account" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { reason, duration, hidePicks } = suspendUserSchema.parse(body);

    // Get user before suspension
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        accountStatus: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent suspending other admins
    if (user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Cannot suspend other administrators" },
        { status: 403 }
      );
    }

    const suspendedUntil = new Date();
    suspendedUntil.setDate(suspendedUntil.getDate() + duration);

    // Use transaction
    await prisma.$transaction(async (tx) => {
      // Update user status
      await tx.user.update({
        where: { id: userId },
        data: {
          accountStatus: AccountStatus.SUSPENDED,
          suspensionReason: reason,
          suspendedUntil,
          suspendedBy: session.user.id,
        },
      });

      // Optionally hide user's picks
      if (hidePicks) {
        await tx.pick.updateMany({
          where: {
            userId,
            moderationStatus: "APPROVED",
          },
          data: {
            moderationStatus: "PENDING_REVIEW",
            moderatedBy: session.user.id,
            moderatedAt: new Date(),
            moderationNotes: `Picks hidden due to user suspension: ${reason}`,
          },
        });
      }

      // Cancel active sessions
      await tx.session.deleteMany({
        where: { userId },
      });
    });

    await logAudit({
      userId: session.user.id,
      action: AuditAction.SUSPEND_USER,
      resource: AuditResource.USER,
      resourceId: userId,
      success: true,
      ...getRequestMetadata(req),
      details: {
        reason,
        duration,
        suspendedUntil,
        hidePicks,
        suspendedUser: user,
      },
    });

    // Broadcast status change for real-time updates
    statusBroadcast.broadcast({
      userId,
      accountStatus: AccountStatus.SUSPENDED,
      suspendedUntil,
      suspensionReason: reason,
      timestamp: new Date(),
    });

    // TODO: Send suspension notification email to user

    return NextResponse.json({
      message: "User suspended successfully",
      user: {
        id: userId,
        status: AccountStatus.SUSPENDED,
        suspendedUntil,
      },
    });
  } catch (error: any) {
    console.error("Error suspending user:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    await logAudit({
      userId: session.user.id,
      action: AuditAction.SUSPEND_USER,
      resource: AuditResource.USER,
      resourceId: userId,
      success: false,
      ...getRequestMetadata(req),
      details: { error: error.message },
    });

    return NextResponse.json(
      { error: "Failed to suspend user" },
      { status: 500 }
    );
  }
}

// Unsuspend user (lift suspension early)
export async function DELETE(
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        accountStatus: true,
        suspensionReason: true,
        suspendedUntil: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.accountStatus !== AccountStatus.SUSPENDED) {
      return NextResponse.json(
        { error: "User is not suspended" },
        { status: 400 }
      );
    }

    // Unsuspend user
    await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: AccountStatus.ACTIVE,
        suspensionReason: null,
        suspendedUntil: null,
        suspendedBy: null,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: AuditAction.UNSUSPEND_USER,
      resource: AuditResource.USER,
      resourceId: userId,
      success: true,
      ...getRequestMetadata(req),
      details: {
        previousSuspensionReason: user.suspensionReason,
        originalSuspendedUntil: user.suspendedUntil,
      },
    });

    // Broadcast status change for real-time updates
    statusBroadcast.broadcast({
      userId,
      accountStatus: AccountStatus.ACTIVE,
      suspendedUntil: null,
      suspensionReason: null,
      timestamp: new Date(),
    });

    // TODO: Send unsuspension notification email to user

    return NextResponse.json({
      message: "User suspension lifted successfully",
      user: {
        id: userId,
        status: AccountStatus.ACTIVE,
      },
    });
  } catch (error: any) {
    console.error("Error unsuspending user:", error);

    await logAudit({
      userId: session.user.id,
      action: AuditAction.UNSUSPEND_USER,
      resource: AuditResource.USER,
      resourceId: userId,
      success: false,
      ...getRequestMetadata(req),
      details: { error: error.message },
    });

    return NextResponse.json(
      { error: "Failed to unsuspend user" },
      { status: 500 }
    );
  }
}
