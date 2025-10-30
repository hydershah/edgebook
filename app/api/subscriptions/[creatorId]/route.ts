/**
 * Subscription Status API
 * Get subscription status for a specific creator
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { subscriptionService } from '@/lib/services/payment';

export async function GET(
  request: NextRequest,
  { params }: { params: { creatorId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { subscribed: false },
        { status: 200 }
      );
    }

    const { creatorId } = params;

    const subscription = await subscriptionService.getSubscription(
      session.user.id,
      creatorId
    );

    if (!subscription) {
      return NextResponse.json({
        subscribed: false,
      });
    }

    return NextResponse.json({
      subscribed: subscription.status === 'ACTIVE',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        amount: subscription.amount / 100,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        canceledAt: subscription.canceledAt,
        createdAt: subscription.createdAt,
      },
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    );
  }
}
