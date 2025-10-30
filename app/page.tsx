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
      <section className="border-b border-gray-200 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-emerald-50/20">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="text-center">
            <h1 className="whitespace-nowrap text-heading-1 text-gray-900">
              Think you&rsquo;ve got the edge? Prove it!
            </h1>
            <p className="mx-auto mt-14 max-w-3xl text-subheader-2 text-gray-600">
              Showcase your picks, track results, and earn from your insight
            </p>
            <div className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-semibold text-white shadow-md transition hover:bg-primary-dark hover:shadow-lg"
              >
                Start Your Free Profile
              </Link>
              <Link
                href="/feed"
                className="text-base font-semibold text-gray-700 transition hover:text-primary"
              >
                Browse Public Picks
              </Link>
            </div>
          </div>

          {/* Profile Card - Horizontal Layout */}
          <div className="mt-40">
            <div
              ref={cardRef}
              className="relative mx-auto max-w-3xl overflow-hidden rounded-xl border border-gray-200 bg-white/90 p-5 shadow-lg shadow-primary/10 ring-1 ring-black/5 backdrop-blur transition-all duration-700 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_15px_45px_-10px_rgba(79,70,229,0.3)]"
            >
              <div className="pointer-events-none absolute -inset-8 opacity-50">
                <ProfileCardGlow />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-200/15 opacity-50 mix-blend-screen" />
              <div className="pointer-events-none absolute inset-0 rounded-xl border border-white/30" />
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Public profile snapshot</p>
                    <h3 className="mt-1 text-base font-semibold text-gray-900">Taylor Morgan</h3>
                    <p className="text-xs text-gray-500">NBA &amp; MLB specialist</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    <AnimatedNumber
                      value={62}
                      suffix="% hit rate"
                      isActive={isCardActive}
                      delay={80}
                      formatter={(val) => Math.round(val).toString()}
                    />
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
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

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-heading-2 text-gray-900">
              Built for sports fans who predict outcomes
            </h2>
            <p className="mt-4 text-paragraph-1 text-gray-600">
              Post picks, share your card, prove your record, sell your insights.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-6 text-subheader-2 text-gray-900">Profiles built on proof</h3>
              <p className="mt-3 text-paragraph-2 leading-relaxed text-gray-600">
                Build trust instantly. Show your bio, socials, and verified stats so followers know your record is real.
              </p>
            </div>

            <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-6 text-subheader-2 text-gray-900">Prediction posts that sell</h3>
              <p className="mt-3 text-paragraph-2 leading-relaxed text-gray-600">
                Post free teasers or premium picks with proof of performance. Every result can be tracked for public record.
              </p>
            </div>

            <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-6 text-subheader-2 text-gray-900">Payouts Simplified</h3>
              <p className="mt-3 text-paragraph-2 leading-relaxed text-gray-600">
                Track earnings, create both subscriptions and per pick paywalls. All from one transparent dashboard.
              </p>
            </div>

            <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <LineChart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-6 text-subheader-2 text-gray-900">Smart discovery for fans</h3>
              <p className="mt-3 text-paragraph-2 leading-relaxed text-gray-600">
                Get discovered by followers, sort by sport or top earners, and rise up the leaderboard with every winning pick.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-b border-gray-200 bg-background py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-heading-2 text-gray-900">
              Post. Prove. Profit
            </h2>
            <p className="mt-4 text-paragraph-1 text-gray-600">
              Three steps from talking picks to earning from them.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">Step 1</span>
              <h3 className="mt-3 text-subheader-2 text-gray-900">Build your edge</h3>
              <p className="mt-3 text-paragraph-2 leading-relaxed text-gray-600">
                Upload your photo, craft your bio, and connect socials. Turn your record into your reputation.
              </p>
              <ul className="mt-4 space-y-2 text-paragraph-2 text-gray-600">
                <li>• Win/loss tracking</li>
                <li>• Performance by sport</li>
                <li>• Verified credibility from day one</li>
              </ul>
            </div>

            <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">Step 2</span>
              <h3 className="mt-3 text-subheader-2 text-gray-900">Share your picks</h3>
              <p className="mt-3 text-paragraph-2 leading-relaxed text-gray-600">
                Post predictions with odds, notes, and confidence levels. Offer free insights or premium picks that unlock instantly when purchased.
              </p>
              <ul className="mt-4 space-y-2 text-paragraph-2 text-gray-600">
                <li>• Blurred previews for premium content</li>
                <li>• Upload models, screenshots, or clips</li>
                <li>• Grade your results (win/loss/push)</li>
              </ul>
            </div>

            <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">Step 3</span>
              <h3 className="mt-3 text-subheader-2 text-gray-900">Get paid for your reputation</h3>
              <p className="mt-3 text-paragraph-2 leading-relaxed text-gray-600">
                Earn directly from your audience through a transparent platform and payout system.
              </p>
              <ul className="mt-4 space-y-2 text-paragraph-2 text-gray-600">
                <li>• Instant payment support</li>
                <li>• Manage and track earnings</li>
                <li>• Download all transactions</li>
              </ul>
            </div>
          </div>

          <div className="mt-16 flex justify-center">
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 via-white to-gray-50 px-12 py-8 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50" />
              <p className="relative text-center text-2xl font-bold text-gray-900">
                It&rsquo;s <span className="text-primary">YOUR</span> edge <span className="mx-3 text-gray-400">|</span> we make it <span className="text-primary">official</span>
              </p>
            </div>
          </div>
        </div>
      </section>


      <section className="bg-background py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-heading-2 text-gray-900">
              Built on trust.
            </h2>
            <p className="mt-4 text-paragraph-1 text-gray-600">
              EdgeBook runs on transparency, security, and fair play, so creators and fans can focus on what matters: the picks.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <ShieldCheck className="h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <h3 className="text-subheader-2 text-gray-900">Age</h3>
                <p className="mt-2 text-paragraph-2 text-gray-600">
                  18+ verification to ensure safeguards are in place. Keeping the community credible and compliant
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <CreditCard className="h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <h3 className="text-subheader-2 text-gray-900">Transparent payments</h3>
                <p className="mt-2 text-paragraph-2 text-gray-600">
                  Every top-up, unlock, and payout is tracked in your dashboard with zero hidden fees and instant digital receipts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <Globe className="h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <h3 className="text-subheader-2 text-gray-900">Territory protection</h3>
                <p className="mt-2 text-paragraph-2 text-gray-600">
                  EdgeBook adapts to your region, respecting privacy laws while keeping your data under your control.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <Users className="h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <h3 className="text-subheader-2 text-gray-900">Responsible gaming tools</h3>
                <p className="mt-2 text-paragraph-2 text-gray-600">
                  EdgeBook is built to help you make smart decisions by giving you transparency in all public opinion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-900 py-20 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center shadow-2xl backdrop-blur">
            <h2 className="text-heading-2">
              Join the community where picks become proof.
            </h2>
            <p className="mt-4 text-paragraph-1 text-white/80">
              Create your profile, post your first picks, and let your record do the talking.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-base font-semibold text-white shadow-md transition hover:bg-primary-dark hover:shadow-lg"
              >
                Start Free Today
              </Link>
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 px-8 py-3 text-base font-semibold text-white transition hover:border-white"
              >
                Sign In to EdgeBook
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/60">
              18+ only. For entertainment and educational use.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
