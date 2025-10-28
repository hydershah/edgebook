'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Sparkles, TrendingUp } from 'lucide-react'

interface TrendingUser {
  id: string
  name: string
  avatar?: string
  stats: {
    totalPicks: number
    winRate: number
    roi: number
  }
}

const formatPercent = (
  value: number | null | undefined,
  { sign = false }: { sign?: boolean } = {}
) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—'
  }

  const decimals = Math.abs(value % 1) > 0.05 ? 1 : 0
  const absoluteValue = Math.abs(value)
  const formatted = absoluteValue.toFixed(decimals)

  if (sign) {
    if (value > 0) return `+${formatted}%`
    if (value < 0) return `-${formatted}%`
    return `${formatted}%`
  }

  return `${formatted}%`
}

const formatInteger = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—'
  }

  return new Intl.NumberFormat('en-US').format(value)
}

export default function TrendingPage() {
  const [trendingUsers, setTrendingUsers] = useState<TrendingUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrendingUsers()
  }, [])

  const fetchTrendingUsers = async () => {
    try {
      const response = await fetch('/api/users/trending')
      if (response.ok) {
        const data = await response.json()
        setTrendingUsers(data)
      }
    } catch (error) {
      console.error('Error fetching trending users:', error)
    } finally {
      setLoading(false)
    }
  }

  const metrics = useMemo(() => {
    if (trendingUsers.length === 0) {
      return {
        totalCreators: 0,
        totalPicks: 0,
        avgWinRate: null,
        avgRoi: null,
      }
    }

    const totalPicks = trendingUsers.reduce(
      (accumulator, user) => accumulator + user.stats.totalPicks,
      0
    )
    const avgWinRate =
      trendingUsers.reduce(
        (accumulator, user) => accumulator + user.stats.winRate,
        0
      ) / trendingUsers.length
    const avgRoi =
      trendingUsers.reduce(
        (accumulator, user) => accumulator + user.stats.roi,
        0
      ) / trendingUsers.length

    return {
      totalCreators: trendingUsers.length,
      totalPicks,
      avgWinRate,
      avgRoi,
    }
  }, [trendingUsers])

  const topBettor = trendingUsers[0]

  return (
    <main className="min-h-screen bg-background text-gray-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-sky-600 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-16 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-[-60px] right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80">
                <TrendingUp className="h-4 w-4" />
                Live leaderboard
              </span>
              <div>
                <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                  Creators on a heater
                </h1>
                <p className="mt-4 text-base text-white/80 sm:text-lg">
                  Discover the bettors catching heat, benchmark their win rates,
                  and unlock profiles that feel as polished as the platforms you
                  already live on.
                </p>
              </div>
              <p className="text-sm text-white/70">
                Updated in real time as picks are graded. Standing out requires
                five verified picks over the last 30 days.
              </p>
            </div>

            <div className="w-full max-w-md">
              {loading ? (
                <div className="h-48 rounded-3xl border border-white/20 bg-white/10 animate-pulse" />
              ) : topBettor ? (
                <Link
                  href={`/profile/${topBettor.id}`}
                  className="group block rounded-3xl border border-white/25 bg-white/10 p-6 shadow-xl shadow-black/10 backdrop-blur transition duration-200 hover:border-white/40 hover:bg-white/20"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                      <Sparkles className="h-4 w-4" />
                      Featured picksmith
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm text-white/80 transition group-hover:text-white">
                      View profile
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>

                  <div className="mt-6 flex items-center gap-4">
                    {topBettor.avatar ? (
                      <Image
                        src={topBettor.avatar}
                        alt={`${topBettor.name} avatar`}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-full object-cover ring-2 ring-white/40"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-semibold uppercase text-white">
                        {topBettor.name.charAt(0) || 'E'}
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-semibold text-white">
                        {topBettor.name}
                      </h2>
                      <p className="text-sm text-white/70">
                        {formatInteger(topBettor.stats.totalPicks)} total picks
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
                    <div className="rounded-2xl bg-white/15 p-3">
                      <p className="text-xs uppercase tracking-wide text-white/60">
                        Win rate
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {formatPercent(topBettor.stats.winRate)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/15 p-3">
                      <p className="text-xs uppercase tracking-wide text-white/60">
                        ROI
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {formatPercent(topBettor.stats.roi, { sign: true })}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/15 p-3">
                      <p className="text-xs uppercase tracking-wide text-white/60">
                        Lifetime picks
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {formatInteger(topBettor.stats.totalPicks)}
                      </p>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="rounded-3xl border border-white/20 bg-white/10 p-6 text-white/80 backdrop-blur">
                  <h2 className="text-lg font-semibold text-white">
                    Leaderboard warming up
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed">
                    Once bettors log five graded picks in the last 30 days,
                    they&apos;ll debut here automatically. Publish picks to take
                    the first spot.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-12 pb-12">
        <div className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 animate-pulse rounded-2xl border border-white/60 bg-white/70"
                />
              ))
            ) : (
              <>
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Creators trending now
                  </p>
                  <p className="mt-4 text-3xl font-semibold text-gray-900">
                    {formatInteger(metrics.totalCreators)}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Qualified in the past 30 days
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Average win rate
                  </p>
                  <p className="mt-4 text-3xl font-semibold text-gray-900">
                    {formatPercent(metrics.avgWinRate)}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Across all trending creators
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Average ROI
                  </p>
                  <p className="mt-4 text-3xl font-semibold text-gray-900">
                    {formatPercent(metrics.avgRoi, { sign: true })}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Unit return vs. staking strategy
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                Leaderboard
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Track the same type of stats you would on Twitter or
                OnlyFans—except here they&apos;re verified.
              </p>
            </div>
            <Link
              href="/feed"
              className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-800 shadow-sm transition duration-150 hover:border-primary hover:text-primary"
            >
              Explore public feed
            </Link>
          </div>

          <div className="mt-10 space-y-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex animate-pulse items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 w-48 rounded bg-gray-200" />
                      <div className="h-3 w-32 rounded bg-gray-200" />
                    </div>
                  </div>
                  <div className="mt-6 grid animate-pulse grid-cols-3 gap-4">
                    <div className="h-6 rounded bg-gray-200" />
                    <div className="h-6 rounded bg-gray-200" />
                    <div className="h-6 rounded bg-gray-200" />
                  </div>
                </div>
              ))
            ) : trendingUsers.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">
                  No trending creators yet
                </h3>
                <p className="mt-3 text-sm text-gray-500">
                  Publish verified picks to claim a top spot. Once you meet the
                  minimum volume, your profile will showcase here automatically.
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/createpick"
                    className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow-md transition duration-150 hover:bg-primary-dark"
                  >
                    Log your next pick
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-800 transition duration-150 hover:border-primary hover:text-primary"
                  >
                    Build a creator profile
                  </Link>
                </div>
              </div>
            ) : (
              trendingUsers.map((user, index) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}`}
                  className="group relative flex flex-col gap-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-1 items-center gap-5">
                    <div className="relative">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={`${user.name} avatar`}
                          width={56}
                          height={56}
                          className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-dark to-primary text-lg font-semibold text-white">
                          {user.name.charAt(0) || '#'}
                        </div>
                      )}
                      <span className="absolute -right-3 -top-2 rounded-full bg-gray-900 px-2 py-1 text-xs font-semibold text-white">
                        #{String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user.name}
                        </h3>
                        {index === 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            <TrendingUp className="h-3 w-3" />
                            On a heater
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatInteger(user.stats.totalPicks)} lifetime picks
                      </p>
                    </div>
                  </div>

                  <div className="grid w-full flex-1 grid-cols-3 gap-4 text-sm sm:max-w-md">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Win rate
                      </p>
                      <p className="mt-1 text-base font-semibold text-gray-900">
                        {formatPercent(user.stats.winRate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        ROI
                      </p>
                      <p className="mt-1 text-base font-semibold text-gray-900">
                        {formatPercent(user.stats.roi, { sign: true })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Verified picks
                      </p>
                      <p className="mt-1 text-base font-semibold text-gray-900">
                        {formatInteger(user.stats.totalPicks)}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition duration-150 group-hover:text-primary-dark">
                    View profile
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
