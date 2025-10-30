/**
 * Whop Webhook Handler
 * Processes webhook events from Whop for payments, subscriptions, and payouts
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { whopService } from '@/lib/services/whop/whop.service';
import { paymentService } from '@/lib/services/payment';
import { subscriptionService } from '@/lib/services/payment';

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature validation
    const body = await request.text();
    const signature = request.headers.get('whop-signature') || '';

    // Validate webhook signature
    if (!whopService.validateWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse webhook event
    const event = whopService.parseWebhookEvent(body);
    if (!event) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    // Store webhook event for processing
    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        provider: 'whop',
        eventType: event.type,
        payload: event,
        processed: false,
      },
    });

    // Process webhook based on event type
    try {
      switch (event.type) {
        case 'payment.succeeded':
          await handlePaymentSucceeded(event);
          break;

        case 'payment.failed':
          await handlePaymentFailed(event);
          break;

        case 'membership.went_valid':
          await handleSubscriptionActivated(event);
          break;

        case 'membership.went_invalid':
          await handleSubscriptionDeactivated(event);
          break;

        case 'transfer.completed':
          await handlePayoutCompleted(event);
          break;

        case 'transfer.failed':
          await handlePayoutFailed(event);
          break;

        default:
          console.log('Unhandled webhook event:', event.type);
      }

      // Mark webhook as processed
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          processed: true,
          processedAt: new Date(),
        },
      });

      return NextResponse.json({ received: true });
    } catch (processingError) {
      console.error('Webhook processing error:', processingError);

      // Update webhook with error
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          processingError:
            processingError instanceof Error
              ? processingError.message
              : 'Unknown error',
          attempts: { increment: 1 },
        },
      });

      // Still return 200 to prevent retries for unrecoverable errors
      return NextResponse.json(
        { error: 'Processing failed', received: true },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(event: any) {
  const { id: paymentId, metadata } = event.data;

  console.log('Processing payment succeeded:', paymentId);

  // Complete the purchase
  await paymentService.completePurchase(paymentId);

  console.log('Purchase completed successfully:', paymentId);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(event: any) {
  const { id: paymentId, failure_reason } = event.data;

  console.log('Processing payment failed:', paymentId, failure_reason);

  // Mark purchase as failed
  await paymentService.failPurchase(paymentId, failure_reason);

  console.log('Purchase marked as failed:', paymentId);
}

/**
 * Handle subscription activation
 */
async function handleSubscriptionActivated(event: any) {
  const {
    id: membershipId,
    current_period_end,
    metadata,
  } = event.data;

  console.log('Processing subscription activation:', membershipId);

  // Activate subscription
  await subscriptionService.activateSubscription(
    membershipId,
    new Date(current_period_end * 1000) // Convert Unix timestamp
  );

  console.log('Subscription activated:', membershipId);
}

/**
 * Handle subscription deactivation
 */
async function handleSubscriptionDeactivated(event: any) {
  const { id: membershipId } = event.data;

  console.log('Processing subscription deactivation:', membershipId);

  // Deactivate subscription
  await subscriptionService.deactivateSubscription(membershipId);

  console.log('Subscription deactivated:', membershipId);
}

/**
 * Handle completed payout
 */
async function handlePayoutCompleted(event: any) {
  const { id: transferId, amount, destination } = event.data;

  console.log('Processing payout completion:', transferId);

  // Update payout status
  await prisma.payout.update({
    where: { whopTransferId: transferId },
    data: {
      status: 'PAID',
      processedAt: new Date(),
    },
  });

  console.log('Payout completed:', transferId);
}

/**
 * Handle failed payout
 */
async function handlePayoutFailed(event: any) {
  const { id: transferId, failure_reason } = event.data;

  console.log('Processing payout failure:', transferId, failure_reason);

  // Update payout status
  await prisma.payout.update({
    where: { whopTransferId: transferId },
    data: {
      status: 'FAILED',
      failureReason: failure_reason,
      processedAt: new Date(),
    },
  });

  console.log('Payout marked as failed:', transferId);
}
