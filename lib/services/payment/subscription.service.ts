/**
 * Subscription Service
 * Handles subscription creation, management, and cancellation
 */

import { prisma } from '@/lib/prisma';
import { whopService } from '../whop/whop.service';
import { SubscriptionStatus } from '@prisma/client';
import { paymentService } from './payment.service';

// Define enums locally since they're not yet used in the Prisma schema (Transaction model uses String temporarily)
enum TransactionType {
  PICK_PURCHASE = 'PICK_PURCHASE',
  PICK_SALE = 'PICK_SALE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  SUBSCRIPTION_REVENUE = 'SUBSCRIPTION_REVENUE',
  PAYOUT = 'PAYOUT',
  REFUND = 'REFUND',
  PLATFORM_FEE = 'PLATFORM_FEE',
  ADJUSTMENT = 'ADJUSTMENT',
}

enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

interface CreateSubscriptionParams {
  subscriberId: string;
  creatorId: string;
  amount: number;
}

export class SubscriptionService {
  /**
   * Check if user is already subscribed to creator
   */
  async isSubscribed(subscriberId: string, creatorId: string): Promise<boolean> {
    const subscription = await prisma.subscription.findUnique({
      where: {
        subscriberId_creatorId: {
          subscriberId,
          creatorId,
        },
      },
    });

    return subscription?.status === SubscriptionStatus.ACTIVE;
  }

  /**
   * Get active subscription
   */
  async getSubscription(subscriberId: string, creatorId: string) {
    return prisma.subscription.findUnique({
      where: {
        subscriberId_creatorId: {
          subscriberId,
          creatorId,
        },
      },
      include: {
        subscriber: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }

  /**
   * Create subscription
   */
  async createSubscription(params: CreateSubscriptionParams) {
    const { subscriberId, creatorId, amount } = params;

    // Check if already subscribed
    const existing = await this.isSubscribed(subscriberId, creatorId);
    if (existing) {
      throw new Error('Already subscribed to this creator');
    }

    // Validate subscription price
    const validation = await paymentService.validateSubscriptionPrice(amount);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Calculate fees
    const fees = await paymentService.calculateFees(amount);

    // Get creator's Whop plan ID (would be configured separately)
    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      select: {
        whopUserId: true,
        subscriptionPrice: true,
        subscriptionEnabled: true,
      },
    });

    if (!creator?.subscriptionEnabled) {
      throw new Error('Creator does not offer subscriptions');
    }

    if (!creator.whopUserId) {
      throw new Error('Creator has not set up payment account');
    }

    // Create subscription with Whop
    const result = await whopService.createSubscription({
      userId: subscriberId,
      planId: creator.whopUserId, // This would be the creator's Whop plan ID
      metadata: {
        creatorId,
        amount: fees.amount,
        platformFee: fees.platformFee,
        creatorEarnings: fees.creatorEarnings,
      },
    });

    if (!result.success) {
      throw new Error(result.error?.message || 'Subscription creation failed');
    }

    // Create pending subscription record
    const now = new Date();
    const nextBillingDate = new Date(now);
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    return prisma.subscription.create({
      data: {
        subscriberId,
        creatorId,
        whopSubscriptionId: result.data?.id,
        status: SubscriptionStatus.PENDING,
        amount: fees.amount,
        platformFee: fees.platformFee,
        currentPeriodStart: now,
        currentPeriodEnd: nextBillingDate,
      },
    });
  }

  /**
   * Activate subscription (called from webhook)
   */
  async activateSubscription(whopSubscriptionId: string, currentPeriodEnd: Date) {
    const subscription = await prisma.subscription.findUnique({
      where: { whopSubscriptionId },
      include: {
        creator: true,
      },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Update subscription status
    const updated = await prisma.subscription.update({
      where: { whopSubscriptionId },
      data: {
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd,
      },
    });

    // Create transaction records for first payment
    await this.recordSubscriptionPayment(subscription.id);

    return updated;
  }

  /**
   * Record subscription payment
   */
  async recordSubscriptionPayment(subscriptionId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        subscriber: true,
        creator: true,
      },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    await prisma.$transaction([
      // Subscriber's payment transaction
      prisma.transaction.create({
        data: {
          userId: subscription.subscriberId,
          type: TransactionType.SUBSCRIPTION,
          amount: subscription.amount,
          platformFee: subscription.platformFee,
          status: TransactionStatus.COMPLETED,
          whopReferenceId: subscription.whopSubscriptionId,
          referenceId: subscription.id,
          description: `Subscription to ${subscription.creator.name || subscription.creator.username}`,
          metadata: {
            creatorId: subscription.creatorId,
          },
        },
      }),
      // Creator's revenue transaction
      prisma.transaction.create({
        data: {
          userId: subscription.creatorId,
          type: TransactionType.SUBSCRIPTION_REVENUE,
          amount: subscription.amount - subscription.platformFee,
          status: TransactionStatus.COMPLETED,
          whopReferenceId: subscription.whopSubscriptionId,
          referenceId: subscription.id,
          description: `Subscription revenue from ${subscription.subscriber.name || subscription.subscriber.email}`,
          metadata: {
            subscriberId: subscription.subscriberId,
          },
        },
      }),
    ]);

    // Check for auto-withdrawal
    await paymentService.checkAutoWithdrawal(subscription.creatorId);
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriberId: string,
    creatorId: string,
    cancelAtPeriodEnd: boolean = true
  ) {
    const subscription = await this.getSubscription(subscriberId, creatorId);

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new Error('Subscription is not active');
    }

    if (!subscription.whopSubscriptionId) {
      throw new Error('Cannot cancel: no Whop subscription ID');
    }

    // Cancel with Whop
    const result = await whopService.cancelSubscription(
      subscription.whopSubscriptionId,
      cancelAtPeriodEnd
    );

    if (!result.success) {
      throw new Error(result.error?.message || 'Cancellation failed');
    }

    // Update subscription record
    return prisma.subscription.update({
      where: {
        subscriberId_creatorId: {
          subscriberId,
          creatorId,
        },
      },
      data: {
        cancelAtPeriodEnd,
        canceledAt: new Date(),
        status: cancelAtPeriodEnd ? SubscriptionStatus.ACTIVE : SubscriptionStatus.CANCELED,
      },
    });
  }

  /**
   * Deactivate subscription (called from webhook)
   */
  async deactivateSubscription(whopSubscriptionId: string) {
    return prisma.subscription.update({
      where: { whopSubscriptionId },
      data: {
        status: SubscriptionStatus.CANCELED,
      },
    });
  }

  /**
   * Handle subscription renewal
   */
  async renewSubscription(whopSubscriptionId: string, newPeriodEnd: Date) {
    const subscription = await prisma.subscription.findUnique({
      where: { whopSubscriptionId },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Update subscription period
    await prisma.subscription.update({
      where: { whopSubscriptionId },
      data: {
        currentPeriodStart: subscription.currentPeriodEnd,
        currentPeriodEnd: newPeriodEnd,
        updatedAt: new Date(),
      },
    });

    // Record payment for renewal
    await this.recordSubscriptionPayment(subscription.id);
  }

  /**
   * Get creator's subscribers
   */
  async getCreatorSubscribers(creatorId: string) {
    return prisma.subscription.findMany({
      where: {
        creatorId,
        status: SubscriptionStatus.ACTIVE,
      },
      include: {
        subscriber: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get user's subscriptions
   */
  async getUserSubscriptions(subscriberId: string) {
    return prisma.subscription.findMany({
      where: {
        subscriberId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get subscription statistics for creator
   */
  async getCreatorStats(creatorId: string) {
    const subscriptions = await prisma.subscription.findMany({
      where: { creatorId },
    });

    const active = subscriptions.filter(s => s.status === SubscriptionStatus.ACTIVE);
    const mrr = active.reduce((sum, s) => sum + s.amount, 0);

    // Calculate churn rate (canceled this month / total at start of month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const canceledThisMonth = subscriptions.filter(
      s => s.canceledAt && s.canceledAt >= startOfMonth
    ).length;

    const totalAtStart = subscriptions.filter(
      s => s.createdAt < startOfMonth &&
        (s.status === SubscriptionStatus.ACTIVE ||
         (s.canceledAt && s.canceledAt >= startOfMonth))
    ).length;

    const churnRate = totalAtStart > 0 ? (canceledThisMonth / totalAtStart) * 100 : 0;

    return {
      activeSubscribers: active.length,
      totalSubscribers: subscriptions.length,
      mrr: mrr / 100, // Convert cents to dollars
      churnRate: parseFloat(churnRate.toFixed(2)),
      averageValue: active.length > 0 ? mrr / active.length / 100 : 0,
    };
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
