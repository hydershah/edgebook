/**
 * Transactions API
 * Get transaction history for authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: session.user.id,
    };

    if (type) {
      where.type = type;
    }

    // Get transactions
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
    ]);

    // Calculate summary statistics
    const stats = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId: session.user.id,
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
    });

    const summary = {
      totalSpent: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
    };

    stats.forEach((stat) => {
      const amount = stat._sum.amount || 0;

      if (stat.type === 'PICK_PURCHASE' || stat.type === 'SUBSCRIPTION') {
        summary.totalSpent += amount;
      }

      if (stat.type === 'PICK_SALE' || stat.type === 'SUBSCRIPTION_REVENUE') {
        summary.totalEarned += amount;
      }

      if (stat.type === 'PAYOUT') {
        summary.totalWithdrawn += amount;
      }
    });

    return NextResponse.json({
      transactions: transactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount / 100, // Convert to dollars
        platformFee: tx.platformFee ? tx.platformFee / 100 : null,
        status: tx.status,
        description: tx.description,
        referenceId: tx.referenceId,
        metadata: tx.metadata,
        createdAt: tx.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalSpent: summary.totalSpent / 100,
        totalEarned: summary.totalEarned / 100,
        totalWithdrawn: summary.totalWithdrawn / 100,
        netEarnings: (summary.totalEarned - summary.totalWithdrawn) / 100,
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to get transactions' },
      { status: 500 }
    );
  }
}
