import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getRequestMetadata } from "@/lib/adminMiddleware";
import { prisma } from "@/lib/prisma";
import { logAudit, AuditAction, AuditResource } from "@/lib/audit";
import { AccountStatus } from "@prisma/client";
import { z } from "zod";
import { statusBroadcast } from "@/lib/statusBroadcast";

const banUserSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  deletePicks: z.boolean().optional().default(false),
  permanent: z.boolean().optional().default(true),
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
    // Prevent banning yourself
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot ban your own account" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { reason, deletePicks, permanent } = banUserSchema.parse(body);

    // Get user before ban
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

    // Prevent banning other admins
    if (user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Cannot ban other administrators" },
        { status: 403 }
      );
    }

    // Use transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // Update user status
      await tx.user.update({
        where: { id: userId },
        data: {
          accountStatus: AccountStatus.BANNED,
          banReason: reason,
          bannedAt: new Date(),
          bannedBy: session.user.id,
        },
      });

      // Optionally delete user's picks
      if (deletePicks) {
        await tx.pick.updateMany({
          where: { userId },
          data: {
            moderationStatus: "REMOVED",
            moderatedBy: session.user.id,
            moderatedAt: new Date(),
            moderationNotes: `Picks removed due to user ban: ${reason}`,
          },
        });
      }

      // Cancel any active sessions
      await tx.session.deleteMany({
        where: { userId },
      });
    });

    await logAudit({
      userId: session.user.id,
      action: AuditAction.BAN_USER,
      resource: AuditResource.USER,
      resourceId: userId,
      success: true,
      ...getRequestMetadata(req),
      details: {
        reason,
        deletePicks,
        permanent,
        bannedUser: user,
      },
    });

    // Broadcast status change for real-time updates
    statusBroadcast.broadcast({
      userId,
      accountStatus: AccountStatus.BANNED,
      banReason: reason,
      timestamp: new Date(),
    });

    // TODO: Send ban notification email to user

    return NextResponse.json({
      message: "User banned successfully",
      user: {
        id: userId,
        status: AccountStatus.BANNED,
        bannedAt: new Date(),
      },
    });
  } catch (error: any) {
    console.error("Error banning user:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    await logAudit({
      userId: session.user.id,
      action: AuditAction.BAN_USER,
      resource: AuditResource.USER,
      resourceId: userId,
      success: false,
      ...getRequestMetadata(req),
      details: { error: error.message },
    });

    return NextResponse.json({ error: "Failed to ban user" }, { status: 500 });
  }
}

// Unban user
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
        banReason: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.accountStatus !== AccountStatus.BANNED) {
      return NextResponse.json(
        { error: "User is not banned" },
        { status: 400 }
      );
    }

    // Unban user
    await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: AccountStatus.ACTIVE,
        banReason: null,
        bannedAt: null,
        bannedBy: null,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: AuditAction.UNBAN_USER,
      resource: AuditResource.USER,
      resourceId: userId,
      success: true,
      ...getRequestMetadata(req),
      details: {
        previousBanReason: user.banReason,
      },
    });

    // Broadcast status change for real-time updates
    statusBroadcast.broadcast({
      userId,
      accountStatus: AccountStatus.ACTIVE,
      banReason: null,
      timestamp: new Date(),
    });

    // TODO: Send unban notification email to user

    return NextResponse.json({
      message: "User unbanned successfully",
      user: {
        id: userId,
        status: AccountStatus.ACTIVE,
      },
    });
  } catch (error: any) {
    console.error("Error unbanning user:", error);

    await logAudit({
      userId: session.user.id,
      action: AuditAction.UNBAN_USER,
      resource: AuditResource.USER,
      resourceId: userId,
      success: false,
      ...getRequestMetadata(req),
      details: { error: error.message },
    });

    return NextResponse.json({ error: "Failed to unban user" }, { status: 500 });
  }
}
