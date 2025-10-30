/**
 * Subscriptions API
 * Handles creator subscription creation and management
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { subscriptionService } from '@/lib/services/payment';
import { z } from 'zod';

const createSubscriptionSchema = z.object({
  creatorId: z.string().min(1, 'Creator ID is required'),
});

/**
 * Create a new subscription to a creator
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
    const validation = createSubscriptionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { creatorId } = validation.data;

    // Can't subscribe to yourself
    if (creatorId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot subscribe to yourself' },
        { status: 400 }
      );
    }

    // Get creator details
    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      select: {
        id: true,
        name: true,
        username: true,
        subscriptionPrice: true,
        subscriptionEnabled: true,
        whopUserId: true,
      },
    });

    if (!creator) {
      return NextResponse.json(
        { error: 'Creator not found' },
        { status: 404 }
      );
    }

    if (!creator.subscriptionEnabled) {
      return NextResponse.json(
        { error: 'This creator does not offer subscriptions' },
        { status: 400 }
      );
    }

    if (!creator.subscriptionPrice) {
      return NextResponse.json(
        { error: 'Creator has not set subscription price' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const isSubscribed = await subscriptionService.isSubscribed(
      session.user.id,
      creatorId
    );

    if (isSubscribed) {
      return NextResponse.json(
        { error: 'You are already subscribed to this creator' },
        { status: 400 }
      );
    }

    // Convert price to cents
    const amount = Math.round(creator.subscriptionPrice * 100);

    // Create subscription
    const subscription = await subscriptionService.createSubscription({
      subscriberId: session.user.id,
      creatorId,
      amount,
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        amount: subscription.amount / 100,
        creatorName: creator.name || creator.username,
      },
      // Note: In real implementation, this would come from Whop
      checkoutUrl: `/checkout/subscription/${subscription.id}`,
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create subscription',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get user's subscriptions
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

    const subscriptions = await subscriptionService.getUserSubscriptions(
      session.user.id
    );

    return NextResponse.json({
      subscriptions: subscriptions.map((sub) => ({
        id: sub.id,
        status: sub.status,
        amount: sub.amount / 100,
        currentPeriodEnd: sub.currentPeriodEnd,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        creator: {
          id: sub.creator.id,
          name: sub.creator.name,
          username: sub.creator.username,
          avatar: sub.creator.avatar,
          bio: sub.creator.bio,
        },
        createdAt: sub.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscriptions' },
      { status: 500 }
    );
  }
}
