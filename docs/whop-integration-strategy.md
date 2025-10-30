# Whop Integration Strategy for EdgeBook

## Integration Overview

Whop will replace Stripe as the primary payment processor, providing a unified platform for payments, subscriptions, and payouts with built-in support for multiple payment methods including crypto.

## 1. Whop SDK Setup

### Installation
```bash
npm install @whop/sdk @whop/webhooks
# or use their REST API directly
```

### Environment Variables
```env
# Whop Configuration
WHOP_API_KEY=whop_api_xxxxxxxxxxxxx
WHOP_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
WHOP_APP_ID=app_xxxxxxxxxxxxx
WHOP_ENVIRONMENT=test # or production

# Platform Configuration
PLATFORM_FEE_PERCENTAGE=15
PLATFORM_PAYOUT_MINIMUM=1000 # $10 in cents
AUTO_WITHDRAWAL_THRESHOLD=10000 # $100 in cents
```

## 2. Whop Service Implementation

### Core Service Class
```typescript
// lib/services/whop/whop.service.ts

import { WhopSDK } from '@whop/sdk';

export class WhopService {
  private sdk: WhopSDK;

  constructor() {
    this.sdk = new WhopSDK({
      apiKey: process.env.WHOP_API_KEY!,
      appId: process.env.WHOP_APP_ID!,
      environment: process.env.WHOP_ENVIRONMENT as 'test' | 'production'
    });
  }

  // One-time payment for picks
  async chargeUser(params: {
    userId: string;
    amount: number;
    currency: string;
    description: string;
    metadata: Record<string, any>;
  }) {
    return await this.sdk.payments.create({
      user_id: params.userId,
      amount: params.amount,
      currency: params.currency,
      description: params.description,
      metadata: params.metadata,
      capture: true // Immediately capture payment
    });
  }

  // Create subscription
  async createSubscription(params: {
    userId: string;
    planId: string;
    trialDays?: number;
    metadata: Record<string, any>;
  }) {
    return await this.sdk.subscriptions.create({
      user_id: params.userId,
      plan_id: params.planId,
      trial_period_days: params.trialDays,
      metadata: params.metadata
    });
  }

  // Transfer money to creator (payout)
  async transferToUser(params: {
    userId: string;
    amount: number;
    currency: string;
    method: 'bank' | 'crypto';
    description: string;
  }) {
    return await this.sdk.transfers.create({
      destination: params.userId,
      amount: params.amount,
      currency: params.currency,
      transfer_method: params.method,
      description: params.description
    });
  }

  // Validate webhook signature
  validateWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.WHOP_WEBHOOK_SECRET!)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}
```

## 3. API Implementation Examples

### Pick Purchase Endpoint
```typescript
// app/api/picks/[pickId]/purchase/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { WhopService } from '@/lib/services/whop/whop.service';
import { calculatePlatformFee } from '@/lib/services/payment/fee.service';

export async function POST(
  request: NextRequest,
  { params }: { params: { pickId: string } }
) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { pickId } = params;

  // Check if already purchased
  const existingPurchase = await prisma.purchase.findUnique({
    where: {
      userId_pickId: {
        userId: session.user.id,
        pickId: pickId
      }
    }
  });

  if (existingPurchase) {
    return NextResponse.json({
      error: 'Pick already purchased'
    }, { status: 400 });
  }

  // Get pick details
  const pick = await prisma.pick.findUnique({
    where: { id: pickId },
    include: { user: true }
  });

  if (!pick || !pick.isPremium || !pick.price) {
    return NextResponse.json({
      error: 'Invalid pick'
    }, { status: 400 });
  }

  // Get platform fee configuration
  const config = await prisma.paymentConfiguration.findFirst();
  const platformFeePercent = config?.platformFeePercent || 15;

  // Calculate fees
  const amount = Math.round(pick.price * 100); // Convert to cents
  const platformFee = Math.round(amount * (platformFeePercent / 100));
  const creatorEarnings = amount - platformFee;

  try {
    const whop = new WhopService();

    // Create payment with Whop
    const payment = await whop.chargeUser({
      userId: session.user.id,
      amount: amount,
      currency: 'USD',
      description: `Purchase pick: ${pick.matchup}`,
      metadata: {
        pickId: pick.id,
        sellerId: pick.userId,
        platformFee: platformFee,
        creatorEarnings: creatorEarnings
      }
    });

    // Create pending purchase record
    await prisma.purchase.create({
      data: {
        userId: session.user.id,
        pickId: pick.id,
        amount: amount,
        platformFee: platformFee,
        creatorEarnings: creatorEarnings,
        whopPaymentId: payment.id,
        status: 'PENDING',
        paymentMethod: payment.payment_method
      }
    });

    // Return payment URL for redirect
    return NextResponse.json({
      paymentUrl: payment.checkout_url,
      paymentId: payment.id
    });

  } catch (error) {
    console.error('Payment creation failed:', error);
    return NextResponse.json({
      error: 'Payment processing failed'
    }, { status: 500 });
  }
}
```

### Webhook Handler
```typescript
// app/api/webhooks/whop/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WhopService } from '@/lib/services/whop/whop.service';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('whop-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const whop = new WhopService();

  // Validate webhook signature
  if (!whop.validateWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);

  // Store webhook event for processing
  const webhookEvent = await prisma.webhookEvent.create({
    data: {
      provider: 'whop',
      eventType: event.type,
      payload: event,
      processed: false
    }
  });

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

      default:
        console.log('Unhandled webhook event:', event.type);
    }

    // Mark webhook as processed
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: {
        processed: true,
        processedAt: new Date()
      }
    });

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);

    // Update webhook with error
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: {
        processingError: error.message,
        attempts: { increment: 1 }
      }
    });

    return NextResponse.json({
      error: 'Webhook processing failed'
    }, { status: 500 });
  }
}

async function handlePaymentSucceeded(event: any) {
  const { payment_id, metadata } = event.data;

  // Update purchase status
  await prisma.purchase.update({
    where: { whopPaymentId: payment_id },
    data: { status: 'COMPLETED' }
  });

  // Create transaction records
  await prisma.transaction.createMany({
    data: [
      {
        userId: metadata.userId,
        type: 'PICK_PURCHASE',
        amount: metadata.amount,
        platformFee: metadata.platformFee,
        status: 'COMPLETED',
        whopReferenceId: payment_id,
        description: 'Pick purchase'
      },
      {
        userId: metadata.sellerId,
        type: 'PICK_SALE',
        amount: metadata.creatorEarnings,
        status: 'COMPLETED',
        whopReferenceId: payment_id,
        description: 'Pick sale earnings'
      }
    ]
  });

  // Update creator balance for auto-withdrawal
  const creator = await prisma.user.findUnique({
    where: { id: metadata.sellerId }
  });

  if (creator?.autoWithdraw) {
    const balance = await calculateCreatorBalance(metadata.sellerId);

    if (balance >= (creator.minPayout || 10000)) {
      await initiateAutoPayout(metadata.sellerId, balance);
    }
  }
}

async function handlePaymentFailed(event: any) {
  const { payment_id } = event.data;

  await prisma.purchase.update({
    where: { whopPaymentId: payment_id },
    data: { status: 'FAILED' }
  });
}

async function handleSubscriptionActivated(event: any) {
  const { membership_id, user_id, plan_id, metadata } = event.data;

  await prisma.subscription.upsert({
    where: {
      subscriberId_creatorId: {
        subscriberId: user_id,
        creatorId: metadata.creatorId
      }
    },
    update: {
      status: 'ACTIVE',
      whopSubscriptionId: membership_id,
      currentPeriodEnd: new Date(event.data.current_period_end)
    },
    create: {
      subscriberId: user_id,
      creatorId: metadata.creatorId,
      whopSubscriptionId: membership_id,
      status: 'ACTIVE',
      amount: metadata.amount,
      platformFee: metadata.platformFee,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(event.data.current_period_end)
    }
  });
}

async function handleSubscriptionDeactivated(event: any) {
  const { membership_id } = event.data;

  await prisma.subscription.update({
    where: { whopSubscriptionId: membership_id },
    data: {
      status: 'CANCELED',
      canceledAt: new Date()
    }
  });
}

async function handlePayoutCompleted(event: any) {
  const { transfer_id, amount, destination } = event.data;

  await prisma.payout.update({
    where: { whopTransferId: transfer_id },
    data: {
      status: 'COMPLETED',
      processedAt: new Date()
    }
  });
}
```

## 4. Frontend Integration

### Purchase Button Component
```typescript
// components/payment/PickPurchaseButton.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface PickPurchaseButtonProps {
  pickId: string;
  price: number;
  onPurchaseComplete?: () => void;
}

export function PickPurchaseButton({
  pickId,
  price,
  onPurchaseComplete
}: PickPurchaseButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handlePurchase = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/picks/${pickId}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Purchase failed');
      }

      const { paymentUrl } = await response.json();

      // Redirect to Whop checkout
      window.location.href = paymentUrl;

    } catch (error) {
      toast({
        title: 'Purchase failed',
        description: 'Please try again later',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePurchase}
      disabled={loading}
      className="w-full"
    >
      {loading ? 'Processing...' : `Unlock for $${price}`}
    </Button>
  );
}
```

### Subscription Management
```typescript
// components/payment/SubscriptionButton.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionButtonProps {
  creatorId: string;
  price: number;
  isSubscribed: boolean;
  onStatusChange?: () => void;
}

export function SubscriptionButton({
  creatorId,
  price,
  isSubscribed,
  onStatusChange
}: SubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    setLoading(true);

    try {
      const endpoint = isSubscribed
        ? '/api/subscriptions/cancel'
        : '/api/subscriptions/create';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId })
      });

      if (!response.ok) {
        throw new Error('Operation failed');
      }

      if (!isSubscribed) {
        const { checkoutUrl } = await response.json();
        window.location.href = checkoutUrl;
      } else {
        toast({
          title: 'Subscription canceled',
          description: 'You will have access until the end of the billing period'
        });
        onStatusChange?.();
      }

    } catch (error) {
      toast({
        title: 'Operation failed',
        description: 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={loading}
      variant={isSubscribed ? 'outline' : 'default'}
      className="w-full"
    >
      {loading ? 'Processing...' : (
        isSubscribed
          ? 'Cancel Subscription'
          : `Subscribe for $${price}/month`
      )}
    </Button>
  );
}
```

## 5. Testing Strategy

### Test Environment Setup
```env
# .env.test
WHOP_API_KEY=whop_test_xxxxxxxxxxxxx
WHOP_WEBHOOK_SECRET=whsec_test_xxxxxxxxxxxxx
WHOP_ENVIRONMENT=test
```

### Test Cases
1. **Payment Flow Tests**
   - Successful pick purchase
   - Failed payment handling
   - Duplicate purchase prevention
   - Refund processing

2. **Subscription Tests**
   - Create subscription
   - Cancel subscription
   - Renewal handling
   - Access verification

3. **Webhook Tests**
   - Signature validation
   - Event processing
   - Error handling
   - Retry logic

4. **Payout Tests**
   - Manual withdrawal
   - Auto withdrawal trigger
   - Minimum threshold check
   - Multiple payout methods

## 6. Migration from Stripe

### Migration Steps
1. **Parallel Running** (Week 1-2)
   - Keep Stripe active
   - Add Whop integration
   - Route new payments to Whop

2. **Data Migration** (Week 3)
   - Export Stripe customer data
   - Create Whop accounts
   - Map payment history

3. **Subscription Migration** (Week 4)
   - Cancel Stripe subscriptions at renewal
   - Create Whop subscriptions
   - Maintain access continuity

4. **Cutover** (Week 5)
   - Disable Stripe endpoints
   - Remove Stripe code
   - Update documentation

### Rollback Plan
- Keep Stripe credentials active
- Database backup before migration
- Feature flag for payment provider
- Quick switch capability

## 7. Monitoring & Analytics

### Key Metrics
```typescript
// Dashboard metrics
interface WhopMetrics {
  payments: {
    successful: number;
    failed: number;
    averageValue: number;
    conversionRate: number;
  };

  subscriptions: {
    new: number;
    canceled: number;
    mrr: number;
    churnRate: number;
  };

  payouts: {
    pending: number;
    completed: number;
    totalAmount: number;
  };

  errors: {
    webhookFailures: number;
    paymentErrors: number;
    payoutErrors: number;
  };
}
```

### Monitoring Setup
- Webhook event logging
- Payment success/failure alerts
- Payout completion tracking
- Error rate monitoring
- Performance metrics

## 8. Security Considerations

1. **API Security**
   - Store Whop credentials in environment variables
   - Never expose API keys in client code
   - Use webhook signature validation

2. **Data Security**
   - No storage of payment details
   - Encrypt sensitive metadata
   - Audit log all transactions

3. **Access Control**
   - Authentication on all payment endpoints
   - Rate limiting
   - CORS configuration
   - IP whitelisting for webhooks

## 9. Support & Documentation

### User Documentation
- Payment method guide
- Subscription management
- Withdrawal instructions
- Refund policy

### Developer Documentation
- API reference
- Integration guide
- Webhook events
- Error codes

### Support Channels
- In-app help center
- Email support
- Discord community
- FAQ section