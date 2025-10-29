'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import PickCard from '@/components/PickCard'
import { Bookmark, Loader2 } from 'lucide-react'

interface Pick {
  id: string
  user: {
    id: string
    name: string | null
    avatar?: string | null
  }
  pickType: string
  sport: string
  matchup: string
  details: string
  odds?: string | null
  confidence: number
  status: string
  isPremium: boolean
  price?: number | null
  createdAt: string
  gameDate: string
  lockedAt?: string | null
  bookmarkedAt: string
  stats: {
    upvotes: number
    downvotes: number
    score: number
    comments: number
    views: number
    unlocks: number
    userVoteType: 'UPVOTE' | 'DOWNVOTE' | null
    isBookmarked: boolean
    isUnlocked: boolean
  }
}

export default function BookmarksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [picks, setPicks] = useState<Pick[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchBookmarks()
    }
  }, [status, router])

  const fetchBookmarks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/bookmarks')
      if (response.ok) {
        const data = await response.json()
        setPicks(data.picks)
      } else {
        console.error('Failed to fetch bookmarks')
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your bookmarks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <Bookmark className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bookmarked Picks</h1>
              <p className="text-gray-600">Picks you&apos;ve saved for later</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{picks.length}</div>
              <div className="text-sm text-gray-600">Total Saved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {picks.filter((p) => p.status === 'PENDING').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {picks.filter((p) => p.status === 'WON').length}
              </div>
              <div className="text-sm text-gray-600">Won</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {picks.filter((p) => p.isPremium).length}
              </div>
              <div className="text-sm text-gray-600">Premium</div>
            </div>
          </div>
        </div>

        {/* Picks */}
        {picks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No bookmarks yet</h3>
            <p className="text-gray-600 mb-6">
              Start saving picks you want to revisit later
            </p>
            <a
              href="/feed"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Explore Picks
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {picks.map((pick) => (
              <PickCard
                key={pick.id}
                pick={{
                  id: pick.id,
                  user: pick.user,
                  pickType: pick.pickType,
                  sport: pick.sport,
                  matchup: pick.matchup,
                  details: pick.details,
                  odds: pick.odds,
                  confidence: pick.confidence,
                  status: pick.status,
                  isPremium: pick.isPremium,
                  price: pick.price,
                  createdAt: pick.createdAt,
                  gameDate: pick.gameDate,
                  lockedAt: pick.lockedAt,
                }}
                stats={pick.stats}
                onStatsUpdate={fetchBookmarks}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
