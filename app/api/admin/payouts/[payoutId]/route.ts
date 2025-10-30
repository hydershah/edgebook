import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getRequestMetadata } from "@/lib/adminMiddleware";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { PayoutStatus } from "@prisma/client";
import { z } from "zod";

const approvePayoutSchema = z.object({
  notes: z.string().optional(),
});

const rejectPayoutSchema = z.object({
  reason: z.string().min(10),
  notes: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { payoutId: string } }
) {
  const authCheck = await requireAdmin(req, false); // Admin only
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const { session } = authCheck;
  const { payoutId } = params;
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action"); // 'approve' or 'reject'

  try {
    const payout = await prisma.payoutReview.findUnique({
      where: { id: payoutId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            stripeAccountId: true,
          },
        },
      },
    });

    if (!payout) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 });
    }

    if (
      payout.status !== PayoutStatus.PENDING &&
      payout.status !== PayoutStatus.UNDER_REVIEW
    ) {
      return NextResponse.json(
        { error: "Payout already processed" },
        { status: 400 }
      );
    }

    const body = await req.json();

    if (action === "approve") {
      const { notes } = approvePayoutSchema.parse(body);

      // TODO: Integrate with Stripe Connect to transfer funds
      // const transfer = await stripe.transfers.create({
      //   amount: Math.round(payout.netAmount * 100),
      //   currency: 'usd',
      //   destination: payout.user.stripeAccountId,
      //   description: `Payout for period ${payout.period}`,
      // });

      const updatedPayout = await prisma.payoutReview.update({
        where: { id: payoutId },
        data: {
          status: PayoutStatus.APPROVED,
          reviewedBy: session.user.id,
          reviewNotes: notes,
          // stripeTransferId: transfer.id,
          // paidAt: new Date(),
        },
      });

      await logAudit({
        userId: session.user.id,
        action: "APPROVE_PAYOUT",
        resource: "PAYOUT",
        resourceId: payoutId,
        success: true,
        ...getRequestMetadata(req),
        details: {
          amount: payout.netAmount,
          period: payout.period,
          creatorId: payout.userId,
          notes,
        },
      });

      // TODO: Send email notification to creator

      return NextResponse.json({
        message: "Payout approved successfully",
        payout: updatedPayout,
      });
    } else if (action === "reject") {
      const { reason, notes } = rejectPayoutSchema.parse(body);

      const updatedPayout = await prisma.payoutReview.update({
        where: { id: payoutId },
        data: {
          status: PayoutStatus.REJECTED,
          reviewedBy: session.user.id,
          reviewNotes: `REJECTED: ${reason}${notes ? `\n\n${notes}` : ""}`,
        },
      });

      await logAudit({
        userId: session.user.id,
        action: "REJECT_PAYOUT",
        resource: "PAYOUT",
        resourceId: payoutId,
        success: true,
        ...getRequestMetadata(req),
        details: {
          amount: payout.netAmount,
          period: payout.period,
          creatorId: payout.userId,
          reason,
          notes,
        },
      });

      // TODO: Send email notification to creator with reason

      return NextResponse.json({
        message: "Payout rejected",
        payout: updatedPayout,
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Error processing payout:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    await logAudit({
      userId: session.user.id,
      action: `${action?.toUpperCase()}_PAYOUT`,
      resource: "PAYOUT",
      resourceId: payoutId,
      success: false,
      ...getRequestMetadata(req),
      details: { error: error.message },
    });

    return NextResponse.json(
      { error: "Failed to process payout" },
      { status: 500 }
    );
  }
}
