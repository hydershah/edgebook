import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getRequestMetadata } from "@/lib/adminMiddleware";
import { prisma } from "@/lib/prisma";
import { logAudit, AuditAction, AuditResource } from "@/lib/audit";
import { UserRole, AccountStatus } from "@prisma/client";
import { z } from "zod";

const updateUserSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  accountStatus: z.nativeEnum(AccountStatus).optional(),
  trustScore: z.number().min(0).max(100).optional(),
  isVerified: z.boolean().optional(),
  notes: z.string().optional(),
});

export async function GET(
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
      include: {
        _count: {
          select: {
            picks: true,
            purchases: true,
            transactions: true,
            reports: true,
            disputes: true,
            followers: true,
            following: true,
            comments: true,
            likes: true,
          },
        },
        picks: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            sport: true,
            matchup: true,
            status: true,
            isPremium: true,
            price: true,
            createdAt: true,
            reportCount: true,
            moderationStatus: true,
          },
        },
        purchases: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            amount: true,
            platformFee: true,
            createdAt: true,
            pick: {
              select: {
                id: true,
                matchup: true,
                sport: true,
              },
            },
          },
        },
        loginActivities: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get revenue stats
    const revenueStats = await prisma.purchase.aggregate({
      where: {
        pick: {
          userId: userId,
        },
      },
      _sum: {
        amount: true,
        platformFee: true,
      },
      _count: true,
    });

    // Get reports against this user
    const reports = await prisma.report.findMany({
      where: {
        targetType: "USER",
        targetId: userId,
      },
      take: 10,
      orderBy: { createdAt: "desc" },
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

    await logAudit({
      userId: session.user.id,
      action: AuditAction.VIEW_USER,
      resource: AuditResource.USER,
      resourceId: userId,
      success: true,
      ...getRequestMetadata(req),
    });

    return NextResponse.json({
      user,
      revenue: {
        totalRevenue: revenueStats._sum.amount || 0,
        platformFees: revenueStats._sum.platformFee || 0,
        netRevenue:
          (revenueStats._sum.amount || 0) - (revenueStats._sum.platformFee || 0),
        totalSales: revenueStats._count,
      },
      reports,
    });
  } catch (error: any) {
    console.error("Error fetching user:", error);

    await logAudit({
      userId: session.user.id,
      action: AuditAction.VIEW_USER,
      resource: AuditResource.USER,
      resourceId: userId,
      success: false,
      ...getRequestMetadata(req),
      details: { error: error.message },
    });

    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PATCH(
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
    const validatedData = updateUserSchema.parse(body);

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        accountStatus: true,
        trustScore: true,
        isVerified: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(validatedData.role && { role: validatedData.role }),
        ...(validatedData.accountStatus && {
          accountStatus: validatedData.accountStatus,
        }),
        ...(validatedData.trustScore !== undefined && {
          trustScore: validatedData.trustScore,
        }),
        ...(validatedData.isVerified !== undefined && {
          isVerified: validatedData.isVerified,
        }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        accountStatus: true,
        trustScore: true,
        isVerified: true,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: AuditAction.UPDATE_USER,
      resource: AuditResource.USER,
      resourceId: userId,
      success: true,
      ...getRequestMetadata(req),
      details: {
        changes: validatedData,
        before: currentUser,
        after: updatedUser,
        notes: validatedData.notes,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    console.error("Error updating user:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    await logAudit({
      userId: session.user.id,
      action: AuditAction.UPDATE_USER,
      resource: AuditResource.USER,
      resourceId: userId,
      success: false,
      ...getRequestMetadata(req),
      details: { error: error.message },
    });

    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  // Only admins (not moderators) can delete users
  const authCheck = await requireAdmin(req, false);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const { session } = authCheck;
  const { userId } = params;

  try {
    // Prevent self-deletion
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Get user data before deletion
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    await logAudit({
      userId: session.user.id,
      action: AuditAction.DELETE_USER,
      resource: AuditResource.USER,
      resourceId: userId,
      success: true,
      ...getRequestMetadata(req),
      details: {
        deletedUser: user,
      },
    });

    return NextResponse.json({
      message: "User deleted successfully",
      deletedUser: user,
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);

    await logAudit({
      userId: session.user.id,
      action: AuditAction.DELETE_USER,
      resource: AuditResource.USER,
      resourceId: userId,
      success: false,
      ...getRequestMetadata(req),
      details: { error: error.message },
    });

    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
