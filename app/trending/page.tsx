'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { TrendingUp, Flame, TrendingUpIcon, Crown, Sparkles } from 'lucide-react'
import PickCard from '@/components/PickCard'

type Algorithm = 'hot' | 'rising' | 'top' | 'new'
type Sport = 'ALL' | 'NFL' | 'NBA' | 'MLB' | 'NHL' | 'SOCCER' | 'COLLEGE_FOOTBALL' | 'COLLEGE_BASKETBALL'
type Period = 'today' | 'week' | 'month' | 'all'

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

interface TrendingPick {
  id: string
  userId: string
  user: {
    id: string
    name: string | null
    username: string | null
    avatar: string | null
    isVerified: boolean
    winRate: number
  }
  sport: string
  pickType: string
  matchup: string
  details: string
  odds: string | null
  confidence: number
  status: string
  isPremium: boolean
  price: number | null
  mediaUrl: string | null
  createdAt: string
  engagement: {
    likes: number
    comments: number
    views: number
    bookmarks: number
  }
}

const formatInteger = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—'
  }
  return new Intl.NumberFormat('en-US').format(value)
}

const formatPercent = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—'
  }
  return `${Math.round(value)}%`
}

export default function TrendingPage() {
  const [algorithm, setAlgorithm] = useState<Algorithm>('hot')
  const [sport, setSport] = useState<Sport>('ALL')
  const [period, setPeriod] = useState<Period>('week')
  const [picks, setPicks] = useState<TrendingPick[]>([])
  const [topCreators, setTopCreators] = useState<TrendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCreators, setLoadingCreators] = useState(true)

  const fetchTrendingPicks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        algorithm,
        sport,
        period: algorithm === 'top' ? period : 'week',
        limit: '20'
      })
      const response = await fetch(`/api/picks/trending?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPicks(data)
      }
    } catch (error) {
      console.error('Error fetching trending picks:', error)
    } finally {
      setLoading(false)
    }
  }, [algorithm, sport, period])

  useEffect(() => {
    fetchTrendingPicks()
  }, [fetchTrendingPicks])

  useEffect(() => {
    fetchTopCreators()
  }, [])

  const fetchTopCreators = async () => {
    try {
      const response = await fetch('/api/users/trending')
      if (response.ok) {
        const data = await response.json()
        setTopCreators(data.slice(0, 5))
      }
    } catch (error) {
      console.error('Error fetching top creators:', error)
    } finally {
      setLoadingCreators(false)
    }
  }

  const tabs = [
    { id: 'hot' as Algorithm, label: 'Hot', icon: Flame, description: "What's trending now" },
    { id: 'rising' as Algorithm, label: 'Rising', icon: TrendingUpIcon, description: 'Gaining traction' },
    { id: 'top' as Algorithm, label: 'Top', icon: Crown, description: 'Most engagement' },
    { id: 'new' as Algorithm, label: 'New', icon: Sparkles, description: 'Latest picks' },
  ]

  const sports: Sport[] = ['ALL', 'NFL', 'NBA', 'MLB', 'NHL', 'SOCCER', 'COLLEGE_FOOTBALL', 'COLLEGE_BASKETBALL']
  const periods: { id: Period; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'all', label: 'All Time' },
  ]

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-sky-600 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-16 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-[-60px] right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80">
              <TrendingUp className="h-4 w-4" />
              Trending Picks
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              What&apos;s Trending
            </h1>
            <p className="mt-4 text-base text-white/80 sm:text-lg">
              Discover the hottest picks, rising stars, and top performers in the community
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setAlgorithm(tab.id)}
                      className={`flex-1 min-w-fit px-6 py-4 text-sm font-semibold transition-all border-b-2 ${
                        algorithm === tab.id
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Icon size={18} />
                        <span>{tab.label}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Sport Filter */}
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Sport</label>
                  <select
                    value={sport}
                    onChange={(e) => setSport(e.target.value as Sport)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  >
                    {sports.map((s) => (
                      <option key={s} value={s}>
                        {s === 'ALL' ? 'All Sports' : s.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Period Filter (only for Top) */}
                {algorithm === 'top' && (
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Time Period</label>
                    <select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value as Period)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    >
                      {periods.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Picks Feed */}
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                        <div className="h-3 w-24 bg-gray-200 rounded" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 w-full bg-gray-200 rounded" />
                      <div className="h-4 w-3/4 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))
              ) : picks.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <h3 className="text-xl font-semibold text-gray-900">No picks found</h3>
                  <p className="mt-3 text-sm text-gray-500">
                    Try adjusting your filters or check back later for more content
                  </p>
                </div>
              ) : (
                picks.map((pick) => (
                  <PickCard
                    key={pick.id}
                    pick={{
                      ...pick,
                      gameDate: pick.createdAt,
                    }}
                    stats={{
                      upvotes: pick.engagement.likes,
                      downvotes: 0,
                      score: pick.engagement.likes,
                      comments: pick.engagement.comments,
                      views: pick.engagement.views,
                      unlocks: 0,
                      userVoteType: null,
                      isBookmarked: false,
                      isUnlocked: !pick.isPremium,
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Sidebar - Top Creators */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Top Creators</h3>
                {loadingCreators ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-24 bg-gray-200 rounded" />
                          <div className="h-3 w-16 bg-gray-200 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : topCreators.length === 0 ? (
                  <p className="text-sm text-gray-500">No top creators yet</p>
                ) : (
                  <div className="space-y-4">
                    {topCreators.map((creator, index) => (
                      <Link
                        key={creator.id}
                        href={`/profile/${creator.id}`}
                        className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <div className="relative">
                          {creator.avatar ? (
                            <Image
                              src={creator.avatar}
                              alt={creator.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold">
                              {creator.name.charAt(0)}
                            </div>
                          )}
                          <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {creator.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatPercent(creator.stats.winRate)} Win Rate
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                <Link
                  href="/feed"
                  className="mt-6 block w-full text-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold text-sm rounded-lg transition-colors"
                >
                  View All Creators
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
