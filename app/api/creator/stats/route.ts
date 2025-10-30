/**
 * Creator Stats API
 * Get subscription and earnings statistics for the authenticated creator
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { subscriptionService } from '@/lib/services/payment';
import { paymentService } from '@/lib/services/payment';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get subscription stats
    const subscriptionStats = await subscriptionService.getCreatorStats(
      session.user.id
    );

    // Get balance
    const balance = await paymentService.calculateCreatorBalance(
      session.user.id
    );

    return NextResponse.json({
      subscriptions: subscriptionStats,
      earnings: {
        availableBalance: balance / 100, // Convert to dollars
        totalEarnings: 0, // TODO: Calculate from transactions
        lifetimeRevenue: 0, // TODO: Calculate from all time
      },
    });
  } catch (error) {
    console.error('Get creator stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get creator stats' },
      { status: 500 }
    );
  }
}
