/**
 * Admin Payment Configuration API
 * Manage platform payment settings (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateConfigSchema = z.object({
  platformFeePercent: z.number().min(0).max(100).optional(),
  minPickPrice: z.number().min(0).optional(),
  maxPickPrice: z.number().min(0).optional(),
  minSubscriptionPrice: z.number().min(0).optional(),
  maxSubscriptionPrice: z.number().min(0).optional(),
  withdrawalMinimum: z.number().min(0).optional(),
  withdrawalEnabled: z.boolean().optional(),
});

/**
 * Get current payment configuration
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

    // Get current configuration
    let config = await prisma.paymentConfiguration.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    // Create default if none exists
    if (!config) {
      config = await prisma.paymentConfiguration.create({
        data: {
          platformFeePercent: parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '15'),
          minPickPrice: 50,
          maxPickPrice: 1000000,
          minSubscriptionPrice: 499,
          maxSubscriptionPrice: 99999,
          withdrawalMinimum: parseFloat(process.env.DEFAULT_MIN_PAYOUT || '1000'),
          withdrawalEnabled: true,
          paymentProvider: 'whop',
        },
      });
    }

    return NextResponse.json({
      config: {
        ...config,
        // Convert cents to dollars for display
        minPickPrice: config.minPickPrice / 100,
        maxPickPrice: config.maxPickPrice / 100,
        minSubscriptionPrice: config.minSubscriptionPrice / 100,
        maxSubscriptionPrice: config.maxSubscriptionPrice / 100,
        withdrawalMinimum: config.withdrawalMinimum / 100,
      },
    });
  } catch (error) {
    console.error('Get payment config error:', error);
    return NextResponse.json(
      { error: 'Failed to get payment configuration' },
      { status: 500 }
    );
  }
}

/**
 * Update payment configuration
 */
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const validation = updateConfigSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const updates = validation.data;

    // Convert dollar amounts to cents
    const dataToUpdate: any = {
      updatedBy: session.user.id,
    };

    if (updates.platformFeePercent !== undefined) {
      dataToUpdate.platformFeePercent = updates.platformFeePercent;
    }
    if (updates.minPickPrice !== undefined) {
      dataToUpdate.minPickPrice = Math.round(updates.minPickPrice * 100);
    }
    if (updates.maxPickPrice !== undefined) {
      dataToUpdate.maxPickPrice = Math.round(updates.maxPickPrice * 100);
    }
    if (updates.minSubscriptionPrice !== undefined) {
      dataToUpdate.minSubscriptionPrice = Math.round(updates.minSubscriptionPrice * 100);
    }
    if (updates.maxSubscriptionPrice !== undefined) {
      dataToUpdate.maxSubscriptionPrice = Math.round(updates.maxSubscriptionPrice * 100);
    }
    if (updates.withdrawalMinimum !== undefined) {
      dataToUpdate.withdrawalMinimum = Math.round(updates.withdrawalMinimum * 100);
    }
    if (updates.withdrawalEnabled !== undefined) {
      dataToUpdate.withdrawalEnabled = updates.withdrawalEnabled;
    }

    // Create new configuration record (keeps history)
    const config = await prisma.paymentConfiguration.create({
      data: {
        ...dataToUpdate,
        paymentProvider: 'whop',
      },
    });

    // Log the change
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PAYMENT_CONFIG_UPDATE',
        resource: 'PaymentConfiguration',
        resourceId: config.id,
        details: {
          updates: validation.data,
        },
        success: true,
      },
    });

    return NextResponse.json({
      success: true,
      config: {
        ...config,
        // Convert back to dollars for response
        minPickPrice: config.minPickPrice / 100,
        maxPickPrice: config.maxPickPrice / 100,
        minSubscriptionPrice: config.minSubscriptionPrice / 100,
        maxSubscriptionPrice: config.maxSubscriptionPrice / 100,
        withdrawalMinimum: config.withdrawalMinimum / 100,
      },
    });
  } catch (error) {
    console.error('Update payment config error:', error);
    return NextResponse.json(
      { error: 'Failed to update payment configuration' },
      { status: 500 }
    );
  }
}
