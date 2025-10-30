/**
 * Payment Service
 * Business logic for handling payments, purchases, and transactions
 */

import { prisma } from '@/lib/prisma';
import { whopService } from '../whop/whop.service';
import { PaymentStatus } from '@prisma/client';

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
  SELLER_PAYOUT_REVERSAL = 'SELLER_PAYOUT_REVERSAL',
  PLATFORM_FEE_REVERSAL = 'PLATFORM_FEE_REVERSAL',
}

enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

interface ProcessPurchaseParams {
  userId: string;
  pickId: string;
  amount: number;
  platformFee: number;
  creatorEarnings: number;
}

interface ProcessSubscriptionParams {
  subscriberId: string;
  creatorId: string;
  amount: number;
  platformFee: number;
}

export class PaymentService {
  /**
   * Get platform configuration
   */
  async getConfiguration() {
    let config = await prisma.paymentConfiguration.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    // Create default configuration if none exists
    if (!config) {
      config = await prisma.paymentConfiguration.create({
        data: {
          platformFeePercent: parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '15'),
          minPickPrice: 50, // $0.50
          maxPickPrice: 1000000, // $10,000
          minSubscriptionPrice: 499, // $4.99
          maxSubscriptionPrice: 99999, // $999.99
          withdrawalMinimum: parseFloat(process.env.DEFAULT_MIN_PAYOUT || '1000'),
          withdrawalEnabled: true,
          paymentProvider: 'whop',
        },
      });
    }

    return config;
  }

  /**
   * Calculate platform fee and creator earnings
   */
  async calculateFees(amount: number, customFeePercent?: number) {
    // Validate amount parameter
    if (typeof amount !== 'number' || Number.isNaN(amount)) {
      throw new RangeError('Amount must be a valid number');
    }

    if (!Number.isFinite(amount)) {
      throw new RangeError('Amount must be a finite number');
    }

    if (amount <= 0) {
      throw new RangeError('Amount must be greater than 0');
    }

    // Validate that amount is an integer (for cents)
    if (!Number.isInteger(amount)) {
      throw new RangeError('Amount must be an integer (value in cents)');
    }

    const config = await this.getConfiguration();
    const feePercent = customFeePercent ?? config.platformFeePercent;

    const platformFee = Math.round(amount * (feePercent / 100));
    const creatorEarnings = amount - platformFee;

    return {
      amount,
      platformFee,
      creatorEarnings,
      feePercent,
    };
  }

  /**
   * Check if user has already purchased a pick
   */
  async checkDuplicatePurchase(userId: string, pickId: string): Promise<boolean> {
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_pickId: {
          userId,
          pickId,
        },
      },
    });

    return !!existingPurchase;
  }

  /**
   * Validate pick price against configuration
   */
  async validatePickPrice(price: number): Promise<{ valid: boolean; error?: string }> {
    const config = await this.getConfiguration();

    if (price < config.minPickPrice) {
      return {
        valid: false,
        error: `Price must be at least $${(config.minPickPrice / 100).toFixed(2)}`,
      };
    }

    if (price > config.maxPickPrice) {
      return {
        valid: false,
        error: `Price cannot exceed $${(config.maxPickPrice / 100).toFixed(2)}`,
      };
    }

    return { valid: true };
  }

  /**
   * Validate subscription price against configuration
   */
  async validateSubscriptionPrice(price: number): Promise<{ valid: boolean; error?: string }> {
    const config = await this.getConfiguration();

    if (price < config.minSubscriptionPrice) {
      return {
        valid: false,
        error: `Subscription price must be at least $${(config.minSubscriptionPrice / 100).toFixed(2)}`,
      };
    }

    if (price > config.maxSubscriptionPrice) {
      return {
        valid: false,
        error: `Subscription price cannot exceed $${(config.maxSubscriptionPrice / 100).toFixed(2)}`,
      };
    }

    return { valid: true };
  }

  /**
   * Create a pending purchase record
   */
  async createPendingPurchase(params: ProcessPurchaseParams & { whopPaymentId: string; paymentMethod?: string }) {
    return prisma.purchase.create({
      data: {
        userId: params.userId,
        pickId: params.pickId,
        amount: params.amount,
        platformFee: params.platformFee,
        creatorEarnings: params.creatorEarnings,
        whopPaymentId: params.whopPaymentId,
        paymentMethod: params.paymentMethod,
        status: PaymentStatus.PENDING,
      },
    });
  }

  /**
   * Complete a purchase after payment confirmation
   */
  async completePurchase(whopPaymentId: string) {
    const purchase = await prisma.purchase.findUnique({
      where: { whopPaymentId },
      include: {
        pick: {
          include: { user: true },
        },
        user: true,
      },
    });

    if (!purchase) {
      throw new Error('Purchase not found');
    }

    if (purchase.status === PaymentStatus.COMPLETED) {
      console.log('Purchase already completed:', whopPaymentId);
      return purchase;
    }

    // Update purchase status
    const updatedPurchase = await prisma.purchase.update({
      where: { whopPaymentId },
      data: { status: PaymentStatus.COMPLETED },
    });

    // Create transaction records
    await prisma.$transaction([
      // Buyer's purchase transaction
      prisma.transaction.create({
        data: {
          userId: purchase.userId,
          type: TransactionType.PICK_PURCHASE,
          amount: purchase.amount,
          platformFee: purchase.platformFee,
          status: TransactionStatus.COMPLETED,
          whopReferenceId: whopPaymentId,
          referenceId: purchase.id,
          description: `Purchase: ${purchase.pick.matchup}`,
          metadata: {
            pickId: purchase.pickId,
            sellerId: purchase.pick.userId,
          },
        },
      }),
      // Seller's sale transaction
      prisma.transaction.create({
        data: {
          userId: purchase.pick.userId,
          type: TransactionType.PICK_SALE,
          amount: purchase.creatorEarnings || 0,
          status: TransactionStatus.COMPLETED,
          whopReferenceId: whopPaymentId,
          referenceId: purchase.id,
          description: `Sale: ${purchase.pick.matchup}`,
          metadata: {
            pickId: purchase.pickId,
            buyerId: purchase.userId,
          },
        },
      }),
      // Platform fee transaction
      prisma.transaction.create({
        data: {
          userId: purchase.pick.userId,
          type: TransactionType.PLATFORM_FEE,
          amount: purchase.platformFee,
          status: TransactionStatus.COMPLETED,
          whopReferenceId: whopPaymentId,
          referenceId: purchase.id,
          description: `Platform fee: ${purchase.pick.matchup}`,
        },
      }),
    ]);

    // Check for auto-withdrawal
    await this.checkAutoWithdrawal(purchase.pick.userId);

    return updatedPurchase;
  }

  /**
   * Mark purchase as failed
   */
  async failPurchase(whopPaymentId: string, reason?: string) {
    return prisma.purchase.update({
      where: { whopPaymentId },
      data: {
        status: PaymentStatus.FAILED,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Calculate creator's available balance
   */
  async calculateCreatorBalance(userId: string): Promise<number> {
    // Get all transactions that affect the creator's balance
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: {
          in: [
            TransactionType.PICK_SALE,
            TransactionType.SUBSCRIPTION_REVENUE,
            TransactionType.SELLER_PAYOUT_REVERSAL,  // Negative amounts (refunds)
            TransactionType.PLATFORM_FEE_REVERSAL,    // Negative amounts (platform fee reversals)
            TransactionType.ADJUSTMENT,               // Manual adjustments
          ],
        },
        status: TransactionStatus.COMPLETED,
      },
    });

    const payouts = await prisma.payout.findMany({
      where: {
        userId,
        status: {
          in: ['PAID', 'PROCESSING', 'PENDING'],
        },
      },
    });

    // Sum all transactions (positive earnings + negative reversals)
    const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalPayouts = payouts.reduce((sum, p) => sum + p.amount, 0);

    return totalBalance - totalPayouts;
  }

  /**
   * Check if creator should get auto-withdrawal
   */
  async checkAutoWithdrawal(userId: string) {
    const creator = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        autoWithdraw: true,
        minPayout: true,
        payoutMethod: true,
        cryptoWalletAddress: true,
        bankAccountId: true,
      },
    });

    if (!creator || !creator.autoWithdraw) {
      return;
    }

    const balance = await this.calculateCreatorBalance(userId);
    const minPayout = creator.minPayout || 10000; // Default $100

    if (balance >= minPayout) {
      // Create payout request
      await this.createPayoutRequest(userId, balance);
    }
  }

  /**
   * Create a payout request
   */
  async createPayoutRequest(userId: string, amount: number) {
    // Validate amount parameter
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new Error('Invalid payout amount: must be a valid number');
    }

    if (amount <= 0) {
      throw new Error('Invalid payout amount: must be greater than zero');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        payoutMethod: true,
        cryptoWalletAddress: true,
        bankAccountId: true,
        whopUserId: true,
      },
    });

    if (!user?.whopUserId) {
      throw new Error('User does not have Whop account configured');
    }

    // Validate payout method and required payment details
    if (!user.payoutMethod) {
      throw new Error('Payout method not configured. Please set your preferred payout method.');
    }

    // Determine destination based on payout method and validate
    let destination: string;
    let method: 'crypto' | 'bank';

    if (user.payoutMethod === 'CRYPTO') {
      if (!user.cryptoWalletAddress || user.cryptoWalletAddress.trim() === '') {
        throw new Error('Crypto wallet address is required for crypto payouts. Please configure your crypto wallet address.');
      }
      destination = user.cryptoWalletAddress.trim();
      method = 'crypto';
    } else {
      // Assuming any non-CRYPTO method is bank-related
      if (!user.bankAccountId || user.bankAccountId.trim() === '') {
        throw new Error('Bank account ID is required for bank payouts. Please configure your bank account details.');
      }
      destination = user.bankAccountId.trim();
      method = 'bank';
    }

    // Initiate transfer with Whop - only after all validations pass
    const result = await whopService.transferToUser({
      userId: user.whopUserId,
      amount,
      currency: 'USD',
      method,
      destination,
      description: `Creator payout for earnings`,
    });

    if (!result.success) {
      throw new Error(result.error?.message || 'Payout failed');
    }

    // Create payout record
    return prisma.payout.create({
      data: {
        userId,
        amount,
        method: user.payoutMethod,
        status: 'PROCESSING',
        whopTransferId: result.data?.id,
      },
    });
  }

  /**
   * Process refund
   */
  async processRefund(purchaseId: string, amount?: number, reason?: string) {
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { pick: true },
    });

    if (!purchase) {
      throw new Error('Purchase not found');
    }

    if (purchase.status !== PaymentStatus.COMPLETED) {
      throw new Error('Can only refund completed purchases');
    }

    if (!purchase.whopPaymentId) {
      throw new Error('Cannot refund: no Whop payment ID');
    }

    const refundAmount = amount || purchase.amount;

    // Process refund with Whop
    const result = await whopService.refundPayment(
      purchase.whopPaymentId,
      refundAmount,
      reason
    );

    if (!result.success) {
      throw new Error(result.error?.message || 'Refund failed');
    }

    // Update purchase record
    await prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        status: refundAmount < purchase.amount
          ? PaymentStatus.PARTIALLY_REFUNDED
          : PaymentStatus.REFUNDED,
        refundedAt: new Date(),
        refundAmount,
      },
    });

    // Calculate proportional refund amounts
    const refundRatio = refundAmount / purchase.amount;
    const platformFeeRefund = Math.round(purchase.platformFee * refundRatio);
    const creatorEarningsRefund = refundAmount - platformFeeRefund;

    // Create refund transactions
    await prisma.$transaction([
      // Refund transaction for buyer (positive amount - they receive money back)
      prisma.transaction.create({
        data: {
          userId: purchase.userId,
          type: TransactionType.REFUND,
          amount: refundAmount,
          status: TransactionStatus.COMPLETED,
          whopReferenceId: result.data?.id,
          referenceId: purchaseId,
          description: `Refund: ${purchase.pick.matchup}${reason ? ` - ${reason}` : ''}`,
        },
      }),
      // Seller payout reversal (negative amount - debiting seller's earnings)
      prisma.transaction.create({
        data: {
          userId: purchase.pick.userId,
          type: TransactionType.SELLER_PAYOUT_REVERSAL,
          amount: -creatorEarningsRefund,
          status: TransactionStatus.COMPLETED,
          whopReferenceId: result.data?.id,
          referenceId: purchaseId,
          description: `Seller earnings reversal for refund: ${purchase.pick.matchup}${reason ? ` - ${reason}` : ''}`,
        },
      }),
      // Platform fee reversal (negative amount - reversing the platform fee)
      prisma.transaction.create({
        data: {
          userId: purchase.pick.userId,
          type: TransactionType.PLATFORM_FEE_REVERSAL,
          amount: -platformFeeRefund,
          status: TransactionStatus.COMPLETED,
          whopReferenceId: result.data?.id,
          referenceId: purchaseId,
          description: `Platform fee reversal for refund: ${purchase.pick.matchup}${reason ? ` - ${reason}` : ''}`,
        },
      }),
    ]);

    return result;
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
