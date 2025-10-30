# Payment System Database Schema

## New Tables Required

### 1. PaymentConfiguration
```prisma
model PaymentConfiguration {
  id                String   @id @default(cuid())
  platformFeePercent Float    @default(15.0) // Platform fee percentage (e.g., 15.0 for 15%)
  minPickPrice      Float    @default(50)   // Minimum price in cents ($0.50)
  maxPickPrice      Float    @default(1000000) // Maximum price in cents ($10,000)
  minSubscriptionPrice Float @default(499)  // Min subscription in cents ($4.99)
  maxSubscriptionPrice Float @default(99999) // Max subscription in cents ($999.99)
  withdrawalMinimum Float    @default(1000) // Minimum withdrawal in cents ($10)
  withdrawalEnabled Boolean  @default(true)
  paymentProvider   String   @default("whop") // Payment provider (whop, stripe, etc.)
  updatedAt         DateTime @updatedAt
  updatedBy         String?  // Admin who updated
  user              User?    @relation(fields: [updatedBy], references: [id])
}

### 2. CreatorSettings (Update User model)
// Add to existing User model:
  // Creator payment settings
  subscriptionPrice     Float?    // Monthly subscription price in cents
  subscriptionEnabled   Boolean   @default(false)
  whopUserId           String?   @unique // Whop user ID for payouts
  whopAccountId        String?   // Whop connect account for receiving payments
  payoutMethod         PayoutMethod @default(BANK) // BANK, CRYPTO
  cryptoWalletAddress  String?   // For crypto payouts
  bankAccountId        String?   // For bank payouts
  minPayout            Float     @default(1000) // Min payout threshold in cents
  autoWithdraw         Boolean   @default(true)

### 3. Subscription (Enhanced)
model Subscription {
  id                   String   @id @default(cuid())
  subscriberId         String   // User who is subscribing
  creatorId            String   // Creator being subscribed to
  whopSubscriptionId   String?  @unique // Whop subscription ID
  status               SubscriptionStatus @default(PENDING)
  amount               Float    // Monthly amount in cents
  platformFee          Float    // Platform fee amount
  currentPeriodStart   DateTime
  currentPeriodEnd     DateTime
  cancelAtPeriodEnd    Boolean  @default(false)
  canceledAt           DateTime?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  subscriber           User     @relation("UserSubscriptions", fields: [subscriberId], references: [id])
  creator              User     @relation("CreatorSubscriptions", fields: [creatorId], references: [id])

  @@unique([subscriberId, creatorId])
  @@index([subscriberId])
  @@index([creatorId])
  @@index([status])
}

enum SubscriptionStatus {
  PENDING
  ACTIVE
  PAST_DUE
  CANCELED
  EXPIRED
}

### 4. Purchase (Enhanced)
model Purchase {
  id                String   @id @default(cuid())
  userId            String
  pickId            String
  amount            Float    // Amount in cents
  platformFee       Float    // Platform fee in cents
  creatorEarnings   Float    // Amount creator receives
  whopPaymentId     String?  @unique // Whop payment ID
  paymentMethod     String?  // card, ach, crypto, bnpl
  status            PaymentStatus @default(PENDING)
  refundedAt        DateTime?
  refundAmount      Float?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user              User     @relation(fields: [userId], references: [id])
  pick              Pick     @relation(fields: [pickId], references: [id])

  @@unique([userId, pickId])
  @@index([userId])
  @@index([pickId])
  @@index([status])
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}

### 5. Payout
model Payout {
  id                String   @id @default(cuid())
  userId            String   // Creator receiving payout
  amount            Float    // Payout amount in cents
  method            PayoutMethod
  status            PayoutStatus @default(PENDING)
  whopTransferId    String?  @unique
  transactionHash   String?  // For crypto payouts
  failureReason     String?
  processedAt       DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user              User     @relation(fields: [userId], references: [id])
  transactions      Transaction[] // Related transactions

  @@index([userId])
  @@index([status])
}

enum PayoutMethod {
  BANK
  CRYPTO
  PAYPAL
  WHOP_BALANCE
}

enum PayoutStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELED
}

### 6. Transaction (Enhanced)
model Transaction {
  id                String   @id @default(cuid())
  userId            String
  type              TransactionType
  amount            Float    // Amount in cents
  platformFee       Float?   // Platform fee if applicable
  status            TransactionStatus @default(PENDING)
  referenceId       String?  // Reference to Purchase/Subscription/Payout ID
  whopReferenceId   String?  // Whop transaction ID
  description       String
  metadata          Json?    // Additional transaction metadata
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user              User     @relation(fields: [userId], references: [id])
  payoutId          String?
  payout            Payout?  @relation(fields: [payoutId], references: [id])

  @@index([userId, createdAt])
  @@index([userId])
  @@index([status])
  @@index([type])
}

enum TransactionType {
  PICK_PURCHASE      // User bought a pick
  PICK_SALE          // Creator sold a pick
  SUBSCRIPTION       // Subscription payment
  SUBSCRIPTION_REVENUE // Creator subscription revenue
  PAYOUT             // Withdrawal to creator
  REFUND             // Refund to user
  PLATFORM_FEE       // Platform fee collection
  ADJUSTMENT         // Manual adjustment by admin
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  REVERSED
}

### 7. WebhookEvent
model WebhookEvent {
  id                String   @id @default(cuid())
  provider          String   // "whop"
  eventType         String   // membership.went_valid, payment.succeeded, etc.
  payload           Json     // Raw webhook payload
  processed         Boolean  @default(false)
  processingError   String?
  attempts          Int      @default(0)
  createdAt         DateTime @default(now())
  processedAt       DateTime?

  @@index([provider, eventType])
  @@index([processed])
  @@index([createdAt])
}
```

## Database Migration Strategy

1. **Phase 1**: Add new models and fields
2. **Phase 2**: Migrate existing Purchase/Transaction data
3. **Phase 3**: Remove old Stripe-specific fields
4. **Phase 4**: Add indexes for performance