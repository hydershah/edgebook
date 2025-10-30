# Whop Payment System - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Set Up Whop Account (5 min)

1. **Sign up at Whop**
   ```
   Visit: https://whop.com
   Create account → Create new app
   ```

2. **Get API Credentials**
   ```
   Dashboard → Settings → API Keys
   Copy:
   - API Key
   - Webhook Secret
   - App ID
   ```

3. **Configure Webhook**
   ```
   Dashboard → Webhooks → Add Endpoint
   URL: https://your-domain.com/api/webhooks/whop
   Events: Select all payment and membership events
   ```

### Step 2: Update Environment Variables (1 min)

Open your `.env` file and add:

```env
# Whop Payment Processing
WHOP_API_KEY="whop_api_xxxxxxxxxxxxx"
WHOP_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"
WHOP_APP_ID="app_xxxxxxxxxxxxx"
WHOP_ENVIRONMENT="test"
WHOP_API_URL="https://api.whop.com/v5"

# Payment Configuration
PLATFORM_FEE_PERCENTAGE="15"
DEFAULT_MIN_PAYOUT="1000"
AUTO_WITHDRAWAL_THRESHOLD="10000"
```

### Step 3: Verify Installation (1 min)

Check that everything is set up:

```bash
# Start your development server
npm run dev

# In another terminal, test the service status
curl http://localhost:3000/api/webhooks/whop
# Should return 400 (not 500) - endpoint is working
```

### Step 4: Create Initial Configuration (2 min)

The system will auto-create default configuration on first use, but you can verify:

1. Start the app: `npm run dev`
2. Make any authenticated API call that triggers payment service
3. Configuration will be created automatically with defaults:
   - Platform fee: 15%
   - Min pick price: $0.50
   - Max pick price: $10,000
   - Withdrawal minimum: $10

## 🧪 Testing the System

### Test 1: Purchase a Premium Pick

1. **Create a premium pick** (as a creator):
   ```
   - Go to /createpick
   - Set "Premium" toggle ON
   - Set price: $5.00
   - Submit pick
   ```

2. **Purchase the pick** (as another user):
   ```
   - View the pick
   - Click "Unlock" button
   - Confirm purchase
   - Should redirect to Whop checkout
   ```

3. **Complete payment**:
   ```
   - Use Whop test card: 4242 4242 4242 4242
   - Any future expiry date
   - Any CVC
   - Complete checkout
   ```

4. **Verify webhook**:
   ```bash
   # Check webhook was received and processed
   psql $DATABASE_URL -c "SELECT * FROM \"WebhookEvent\" ORDER BY \"createdAt\" DESC LIMIT 1;"

   # Check purchase was completed
   psql $DATABASE_URL -c "SELECT * FROM \"Purchase\" ORDER BY \"createdAt\" DESC LIMIT 1;"
   ```

### Test 2: Create a Subscription

1. **Enable subscriptions** (as creator):
   ```
   - Go to profile settings
   - Set "Enable Subscriptions" ON
   - Set monthly price: $9.99
   - Save
   ```

2. **Subscribe to creator** (as another user):
   ```
   POST http://localhost:3000/api/subscriptions
   {
     "creatorId": "creator_user_id"
   }
   ```

3. **Verify subscription**:
   ```bash
   # Check subscription was created
   psql $DATABASE_URL -c "SELECT * FROM \"Subscription\" ORDER BY \"createdAt\" DESC LIMIT 1;"
   ```

### Test 3: Check Creator Stats

```bash
# Get creator statistics
curl http://localhost:3000/api/creator/stats \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# Expected response:
{
  "subscriptions": {
    "activeSubscribers": 5,
    "totalSubscribers": 10,
    "mrr": 49.95,
    "churnRate": 10.5,
    "averageValue": 9.99
  },
  "earnings": {
    "availableBalance": 127.50
  }
}
```

## 🔧 API Usage Examples

### Purchase a Pick

```typescript
// Frontend code
const handlePurchase = async (pickId: string) => {
  const response = await fetch(`/api/picks/${pickId}/purchase`, {
    method: 'POST',
  });

  const data = await response.json();

  if (data.payment?.checkoutUrl) {
    // Redirect to Whop checkout
    window.location.href = data.payment.checkoutUrl;
  }
};
```

### Check Purchase Status

```typescript
const checkPurchase = async (pickId: string) => {
  const response = await fetch(`/api/picks/${pickId}/purchase`);
  const data = await response.json();

  return data.purchased; // true/false
};
```

### Create Subscription

```typescript
const subscribe = async (creatorId: string) => {
  const response = await fetch('/api/subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creatorId }),
  });

  const data = await response.json();

  if (data.checkoutUrl) {
    window.location.href = data.checkoutUrl;
  }
};
```

### Cancel Subscription

```typescript
const cancelSubscription = async (creatorId: string) => {
  await fetch('/api/subscriptions/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creatorId,
      immediate: false // Cancel at period end
    }),
  });
};
```

### Get Creator Stats

```typescript
const getStats = async () => {
  const response = await fetch('/api/creator/stats');
  const data = await response.json();

  console.log('MRR:', data.subscriptions.mrr);
  console.log('Balance:', data.earnings.availableBalance);
};
```

## 🐛 Debugging

### Check Whop Service Status

```typescript
import { whopService } from '@/lib/services/whop/whop.service';

console.log(whopService.getStatus());
// Output:
// {
//   configured: true,
//   environment: 'test',
//   hasApiKey: true,
//   hasWebhookSecret: true,
//   hasAppId: true
// }
```

### View Webhook Logs

```sql
-- View all webhook events
SELECT
  "eventType",
  "processed",
  "processingError",
  "createdAt"
FROM "WebhookEvent"
ORDER BY "createdAt" DESC
LIMIT 10;

-- View failed webhooks
SELECT * FROM "WebhookEvent"
WHERE "processed" = false OR "processingError" IS NOT NULL;
```

### View Recent Transactions

```sql
-- All recent transactions
SELECT
  t.type,
  t.amount / 100 as amount_dollars,
  t.status,
  t."createdAt",
  u.name as user_name
FROM "Transaction" t
JOIN "User" u ON t."userId" = u.id
ORDER BY t."createdAt" DESC
LIMIT 10;

-- Creator earnings
SELECT
  u.name,
  COUNT(*) as total_sales,
  SUM(t.amount) / 100 as total_earnings
FROM "Transaction" t
JOIN "User" u ON t."userId" = u.id
WHERE t.type IN ('PICK_SALE', 'SUBSCRIPTION_REVENUE')
  AND t.status = 'COMPLETED'
GROUP BY u.id, u.name;
```

### Check Platform Fees Collected

```sql
SELECT
  COUNT(*) as total_transactions,
  SUM("platformFee") / 100 as total_platform_fees
FROM "Transaction"
WHERE type = 'PLATFORM_FEE'
  AND status = 'COMPLETED';
```

## 📊 Monitoring Dashboard Queries

### Real-time Revenue

```sql
-- Today's revenue
SELECT
  SUM(amount) / 100 as revenue
FROM "Transaction"
WHERE type IN ('PICK_PURCHASE', 'SUBSCRIPTION')
  AND status = 'COMPLETED'
  AND "createdAt" >= CURRENT_DATE;

-- This month's revenue
SELECT
  SUM(amount) / 100 as revenue
FROM "Transaction"
WHERE type IN ('PICK_PURCHASE', 'SUBSCRIPTION')
  AND status = 'COMPLETED'
  AND "createdAt" >= DATE_TRUNC('month', CURRENT_DATE);
```

### Active Subscriptions

```sql
SELECT
  COUNT(*) as active_subscriptions,
  SUM(amount) / 100 as monthly_recurring_revenue
FROM "Subscription"
WHERE status = 'ACTIVE';
```

### Top Creators

```sql
SELECT
  u.name,
  u.username,
  COUNT(DISTINCT s.id) as subscribers,
  SUM(s.amount) / 100 as mrr
FROM "User" u
LEFT JOIN "Subscription" s ON s."creatorId" = u.id AND s.status = 'ACTIVE'
GROUP BY u.id, u.name, u.username
HAVING COUNT(DISTINCT s.id) > 0
ORDER BY mrr DESC
LIMIT 10;
```

## 🚨 Common Issues & Solutions

### Issue: Webhook not being called

**Solution:**
1. Check Whop dashboard webhook configuration
2. Ensure webhook URL is publicly accessible
3. Verify webhook endpoint returns 200 status
4. Check firewall/security settings

**Test webhook locally:**
```bash
# Use ngrok to expose local server
ngrok http 3000

# Update Whop webhook URL to ngrok URL
# Example: https://abc123.ngrok.io/api/webhooks/whop
```

### Issue: Purchase not completing

**Checklist:**
- ✅ Webhook endpoint accessible
- ✅ Webhook secret configured correctly
- ✅ Payment succeeded in Whop dashboard
- ✅ No errors in webhook event logs
- ✅ Purchase record created in database

**Debug:**
```sql
-- Check purchase status
SELECT * FROM "Purchase"
WHERE "whopPaymentId" = 'payment_id_here';

-- Check webhook was received
SELECT * FROM "WebhookEvent"
WHERE payload->>'id' = 'payment_id_here';
```

### Issue: Balance not updating

**Solution:**
1. Verify transactions were created:
```sql
SELECT * FROM "Transaction"
WHERE "whopReferenceId" = 'payment_id_here';
```

2. Check auto-withdrawal threshold:
```sql
-- Get user's balance
SELECT SUM(amount) as balance
FROM "Transaction"
WHERE "userId" = 'user_id_here'
  AND type IN ('PICK_SALE', 'SUBSCRIPTION_REVENUE')
  AND status = 'COMPLETED';
```

## 🎯 Success Criteria

Your payment system is working correctly when:

✅ Can create premium picks with prices
✅ Can initiate purchase and redirect to checkout
✅ Webhook receives payment.succeeded events
✅ Purchases complete automatically via webhook
✅ Transactions are created for buyer and seller
✅ Platform fees are calculated and recorded
✅ Can create and cancel subscriptions
✅ MRR is calculated correctly
✅ Creator balance updates in real-time
✅ Auto-withdrawal triggers at threshold

## 📞 Support

**Documentation:**
- [Payment System Schema](./payment-system-schema.md)
- [Architecture Plan](./payment-architecture-plan.md)
- [Whop Integration](./whop-integration-strategy.md)
- [Admin Configuration](./admin-configuration-system.md)

**Whop Resources:**
- API Docs: https://dev.whop.com
- Dashboard: https://whop.com/dashboard
- Support: https://whop.com/support

**Database Access:**
```bash
# View all tables
psql $DATABASE_URL -c "\dt"

# Interactive shell
psql $DATABASE_URL
```

---

**Ready to test?** Follow the steps above and your payment system will be operational in minutes!