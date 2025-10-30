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
    <main className="bg-white text-gray-900">
      <ComplianceConsent />
      <section className="relative border-b border-gray-800 bg-gradient-to-br from-[#092045] via-[#0b274d] to-[#092045] overflow-hidden" aria-label="Hero section">
        {/* White accent spread from top */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/25 via-white/10 via-30% to-transparent to-60%" />

        {/* Additional white accent from left */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_left,_var(--tw-gradient-stops))] from-white/15 via-transparent via-25% to-transparent" />

        {/* Subtle green accent in bottom right corner */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#206344]/12 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Think you&rsquo;ve got the edge? Prove it!
            </h1>
            <p className="mx-auto mt-8 sm:mt-14 max-w-3xl text-base sm:text-lg md:text-xl text-gray-200 px-4">
              Showcase your sports picks, track performance results, and earn money from your prediction insights across NBA, NFL, MLB, UFC and more
            </p>
            <nav className="mt-8 sm:mt-14 flex flex-col items-center gap-4 sm:flex-row sm:justify-center px-4" aria-label="Primary actions">
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-primary px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-md transition hover:bg-primary-dark hover:shadow-lg"
                aria-label="Sign up for free EdgeBook account"
              >
                Start Your Free Profile
              </Link>
              <Link
                href="/feed"
                className="text-sm sm:text-base font-semibold text-white transition hover:text-gray-300"
                aria-label="Browse public sports picks"
              >
                Browse Public Picks
              </Link>
            </nav>
          </div>

          {/* Profile Card - Horizontal Layout */}
          <div className="mt-12 sm:mt-20 lg:mt-40">
            <div
              ref={cardRef}
              className="relative mx-auto max-w-3xl overflow-hidden rounded-xl border border-gray-200 bg-white/90 p-4 sm:p-5 shadow-lg shadow-primary/10 ring-1 ring-black/5 backdrop-blur transition-all duration-700 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_15px_45px_-10px_rgba(79,70,229,0.3)]"
            >
              <div className="pointer-events-none absolute -inset-8 opacity-50">
                <ProfileCardGlow />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-200/15 opacity-50 mix-blend-screen" />
              <div className="pointer-events-none absolute inset-0 rounded-xl border border-white/30" />
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 sm:gap-0">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Public profile snapshot</p>
                    <h3 className="mt-1 text-base font-semibold text-gray-900">Taylor Morgan</h3>
                    <p className="text-xs text-gray-500">NBA &amp; MLB specialist</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary whitespace-nowrap">
                    <AnimatedNumber
                      value={62}
                      suffix="% hit rate"
                      isActive={isCardActive}
                      delay={80}
                      formatter={(val) => Math.round(val).toString()}
                    />
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:grid-cols-4">
                  <div className="rounded-lg bg-background p-2.5">
                    <p className="text-xs font-medium uppercase text-gray-500">Total picks</p>
                    <p className="mt-0.5 text-lg font-semibold text-gray-900">
                      <AnimatedNumber value={248} isActive={isCardActive} delay={120} />
                    </p>
                    <p className="text-xs text-gray-500">82 premium • 166 free</p>
                  </div>
                  <div className="rounded-lg bg-background p-2.5">
                    <p className="text-xs font-medium uppercase text-gray-500">Return on units</p>
                    <p className="mt-0.5 text-lg font-semibold text-gray-900">
                      <AnimatedNumber value={38.6} decimals={1} prefix="+" isActive={isCardActive} delay={220} />
                    </p>
                    <p className="text-xs text-gray-500">
                      Best run: +
                      <AnimatedNumber
                        value={12}
                        suffix="u"
                        isActive={isCardActive}
                        delay={320}
                        formatter={(val) => Math.round(val).toString()}
                      />
                    </p>
                  </div>
                  <div className="rounded-lg bg-background p-2.5">
                    <p className="text-xs font-medium uppercase text-gray-500">Followers</p>
                    <p className="mt-0.5 text-lg font-semibold text-gray-900">
                      <AnimatedNumber
                        value={4832}
                        isActive={isCardActive}
                        delay={260}
                        formatter={(val) => Math.round(val).toLocaleString()}
                      />
                    </p>
                    <p className="text-xs text-gray-500">
                      Avg unlock{' '}
                      <AnimatedNumber
                        value={41}
                        suffix="%"
                        isActive={isCardActive}
                        delay={360}
                        formatter={(val) => Math.round(val).toString()}
                      />
                    </p>
                  </div>
                  <div className="rounded-lg bg-background p-2.5">
                    <p className="text-xs font-medium uppercase text-gray-500">Sport breakdown</p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-900">
                      NBA{' '}
                      <AnimatedNumber
                        value={58}
                        suffix="%"
                        isActive={isCardActive}
                        delay={300}
                        formatter={(val) => Math.round(val).toString()}
                      />
                    </p>
                    <p className="text-xs text-gray-500">
                      MLB{' '}
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
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-gray-200 bg-white p-2.5">
                  <p className="text-xs font-semibold uppercase text-gray-500">Latest premium picks</p>
                  <div className="mt-2 space-y-1.5 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Dodgers @ Braves — Moneyline</span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">$11 unlock</span>
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

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>Transaction history &amp; wallet balance synced in real time</span>
                  <Link
                    href="/profile"
                    className="group inline-flex items-center gap-1 text-primary transition hover:text-primary-dark"
                  >
                    View profile
                    <ArrowRight className="h-3 w-3 transition-transform duration-500 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20" aria-labelledby="features-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="features-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              Built for sports fans who predict outcomes
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600 px-4">
              Post picks, share your card, prove your record, sell your insights.
            </p>
          </div>

          <div className="mt-8 sm:mt-12 lg:mt-16 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
            <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10" aria-hidden="true">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 sm:mt-6 text-lg sm:text-xl font-semibold text-gray-900">Profiles built on proof</h3>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base leading-relaxed text-gray-600">
                Build trust instantly. Show your bio, socials, and verified stats so followers know your record is real.
              </p>
            </article>

            <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10" aria-hidden="true">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 sm:mt-6 text-lg sm:text-xl font-semibold text-gray-900">Prediction posts that sell</h3>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base leading-relaxed text-gray-600">
                Post free teasers or premium picks with proof of performance. Every result can be tracked for public record.
              </p>
            </article>

            <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10" aria-hidden="true">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 sm:mt-6 text-lg sm:text-xl font-semibold text-gray-900">Payouts Simplified</h3>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base leading-relaxed text-gray-600">
                Track earnings, create both subscriptions and per pick paywalls. All from one transparent dashboard.
              </p>
            </article>

            <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10" aria-hidden="true">
                <LineChart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 sm:mt-6 text-lg sm:text-xl font-semibold text-gray-900">Smart discovery for fans</h3>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base leading-relaxed text-gray-600">
                Get discovered by followers, sort by sport or top earners, and rise up the leaderboard with every winning pick.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="border-t border-b border-gray-200 bg-background py-12 sm:py-16 lg:py-20" aria-labelledby="how-it-works-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="how-it-works-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              Post. Prove. Profit
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600 px-4">
              Three steps from talking picks to earning from them.
            </p>
          </div>

          <div className="mt-8 sm:mt-10 lg:mt-14 grid gap-6 md:grid-cols-3">
            <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">Step 1</span>
              <h3 className="mt-3 text-lg sm:text-xl font-semibold text-gray-900">Build your edge</h3>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-gray-600">
                Upload your photo, craft your bio, and connect socials. Turn your record into your reputation.
              </p>
              <ul className="mt-4 space-y-2 text-sm sm:text-base text-gray-600">
                <li>• Win/loss tracking</li>
                <li>• Performance by sport</li>
                <li>• Verified credibility from day one</li>
              </ul>
            </div>

            <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">Step 2</span>
              <h3 className="mt-3 text-lg sm:text-xl font-semibold text-gray-900">Share your picks</h3>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-gray-600">
                Post predictions with odds, notes, and confidence levels. Offer free insights or premium picks that unlock instantly when purchased.
              </p>
              <ul className="mt-4 space-y-2 text-sm sm:text-base text-gray-600">
                <li>• Blurred previews for premium content</li>
                <li>• Upload models, screenshots, or clips</li>
                <li>• Grade your results (win/loss/push)</li>
              </ul>
            </div>

            <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">Step 3</span>
              <h3 className="mt-3 text-lg sm:text-xl font-semibold text-gray-900">Get paid for your reputation</h3>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-gray-600">
                Earn directly from your audience through a transparent platform and payout system.
              </p>
              <ul className="mt-4 space-y-2 text-sm sm:text-base text-gray-600">
                <li>• Instant payment support</li>
                <li>• Manage and track earnings</li>
                <li>• Download all transactions</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 sm:mt-12 lg:mt-16 flex justify-center px-4">
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 via-white to-gray-50 px-6 sm:px-8 md:px-12 py-6 sm:py-8 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50" />
              <p className="relative text-center text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                It&rsquo;s <span className="text-primary">YOUR</span> edge <span className="mx-2 sm:mx-3 text-gray-400">|</span> we make it <span className="text-primary">official</span>
              </p>
            </div>
          </div>
        </div>
      </section>


      <section className="bg-background py-12 sm:py-16 lg:py-20" aria-labelledby="trust-heading">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="trust-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              Built on trust.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600 px-4">
              EdgeBook runs on transparency, security, and fair play, so creators and fans can focus on what matters: the picks.
            </p>
          </div>

          <div className="mt-8 sm:mt-10 lg:mt-14 grid gap-6 md:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
              <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-primary" />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Age</h3>
                <p className="mt-2 text-sm sm:text-base text-gray-600">
                  18+ verification to ensure safeguards are in place. Keeping the community credible and compliant
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
              <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-primary" />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Transparent payments</h3>
                <p className="mt-2 text-sm sm:text-base text-gray-600">
                  Every top-up, unlock, and payout is tracked in your dashboard with zero hidden fees and instant digital receipts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
              <Globe className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-primary" />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Territory protection</h3>
                <p className="mt-2 text-sm sm:text-base text-gray-600">
                  EdgeBook adapts to your region, respecting privacy laws while keeping your data under your control.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-primary" />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Responsible gaming tools</h3>
                <p className="mt-2 text-sm sm:text-base text-gray-600">
                  EdgeBook is built to help you make smart decisions by giving you transparency in all public opinion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-900 py-12 sm:py-16 lg:py-20 text-white" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 md:p-10 text-center shadow-2xl backdrop-blur">
            <h2 id="cta-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              Join the community where picks become proof.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/80 px-4">
              Create your profile, post your first picks, and let your record do the talking.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-primary px-6 sm:px-8 py-3 text-sm sm:text-base font-semibold text-white shadow-md transition hover:bg-primary-dark hover:shadow-lg"
              >
                Start Free Today
              </Link>
              <Link
                href="/auth/signin"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-white/30 px-6 sm:px-8 py-3 text-sm sm:text-base font-semibold text-white transition hover:border-white"
              >
                Sign In to EdgeBook
              </Link>
            </div>
            <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-white/60">
              18+ only. For entertainment and educational use.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
