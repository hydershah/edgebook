import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getRequestMetadata } from "@/lib/adminMiddleware";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { DisputeStatus, PickStatus } from "@prisma/client";
import { z } from "zod";

const resolveDisputeSchema = z.object({
  resolution: z.string().min(10),
  correctResult: z.nativeEnum(PickStatus),
  refund: z.boolean().optional().default(false),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { disputeId: string } }
) {
  const authCheck = await requireAdmin(req);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const { session } = authCheck;
  const { disputeId } = params;

  try {
    const body = await req.json();
    const { resolution, correctResult, refund } = resolveDisputeSchema.parse(body);

    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        pick: true,
        user: {
          select: { id: true, email: true, username: true },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    if (dispute.status === DisputeStatus.RESOLVED) {
      return NextResponse.json(
        { error: "Dispute already resolved" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Update dispute
      await tx.dispute.update({
        where: { id: disputeId },
        data: {
          status: DisputeStatus.RESOLVED,
          resolution,
          resolvedBy: session.user.id,
          resolvedAt: new Date(),
        },
      });

      // Update pick result
      await tx.pick.update({
        where: { id: dispute.pickId },
        data: {
          status: correctResult,
          moderatedBy: session.user.id,
          moderatedAt: new Date(),
          moderationNotes: `Result updated via dispute resolution: ${resolution}`,
        },
      });

      // If refund requested, create refund transaction
      if (refund) {
        const purchases = await tx.purchase.findMany({
          where: { pickId: dispute.pickId },
        });

        // TODO: Process Stripe refunds
        for (const purchase of purchases) {
          // await stripe.refunds.create({
          //   payment_intent: purchase.stripePaymentId,
          // });
        }
      }
    });

    await logAudit({
      userId: session.user.id,
      action: "RESOLVE_DISPUTE",
      resource: "DISPUTE",
      resourceId: disputeId,
      success: true,
      ...getRequestMetadata(req),
      details: {
        pickId: dispute.pickId,
        correctResult,
        refund,
        resolution,
      },
    });

    // TODO: Send email notifications to disputer and pick creator

    return NextResponse.json({
      message: "Dispute resolved successfully",
      correctResult,
      refund,
    });
  } catch (error: any) {
    console.error("Error resolving dispute:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    await logAudit({
      userId: session.user.id,
      action: "RESOLVE_DISPUTE",
      resource: "DISPUTE",
      resourceId: disputeId,
      success: false,
      ...getRequestMetadata(req),
      details: { error: error.message },
    });

    return NextResponse.json(
      { error: "Failed to resolve dispute" },
      { status: 500 }
    );
  }
}
