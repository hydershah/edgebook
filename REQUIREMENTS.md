# Edge Book - Sports Betting Predictions Platform

## Executive Summary
Edge Book is a social platform where sports betting enthusiasts can share and monetize their predictions. Users can both create content (predictions) and consume content from others, similar to Twitter but with a pay-per-view monetization model for premium predictions.

---

## Core Features

### 1. User System
- **Single User Role**: All users can both post predictions and view content
- **User Profiles** include:
  - Username, bio, profile picture
  - Social media connections (Instagram, Facebook, YouTube, etc.)
  - Prediction statistics:
    - Total predictions made
    - Accuracy rate/percentage
    - Win/loss record
    - Performance by sport category
  - Earnings/spending history
  - Follower/following counts

### 2. Feed System (Twitter-like)
- Chronological and algorithmic feed options
- Home feed (personalized)
- Global/explore feed
- Following feed
- Filter by:
  - Sport type
  - Free vs paid predictions
  - Top performers
  - Price range

### 3. Prediction Posts
- **Free Predictions**: Visible to all users
- **Paid Predictions**:
  - Blurred content (OnlyFans-style)
  - User must pay to unlock and view
  - Once paid, permanently accessible to that user
  - Creator sets the price per prediction
- Post content includes:
  - Prediction details (team, odds, stake, reasoning)
  - Attachments (images, stats, screenshots)
  - Sport category/tags
  - Timestamp (when posted vs when event occurs)

### 4. Wallet System
- **Top-up**: Users deposit money into their Edge Book wallet
  - Payment methods: Credit/debit card, PayPal, etc.
  - Minimum top-up amount
- **Pay-per-view**: Funds deducted when viewing paid predictions
- **Confirmation Flow**:
  1. User clicks on blurred prediction
  2. Popup shows price and confirmation
  3. User confirms or cancels
  4. If confirmed and sufficient balance: instant unlock + deduction
  5. If insufficient balance: prompt to top up
- **Transaction History**: All payments and top-ups logged
- **Viewing History**: Record of all paid predictions accessed

### 5. Social Connections
- Link external social media profiles:
  - Instagram
  - Facebook
  - YouTube
  - Twitter/X
  - TikTok
  - Discord
- Display on profile for credibility
- Optional verification of ownership

### 6. Accuracy Tracking
- Automated or manual result verification
- Predictions marked as:
  - Pending (event hasn't occurred)
  - Won (prediction correct)
  - Lost (prediction incorrect)
  - Push/Void (tie or cancelled event)
- Historical accuracy displayed on profile

---

## Critical Gaps & Questions

### 🚨 PAYMENT & MONETIZATION

#### Missing Requirements:
1. **Creator Payouts**
   - How do content creators withdraw their earnings?
   - Payout schedule (daily, weekly, monthly)?
   - Minimum payout threshold?
   - Payout methods (bank transfer, PayPal, crypto)?
   - Processing time for withdrawals?

2. **Platform Revenue Model**
   - What percentage does Edge Book take as commission?
   - Transaction fees on top-ups?
   - Subscription tiers vs pure pay-per-view?

3. **Refund Policy**
   - What if a prediction was fraudulent or incorrect?
   - Can users dispute charges?
   - Chargeback handling?
   - What if content creator deletes their account?

4. **Pricing Controls**
   - Min/max price limits for predictions?
   - Dynamic pricing allowed?
   - Bulk deals (e.g., "buy 10 predictions for $X")?
   - Subscription to specific creators?

5. **Tax & Compliance**
   - Tax reporting for creators earning over threshold?
   - 1099 forms (US)?
   - VAT/GST handling for international users?
   - KYC/AML requirements for payouts?

---

### 🚨 LEGAL & REGULATORY

#### Critical Missing Elements:
1. **Age Verification**
   - MUST be 18+ (or 21+ depending on jurisdiction)
   - How to verify age? ID upload? Third-party verification?

2. **Gambling Regulations**
   - Edge Book may be classified as gambling-adjacent
   - Different regulations per country/state
   - Need legal disclaimer: "For entertainment purposes only"?
   - Prohibited in certain jurisdictions?

3. **Responsible Gambling Features**
   - Spending limits (daily, weekly, monthly)
   - Self-exclusion options
   - Warnings about gambling risks
   - Links to gambling addiction resources

4. **Terms of Service**
   - Clear ToS regarding:
     - No guarantee of prediction accuracy
     - Platform liability limitations
     - Content ownership
     - Account termination conditions

5. **Privacy & Data Protection**
   - GDPR compliance (EU users)
   - CCPA compliance (California)
   - Data retention policies
   - User data export/deletion rights

6. **Financial Licenses**
   - May need money transmitter license (US)
   - Payment institution license (EU)
   - Varies by jurisdiction

---

### 🚨 CONTENT INTEGRITY & FRAUD PREVENTION

#### Missing Requirements:
1. **Result Verification System**
   - **Who determines if a prediction was accurate?**
     - Automated via sports data API (recommended)
     - Manual verification (not scalable)
     - Community voting (gameable)
   - **Source of truth**: Official sports scores API (ESPN, Sportradar, etc.)
   - **Timestamp locking**: Predictions locked before event starts (can't edit after)

2. **Anti-Fraud Measures**
   - Prevent users from:
     - Posting both outcomes then deleting the wrong one
     - Editing predictions after events start
     - Creating fake accounts to inflate stats
     - Buying their own predictions to game the system
   - Verification badges for trusted predictors
   - Minimum account age before monetization?

3. **Content Moderation**
   - Spam detection
   - Inappropriate content filtering
   - Reporting system for fraudulent predictions
   - Appeals process
   - Moderator dashboard

4. **Scam Prevention**
   - What stops someone from:
     - Taking screenshots of paid predictions and sharing?
     - Creating bots to mass-produce predictions?
     - Price gouging (charging $1000 for a prediction)?
   - Watermarks on paid content?
   - Copyright/IP protection for creators?

---

### 🚨 USER EXPERIENCE GAPS

#### Missing Features:
1. **Discovery & Search**
   - How do users find good predictors?
   - Search by sport, accuracy rate, price range?
   - Leaderboards (top predictors by accuracy, earnings, followers)?
   - Trending predictions?

2. **Social Features**
   - Follow/unfollow system
   - Notifications:
     - When followed user posts
     - When prediction result is verified
     - When wallet balance is low
   - Comments on predictions (public discussion)?
   - Likes/reactions?
   - Share predictions externally?

3. **Filtering & Personalization**
   - Favorite sports
   - Mute/block users
   - Customize feed algorithm
   - Save predictions for later

4. **Creator Tools**
   - Analytics dashboard:
     - Earnings over time
     - Follower growth
     - Engagement metrics
     - Conversion rate (views to paid unlocks)
   - Post scheduling
   - Draft predictions
   - Bulk upload/import

5. **Viewer Tools**
   - ROI calculator (spending vs potential winnings)
   - Track favorite predictors
   - Set budget alerts
   - Export viewing history

---

### 🚨 WALLET & PAYMENT EDGE CASES

#### Scenarios to Handle:

1. **Insufficient Balance**
   - ✅ You mentioned: Prompt user to top up
   - Also need:
     - Save their intent (they wanted to view this prediction)
     - After top-up, redirect to complete purchase
     - Show current balance in popup

2. **Failed Payments**
   - Payment processor declines top-up
   - What happens mid-transaction?
   - Retry mechanism?
   - Error messaging

3. **Concurrent Purchases**
   - User clicks multiple paid predictions rapidly
   - Race condition: Two purchases with $5 balance but each costs $3
   - Need transaction locking

4. **Partial Refunds**
   - If creator is banned, do viewers get refunded?
   - If prediction is removed for ToS violation?

5. **Currency & Conversion**
   - Multi-currency support?
   - Crypto payments?
   - Exchange rate fluctuations?

6. **Wallet Security**
   - Two-factor authentication for withdrawals?
   - Spending PIN/password?
   - Suspicious activity detection

7. **Negative Balance Prevention**
   - Ensure atomic transactions
   - Database constraints

8. **Expiring Balance**
   - Does wallet credit expire?
   - Dormant account policies?

---

### 🚨 PREDICTION LIFECYCLE

#### Missing Details:

1. **Post Creation Flow**
   - What fields are required?
     - Sport/league/teams
     - Bet type (moneyline, spread, over/under, prop bet)
     - Odds
     - Stake amount
     - Reasoning/analysis
     - Event date/time
   - Can predictions be edited? (Should be locked before event)
   - Can predictions be deleted? (Hurts accuracy tracking)

2. **Event Timing**
   - **Cutoff time**: Prediction must be posted before event starts
   - **Result verification**: After event ends
   - **Dispute window**: Time for users to report issues

3. **Multi-Leg Predictions**
   - Parlays (multiple bets combined)?
   - How to track accuracy for complex bets?

4. **Live Predictions**
   - Can users post during live events?
   - In-game predictions?

---

### 🚨 TECHNICAL CONSIDERATIONS

#### Infrastructure Needs:

1. **Security**
   - Payment card data: PCI DSS compliance
   - Never store raw card numbers (use Stripe/PayPal)
   - Encrypt wallet balances
   - Prevent SQL injection, XSS
   - Rate limiting on API endpoints

2. **Scalability**
   - What if platform goes viral?
   - CDN for blurred image previews?
   - Database sharding for user data?
   - Caching layer for feeds?

3. **Reliability**
   - Backup strategy
   - Disaster recovery
   - Payment system must be highly available (99.99%+)

4. **Content Protection**
   - Blurred images: How to prevent inspect-element bypass?
   - Server-side rendering of paid content
   - Digital watermarks on unlocked content?

5. **Third-Party Integrations**
   - Sports data API (for scores/results)
   - Payment processor (Stripe, PayPal, Square)
   - Social media OAuth
   - Email service (SendGrid, AWS SES)
   - SMS verification (Twilio)

---

### 🚨 ANALYTICS & REPORTING

#### Platform Needs:
1. **User Analytics**
   - Track user behavior for feed algorithm
   - A/B testing framework
   - Conversion funnels (view → pay)

2. **Financial Reports**
   - Total platform revenue
   - Creator earnings
   - Top-up trends
   - Average transaction value

3. **Fraud Detection**
   - Unusual accuracy rates (too good to be true)
   - Suspicious payment patterns
   - Duplicate accounts

---

## Additional Features to Consider

### Phase 2 Enhancements:
1. **Subscription Model**
   - Follow a creator for $X/month, get all their predictions
   - Tier system (Silver, Gold, Platinum access)

2. **Achievements & Gamification**
   - Badges for accuracy milestones
   - Streak tracking (consecutive correct predictions)
   - Leaderboards

3. **Groups/Communities**
   - Private prediction groups
   - Invite-only premium communities

4. **Affiliate System**
   - Referral bonuses
   - Influencer partnerships

5. **Mobile App**
   - Push notifications
   - Live score updates
   - Quick bet copying (integrate with betting platforms?)

6. **AI/ML Features**
   - Recommended creators
   - Prediction of prediction accuracy (meta!)
   - Personalized feed ranking

7. **API for Third Parties**
   - Allow betting apps to integrate Edge Book predictions
   - Revenue sharing

---

## Critical Path Items (Must-Have for MVP)

### Before Launch:
- [ ] Legal review by attorney specializing in gambling/fintech
- [ ] Age verification system
- [ ] Terms of Service & Privacy Policy
- [ ] Payment processor integration (Stripe recommended)
- [ ] Sports data API integration for result verification
- [ ] Wallet system with transaction atomicity
- [ ] Content moderation tools
- [ ] Basic reporting/blocking functionality
- [ ] Secure authentication (2FA recommended)
- [ ] Timestamp-based prediction locking
- [ ] Creator payout system
- [ ] Customer support system (for payment disputes)

### Nice-to-Have for MVP:
- [ ] Social media OAuth login
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Subscription model
- [ ] API access

---

## Risk Assessment

### High Risk:
1. **Legal/Regulatory**: Could be banned in certain regions
2. **Fraud**: Scammers posting fake predictions
3. **Payment Disputes**: Users wanting refunds for bad predictions
4. **Content Piracy**: Screenshots of paid predictions being shared

### Medium Risk:
1. **User Acquisition**: Getting critical mass of both creators and viewers
2. **Payment Processing**: Fees eating into creator earnings
3. **Competition**: Existing platforms (Discord, Telegram groups)

### Low Risk:
1. **Technical Implementation**: Standard e-commerce + social media patterns
2. **Scalability**: Can start small and scale

---

## Questions to Answer Before Development

1. **What is the primary target market?** (US, EU, Global?)
2. **What sports will you support initially?** (Focus on one first?)
3. **What's the commission structure?** (Platform cut?)
4. **Minimum viable feature set?** (Can we launch without some features?)
5. **Budget for legal compliance?** (This could be expensive)
6. **Do you have a sports data API budget?** (These can cost $500-$5000/month)
7. **What payment processors are you comfortable with?** (Stripe, PayPal, crypto?)
8. **Moderation approach?** (Automated, human moderators, hybrid?)
9. **Mobile-first or web-first?**
10. **How to bootstrap the network?** (Chicken-and-egg: need creators to attract viewers, need viewers to attract creators)

---

## Recommended Tech Stack

### Backend:
- Next.js API routes (you're already using)
- PostgreSQL for relational data (users, predictions, transactions)
- Redis for caching and real-time features
- Stripe for payments
- AWS S3 for image storage
- Sports data API (Sportradar, The Odds API, etc.)

### Frontend:
- Next.js with React
- TailwindCSS (for rapid UI development)
- Real-time updates (Pusher or WebSockets)

### Security:
- NextAuth.js for authentication
- Rate limiting (upstash-ratelimit)
- CSRF protection
- SQL injection prevention (Prisma ORM)

### Monitoring:
- Sentry for error tracking
- PostHog or Mixpanel for analytics
- Stripe Dashboard for payment monitoring

---

## Timeline Estimate

### MVP (3-4 months with small team):
- Month 1: Core user system, profiles, basic feed
- Month 2: Wallet system, payment integration, paid predictions
- Month 3: Result verification, accuracy tracking, moderation tools
- Month 4: Testing, legal review, soft launch

### Full Launch (6-9 months):
- Add social features, analytics, mobile app
- Scale infrastructure
- Marketing and user acquisition

---

## Immediate Next Steps

1. **Legal Consultation**: Speak with a lawyer ASAP
2. **Market Research**: Validate demand (survey potential users)
3. **Competitive Analysis**: Study Discord betting groups, Telegram channels, paid picks services
4. **Technical Validation**: Test sports data APIs, payment processors
5. **Financial Modeling**: Calculate unit economics (revenue per user, costs, break-even)
6. **Wireframes/Mockups**: Design key user flows
7. **Database Schema**: Design data models for users, predictions, transactions, etc.

---

## Conclusion

Edge Book has strong potential but requires careful execution, especially around:
- **Legal compliance** (gambling regulations)
- **Fraud prevention** (manipulated accuracy stats)
- **Payment security** (handling real money)
- **User trust** (verification, moderation)

The pay-per-view model is innovative, but you may want to also offer:
- Subscriptions (more predictable revenue)
- Free tier with ads (lower barrier to entry)
- Freemium model (some free predictions to build trust)

**Biggest concern**: Legal/regulatory risk. Consult with an attorney before writing any code.

**Biggest opportunity**: If executed well, this could disrupt the fragmented "paid picks" market currently happening in Discord/Telegram.
