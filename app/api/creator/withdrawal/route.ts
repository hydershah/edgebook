/**
 * Creator Withdrawal API
 * Request payout of available earnings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { paymentService } from '@/lib/services/payment';
import { z } from 'zod';

const withdrawalRequestSchema = z.object({
  amount: z.number().min(0).optional(), // If not provided, withdraw all available
});

/**
 * Request a withdrawal
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = withdrawalRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        whopUserId: true,
        payoutMethod: true,
        cryptoWalletAddress: true,
        bankAccountId: true,
        minPayout: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.whopUserId) {
      return NextResponse.json(
        {
          error: 'Payout account not configured',
          message: 'Please connect your Whop account in settings to receive payouts',
        },
        { status: 400 }
      );
    }

    // Calculate available balance
    const availableBalance = await paymentService.calculateCreatorBalance(
      session.user.id
    );

    if (availableBalance <= 0) {
      return NextResponse.json(
        { error: 'No funds available for withdrawal' },
        { status: 400 }
      );
    }

    // Determine withdrawal amount
    const requestedAmount = validation.data.amount
      ? Math.round(validation.data.amount * 100) // Convert to cents
      : availableBalance;

    if (requestedAmount > availableBalance) {
      return NextResponse.json(
        {
          error: 'Insufficient balance',
          available: availableBalance / 100,
          requested: requestedAmount / 100,
        },
        { status: 400 }
      );
    }

    // Check minimum payout threshold
    const config = await paymentService.getConfiguration();
    if (requestedAmount < config.withdrawalMinimum) {
      return NextResponse.json(
        {
          error: 'Below minimum withdrawal amount',
          minimum: config.withdrawalMinimum / 100,
          requested: requestedAmount / 100,
        },
        { status: 400 }
      );
    }

    if (!config.withdrawalEnabled) {
      return NextResponse.json(
        { error: 'Withdrawals are currently disabled' },
        { status: 503 }
      );
    }

    // Validate payout method configuration
    if (user.payoutMethod === 'CRYPTO' && !user.cryptoWalletAddress) {
      return NextResponse.json(
        { error: 'Crypto wallet address not configured' },
        { status: 400 }
      );
    }

    if (user.payoutMethod === 'BANK' && !user.bankAccountId) {
      return NextResponse.json(
        { error: 'Bank account not configured' },
        { status: 400 }
      );
    }

    // Create payout request
    const payout = await paymentService.createPayoutRequest(
      session.user.id,
      requestedAmount
    );

    return NextResponse.json({
      success: true,
      payout: {
        id: payout.id,
        amount: payout.amount / 100,
        method: payout.method,
        status: payout.status,
        createdAt: payout.createdAt,
      },
      message: 'Withdrawal request created successfully',
    });
  } catch (error) {
    console.error('Withdrawal request error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process withdrawal request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get withdrawal history
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

    const payouts = await prisma.payout.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Last 50 payouts
    });

    // Calculate available balance
    const availableBalance = await paymentService.calculateCreatorBalance(
      session.user.id
    );

    return NextResponse.json({
      availableBalance: availableBalance / 100,
      payouts: payouts.map((payout) => ({
        id: payout.id,
        amount: payout.amount / 100,
        method: payout.method,
        status: payout.status,
        transactionHash: payout.transactionHash,
        failureReason: payout.failureReason,
        processedAt: payout.processedAt,
        createdAt: payout.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get withdrawal history error:', error);
    return NextResponse.json(
      { error: 'Failed to get withdrawal history' },
      { status: 500 }
    );
  }
}
