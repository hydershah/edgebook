/**
 * Creator Subscribers API
 * Get list of subscribers for the authenticated creator
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { subscriptionService } from '@/lib/services/payment';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subscribers = await subscriptionService.getCreatorSubscribers(
      session.user.id
    );

    return NextResponse.json({
      subscribers: subscribers.map((sub) => ({
        id: sub.id,
        amount: sub.amount / 100,
        status: sub.status,
        currentPeriodEnd: sub.currentPeriodEnd,
        subscriber: {
          id: sub.subscriber.id,
          name: sub.subscriber.name,
          username: sub.subscriber.username,
          email: sub.subscriber.email,
          avatar: sub.subscriber.avatar,
        },
        createdAt: sub.createdAt,
      })),
      total: subscribers.length,
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscribers' },
      { status: 500 }
    );
  }
}
