/**
 * Pick Purchase API
 * Handles premium pick purchases with Whop payment processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { whopService } from '@/lib/services/whop/whop.service';
import { paymentService } from '@/lib/services/payment';
import { z } from 'zod';

export async function POST(
  request: NextRequest,
  { params }: { params: { pickId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { pickId } = params;

    // Check if already purchased
    const hasPurchased = await paymentService.checkDuplicatePurchase(
      session.user.id,
      pickId
    );

    if (hasPurchased) {
      return NextResponse.json(
        { error: 'You have already purchased this pick' },
        { status: 400 }
      );
    }

    // Get pick details
    const pick = await prisma.pick.findUnique({
      where: { id: pickId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            whopUserId: true,
          },
        },
      },
    });

    if (!pick) {
      return NextResponse.json(
        { error: 'Pick not found' },
        { status: 404 }
      );
    }

    if (!pick.isPremium || !pick.price) {
      return NextResponse.json(
        { error: 'This pick is not available for purchase' },
        { status: 400 }
      );
    }

    // Prevent self-purchase
    if (pick.userId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot purchase your own pick' },
        { status: 400 }
      );
    }

    // Check if pick is locked
    if (pick.lockedAt && new Date() > pick.lockedAt) {
      return NextResponse.json(
        { error: 'This pick is locked and can no longer be purchased' },
        { status: 400 }
      );
    }

    // Convert price to cents
    const amount = Math.round(pick.price * 100);

    // Validate price
    const priceValidation = await paymentService.validatePickPrice(amount);
    if (!priceValidation.valid) {
      return NextResponse.json(
        { error: priceValidation.error },
        { status: 400 }
      );
    }

    // Calculate fees
    const fees = await paymentService.calculateFees(amount);

    // Create payment with Whop
    const paymentResult = await whopService.chargeUser({
      userId: session.user.id,
      amount: fees.amount,
      currency: 'USD',
      description: `Purchase pick: ${pick.matchup}`,
      metadata: {
        pickId: pick.id,
        sellerId: pick.userId,
        platformFee: fees.platformFee,
        creatorEarnings: fees.creatorEarnings,
        buyerId: session.user.id,
        buyerName: session.user.name || session.user.email,
        pickMatchup: pick.matchup,
      },
    });

    if (!paymentResult.success) {
      console.error('Whop payment failed:', paymentResult.error);
      return NextResponse.json(
        {
          error: 'Payment processing failed',
          details: paymentResult.error?.message
        },
        { status: 500 }
      );
    }

    // Create pending purchase record
    const purchase = await paymentService.createPendingPurchase({
      userId: session.user.id,
      pickId: pick.id,
      amount: fees.amount,
      platformFee: fees.platformFee,
      creatorEarnings: fees.creatorEarnings,
      whopPaymentId: paymentResult.data?.id,
      paymentMethod: paymentResult.data?.payment_method,
    });

    // Return checkout URL for Whop payment
    return NextResponse.json({
      success: true,
      purchase: {
        id: purchase.id,
        amount: fees.amount / 100, // Convert back to dollars
        status: purchase.status,
      },
      payment: {
        id: paymentResult.data?.id,
        checkoutUrl: paymentResult.data?.checkout_url,
      },
    });
  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process purchase',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get purchase status for a pick
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { pickId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { pickId } = params;

    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_pickId: {
          userId: session.user.id,
          pickId,
        },
      },
      select: {
        id: true,
        status: true,
        amount: true,
        createdAt: true,
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { purchased: false },
        { status: 200 }
      );
    }

    return NextResponse.json({
      purchased: true,
      purchase: {
        ...purchase,
        amount: purchase.amount / 100, // Convert to dollars
      },
    });
  } catch (error) {
    console.error('Get purchase error:', error);
    return NextResponse.json(
      { error: 'Failed to get purchase status' },
      { status: 500 }
    );
  }
}
