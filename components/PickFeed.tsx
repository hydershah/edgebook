'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import PickCard from './PickCard'
import { Loader2 } from 'lucide-react'

interface Pick {
  id: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  pickType: string
  sport: string
  matchup: string
  details: string
  odds?: string
  confidence: number
  status: string
  isPremium: boolean
  price?: number
  createdAt: string
  gameDate: string
}

interface PickStats {
  likes: number
  comments: number
  views: number
  unlocks: number
  isLiked: boolean
  isBookmarked: boolean
  isUnlocked: boolean
}

interface PickFeedProps {
  filters: {
    sport: string
    status: string
    units: string
    premiumOnly: boolean
  }
  followingOnly: boolean
}

export default function PickFeed({ filters, followingOnly }: PickFeedProps) {
  const [picks, setPicks] = useState<Pick[]>([])
  const [stats, setStats] = useState<Record<string, PickStats>>({})
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const observerTarget = useRef<HTMLDivElement>(null)

  const fetchStats = useCallback(async (pickIds: string[]) => {
    if (pickIds.length === 0) return

    try {
      const response = await fetch('/api/picks/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickIds }),
      })

      if (response.ok) {
        const data = await response.json()
        setStats(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }, [])

  const fetchPicks = useCallback(async (pageNum: number, isInitial = false) => {
    if (isInitial) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const params = new URLSearchParams()
      if (filters.sport !== 'all') params.append('sport', filters.sport)
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.units !== 'all') params.append('confidence', filters.units)
      if (filters.premiumOnly) params.append('premiumOnly', 'true')
      if (followingOnly) params.append('followingOnly', 'true')
      params.append('page', pageNum.toString())
      params.append('limit', '10')

      const response = await fetch(`/api/picks?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()

        if (isInitial) {
          setPicks(data)
        } else {
          setPicks(prev => [...prev, ...data])
        }

        // Fetch stats for the new picks
        const pickIds = data.map((pick: Pick) => pick.id)
        await fetchStats(pickIds)

        setHasMore(data.length === 10)
      }
    } catch (error) {
      console.error('Error fetching picks:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [filters, followingOnly, fetchStats])

  const refreshPickStats = useCallback(async (pickId: string) => {
    await fetchStats([pickId])
  }, [fetchStats])

  useEffect(() => {
    setPage(1)
    setHasMore(true)
    fetchPicks(1, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, followingOnly])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          const nextPage = page + 1
          setPage(nextPage)
          fetchPicks(nextPage, false)
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, loadingMore, page])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/6"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (picks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
        <div className="max-w-sm mx-auto">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No picks found</h3>
          <p className="text-gray-600 mb-6">
            {followingOnly
              ? "You&apos;re not following anyone yet. Start following creators to see their picks here!"
              : "Try adjusting your filters to see more picks"
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {picks.map((pick, index) => (
        <div
          key={pick.id}
          className="animate-fadeInUp"
          style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
        >
          <PickCard
            pick={pick}
            stats={stats[pick.id]}
            onStatsUpdate={() => refreshPickStats(pick.id)}
          />
        </div>
      ))}

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="py-4">
        {loadingMore && (
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="ml-2 text-gray-600">Loading more picks...</span>
          </div>
        )}

        {!hasMore && picks.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">You&apos;ve reached the end of the feed</p>
          </div>
        )}
      </div>
    </div>
  )
}
