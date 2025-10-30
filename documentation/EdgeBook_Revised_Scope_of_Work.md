# EdgeBook.ai – Comprehensive Development Scope of Work

**Client:** Travis Shipley
**Platform:** EdgeBook.ai
**Document Date:** October 29, 2025
**Project Start Date:** October 28, 2025
**Current Status:** Phase 2 In Progress (~60% Overall Completion)

---

## Executive Summary

EdgeBook.ai is a social platform for sports enthusiasts to share, discover, and monetize their predictions. The platform combines social media engagement with a content marketplace model, where users can post both free and premium predictions, follow top performers, and access AI-powered sports insights.

**Current Progress:** The platform has a solid foundation with authentication, database architecture, social features, and basic payment infrastructure. Critical business features including Stripe Connect (creator payouts), sports data API integration, and fraud prevention systems are in active development.

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14.2.0 (React 18.2.0)
- **Language:** TypeScript 5.3+
- **Styling:** Tailwind CSS 3.4+
- **UI Components:** Lucide React (icons)
- **Form Management:** React Hook Form 7.50+ with Zod validation
- **Date Handling:** date-fns 3.0+

### Backend
- **API:** Next.js API Routes (serverless)
- **Authentication:** NextAuth.js 4.24+ with Prisma Adapter
- **Database:** PostgreSQL (Railway hosted)
- **ORM:** Prisma 5.10+
- **Password Hashing:** bcryptjs 2.4+

### Payment & Monetization
- **Payment Processor:** Stripe 14.0+
- **Client SDK:** @stripe/stripe-js 3.0+
- **Creator Payouts:** Stripe Connect (in development)

### AI & Machine Learning
- **AI Provider:** OpenAI GPT
- **SDK:** openai

### File Storage
- **Cloud Storage:** AWS S3
- **SDK:** @aws-sdk/client-s3 3.490+

### Security & Authentication
- **2FA:** otplib 12.0+ with QR code generation
- **Session Management:** NextAuth.js JWT + database sessions
- **Email:** Nodemailer 7.0+ for transactional emails

### Development Tools
- **Linting:** ESLint 8.0+ with Next.js config
- **CSS Processing:** PostCSS 8.4+, Autoprefixer 10.4+
- **Package Manager:** npm

### Deployment
- **Platform:** Railway
- **Database:** Railway PostgreSQL
- **Environment:** Production and Development environments

---

## Phase 1 – Foundation & Architecture
**Timeline:** October 28, 2025 - November 4, 2025 (1 week)
**Status:** ✅ 75% Complete

### ✅ Completed Deliverables (October 28, 2025)

#### 1. PostgreSQL Database Schema
**Location:** `prisma/schema.prisma`

**Core Models Implemented:**
- **User:** Comprehensive profile with email, username, password, avatar, bio, social links (Instagram, Facebook, YouTube, Twitter, TikTok, website), premium status, verification, Stripe integration fields, 2FA support, theme preferences
- **Pick:** Sports predictions with type (SINGLE/PARLAY), sport (NFL/NBA/MLB/NHL/SOCCER/COLLEGE), matchup, details, odds, media, game date, confidence (1-5 units), status (PENDING/WON/LOST/PUSH), premium pricing
- **Transaction:** Complete payment tracking with userId, type, amount, platform fee, status, Stripe payment ID
- **Purchase:** Pick unlock tracking with userId, pickId, amount, platformFee, stripePaymentId, unique constraint preventing duplicate purchases
- **Follow:** Bidirectional following system
- **Like:** Pick engagement tracking
- **Bookmark:** Save picks for later
- **Comment:** Discussion on picks
- **View:** View tracking with IP addresses for analytics
- **Chat:** AI analyst chat sessions
- **Message:** Chat message history
- **Subscription:** Creator subscription management
- **LoginActivity:** Security audit trail with IP, user agent, location, timestamps
- **PasswordReset:** Secure password reset token management
- **Account/Session:** NextAuth.js integration models

**Enumerations:**
- PickStatus: PENDING, WON, LOST, PUSH
- PickType: SINGLE, PARLAY
- Sport: NFL, NBA, MLB, NHL, SOCCER, COLLEGE_FOOTBALL, COLLEGE_BASKETBALL

#### 2. Authentication System
**Location:** `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/auth/`

**Features Implemented:**
- Email/password authentication with bcrypt hashing
- Social OAuth logins (Google, Facebook, Microsoft Azure AD)
- Password reset flow with secure token generation
- Email verification system
- Session-based JWT authentication
- Protected API routes with session validation
- Two-factor authentication (2FA) with QR code setup
- Session management with device tracking
- Login activity logging (IP, user agent, location)
- Welcome emails on signup
- Password reset emails with Nodemailer

**Pages:**
- `/auth/signin` - Sign in page
- `/auth/signup` - Registration page
- `/auth/forgot-password` - Password reset request
- `/auth/reset-password` - Password reset confirmation

#### 3. Legal Compliance Framework
**Location:** `app/legal/`, `components/Footer.tsx`, `components/ComplianceConsent.tsx`

**Implemented:**
- Terms of Service page
- Privacy Policy page
- Platform Disclosures (15% platform fee clearly stated)
- Responsible Use resources page with support helpline
- Compliance footer with "Must be 18+" disclaimer
- Support helpline: 1-800-522-4700
- Compliance consent modal on first visit
- Legal disclaimers throughout platform

#### 4. Railway Deployment
**Status:** ✅ Live and Operational

**Configuration:**
- Environment variables securely configured in Railway
- PostgreSQL database connected and migrated
- SSL/TLS encryption enabled
- Production and development environments separated
- Automated deployments on git push

### ⚠️ In Progress / Needs Completion

#### 1. Age Verification System
**Target:** November 1-4, 2025 (3-4 days)

**Current State:** Client-side checkbox only (not compliant)

**Required Implementation:**
- Stripe Identity API integration
- Document upload and verification flow
- Backend verification status tracking
- Age verification badge on verified profiles
- Gating of premium features for unverified users
- Admin dashboard for verification review
- Retry mechanism for failed verifications

**Acceptance Criteria:**
- Users cannot purchase or post premium picks without age verification
- Verification status stored in database
- Admin can review verification attempts
- Compliant with 18+/21+ requirements by jurisdiction

#### 2. Basic Admin Dashboard
**Target:** November 5-12, 2025 (1 week)

**Current State:** Not implemented (no `/app/admin` directory exists)

**Required Features:**
- Admin role and permission system in User model
- Content moderation interface (approve/reject/flag picks)
- User management (ban, warn, verify badges)
- Transaction review dashboard
- Payout approval queue (for Stripe Connect)
- Platform analytics overview
- Audit log viewer (login activity, transactions)
- Search and filter tools

**Acceptance Criteria:**
- Designated admin users can access admin portal
- Can moderate content and users
- Can view platform financial metrics
- Can approve/deny creator payouts

### Phase 1 Assessment
- **Completion:** 75%
- **Payment Milestone:** 20% of total contract value
- **Recommendation:** 15% payment upon Age Verification and Basic Admin Dashboard completion

---

## Phase 2 – Core Product Development
**Timeline:** October 28 - November 25, 2025 (4 weeks)
**Status:** 🔄 50% Complete

### ✅ Completed Deliverables (October 28, 2025)

#### 1. Prediction Posting System
**Location:** `app/createpick/page.tsx`, `app/api/picks/route.ts`

**Features:**
- Pick type selection (Single bet vs Parlay)
- Sport category (7 sports supported)
- Matchup input with team selection
- Detailed analysis/reasoning text editor
- Odds input field
- Game date/time picker
- Confidence level selector (1-5 units)
- Premium pick toggle with custom pricing
- Platform fee disclosure (15% shown to creator)
- Media upload interface (AWS S3 ready)
- Form validation with Zod schemas
- Draft saving capability
- Preview before posting

**API Endpoints:**
- `POST /api/picks` - Create new pick
- `GET /api/picks` - Fetch picks with filters
- `GET /api/picks/[pickId]` - Get single pick
- `PUT /api/picks/[pickId]` - Update pick (owner only)
- `DELETE /api/picks/[pickId]` - Delete pick (owner only)

#### 2. Feed System
**Location:** `app/feed/page.tsx`, `components/PickFeed.tsx`

**Features:**
- Infinite scroll feed with pagination
- Tab switching: "For You" (algorithmic) vs "Following" (chronological)
- Comprehensive filtering:
  - Sport filters (NFL, NBA, MLB, NHL, Soccer, College Football, College Basketball)
  - Status filters (Pending, Won, Lost, Push)
  - Unit/confidence filters (1U through 5U)
  - Premium-only toggle
  - Date range selector
- Real-time updates on new picks
- Trending sports sidebar
- Top creators sidebar with stats
- Search functionality

**API Endpoints:**
- `GET /api/picks?filters=...` - Filtered feed

#### 3. Profile System
**Location:** `app/profile/[userId]/page.tsx`, `app/profile/page.tsx`

**Features:**
- Public profile pages with stats:
  - Win rate percentage
  - Total picks posted
  - Units won/lost
  - Follower/following counts
  - Premium pick count
- Profile customization:
  - Avatar upload (AWS S3)
  - Cover photo upload
  - Bio (280 character limit)
  - Location
  - Social media links (6 platforms)
- Pick history feed (user's picks only)
- Accuracy metrics breakdown by sport
- Earnings dashboard (for creators)

**API Endpoints:**
- `GET /api/profile/[userId]` - Fetch user profile
- `PUT /api/profile` - Update own profile
- `GET /api/profile/[userId]/picks` - User's pick history

#### 4. Settings System
**Location:** `app/profile/settings/page.tsx`, `app/profile/settings/tabs/`

**Comprehensive Settings Pages:**
- **Account Settings:** Email, username, name, phone, birthday, gender, location
- **Security:** Password change, 2FA setup with QR codes, active session management, login activity history
- **Privacy:** Profile visibility, who can follow, who can DM, data export/deletion
- **Notifications:** Email preferences for follows, likes, comments, pick results, payouts
- **Creator Settings:** Subscription pricing, payout preferences, Stripe Connect onboarding (UI ready)
- **Appearance:** Light/dark mode, theme customization

**API Endpoints:**
- `PUT /api/settings/account` - Update account info
- `PUT /api/settings/password` - Change password
- `POST /api/settings/2fa` - Enable/disable 2FA
- `GET /api/settings/sessions` - List active sessions
- `DELETE /api/settings/sessions/[id]` - Revoke session
- `PUT /api/settings/notifications` - Update notification preferences
- `PUT /api/settings/username` - Change username
- `PUT /api/settings/email` - Change email

#### 5. Social Engagement Features
**Location:** Various components and API routes

**Implemented:**
- **Follow System:**
  - Follow/unfollow users
  - Follower/following lists
  - Follow suggestions based on activity
  - API: `POST /api/follow/[userId]`, `DELETE /api/follow/[userId]`

- **Like System:**
  - Like/unlike picks
  - Like count display
  - Liked picks history
  - API: `POST /api/picks/[pickId]/like`, `DELETE /api/picks/[pickId]/like`

- **Bookmark System:**
  - Save picks for later
  - Bookmarks collection page
  - API: `POST /api/picks/[pickId]/bookmark`, `DELETE /api/picks/[pickId]/bookmark`

- **Comment System:**
  - Comment on picks
  - Comment threads
  - Comment count
  - Delete own comments
  - API: `POST /api/picks/[pickId]/comments`, `DELETE /api/picks/[pickId]/comments/[commentId]`

- **View Tracking:**
  - Track pick views with IP addresses
  - View count display
  - Analytics for creators

#### 6. Payment Infrastructure (Partial)
**Location:** `app/api/payments/`, `app/api/picks/[pickId]/unlock/`

**What Works:**
- Stripe payment intent creation
- Platform fee calculation (15%)
- Transaction logging in database
- Purchase tracking (prevents duplicate purchases)
- Basic unlock endpoint

**API Endpoints:**
- `POST /api/payments/create-payment-intent` - Initiate payment
- `POST /api/picks/[pickId]/unlock` - Unlock premium pick

**What's Missing:**
- Actual payment processing in unlock flow (currently uses placeholder IDs)
- Wallet balance system
- Stripe Connect for creator payouts

#### 7. AI Sports Analyst
**Location:** `app/aianalyst/page.tsx`, `app/api/chats/`

**Features:**
- OpenAI GPT-4 powered chat interface
- Chat history persistence
- Multiple chat sessions
- Sports insights and analysis
- Personalized recommendations
- Chat management (create, delete sessions)

**API Endpoints:**
- `POST /api/chats` - Create new chat
- `GET /api/chats` - List user's chats
- `POST /api/chats/[chatId]/messages` - Send message
- `GET /api/chats/[chatId]/messages` - Fetch chat history
- `DELETE /api/chats/[chatId]` - Delete chat

#### 8. User Search & Discovery
**Location:** `app/api/users/search/`

**Features:**
- Search users by username or name
- Filter by verified status
- Sort by followers, win rate, total picks
- Debounced search for performance

**API Endpoints:**
- `GET /api/users/search?q=...` - Search users

#### 9. Email Notification System
**Location:** `lib/email.ts`

**Implemented Emails:**
- Welcome email on signup
- Password reset emails
- Email verification (when enabled)
- 2FA setup confirmation

**Email Provider:** Nodemailer (SMTP configured)

### ⚠️ In Progress / Critical Missing Features

#### 1. Stripe Connect (Creator Payouts)
**Target:** November 13-25, 2025 (2 weeks)
**Priority:** 🔴 CRITICAL - Blocks Monetization

**Current State:** UI exists in Creator Settings but shows alert only

**Required Implementation:**
- Stripe Connect Express/Standard account onboarding
- OAuth flow for connecting Stripe accounts
- Connected account creation endpoint
- Payout/transfer API (from platform to creators)
- Balance tracking for creators
- Payout schedule configuration (daily, weekly, monthly)
- Minimum payout threshold enforcement
- Webhook handling for account events (account.updated, payout.paid, etc.)
- Creator dashboard link to Stripe Express Dashboard
- Payout history view

**Database Changes:**
- Enhance `stripeAccountId` validation
- Add payout status tracking
- Add pending balance field

**API Endpoints Needed:**
- `POST /api/stripe/connect/onboard` - Start onboarding
- `GET /api/stripe/connect/status` - Check account status
- `POST /api/stripe/connect/payout` - Initiate payout
- `GET /api/stripe/connect/balance` - Get creator balance
- `POST /api/webhooks/stripe/connect` - Handle Stripe webhooks

**Acceptance Criteria:**
- Creator can complete Stripe onboarding
- Platform can transfer funds to creator accounts
- Payouts tracked in database
- Creators can view earnings and payout history
- Webhook handling for account lifecycle events

#### 2. Sports Data API Integration
**Target:** November 26 - December 9, 2025 (2 weeks)
**Priority:** 🔴 CRITICAL - Enables Automation

**Current State:** Not implemented - all result verification is manual

**Required Features:**
- API provider selection and integration (The Odds API, Sportradar, or SportsData.io)
- Real-time score updates
- Automated pick result verification (WON/LOST/PUSH)
- Event start time validation
- Webhook/polling system for game results
- Multi-sport support (NFL, NBA, MLB, NHL, Soccer)
- Odds data fetching
- Postponed/cancelled game handling

**API Endpoints Needed:**
- `POST /api/sports/verify-results` - Manual trigger for verification
- `GET /api/sports/games?sport=...&date=...` - Fetch upcoming games
- `GET /api/sports/scores?gameId=...` - Get game score
- `POST /api/webhooks/sports-data` - Receive updates from provider

**Cron Jobs:**
- Scheduled result verification every 15-30 minutes
- Update pick statuses automatically
- Notify users of pick results

**Environment Variables:**
- `SPORTS_API_KEY` - API authentication
- `SPORTS_API_URL` - Provider endpoint

**Acceptance Criteria:**
- Picks automatically update to WON/LOST/PUSH after games end
- Accurate score data from reliable provider
- Handles edge cases (postponements, cancellations)
- Manual override available in admin dashboard

#### 3. Timestamp Locking & Edit Prevention
**Target:** December 10-13, 2025 (3-4 days)
**Priority:** 🔴 CRITICAL - Fraud Prevention

**Current State:** Users can edit picks after events start (fraud vulnerability)

**Required Implementation:**
- Server-side validation preventing pick creation after event start
- Lock editing after event starts (backend enforcement)
- Frontend warnings for upcoming locks
- Countdown timer showing time until lock
- Edit history tracking (if allowed before lock)
- Timezone handling for game times
- Grace period configuration (e.g., lock 5 minutes before event)

**API Changes:**
- `POST /api/picks` - Add gameDate validation
- `PUT /api/picks/[pickId]` - Prevent edits after gameDate
- Add `lockedAt` timestamp to Pick model

**Acceptance Criteria:**
- Cannot create picks for past events
- Cannot edit picks after event starts
- Frontend shows locked state clearly
- Admin can override locks if needed

#### 4. Secure Blurred Preview System
**Target:** December 14-18, 2025 (1 week)
**Priority:** 🟡 MEDIUM - Content Protection

**Current State:** CSS blur only (easily bypassable via browser inspect)

**Required Implementation:**
- Server-side content obfuscation
- API returns partial content for unpurchased premium picks
- Blurred image generation on server
- Content fully hidden in DOM until purchase
- Secure unlock verification
- Watermarking for unlocked content (user ID embedded)

**API Changes:**
- `GET /api/picks/[pickId]` - Return full content only if purchased or owner
- Return truncated/obfuscated content for locked picks

**Acceptance Criteria:**
- Premium content not visible in DOM before purchase
- Content reveal only after verified payment
- Cannot bypass via browser developer tools

#### 5. Wallet Balance System
**Target:** December 19-24, 2025 (1 week)
**Priority:** 🟡 MEDIUM - Better UX

**Current State:** Direct payments only (no balance)

**Required Implementation:**
- Add `walletBalance` field to User model
- Top-up/deposit functionality
- Withdrawal API
- Transaction history view (deposits, purchases, withdrawals)
- Insufficient funds validation
- Atomic balance updates (prevent race conditions)
- Minimum top-up amount enforcement
- Balance display in UI header

**API Endpoints:**
- `POST /api/wallet/topup` - Add funds
- `POST /api/wallet/withdraw` - Request withdrawal
- `GET /api/wallet/balance` - Get current balance
- `GET /api/wallet/transactions` - Transaction history

**Database Changes:**
- Add `walletBalance` field to User (type: Float, default: 0)
- Add balance change tracking in Transaction model

**Acceptance Criteria:**
- Users can top up wallet via Stripe
- Purchases deduct from wallet balance
- Insufficient balance shows top-up prompt
- Transaction history accurate and complete

### Phase 2 Assessment
- **Completion:** 50%
- **Payment Milestone:** 30% of total contract value
- **Recommendation:** Payment upon completion of Stripe Connect, Sports API, and Timestamp Locking

---

## Phase 3 – Compliance, Fraud Prevention & UX Polish
**Timeline:** December 25, 2025 - January 15, 2026 (3 weeks)
**Status:** 🔄 20% Complete

### ✅ Completed Deliverables

#### 1. Basic Audit Logging
- LoginActivity table tracks IP addresses, user agents, locations
- View tracking with IP addresses for analytics
- Purchase uniqueness constraint (prevents buying same pick twice)

#### 2. Email Notification System
**Location:** `lib/email.ts`

- Password reset emails
- Welcome emails
- Nodemailer SMTP configuration
- HTML email templates

#### 3. Notification Preferences UI
**Location:** `app/profile/settings/tabs/NotificationSettings.tsx`

- Email notification toggles
- Preferences stored in User.notificationPreferences JSON field
- Categories: follows, likes, comments, pick results, payouts

#### 4. Responsive Design
- Mobile-responsive layout (Tailwind CSS)
- Dark mode support
- Clean, modern UI with Lucide icons
- Accessible forms with validation

### ⚠️ Critical Missing Features

#### 1. Comprehensive Fraud Prevention System
**Target:** January 1-7, 2026 (1 week)
**Priority:** 🔴 CRITICAL

**Required Implementations:**

**A. Anti-Self-Purchase Logic:**
- Prevent creators from buying their own premium picks
- Validation in unlock API endpoint
- Database check: `pick.userId !== purchaser.userId`

**B. Account Flagging System:**
- Add `isFlagged` and `flagReason` to User model
- Suspicious activity alerts
- Admin review queue for flagged accounts

**C. Rate Limiting:**
- API rate limits to prevent abuse
- Pick creation limits (e.g., max 50 picks per day)
- Purchase rate limiting

**D. Duplicate Account Detection:**
- Track email patterns
- IP address correlation
- Device fingerprinting

**E. Win Rate Validation:**
- Statistical analysis of accuracy rates
- Flag impossibly high win rates (>90% sustained)
- Require minimum pick volume for accuracy display

**F. Edit History Tracking:**
- Log all pick edits before lock
- Show edit history to buyers
- Transparency in prediction changes

**Acceptance Criteria:**
- Creators cannot purchase own picks
- Suspicious accounts automatically flagged
- Rate limits prevent spam
- Admin can investigate fraud patterns

#### 2. Reporting & Moderation System
**Target:** January 8-12, 2026 (5 days)
**Priority:** 🔴 CRITICAL

**Required Features:**

**Database Model:**
```prisma
model Report {
  id          String   @id @default(cuid())
  reporterId  String
  reportedId  String   // User or Pick ID
  type        ReportType // USER or PICK
  category    String   // fraud, spam, inappropriate, etc.
  description String
  status      ReportStatus // PENDING, REVIEWED, RESOLVED
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**UI Components:**
- Report button on picks and profiles
- Report submission modal with categories
- Report history for users
- Moderation queue in admin dashboard

**API Endpoints:**
- `POST /api/reports` - Submit report
- `GET /api/admin/reports` - View all reports (admin only)
- `PUT /api/admin/reports/[id]` - Update report status

**Acceptance Criteria:**
- Users can report picks and users
- Reports visible in admin dashboard
- Admins can take action (warn, ban, remove content)
- Reporters notified of outcomes

#### 3. Enhanced Admin Dashboard
**Target:** January 13-15, 2026 (3 days)
**Priority:** 🔴 CRITICAL

**Additional Features Beyond Phase 1 Basic Dashboard:**

- **Dispute Resolution:**
  - User appeals system
  - Payout disputes
  - Banned account appeals

- **Fraud Investigation Tools:**
  - Multi-account detection view
  - Win rate anomalies dashboard
  - Purchase pattern analysis

- **Platform Analytics:**
  - Daily active users (DAU)
  - Revenue metrics
  - Top creators by earnings
  - User retention cohorts
  - Conversion funnels

- **Transaction Review:**
  - Suspicious transaction flagging
  - Refund management
  - Chargeback handling

**Acceptance Criteria:**
- Complete moderation workflow
- Analytics dashboard functional
- Dispute resolution process documented
- Fraud detection rules active

#### 4. In-App Notification System
**Target:** January 16-20, 2026 (5 days)
**Priority:** 🟡 MEDIUM

**Current State:** Email notifications only

**Required Features:**
- Notification center UI component
- Badge count for unread notifications
- Real-time notifications (optional WebSocket integration)
- Notification types:
  - Followed user posted new pick
  - Pick result verified (WON/LOST)
  - New follower
  - Comment on your pick
  - Like on your pick
  - Payout completed
  - Low wallet balance
- Mark as read/unread
- Notification preferences (which types to receive)

**Database Model:**
```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String
  title     String
  message   String
  link      String?
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**API Endpoints:**
- `GET /api/notifications` - Fetch user notifications
- `PUT /api/notifications/[id]/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all read
- `DELETE /api/notifications/[id]` - Delete notification

**Acceptance Criteria:**
- Notifications appear in real-time or on page refresh
- Badge count accurate
- Users can manage notification preferences
- Notification center accessible from all pages

#### 5. Content Protection & Watermarking
**Target:** January 21-25, 2026 (5 days)
**Priority:** 🟢 LOW (Nice to Have)

**Features:**
- Dynamic watermarking on unlocked premium content
- User ID and timestamp embedded in images
- Screenshot detection (best effort on web)
- DRM for video content
- Content encryption at rest

**Implementation:**
- Server-side image manipulation (add user ID watermark)
- Unique image URL per user for same pick
- Tracking watermarked content shares

**Acceptance Criteria:**
- Watermarks visible but not obtrusive
- Each user gets unique watermarked content
- Reduces content piracy risk

### Phase 3 Assessment
- **Completion:** 20%
- **Payment Milestone:** 25% of total contract value
- **Recommendation:** Payment upon completion of Fraud Prevention, Reporting, and Enhanced Admin Dashboard

---

## Phase 4 – Testing, Launch & Handoff
**Timeline:** January 26 - February 15, 2026 (3 weeks)
**Status:** ⏳ Not Started (0% Complete)

### Required Deliverables

#### 1. Quality Assurance & Testing
**Target:** January 26 - February 5, 2026 (1.5 weeks)

**Testing Categories:**

**A. Functional Testing:**
- User registration and authentication flows
- Pick creation and publishing
- Payment flows (top-up, purchase, unlock)
- Social features (follow, like, comment, bookmark)
- AI analyst chat
- Profile and settings updates
- Admin dashboard operations

**B. Security Testing:**
- Authentication bypass attempts
- SQL injection testing
- XSS vulnerability scanning
- CSRF protection validation
- API authorization checks
- Payment security audit

**C. Performance Testing:**
- Load testing (simulate 1000+ concurrent users)
- API response time benchmarks (< 500ms target)
- Database query optimization
- Image loading performance
- Infinite scroll performance

**D. Cross-Browser Testing:**
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design validation

**E. Payment Flow Regression:**
- Test with real Stripe test cards
- Refund scenarios
- Failed payment handling
- Webhook processing
- Stripe Connect payouts

**F. Edge Case Testing:**
- Timezone handling for game times
- Concurrent purchases (race conditions)
- API rate limiting
- Large file uploads
- Slow network conditions

**Testing Tools:**
- Manual QA checklist
- Automated tests (if time permits): Jest, React Testing Library
- Lighthouse performance audits
- Stripe test mode

**Acceptance Criteria:**
- All critical paths tested
- No P0 (critical) bugs remaining
- Performance benchmarks met
- Cross-browser compatibility confirmed

#### 2. Analytics & Monitoring Setup
**Target:** February 6-8, 2026 (3 days)

**Analytics Platform:**
- **PostHog** (recommended) or **Mixpanel**
- User behavior tracking
- Conversion funnel analysis
- Retention cohorts
- A/B testing framework

**Error Monitoring:**
- **Sentry** integration
- Real-time error alerts
- Error grouping and prioritization
- Source map upload for stack traces
- Performance monitoring

**Custom Event Tracking:**
- Pick created
- Pick purchased
- User signed up
- Wallet top-up
- Follow action
- AI analyst query
- Payment completed
- Payout initiated

**Dashboards:**
- User acquisition metrics
- Revenue dashboard
- Creator earnings leaderboard
- Pick performance by sport
- Conversion rates (free user → paying user)

**Environment Variables:**
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`

**Acceptance Criteria:**
- PostHog tracking all key events
- Sentry catching and reporting errors
- Dashboards configured for key metrics
- Alerts set up for critical errors

#### 3. Production Deployment & Domain Setup
**Target:** February 9-11, 2026 (3 days)

**Domain Configuration:**
- Register/configure `edgebook.ai` domain
- DNS configuration (Cloudflare recommended)
- SSL/TLS certificate setup (Let's Encrypt via Railway)
- CDN setup for static assets (Cloudflare CDN)

**Railway Production Environment:**
- Production database (separate from development)
- Environment variable configuration
- Database connection pooling
- Automated backups enabled (daily)
- Disaster recovery plan documented

**Deployment Checklist:**
- All environment variables set in production
- Stripe production keys configured
- AWS S3 production bucket configured
- OpenAI production API key with billing set up
- Email service configured (production SMTP)
- Sports data API production credentials
- Database migrations applied
- Prisma client generated
- Next.js production build tested

**Post-Deployment Validation:**
- Smoke tests on production
- Payment flow end-to-end test (small real transaction)
- Stripe webhooks receiving events
- Email delivery working
- AI analyst responding
- Database read/write operations

**Acceptance Criteria:**
- Site accessible at edgebook.ai
- HTTPS enabled
- All features working in production
- No errors in Sentry
- Analytics tracking confirmed

#### 4. Documentation & Knowledge Transfer
**Target:** February 12-14, 2026 (3 days)

**Documentation Deliverables:**

**A. API Documentation:**
- Endpoint reference (all routes documented)
- Request/response schemas
- Authentication requirements
- Error codes and handling
- Rate limiting details
- Webhook documentation

**B. Admin User Guide:**
- How to access admin dashboard
- Content moderation workflows
- User management (ban, warn, verify)
- Payout approval process
- Fraud investigation procedures
- Report handling
- Platform analytics interpretation

**C. Creator Onboarding Guide:**
- How to set up Stripe Connect
- How to post premium picks
- Understanding platform fees
- How to track earnings
- Payout schedule and thresholds
- Best practices for accuracy

**D. Deployment & Operations Guide:**
- Environment variables reference
- Deployment procedures (Railway)
- Database migration guide
- Backup and restore procedures
- Monitoring and alerting setup
- Troubleshooting common issues
- Scaling recommendations

**E. Database Schema Documentation:**
- ERD (Entity Relationship Diagram)
- Model descriptions
- Relationship explanations
- Index strategies
- Migration history

**F. Security & Compliance:**
- Security best practices
- Compliance requirements (age verification, legal)
- Data retention policies
- GDPR/CCPA compliance notes
- Incident response plan

**Existing Documentation:**
- ✅ README.md (setup and tech stack)
- ✅ REQUIREMENTS.md (feature requirements)
- ✅ AUTH_SETUP.md (authentication guide)
- ✅ QUICKSTART.md (quick start)
- ✅ PROJECT_STATUS_REPORT.md (progress tracking)

**Acceptance Criteria:**
- All documentation complete and accurate
- Admin can operate platform independently
- Developers can understand codebase from docs
- Deployment procedures tested and validated

#### 5. Training & Handoff
**Target:** February 15, 2026 (1 day)

**Training Sessions:**
- Admin dashboard walkthrough
- Content moderation training
- Financial management (Stripe dashboard)
- User support procedures
- Analytics interpretation
- Emergency procedures

**Access & Credentials Handoff:**
- Railway account access
- Stripe account (admin access)
- AWS S3 credentials
- OpenAI API key
- Database credentials
- Sports data API credentials
- Email service credentials
- Domain registrar access
- Analytics platform access
- Error monitoring access

**Code Repository:**
- GitHub repository access granted
- Branching strategy explained
- Commit history clean
- All code commented appropriately

**Acceptance Criteria:**
- Client can access all platforms and services
- Client can perform basic admin operations
- Client understands escalation procedures
- All credentials documented and handed over

### Phase 4 Assessment
- **Completion:** 0% (Not started)
- **Payment Milestone:** 25% of total contract value (final payment)
- **Recommendation:** Payment upon successful production launch, QA completion, and full documentation handoff

---

## Project Timeline Overview

```
Phase 1: Foundation (1 week) - Oct 28 - Nov 4, 2025
├─ ✅ Database Schema (Oct 28)
├─ ✅ Authentication (Oct 28)
├─ ✅ Legal Pages (Oct 28)
├─ ✅ Railway Deployment (Oct 28)
├─ ⏳ Age Verification (Nov 1-4)
└─ ⏳ Basic Admin Dashboard (Nov 5-12)

Phase 2: Core Features (4 weeks) - Oct 28 - Nov 25, 2025
├─ ✅ Pick Posting System (Oct 28)
├─ ✅ Feed & Filtering (Oct 28)
├─ ✅ Profile System (Oct 28)
├─ ✅ Settings System (Oct 28)
├─ ✅ Social Features (Oct 28)
├─ ✅ AI Analyst (Oct 28)
├─ ✅ User Search (Oct 28)
├─ ⚠️ Payment Infrastructure (Partial)
├─ ⏳ Stripe Connect (Nov 13-25) 🔴 CRITICAL
├─ ⏳ Sports Data API (Nov 26 - Dec 9) 🔴 CRITICAL
├─ ⏳ Timestamp Locking (Dec 10-13) 🔴 CRITICAL
├─ ⏳ Secure Blurred Preview (Dec 14-18)
└─ ⏳ Wallet System (Dec 19-24)

Phase 3: Security & Polish (3 weeks) - Dec 25 - Jan 15, 2026
├─ ✅ Basic Audit Logging (Oct 28)
├─ ✅ Email Notifications (Oct 28)
├─ ✅ Responsive Design (Oct 28)
├─ ⏳ Fraud Prevention (Jan 1-7) 🔴 CRITICAL
├─ ⏳ Reporting System (Jan 8-12) 🔴 CRITICAL
├─ ⏳ Enhanced Admin Dashboard (Jan 13-15) 🔴 CRITICAL
├─ ⏳ In-App Notifications (Jan 16-20)
└─ ⏳ Watermarking (Jan 21-25)

Phase 4: Launch (3 weeks) - Jan 26 - Feb 15, 2026
├─ ⏳ QA & Testing (Jan 26 - Feb 5)
├─ ⏳ Analytics Setup (Feb 6-8)
├─ ⏳ Production Deployment (Feb 9-11)
├─ ⏳ Documentation (Feb 12-14)
└─ ⏳ Training & Handoff (Feb 15)
```

**Total Timeline:** ~15 weeks from start to production launch

---

## Payment Structure

| Phase | Deliverables | Completion | Payment % | Amount Due Upon |
|-------|-------------|------------|-----------|----------------|
| **Phase 1** | Foundation & Architecture | 75% | **20%** | Age Verification + Basic Admin Dashboard complete |
| **Phase 2** | Core Product Features | 50% | **30%** | Stripe Connect + Sports API + Timestamp Locking complete |
| **Phase 3** | Security & Polish | 20% | **25%** | Fraud Prevention + Reporting + Enhanced Admin complete |
| **Phase 4** | Testing & Launch | 0% | **25%** | Production deployment + QA passed + Documentation delivered |

**Current Recommended Payment:** 15% (for Phase 1 work completed to date)

**Next Payment Trigger:** Upon completion of Age Verification and Basic Admin Dashboard

---

## Critical Path Items (Launch Blockers)

The following features **MUST** be completed before public launch:

1. ✅ **Database & Authentication** (Completed)
2. ✅ **Legal Compliance Pages** (Completed)
3. ⏳ **Age Verification** (In Progress) - Legal requirement
4. ⏳ **Stripe Connect** (Not Started) - Cannot pay creators without this
5. ⏳ **Admin Dashboard** (Not Started) - Cannot moderate platform
6. ⏳ **Timestamp Locking** (Not Started) - Prevents fraud
7. ⏳ **Sports Data API** (Not Started) - Enables automation
8. ⏳ **Fraud Prevention** (Not Started) - Anti-self-purchase, flagging
9. ⏳ **Reporting System** (Not Started) - User safety

**Estimated Time to Launch-Ready MVP:** 10-12 weeks from current date (mid-January 2026)

---

## Risk Assessment & Mitigation

### High-Risk Items

| Risk | Impact | Mitigation Strategy |
|------|--------|---------------------|
| **Stripe Connect Integration Delays** | Cannot launch; creators can't get paid | Start immediately; allocate 2 full weeks; test extensively in Stripe test mode |
| **Sports API Costs** | Monthly costs $500-$5000+ depending on provider | Budget accordingly; start with The Odds API (lower cost); implement caching |
| **Legal/Regulatory Issues** | Platform shutdown, lawsuits | Consult attorney before launch; implement robust age verification; clear ToS |
| **Fraud at Scale** | Platform reputation damage | Implement all fraud prevention measures before launch; monitor closely post-launch |
| **Payment Processing Issues** | Lost revenue, user trust | Extensive testing; Stripe test mode; small real transactions before full launch |

### Medium-Risk Items

| Risk | Impact | Mitigation Strategy |
|------|--------|---------------------|
| **Content Piracy** | Premium content shared freely | Watermarking, monitoring, ToS enforcement |
| **User Acquisition** | Low user base, poor network effects | Marketing budget; creator incentives; referral program |
| **Performance at Scale** | Slow load times, poor UX | Load testing; database optimization; CDN for assets |

### Low-Risk Items

| Risk | Impact | Mitigation Strategy |
|------|--------|---------------------|
| **Third-Party Service Downtime** | Temporary feature unavailability | Graceful degradation; status page; error handling |
| **Browser Compatibility** | Some users can't access | Cross-browser testing; progressive enhancement |

---

## Post-Launch Roadmap (Phase 5+)

### 30-Day Post-Launch Priorities
1. Monitor analytics and user feedback
2. Fix critical bugs and performance issues
3. Optimize conversion funnels based on data
4. Scale infrastructure if needed
5. Enhance fraud detection based on observed patterns

### Future Enhancements (3-6 Months)
1. **Mobile App** (iOS and Android via React Native or native)
2. **Advanced Analytics** for creators (deeper insights dashboard)
3. **Subscription Model** (monthly subscriptions to creators)
4. **Group/Community Features** (private prediction groups)
5. **Affiliate/Referral Program** (user acquisition incentives)
6. **Live Predictions** (in-game predictions)
7. **Parlay Builder** (multi-leg prediction tool)
8. **Social Sharing** (share picks to Twitter/Instagram)
9. **Push Notifications** (mobile app engagement)
10. **API for Third Parties** (sports app integrations)

---

## Success Metrics (KPIs)

### User Metrics
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- User retention (D1, D7, D30)
- Average session duration
- New user signups per day

### Engagement Metrics
- Picks posted per day
- Comments per pick
- Likes per pick
- Follows per user
- AI analyst queries per day

### Financial Metrics
- Total revenue (platform fees)
- Average revenue per user (ARPU)
- Creator earnings (total payouts)
- Average transaction value
- Wallet top-up conversion rate
- Premium pick unlock rate

### Content Metrics
- Pick accuracy rate (platform average)
- Picks verified per day
- Premium vs free pick ratio
- Top performing sports
- Top performing creators

### Platform Health
- Uptime (target: 99.9%+)
- API response times (target: <500ms)
- Error rate (target: <0.1%)
- Fraud reports per week
- Support tickets per week

---

## Developer Handoff Checklist

### Code Repository
- [ ] GitHub repository access granted to client
- [ ] All code committed with clear commit messages
- [ ] No sensitive credentials in code
- [ ] `.env.example` file with all required variables
- [ ] README.md updated with setup instructions

### Environment & Credentials
- [ ] Railway production environment access
- [ ] Railway development environment access
- [ ] PostgreSQL database credentials
- [ ] Stripe production keys and webhooks
- [ ] Stripe test keys (for future development)
- [ ] AWS S3 bucket and IAM credentials
- [ ] OpenAI API key and organization ID
- [ ] Sports data API credentials
- [ ] Email service (SMTP) credentials
- [ ] Domain registrar access
- [ ] Cloudflare/CDN access (if applicable)

### Platform Access
- [ ] PostHog analytics admin access
- [ ] Sentry error monitoring admin access
- [ ] Stripe Dashboard admin access
- [ ] AWS Console access
- [ ] Admin user account created on platform

### Documentation
- [ ] API documentation complete
- [ ] Admin user guide delivered
- [ ] Deployment guide delivered
- [ ] Database schema documentation
- [ ] Security & compliance guide
- [ ] Creator onboarding guide

### Training
- [ ] Admin dashboard training session completed
- [ ] Content moderation procedures explained
- [ ] Financial management training
- [ ] Emergency procedures documented

### Final Verification
- [ ] Production site live at edgebook.ai
- [ ] All critical features tested in production
- [ ] SSL certificate valid
- [ ] Analytics tracking verified
- [ ] Error monitoring active
- [ ] Email delivery working
- [ ] Payment flow tested (small real transaction)
- [ ] Client sign-off received

---

## General Terms & Conditions

### Work Scope
- All work performed on Railway environment unless mutually agreed otherwise
- Scope changes outside the four phases require written change order
- Weekly progress check-ins required (screenshots/demos)

### Intellectual Property
- All source code, designs, and data belong to EdgeBook.ai (Travis Shipley) upon final payment
- Developer retains no rights to codebase after handoff

### Version Control
- Developer maintains GitHub version control with clean commit history
- Branching strategy: `main` (production), `develop` (staging), `feature/*` branches
- No force pushes to main branch

### Payment Terms
- Payment milestones tied to deliverable completion and acceptance
- Acceptance criteria must be met before payment release
- Partial payment (15%) recommended for Phase 1 work already completed
- Net-15 payment terms upon invoice

### Support & Warranty
- 30-day bug fix warranty after final handoff (for bugs in delivered features)
- Post-launch support available via separate agreement
- Critical security issues addressed immediately

### Communication
- Weekly progress updates via email with screenshots
- Demo of working features upon request
- Response time for questions: within 24 hours

---

## Contact Information

**Client:**
Name: Travis Shipley
Email: [Client Email]
Platform: EdgeBook.ai

**Developer:**
Name: [Developer Name]
Email: [Developer Email]
GitHub: [Developer GitHub]

---

## Signatures

By signing below, both parties agree to the terms, timeline, deliverables, and payment structure outlined in this Scope of Work.

**Client Signature:**
___________________________
Name: Travis Shipley
Date: _______________

**Developer Signature:**
___________________________
Name: [Developer Name]
Date: _______________

---

**Document Version:** 2.0
**Last Updated:** October 29, 2025
**Status:** Active Development
**Next Review Date:** November 15, 2025

---

## Appendix A: Technology Stack Details

### Frontend Dependencies
```json
{
  "next": "14.2.0",
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "typescript": "5.3.0",
  "tailwindcss": "3.4.0",
  "lucide-react": "0.330.0",
  "react-hook-form": "7.50.0",
  "zod": "3.22.0",
  "@hookform/resolvers": "3.3.0",
  "date-fns": "3.0.0",
  "clsx": "2.1.0"
}
```

### Backend Dependencies
```json
{
  "next-auth": "4.24.0",
  "@next-auth/prisma-adapter": "1.0.7",
  "@prisma/client": "5.10.0",
  "bcryptjs": "2.4.3",
  "stripe": "14.0.0",
  "@stripe/stripe-js": "3.0.0",
  "openai": "4.0.0",
  "@aws-sdk/client-s3": "3.490.0",
  "nodemailer": "7.0.10",
  "otplib": "12.0.1",
  "qrcode": "1.5.4",
  "uuid": "9.0.1"
}
```

### Development Dependencies
```json
{
  "@types/node": "20.0.0",
  "@types/react": "18.2.0",
  "@types/react-dom": "18.2.0",
  "@types/bcryptjs": "2.4.0",
  "@types/nodemailer": "7.0.3",
  "@types/qrcode": "1.5.6",
  "@types/uuid": "9.0.7",
  "eslint": "8.0.0",
  "eslint-config-next": "14.2.0",
  "autoprefixer": "10.4.0",
  "postcss": "8.4.0",
  "prisma": "5.10.0"
}
```

---

## Appendix B: Environment Variables Reference

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/edgebook"

# NextAuth
NEXTAUTH_SECRET="[random-secret-key]"
NEXTAUTH_URL="https://edgebook.ai"

# Stripe
STRIPE_SECRET_KEY="sk_live_[key]"
STRIPE_PUBLISHABLE_KEY="pk_live_[key]"
STRIPE_WEBHOOK_SECRET="whsec_[secret]"
STRIPE_CONNECT_WEBHOOK_SECRET="whsec_[secret]"

# OpenAI
OPENAI_API_KEY="sk-[key]"

# AWS S3
AWS_ACCESS_KEY_ID="[key]"
AWS_SECRET_ACCESS_KEY="[secret]"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="edgebook-uploads"

# Email (Nodemailer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="[email]"
SMTP_PASS="[password]"
EMAIL_FROM="noreply@edgebook.ai"

# Sports Data API (to be configured)
SPORTS_API_KEY="[key]"
SPORTS_API_URL="[provider-url]"

# Analytics
NEXT_PUBLIC_POSTHOG_KEY="[key]"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# Error Monitoring
SENTRY_DSN="[dsn]"
SENTRY_AUTH_TOKEN="[token]"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="[id]"
GOOGLE_CLIENT_SECRET="[secret]"
FACEBOOK_CLIENT_ID="[id]"
FACEBOOK_CLIENT_SECRET="[secret]"
AZURE_AD_CLIENT_ID="[id]"
AZURE_AD_CLIENT_SECRET="[secret]"
AZURE_AD_TENANT_ID="[tenant]"
```

---

**END OF SCOPE OF WORK**
