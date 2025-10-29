'use client'

import { useEffect, useRef, useState } from 'react'
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

type AnimatedNumberProps = {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
  delay?: number
  className?: string
  formatter?: (value: number) => string
  isActive?: boolean
}

const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3)

function AnimatedNumber({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1000,
  delay = 0,
  className,
  formatter,
  isActive = true,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    if (!isActive) {
      setDisplayValue(value)
      return
    }

    let frameId: number | null = null
    let startTime: number | null = null
    const startValue = 0

    const step = (time: number) => {
      if (startTime === null) {
        startTime = time
      }

      const elapsed = time - startTime

      if (delay && elapsed < delay) {
        frameId = requestAnimationFrame(step)
        return
      }

      const rawProgress = (elapsed - delay) / duration
      const progress = Math.min(Math.max(rawProgress, 0), 1)
      const easedProgress = easeOutCubic(progress)
      const currentValue = startValue + (value - startValue) * easedProgress
      setDisplayValue(currentValue)

      if (progress < 1) {
        frameId = requestAnimationFrame(step)
      }
    }

    setDisplayValue(startValue)
    frameId = requestAnimationFrame(step)

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [value, duration, delay, isActive])

  const resolvedValue = formatter ? formatter(displayValue) : Number(displayValue).toFixed(decimals)

  return (
    <span className={className}>
      {prefix}
      {resolvedValue}
      {suffix}
    </span>
  )
}

function ProfileCardGlow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
    >
      <defs>
        <radialGradient id="card-glow-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#8B5CF6" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="card-glow-trail" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle cx="200" cy="200" r="130" fill="url(#card-glow-gradient)">
        <animate attributeName="r" values="120;180;120" dur="8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0.95;0.5" dur="6s" repeatCount="indefinite" />
      </circle>

      <path
        d="M40 280 C140 200 260 320 360 240"
        fill="none"
        stroke="url(#card-glow-trail)"
        strokeWidth="22"
        strokeLinecap="round"
        strokeOpacity="0.6"
      >
        <animate attributeName="stroke-width" values="18;30;18" dur="9s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.2;0.8;0.2" dur="5.5s" repeatCount="indefinite" />
      </path>

      <g opacity="0.7">
        <circle cx="120" cy="120" r="6" fill="#38BDF8">
          <animate attributeName="r" values="4;8;4" dur="4.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0.9;0.2" dur="4.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="300" cy="90" r="5" fill="#C084FC">
          <animate attributeName="r" values="3;7;3" dur="6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0.8;0.2" dur="6s" repeatCount="indefinite" />
        </circle>
        <circle cx="340" cy="300" r="7" fill="#22D3EE">
          <animate attributeName="r" values="5;9;5" dur="7s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0.8;0.2" dur="7s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  )
}

export default function Home() {
  const [isCardActive, setIsCardActive] = useState(false)
  const cardRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const node = cardRef.current

    if (!node) {
      setIsCardActive(true)
      return
    }

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsCardActive(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsCardActive(true)
            observer.disconnect()
          }
        })
      },
      {
        threshold: 0.35,
      }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  return (
    <div className="bg-white text-gray-900">
      <ComplianceConsent />
      <section className="border-b border-gray-200 bg-gradient-to-br from-white via-background to-white/70">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-11 lg:px-8 lg:py-24">
          <div className="lg:col-span-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              The social home for disciplined analysts
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Real records. Real community. Real edge.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
              EdgeBook lets you showcase every pick, surface your performance by sport, and sell premium insights to
              the community who cares about credibility. Build a public track record, grow your audience, and manage earnings
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
                  Connect your socials, grow followers inside EdgeBook, and let serious analysts subscribe to your feed.
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
            <div
              ref={cardRef}
              className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white/90 p-8 shadow-2xl shadow-primary/10 ring-1 ring-black/5 backdrop-blur transition-all duration-700 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_35px_90px_-25px_rgba(79,70,229,0.45)]"
            >
              <div className="pointer-events-none absolute -inset-14 opacity-70">
                <ProfileCardGlow />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-emerald-200/35 opacity-70 mix-blend-screen" />
              <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/30" />
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Public profile snapshot</p>
                    <h3 className="mt-1 text-xl font-semibold text-gray-900">Taylor Morgan</h3>
                    <p className="text-sm text-gray-500">NBA &amp; MLB specialist</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <AnimatedNumber
                      value={62}
                      suffix="% hit rate"
                      isActive={isCardActive}
                      delay={80}
                      formatter={(val) => Math.round(val).toString()}
                    />
                  </span>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-background p-4">
                    <p className="text-xs font-medium uppercase text-gray-500">Total picks</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      <AnimatedNumber value={248} isActive={isCardActive} delay={120} />
                    </p>
                    <p className="text-xs text-gray-500">82 premium • 166 free</p>
                  </div>
                  <div className="rounded-2xl bg-background p-4">
                    <p className="text-xs font-medium uppercase text-gray-500">Return on units</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      <AnimatedNumber value={38.6} decimals={1} prefix="+" isActive={isCardActive} delay={220} />
                    </p>
                    <p className="text-xs text-gray-500">
                      Best run:{' '}
                      <AnimatedNumber
                        value={12}
                        prefix="+"
                        suffix="u"
                        isActive={isCardActive}
                        delay={320}
                        formatter={(val) => Math.round(val).toString()}
                      />{' '}
                      last 30 days
                    </p>
                  </div>
                  <div className="rounded-2xl bg-background p-4">
                    <p className="text-xs font-medium uppercase text-gray-500">Followers</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      <AnimatedNumber
                        value={4832}
                        isActive={isCardActive}
                        delay={260}
                        formatter={(val) => Math.round(val).toLocaleString()}
                      />
                    </p>
                    <p className="text-xs text-gray-500">
                      Avg unlock rate{' '}
                      <AnimatedNumber
                        value={41}
                        suffix="%"
                        isActive={isCardActive}
                        delay={360}
                        formatter={(val) => Math.round(val).toString()}
                      />
                    </p>
                  </div>
                  <div className="rounded-2xl bg-background p-4">
                    <p className="text-xs font-medium uppercase text-gray-500">Sport breakdown</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      NBA{' '}
                      <AnimatedNumber
                        value={58}
                        suffix="%"
                        isActive={isCardActive}
                        delay={300}
                        formatter={(val) => Math.round(val).toString()}
                      />{' '}
                      • MLB{' '}
                      <AnimatedNumber
                        value={65}
                        suffix="%"
                        isActive={isCardActive}
                        delay={360}
                        formatter={(val) => Math.round(val).toString()}
                      />{' '}
                      • UFC{' '}
                      <AnimatedNumber
                        value={54}
                        suffix="%"
                        isActive={isCardActive}
                        delay={420}
                        formatter={(val) => Math.round(val).toString()}
                      />
                    </p>
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
                  <Link
                    href="/profile"
                    className="group inline-flex items-center gap-1 text-primary transition hover:text-primary-dark"
                  >
                    View profile
                    <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Why analysts rely on EdgeBook</p>
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
                Data that keeps analysts confident
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
                    Seasonal leaderboards spotlight trending analysts by accuracy, volume, and earnings to boost organic
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
                &ldquo;I stopped DM&rsquo;ing my slips because EdgeBook shows the full story—profit, loss, and sport-by-sport splits.
                The unlocks pay out weekly and I don&rsquo;t have to babysit spreadsheets anymore.&rdquo;
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
                &ldquo;I only pay for predictions when the numbers check out. EdgeBook makes it obvious: I can see unit
                history, accuracy by sport, and whether the creator actually beats the closing line.&rdquo;
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
              Responsible infrastructure from day one
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
              Sign up today, import your past results, and start sharing predictions with the community who cares about the
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
            Need help? Call 1-800-522-4700. Must be 18+ (or 21+ where required). Please play responsibly.
          </p>
        </div>
      </section>
    </div>
  )
}
