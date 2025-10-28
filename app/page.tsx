import Link from 'next/link'
import {
  Users,
  LineChart,
  CreditCard,
  ShieldCheck,
  Target,
  Trophy,
  BarChart3,
  ArrowRight,
  Wallet,
  Globe,
} from 'lucide-react'
import ComplianceConsent from '@/components/ComplianceConsent'

export default function Home() {
  return (
    <div className="bg-white text-gray-900">
      <ComplianceConsent />
      <section className="border-b border-gray-200 bg-gradient-to-br from-white via-background to-white/70">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-11 lg:px-8 lg:py-24">
          <div className="lg:col-span-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              The social home for disciplined bettors
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Real records. Real community. Real edge.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
              EdgeBook lets you showcase every pick, surface your performance by sport, and sell premium insights to
              bettors who care about credibility. Build a public track record, grow your audience, and manage earnings
              without the guesswork.
            </p>
            <ul className="mt-8 space-y-3 text-sm sm:text-base">
              <li className="flex items-start gap-3 text-gray-700">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                <span>
                  Every profile highlights accuracy rate, win/loss record, unit performance, sport splits, and lifetime
                  earnings.
                </span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <CreditCard className="mt-0.5 h-5 w-5 text-primary" />
                <span>
                  Offer free previews or pay-per-view picks with transparent pricing, instant unlocks, and transaction
                  receipts.
                </span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <Users className="mt-0.5 h-5 w-5 text-primary" />
                <span>
                  Connect your socials, grow followers inside EdgeBook, and let serious bettors subscribe to your feed.
                </span>
              </li>
            </ul>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-7 py-3 text-base font-semibold text-white shadow-md transition hover:bg-primary-dark hover:shadow-lg"
              >
                Create your profile
              </Link>
              <Link
                href="/feed"
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-7 py-3 text-base font-semibold text-gray-800 shadow-sm transition hover:border-primary hover:text-primary"
              >
                Explore public picks
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Free to join • No credit card required • Cancel anytime
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-3xl border border-gray-200 bg-white/90 p-8 shadow-2xl shadow-primary/10 ring-1 ring-black/5 backdrop-blur">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Public profile snapshot</p>
                  <h3 className="mt-1 text-xl font-semibold text-gray-900">Taylor Morgan</h3>
                  <p className="text-sm text-gray-500">NBA &amp; MLB specialist</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">62% hit rate</span>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-medium uppercase text-gray-500">Total picks</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">248</p>
                  <p className="text-xs text-gray-500">82 premium • 166 free</p>
                </div>
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-medium uppercase text-gray-500">Return on units</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">+38.6</p>
                  <p className="text-xs text-gray-500">Best run: +12u last 30 days</p>
                </div>
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-medium uppercase text-gray-500">Followers</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">4,832</p>
                  <p className="text-xs text-gray-500">Avg unlock rate 41%</p>
                </div>
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-medium uppercase text-gray-500">Sport breakdown</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">NBA 58% • MLB 65% • UFC 54%</p>
                  <p className="text-xs text-gray-500">Updated after every result</p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">Latest premium picks</p>
                <div className="mt-3 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Dodgers @ Braves — Moneyline</span>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">$11 unlock</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Timberwolves +3.5 — Spread</span>
                    <span className="text-xs font-semibold text-gray-500">Unlocked by you</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Red Sox @ Yankees — Over 8.5</span>
                    <span className="text-xs font-semibold text-gray-500">Pending • 2u</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                <span>Transaction history &amp; wallet balance synced in real time</span>
                <Link href="/profile" className="inline-flex items-center gap-1 text-primary transition hover:text-primary-dark">
                  View profile
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Why bettors rely on EdgeBook</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Built around the way serious handicappers actually work
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Whether you&apos;re publishing picks or paying to unlock them, EdgeBook keeps every action verifiable and
              easy to follow.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Profiles built on proof</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Highlight your bio, socials, and verified stats so members can judge credibility at a glance.
              </p>
            </div>

            <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Prediction posts that convert</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Offer free previews, blur premium analysis, attach receipts, and track performance by sport category.
              </p>
            </div>

            <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Wallet &amp; payouts under control</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Members top up balances, confirm purchases, and review every transaction or viewing history from one
                ledger.
              </p>
            </div>

            <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <LineChart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Discovery that feels familiar</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Scroll feeds by following, global, or algorithmic views, then filter by sport, pricing, or top performers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-b border-gray-200 bg-background py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Your workflow</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need from signup to settled bets
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              No mock screenshots or vague promises—here&apos;s what you can manage inside EdgeBook on day one.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">Step 1</span>
              <h3 className="mt-3 text-xl font-semibold text-gray-900">Standout profile</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Upload a headshot, write a sharp bio, connect Instagram, YouTube, and Discord, and let your follower
                metrics speak for themselves.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li>• Accuracy, win/loss, and units auto-update</li>
                <li>• Sport category performance at a glance</li>
                <li>• Earnings and spending history for transparency</li>
              </ul>
            </div>

            <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">Step 2</span>
              <h3 className="mt-3 text-xl font-semibold text-gray-900">Publish the goods</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Post predictions with odds, stakes, and reasoning. Sell premium analysis or keep posts free for reach—the
                unlock flow is handled for you.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li>• Blurred previews until purchase is confirmed</li>
                <li>• Attach screenshots, models, or video breakdowns</li>
                <li>• Automatic result grading: pending, win, loss, push</li>
              </ul>
            </div>

            <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">Step 3</span>
              <h3 className="mt-3 text-xl font-semibold text-gray-900">Get paid responsibly</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Top up wallets securely, trigger payouts on your schedule, and keep every ledger ready for tax season and
                compliance.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li>• Stripe-backed payment rails with PayPal support</li>
                <li>• Dispute handling and optional refund workflows</li>
                <li>• Exportable transaction history and receipts</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">Proof in numbers</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Data that keeps bettors confident
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                EdgeBook tracks the metrics that actually matter so creators can demonstrate their edge and buyers know
                what they&apos;re paying for.
              </p>
            </div>
            <div className="lg:col-span-2">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Accuracy</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">Series, season, lifetime</p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    Break down your win rate by league, bet type, or time period. Pending, won, lost, and void statuses
                    update automatically.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Bankroll</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">Units &amp; ROI tracking</p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    Visualize performance against units risked. Watch ROI trends to understand streaks and long-term
                    profitability.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Community</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">Followers &amp; unlocks</p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    Track who follows, purchases, and re-ups so you can reward loyalty and run targeted promotions.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Recognition</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">Leaderboards &amp; awards</p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    Seasonal leaderboards spotlight trending bettors by accuracy, volume, and earnings to boost organic
                    discovery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-b border-gray-200 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 bg-background p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-primary" />
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">From the community</p>
              </div>
              <blockquote className="mt-6 text-lg leading-relaxed text-gray-700">
                “I stopped DM’ing my slips because EdgeBook shows the full story—profit, loss, and sport-by-sport splits.
                The unlocks pay out weekly and I don’t have to babysit spreadsheets anymore.”
              </blockquote>
              <div className="mt-6 text-sm text-gray-500">
                <p className="font-semibold text-gray-800">Jordan P. — NHL &amp; MLB handicapper</p>
                <p>4.4k followers • 58% lifetime accuracy • Member since 2023</p>
              </div>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-background p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-primary" />
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Buyer perspective</p>
              </div>
              <blockquote className="mt-6 text-lg leading-relaxed text-gray-700">
                “I only pay for predictions when the numbers check out. EdgeBook makes it obvious: I can see unit
                history, accuracy by sport, and whether the creator actually beats the closing line.”
              </blockquote>
              <div className="mt-6 text-sm text-gray-500">
                <p className="font-semibold text-gray-800">Melissa R. — Verified subscriber</p>
                <p>$240 lifetime spend • 19 paid creators followed • Daily notification digest</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Compliance &amp; trust</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Responsible betting infrastructure from day one
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              EdgeBook operates with licensing, age verification, and responsible gaming controls in mind so creators and
              buyers stay protected.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <ShieldCheck className="h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Age &amp; identity checks</h3>
                <p className="mt-2 text-sm text-gray-600">
                  18+ verification, optional ID upload, and regional controls keep the platform compliant with
                  jurisdictional rules.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <CreditCard className="h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Payment transparency</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Every top-up, unlock, and payout is receipted. EdgeBook fees are disclosed up front with clear dispute
                  flows.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <Globe className="h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Territory aware</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Support for geo restrictions, privacy requests, and data exports keeps us ready for GDPR, CCPA, and
                  local regulations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <Users className="h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Responsible gaming toolkit</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Self-exclusion, spending limits, and direct links to support resources help members stay in control of
                  their bankroll.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-10 text-center text-xs text-gray-500">
            EdgeBook is not a sportsbook. For entertainment and informational purposes only. Winnings are never
            guaranteed.
          </p>
        </div>
      </section>

      <section className="bg-gray-900 py-20 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center shadow-2xl backdrop-blur">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to build your EdgeBook presence?</h2>
            <p className="mt-4 text-lg text-white/80">
              Sign up today, import your past results, and start sharing predictions with the bettors who care about the
              numbers.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-base font-semibold text-white shadow-md transition hover:bg-primary-dark hover:shadow-lg"
              >
                Launch my profile
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 px-8 py-3 text-base font-semibold text-white transition hover:border-white"
              >
                I already have an account
              </Link>
            </div>
            <p className="mt-6 text-xs text-white/60">
              Need a closer look? Join our next live walkthrough or request onboarding support after signup.
            </p>
          </div>
          <p className="mt-10 text-center text-xs text-white/50">
            Gambling problem? Call 1-800-522-4700. Must be 18+ (or 21+ where required). Please wager responsibly.
          </p>
        </div>
      </section>
    </div>
  )
}
