import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getRequestMetadata } from "@/lib/adminMiddleware";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { ModerationStatus, PickStatus } from "@prisma/client";
import { z } from "zod";

const moderatePickSchema = z.object({
  moderationStatus: z.nativeEnum(ModerationStatus),
  moderationNotes: z.string().optional(),
  verifyResult: z.nativeEnum(PickStatus).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { pickId: string } }
) {
  const authCheck = await requireAdmin(req);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const { session } = authCheck;
  const { pickId } = params;

  try {
    const body = await req.json();
    const { moderationStatus, moderationNotes, verifyResult } = moderatePickSchema.parse(body);

    const currentPick = await prisma.pick.findUnique({
      where: { id: pickId },
      select: {
        id: true,
        moderationStatus: true,
        status: true,
        userId: true,
      },
    });

    if (!currentPick) {
      return NextResponse.json({ error: "Pick not found" }, { status: 404 });
    }

    const updateData: any = {
      moderationStatus,
      moderatedBy: session.user.id,
      moderatedAt: new Date(),
    };

    if (moderationNotes) {
      updateData.moderationNotes = moderationNotes;
    }

    // If verifying result, update status
    if (verifyResult) {
      updateData.status = verifyResult;

      // Resolve any disputes for this pick
      await prisma.dispute.updateMany({
        where: {
          pickId,
          status: { in: ["OPEN", "INVESTIGATING"] },
        },
        data: {
          status: "RESOLVED",
          resolution: `Result verified by admin: ${verifyResult}`,
          resolvedBy: session.user.id,
          resolvedAt: new Date(),
        },
      });
    }

    const updatedPick = await prisma.pick.update({
      where: { id: pickId },
      data: updateData,
      include: {
        user: {
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
      action: "MODERATE_PICK",
      resource: "PICK",
      resourceId: pickId,
      success: true,
      ...getRequestMetadata(req),
      details: {
        before: currentPick,
        changes: { moderationStatus, verifyResult },
        notes: moderationNotes,
      },
    });

    return NextResponse.json({ pick: updatedPick });
  } catch (error: any) {
    console.error("Error moderating pick:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    await logAudit({
      userId: session.user.id,
      action: "MODERATE_PICK",
      resource: "PICK",
      resourceId: pickId,
      success: false,
      ...getRequestMetadata(req),
      details: { error: error.message },
    });

    return NextResponse.json(
      { error: "Failed to moderate pick" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { pickId: string } }
) {
  const authCheck = await requireAdmin(req);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const { session } = authCheck;
  const { pickId } = params;

  try {
    const pick = await prisma.pick.findUnique({
      where: { id: pickId },
      select: {
        id: true,
        matchup: true,
        userId: true,
        user: {
          select: { username: true, email: true },
        },
      },
    });

    if (!pick) {
      return NextResponse.json({ error: "Pick not found" }, { status: 404 });
    }

    await prisma.pick.delete({
      where: { id: pickId },
    });

    await logAudit({
      userId: session.user.id,
      action: "DELETE_PICK",
      resource: "PICK",
      resourceId: pickId,
      success: true,
      ...getRequestMetadata(req),
      details: { deletedPick: pick },
    });

    return NextResponse.json({
      message: "Pick deleted successfully",
      deletedPick: pick,
    });
  } catch (error: any) {
    console.error("Error deleting pick:", error);

    await logAudit({
      userId: session.user.id,
      action: "DELETE_PICK",
      resource: "PICK",
      resourceId: pickId,
      success: false,
      ...getRequestMetadata(req),
      details: { error: error.message },
    });

    return NextResponse.json(
      { error: "Failed to delete pick" },
      { status: 500 }
    );
  }
}
