'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Users,
  LineChart,
  CreditCard,
  ShieldCheck,
  Target,
  ArrowRight,
  Wallet,
  Globe,
  QrCode,
  DollarSign,
  TrendingUp,
  Eye,
  ShoppingCart,
  Award,
  UserPlus,
  Percent,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
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
  const [displayValue, setDisplayValue] = useState(0)

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

    setDisplayValue(0)
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

type AnimatedTextProps = {
  text: string
  className?: string
  isActive?: boolean
}

function AnimatedText({ text, className, isActive = true }: AnimatedTextProps) {
  return (
    <span className={className}>
      {text.split('').map((char, index) => (
        <span
          key={`${char}-${index}`}
          className="inline-block overflow-hidden"
          style={{
            height: '1.2em',
            lineHeight: '1.2em'
          }}
        >
          <span
            className="inline-block"
            style={{
              animation: isActive ? `rollUp 0.5s ease-out ${index * 0.04}s both` : 'none',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        </span>
      ))}
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

type ExpertProfile = {
  name: string
  sports: string
  hitRate: number
  earnings: number
  winRate: number
  settledPicks: number
  correctPicks: number
  totalPicks: number
  record: string
  sportStats: Array<{
    name: string
    percentage: number
    record: string
  }>
  isPremium: boolean
  picks?: string[]
}

const EXPERT_PROFILES: ExpertProfile[] = [
  {
    name: 'Taylor Morgan',
    sports: 'NBA & MLB specialist',
    hitRate: 62,
    earnings: 3450,
    winRate: 62,
    settledPicks: 154,
    correctPicks: 154,
    totalPicks: 248,
    record: '154-94',
    sportStats: [
      { name: 'NBA', percentage: 58, record: '42-30' },
      { name: 'MLB', percentage: 65, record: '78-42' },
      { name: 'UFC', percentage: 54, record: '34-22' },
    ],
    isPremium: true,
  },
  {
    name: 'Marcus Rodriguez',
    sports: 'NFL & NBA expert',
    hitRate: 67,
    earnings: 8920,
    winRate: 67,
    settledPicks: 210,
    correctPicks: 210,
    totalPicks: 315,
    record: '210-105',
    sportStats: [
      { name: 'NFL', percentage: 71, record: '89-36' },
      { name: 'NBA', percentage: 64, record: '96-54' },
      { name: 'MLB', percentage: 62, record: '25-15' },
    ],
    isPremium: false,
    picks: ['Chiefs -3.5 vs Bills — Spread', 'Lakers ML @ Warriors — Moneyline', '49ers @ Cowboys — Under 47.5'],
  },
  {
    name: 'Sarah Chen',
    sports: 'MLB & UFC specialist',
    hitRate: 59,
    earnings: 5680,
    winRate: 59,
    settledPicks: 182,
    correctPicks: 182,
    totalPicks: 308,
    record: '182-126',
    sportStats: [
      { name: 'MLB', percentage: 63, record: '118-69' },
      { name: 'UFC', percentage: 57, record: '48-36' },
      { name: 'NBA', percentage: 52, record: '16-21' },
    ],
    isPremium: true,
  },
  {
    name: 'James Thompson',
    sports: 'NHL & NBA analyst',
    hitRate: 64,
    earnings: 6240,
    winRate: 64,
    settledPicks: 145,
    correctPicks: 145,
    totalPicks: 227,
    record: '145-82',
    sportStats: [
      { name: 'NHL', percentage: 68, record: '75-35' },
      { name: 'NBA', percentage: 60, record: '58-39' },
      { name: 'NFL', percentage: 60, record: '12-8' },
    ],
    isPremium: false,
    picks: ['Avalanche ML vs Maple Leafs — Moneyline', 'Celtics -5.5 @ Heat — Spread', 'Oilers @ Bruins — Over 6.5'],
  },
  {
    name: 'Alex Rivera',
    sports: 'NFL & MLB pro',
    hitRate: 70,
    earnings: 12450,
    winRate: 70,
    settledPicks: 268,
    correctPicks: 268,
    totalPicks: 383,
    record: '268-115',
    sportStats: [
      { name: 'NFL', percentage: 73, record: '142-52' },
      { name: 'MLB', percentage: 68, record: '108-51' },
      { name: 'UFC', percentage: 64, record: '18-12' },
    ],
    isPremium: true,
  },
  {
    name: 'Jordan Lee',
    sports: 'UFC & Boxing expert',
    hitRate: 61,
    earnings: 4890,
    winRate: 61,
    settledPicks: 127,
    correctPicks: 127,
    totalPicks: 208,
    record: '127-81',
    sportStats: [
      { name: 'UFC', percentage: 65, record: '78-42' },
      { name: 'Boxing', percentage: 59, record: '39-27' },
      { name: 'NBA', percentage: 55, record: '10-12' },
    ],
    isPremium: false,
    picks: ['Jones by KO/TKO — Method', 'Canelo ML vs Charlo — Moneyline', 'Adesanya ITD @ -110 — Prop'],
  },
]

export default function Home() {
  const [isCardActive, setIsCardActive] = useState(false)
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop')
  const cardRef = useRef<HTMLDivElement | null>(null)
  const { data: session } = useSession()
  const router = useRouter()

  const handlePickClick = () => {
    if (session) {
      router.push('/feed')
    } else {
      router.push('/auth/signin')
    }
  }

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

  // Auto-rotation effect
  useEffect(() => {
    if (!isCardActive) return

    const rotationInterval = setInterval(() => {
      setIsTransitioning(true)

      setTimeout(() => {
        setCurrentProfileIndex((prev) => (prev + 1) % EXPERT_PROFILES.length)
        setIsTransitioning(false)
      }, 300)
    }, 5000) // Rotate every 5 seconds

    return () => clearInterval(rotationInterval)
  }, [isCardActive])

  const currentProfile = EXPERT_PROFILES[currentProfileIndex]

  return (
    <main className="bg-white text-gray-900">
      <style jsx global>{`
        @keyframes rollUp {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
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
                    <h3 className="mt-1 text-base font-semibold text-gray-900">
                      <AnimatedText
                        key={`name-${currentProfileIndex}`}
                        text={currentProfile.name}
                        isActive={!isTransitioning}
                      />
                    </h3>
                    <p className={`text-xs text-gray-500 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                      {currentProfile.sports}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary whitespace-nowrap">
                    <AnimatedNumber
                      value={currentProfile.hitRate}
                      suffix="% hit rate"
                      isActive={isCardActive}
                      delay={80}
                      duration={800}
                      formatter={(val) => Math.round(val).toString()}
                    />
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-2.5 border border-emerald-200/50">
                    <p className="text-xs font-semibold uppercase text-emerald-700">Total Earnings</p>
                    <p className="mt-0.5 text-xl font-bold text-emerald-600">
                      <AnimatedNumber value={currentProfile.earnings} prefix="$" isActive={isCardActive} delay={120} duration={800} formatter={(val) => Math.round(val).toLocaleString()} />
                    </p>
                    <p className="text-xs text-emerald-600/80">Net profit</p>
                  </div>
                  <div className="rounded-lg bg-background p-2.5 border border-gray-200">
                    <p className="text-xs font-semibold uppercase text-gray-600">Win Rate</p>
                    <p className="mt-0.5 text-xl font-bold text-gray-900">
                      <AnimatedNumber value={currentProfile.winRate} suffix="%" isActive={isCardActive} delay={220} duration={800} />
                    </p>
                    <p className={`text-xs text-gray-500 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                      {currentProfile.settledPicks} settled picks
                    </p>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 p-2.5 border border-blue-200/50">
                    <p className="text-xs font-semibold uppercase text-blue-700">Correct Picks</p>
                    <p className="mt-0.5 text-xl font-bold text-blue-600">
                      <AnimatedNumber value={currentProfile.correctPicks} isActive={isCardActive} delay={260} duration={800} />
                    </p>
                    <p className="text-xs text-blue-600/80">Winning predictions</p>
                  </div>
                  <div className="rounded-lg bg-background p-2.5 border border-gray-200">
                    <p className="text-xs font-semibold uppercase text-gray-600">Total Picks</p>
                    <p className="mt-0.5 text-xl font-bold text-gray-900">
                      <AnimatedNumber value={currentProfile.totalPicks} isActive={isCardActive} delay={300} duration={800} />
                    </p>
                    <p className={`text-xs text-gray-500 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                      {currentProfile.record} record
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-lg bg-white/50 px-2 py-1.5 border border-gray-200">
                  <p className="text-xs font-semibold uppercase text-gray-600 mb-1">Performance by Sport</p>
                  <div className="grid grid-cols-3 gap-1 text-center">
                    {currentProfile.sportStats.map((sport, index) => (
                      <div key={`${currentProfileIndex}-${index}`} className="rounded-md bg-background px-1.5 py-1">
                        <p className={`text-xs font-semibold text-gray-500 uppercase leading-tight transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                          {sport.name}
                        </p>
                        <p className={`text-sm font-bold leading-tight my-0.5 ${sport.percentage >= 60 ? 'text-emerald-600' : 'text-blue-600'}`}>
                          <AnimatedNumber value={sport.percentage} suffix="%" isActive={isCardActive} delay={340 + index * 40} duration={800} />
                        </p>
                        <p className={`text-xs text-gray-500 leading-tight transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                          {sport.record}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-gray-200 bg-white p-2.5">
                  <p className="text-xs font-semibold uppercase text-gray-500 mb-2">
                    {currentProfile.isPremium ? 'Latest premium picks' : 'Latest free picks'}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <div className={`flex-1 space-y-1 text-sm transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                      {currentProfile.isPremium ? (
                        <>
                          <div className="font-medium text-gray-900 blur-sm select-none">Dodgers @ Braves — Moneyline</div>
                          <div className="font-medium text-gray-900 blur-sm select-none">Timberwolves +3.5 — Spread</div>
                          <div className="font-medium text-gray-900 blur-sm select-none">Red Sox @ Yankees — Over 8.5</div>
                        </>
                      ) : (
                        currentProfile.picks?.map((pick, index) => (
                          <div key={`${currentProfileIndex}-pick-${index}`} className="font-medium text-gray-900">
                            {pick}
                          </div>
                        ))
                      )}
                    </div>
                    <button
                      onClick={handlePickClick}
                      className="flex-shrink-0 flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                    >
                      <span>{currentProfile.isPremium ? 'Unlock pick' : 'View pick'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>Transaction history &amp; wallet balance synced in real time</span>
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center gap-1 text-primary transition hover:text-primary-dark"
                  >
                    View dashboard
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
      {/* Device Showcase */}
      <section className="overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white py-16 sm:py-20" aria-labelledby="device-showcase-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-primary">
              Product Preview
            </div>
            <h2 id="device-showcase-heading" className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl">
              Your edge. Any device.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-600 sm:text-base">
              A true look at the EdgeBook creator dashboard — the exact layout your experts use to manage bankroll, subscribers, and payouts.
            </p>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div className="flex flex-col items-center gap-8">
              <div className="relative flex w-full max-w-[620px] lg:max-w-[660px] h-[560px] items-center justify-center transition-all duration-300">
                {deviceView === 'desktop' && (
                  <div className="relative w-full scale-90">
                    <div className="absolute -inset-5 sm:-inset-6 rounded-[48px] bg-gradient-to-br from-primary/20 via-transparent to-emerald-200/40 blur-2xl" />
                    <div className="relative mx-auto w-full overflow-hidden rounded-[34px] border-[5px] border-slate-700 bg-slate-700 shadow-[0_50px_110px_rgba(15,23,42,0.25)]">
                      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                        </div>
                        <div className="rounded-md bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.35em] text-slate-300">
                          edgebook.ai/dashboard
                        </div>
                        <div className="h-3 w-12 rounded-full bg-white/10" />
                      </div>
                      <div className="px-[1px] pb-[1px] pt-[1px]">
                        <div className="flex h-[490px] flex-col rounded-[28px] bg-white/95 shadow-[0_30px_80px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/40">
                          <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Account Overview</p>
                              <h3 className="mt-2 text-2xl font-semibold text-slate-900">Jordan Rivers</h3>
                              <p className="text-sm text-slate-500">Track your performance and revenue in real time</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button type="button" className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg">
                                <Plus className="h-3.5 w-3.5" />
                                <span>Create a Pick</span>
                              </button>
                              <button type="button" className="inline-flex items-center gap-1.5 rounded-lg border-2 border-emerald-500 bg-white px-3 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50">
                                <DollarSign className="h-3.5 w-3.5" />
                                <span>Withdraw Earnings</span>
                              </button>
                            </div>
                          </div>
                          <div className="relative flex-1 overflow-hidden">
                            <div className="h-full overflow-y-auto px-6 py-6 pr-10 [scrollbar-width:thin] [scrollbar-color:#cbd5f5_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/70">
                              <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                                  <div className="rounded-xl bg-white/80 p-6 shadow-inner ring-1 ring-slate-200/80">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="mb-3 flex items-center gap-3">
                                          <div className="rounded-lg bg-emerald-50 p-2">
                                            <DollarSign className="h-5 w-5 text-emerald-600" />
                                          </div>
                                          <p className="text-sm font-medium text-slate-600">Net Revenue</p>
                                        </div>
                                        <p className="text-3xl font-bold text-slate-900">$8,920</p>
                                        <p className="text-xs text-slate-500">$9,240 total earned</p>
                                      </div>
                                      <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                                    </div>
                                  </div>
                                  <div className="rounded-xl bg-white/80 p-6 shadow-inner ring-1 ring-slate-200/80">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="mb-3 flex items-center gap-3">
                                          <div className="rounded-lg bg-blue-50 p-2">
                                            <Award className="h-5 w-5 text-primary" />
                                          </div>
                                          <p className="text-sm font-medium text-slate-600">Win Rate</p>
                                        </div>
                                        <p className="text-3xl font-bold text-slate-900">67%</p>
                                        <p className="text-xs text-slate-500">210W / 105L</p>
                                      </div>
                                      <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                                    </div>
                                  </div>
                                  <div className="rounded-xl bg-white/80 p-6 shadow-inner ring-1 ring-slate-200/80">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="mb-3 flex items-center gap-3">
                                          <div className="rounded-lg bg-purple-50 p-2">
                                            <Target className="h-5 w-5 text-purple-600" />
                                          </div>
                                          <p className="text-sm font-medium text-slate-600">Total Picks</p>
                                        </div>
                                        <p className="text-3xl font-bold text-slate-900">315</p>
                                        <p className="text-xs text-slate-500">3 pending</p>
                                      </div>
                                      <ArrowDownRight className="h-5 w-5 text-rose-500" />
                                    </div>
                                  </div>
                                  <div className="rounded-xl bg-white/80 p-6 shadow-inner ring-1 ring-slate-200/80">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="mb-3 flex items-center gap-3">
                                          <div className="rounded-lg bg-orange-50 p-2">
                                            <ShoppingCart className="h-5 w-5 text-orange-600" />
                                          </div>
                                          <p className="text-sm font-medium text-slate-600">Total Sales</p>
                                        </div>
                                        <p className="text-3xl font-bold text-slate-900">892</p>
                                        <p className="text-xs text-slate-500">142 paid picks</p>
                                      </div>
                                      <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                  <div className="rounded-xl bg-white/80 p-4 shadow-inner ring-1 ring-slate-200/80">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-indigo-50 p-2">
                                          <Eye className="h-4 w-4 text-indigo-600" />
                                        </div>
                                        <div>
                                          <p className="text-sm text-slate-600">Total Views</p>
                                          <p className="text-xl font-bold text-slate-900">12,458</p>
                                        </div>
                                      </div>
                                      <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                                    </div>
                                  </div>
                                  <div className="rounded-xl bg-white/80 p-4 shadow-inner ring-1 ring-slate-200/80">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-pink-50 p-2">
                                          <Users className="h-4 w-4 text-pink-600" />
                                        </div>
                                        <div>
                                          <p className="text-sm text-slate-600">Followers</p>
                                          <p className="text-xl font-bold text-slate-900">1,247</p>
                                        </div>
                                      </div>
                                      <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                                    </div>
                                  </div>
                                  <div className="rounded-xl bg-white/80 p-4 shadow-inner ring-1 ring-slate-200/80">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-teal-50 p-2">
                                          <UserPlus className="h-4 w-4 text-teal-600" />
                                        </div>
                                        <div>
                                          <p className="text-sm text-slate-600">Following</p>
                                          <p className="text-xl font-bold text-slate-900">89</p>
                                        </div>
                                      </div>
                                      <ArrowDownRight className="h-4 w-4 text-rose-500" />
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                  <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-6 shadow-lg shadow-emerald-100">
                                    <div className="mb-5 flex items-center justify-between">
                                      <div>
                                        <p className="text-xs uppercase tracking-[0.28em] text-emerald-500">Paid Picks</p>
                                        <h4 className="mt-1 text-lg font-bold text-slate-900">Premium performance</h4>
                                      </div>
                                      <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">Premium</span>
                                    </div>
                                    <div className="space-y-3 text-sm text-slate-700">
                                      <div className="flex items-center justify-between">
                                        <span>Win rate</span>
                                        <span className="text-lg font-semibold text-emerald-600">68%</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span>Total picks</span>
                                        <span className="font-semibold text-slate-900">214</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span>Record</span>
                                        <span className="font-semibold text-slate-900">146W - 68L</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span>Settled</span>
                                        <span className="font-semibold text-slate-900">207</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-lg shadow-blue-100">
                                    <div className="mb-5 flex items-center justify-between">
                                      <div>
                                        <p className="text-xs uppercase tracking-[0.28em] text-blue-500">Free Picks</p>
                                        <h4 className="mt-1 text-lg font-bold text-slate-900">Community reach</h4>
                                      </div>
                                      <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">Free</span>
                                    </div>
                                    <div className="space-y-3 text-sm text-slate-700">
                                      <div className="flex items-center justify-between">
                                        <span>Win rate</span>
                                        <span className="text-lg font-semibold text-blue-600">59%</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span>Total picks</span>
                                        <span className="font-semibold text-slate-900">101</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span>Record</span>
                                        <span className="font-semibold text-slate-900">60W - 41L</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span>Settled</span>
                                        <span className="font-semibold text-slate-900">96</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-2xl bg-white/80 p-6 shadow-inner ring-1 ring-slate-200/80">
                                  <div className="mb-4 flex items-center gap-3">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    <h4 className="text-lg font-semibold text-slate-900">Performance by confidence level</h4>
                                  </div>
                                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                                    {[
                                      { label: '5U', winRate: '72%', record: '42-16', settled: '58' },
                                      { label: '4U', winRate: '65%', record: '36-19', settled: '55' },
                                      { label: '3U', winRate: '59%', record: '38-26', settled: '64' },
                                      { label: '2U', winRate: '54%', record: '52-44', settled: '96' },
                                      { label: '1U', winRate: '51%', record: '68-65', settled: '133' },
                                    ].map((unit) => (
                                      <div key={unit.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="mb-3 flex items-center justify-between">
                                          <span className="text-2xl font-bold text-primary">{unit.label}</span>
                                          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{unit.winRate}</span>
                                        </div>
                                        <div className="space-y-2 text-xs text-slate-600">
                                          <div className="flex items-center justify-between">
                                            <span>Record</span>
                                            <span className="font-semibold text-slate-900">{unit.record}</span>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span>Settled</span>
                                            <span className="font-semibold text-slate-900">{unit.settled}</span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="rounded-2xl bg-white/80 p-6 shadow-inner ring-1 ring-slate-200/80">
                                  <div className="mb-4 flex items-center gap-3">
                                    <DollarSign className="h-5 w-5 text-emerald-600" />
                                    <h4 className="text-lg font-semibold text-slate-900">Revenue breakdown</h4>
                                  </div>
                                  <div className="space-y-4 text-sm text-slate-600">
                                    <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 p-4">
                                      <div>
                                        <p>Total revenue</p>
                                        <p className="text-2xl font-semibold text-slate-900">$14,260</p>
                                      </div>
                                      <ArrowUpRight className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl border-2 border-primary bg-primary/5 p-4">
                                      <div>
                                        <p>Net revenue</p>
                                        <p className="text-2xl font-semibold text-primary">$8,920</p>
                                      </div>
                                      <DollarSign className="h-8 w-8 text-primary" />
                                    </div>
                                    <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                                      View detailed earnings
                                      <ArrowRight className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white via-white to-transparent" />
                          </div>
                        </div>
                      </div>
                      <div className="mx-auto h-4 w-[92%] rounded-b-[40px] bg-slate-900/60 shadow-inner" />
                    </div>
                  </div>
                )}

                {deviceView === 'mobile' && (
                  <div className="relative flex justify-center w-full">
                    <div className="absolute -inset-5 sm:-inset-6 rounded-[48px] bg-gradient-to-br from-primary/20 via-transparent to-emerald-200/40 blur-2xl" />
                    <div className="relative w-[250px] rounded-[38px] border-[5px] border-slate-700 bg-slate-700 p-[2px] shadow-[0_32px_68px_rgba(15,23,42,0.2)]">
                      <div className="relative rounded-[36px] border-[0.5px] border-slate-400/30 bg-slate-100/70 p-0 text-slate-900">
                        <div className="absolute left-1/2 top-2 h-[1rem] w-24 -translate-x-1/2 rounded-b-3xl bg-black/40" />
                        <div className="flex h-[460px] flex-col overflow-hidden rounded-[30px] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.14)] border-[0.5px] border-slate-200/40">
                          <div className="flex items-center justify-between px-4 pt-5">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">EdgeBook</p>
                              <p className="text-lg font-semibold">Account Overview</p>
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              JR
                            </div>
                          </div>
                          <div className="relative flex-1 overflow-hidden">
                            <div className="h-full space-y-4 overflow-y-auto px-4 pb-6 pt-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                              <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-xs text-slate-500">Net revenue</p>
                                    <p className="text-2xl font-semibold text-slate-900">$8,920</p>
                                  </div>
                                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">+12% WTD</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200/80">
                                  <p className="text-[11px] text-slate-500">Win rate</p>
                                  <p className="text-xl font-semibold text-slate-900">67%</p>
                                  <p className="text-[10px] text-slate-400">210W / 105L</p>
                                </div>
                                <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200/80">
                                  <p className="text-[11px] text-slate-500">Followers</p>
                                  <p className="text-xl font-semibold text-slate-900">1,247</p>
                                  <p className="text-[10px] text-slate-400">+48 this week</p>
                                </div>
                              </div>
                              <div className="space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-semibold">Warriors -5.5</p>
                                    <p className="text-[11px] text-slate-500">NBA • Confidence 4U</p>
                                  </div>
                                  <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">Locked</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-semibold">Bills ML +120</p>
                                    <p className="text-[11px] text-slate-500">NFL • 1h ago</p>
                                  </div>
                                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-600">Won</span>
                                </div>
                              </div>
                              <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
                                <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-slate-400">
                                  <span>Revenue</span>
                                  <Percent className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <div className="flex items-center justify-between text-sm text-slate-600">
                                  <span>Total</span>
                                  <span className="font-semibold text-slate-900">$14,260</span>
                                </div>
                                <div className="mt-1 flex items-center justify-between text-sm text-slate-600">
                                  <span>Net</span>
                                  <span className="font-semibold text-primary">$8,920</span>
                                </div>
                              </div>
                              <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Navigation</p>
                                <div className="mt-3 flex items-center justify-between text-[11px] font-semibold tracking-[0.28em] text-slate-500">
                                  <span className="text-slate-900">Feed</span>
                                  <span>Dashboard</span>
                                  <span>Picks</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center">
                <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                  <button
                    onClick={() => setDeviceView('desktop')}
                    className={`px-5 py-2 text-sm font-semibold transition ${
                      deviceView === 'desktop'
                        ? 'rounded-full bg-slate-900 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Desktop
                  </button>
                  <button
                    onClick={() => setDeviceView('mobile')}
                    className={`px-5 py-2 text-sm font-semibold transition ${
                      deviceView === 'mobile'
                        ? 'rounded-full bg-slate-900 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Mobile
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-8 text-center lg:items-start lg:text-left">
              <div className="relative w-full max-w-[420px] overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur">
                <div className="absolute -top-16 right-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-20 left-4 h-48 w-48 rounded-full bg-emerald-100/40 blur-3xl" />
                <div className="relative flex flex-col items-center gap-6 text-center">
                  <div className="inline-flex items-center justify-center rounded-2xl bg-slate-900 p-6 shadow-lg">
                    <QrCode className="h-24 w-24 text-white" />
                  </div>
                  <p className="text-sm text-slate-600">
                    Download EdgeBook on iOS or Android to keep your picks, subscribers, and payouts synced with the desktop dashboard.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="#"
                  className="group inline-flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53-1.72-2.48-3.03-7.01-1.27-10.08.88-1.53 2.44-2.5 4.13-2.52 1.29-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.84M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <span>Download on iOS</span>
                </a>
                <a
                  href="#"
                  className="group inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-md transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 5.5v13c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-13c0-.83-.67-1.5-1.5-1.5S3 4.67 3 5.5zm16.5 5c-.83 0-1.5.67-1.5 1.5v6.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V12c0-.83-.67-1.5-1.5-1.5zm-10 0c-.83 0-1.5.67-1.5 1.5v6.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V12c0-.83-.67-1.5-1.5-1.5zm5-6.5c-.83 0-1.5.67-1.5 1.5v13c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-13c0-.83-.67-1.5-1.5-1.5z" />
                  </svg>
                  <span>Download on Android</span>
                </a>
              </div>
              <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Seamless on desktop, tablet, and mobile</p>
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
