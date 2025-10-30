/**
 * Admin Refunds API
 * Process refunds for purchases (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { paymentService } from '@/lib/services/payment';
import { z } from 'zod';

const refundSchema = z.object({
  purchaseId: z.string().min(1, 'Purchase ID is required'),
  amount: z.number().min(0).optional(), // Partial refund amount in dollars
  reason: z.string().min(1, 'Reason is required'),
});

/**
 * Process a refund
 */
export async function POST(request: NextRequest) {
  let session;
  try {
    session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = refundSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { purchaseId, amount, reason } = validation.data;

    // Get purchase details
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        pick: {
          select: {
            id: true,
            matchup: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    // Convert amount to cents if provided
    const refundAmount = amount ? Math.round(amount * 100) : undefined;

    // Validate refund amount
    if (refundAmount && refundAmount > purchase.amount) {
      return NextResponse.json(
        {
          error: 'Refund amount exceeds purchase amount',
          purchaseAmount: purchase.amount / 100,
          requestedRefund: refundAmount / 100,
        },
        { status: 400 }
      );
    }

    // Check if already refunded
    if (purchase.status === 'REFUNDED') {
      return NextResponse.json(
        { error: 'Purchase has already been fully refunded' },
        { status: 400 }
      );
    }

    // Check partial refund limits
    if (purchase.status === 'PARTIALLY_REFUNDED' && purchase.refundAmount) {
      const remainingAmount = purchase.amount - purchase.refundAmount;
      if (refundAmount && refundAmount > remainingAmount) {
        return NextResponse.json(
          {
            error: 'Refund amount exceeds remaining balance',
            remaining: remainingAmount / 100,
            requestedRefund: refundAmount / 100,
          },
          { status: 400 }
        );
      }
    }

    // Process refund
    const result = await paymentService.processRefund(
      purchaseId,
      refundAmount,
      reason
    );

    // Log the refund
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'REFUND_PROCESSED',
        resource: 'Purchase',
        resourceId: purchaseId,
        details: {
          purchaseId,
          amount: refundAmount ? refundAmount / 100 : purchase.amount / 100,
          reason,
          buyerEmail: purchase.user.email,
          pickMatchup: purchase.pick.matchup,
        },
        success: true,
      },
    });

    return NextResponse.json({
      success: true,
      refund: {
        purchaseId,
        amount: refundAmount ? refundAmount / 100 : purchase.amount / 100,
        reason,
        processedBy: session.user.name || session.user.email,
      },
      message: 'Refund processed successfully',
    });
  } catch (error) {
    console.error('Process refund error:', error);

    // Log failed refund attempt
    try {
      await prisma.auditLog.create({
        data: {
          userId: session?.user?.id || 'unknown',
          action: 'REFUND_FAILED',
          resource: 'Purchase',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          success: false,
        },
      });
    } catch (logError) {
      console.error('Failed to log refund error:', logError);
    }

    return NextResponse.json(
      {
        error: 'Failed to process refund',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get refund history
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = (page - 1) * limit;

    // Get refunded purchases
    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where: {
          status: {
            in: ['REFUNDED', 'PARTIALLY_REFUNDED'],
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          pick: {
            select: {
              id: true,
              matchup: true,
            },
          },
        },
        orderBy: {
          refundedAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.purchase.count({
        where: {
          status: {
            in: ['REFUNDED', 'PARTIALLY_REFUNDED'],
          },
        },
      }),
    ]);

    return NextResponse.json({
      refunds: purchases.map((purchase) => ({
        id: purchase.id,
        purchaseAmount: purchase.amount / 100,
        refundAmount: purchase.refundAmount ? purchase.refundAmount / 100 : null,
        status: purchase.status,
        buyer: {
          id: purchase.user.id,
          name: purchase.user.name,
          email: purchase.user.email,
        },
        pick: {
          id: purchase.pick.id,
          matchup: purchase.pick.matchup,
        },
        refundedAt: purchase.refundedAt,
        createdAt: purchase.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get refunds error:', error);
    return NextResponse.json(
      { error: 'Failed to get refunds' },
      { status: 500 }
    );
  }
}
