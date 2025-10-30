'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import PickCard from '@/components/PickCard'
import { useSession } from 'next-auth/react'

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
  isLocked?: boolean
  isPremiumLocked?: boolean
}

interface PickStats {
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

export default function PickPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [pick, setPick] = useState<Pick | null>(null)
  const [stats, setStats] = useState<PickStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPick = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/picks/${params.id}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError('Pick not found')
        } else {
          setError('Failed to load pick')
        }
        return
      }

      const data = await response.json()
      setPick(data.pick)
      setStats(data.stats)
    } catch (err) {
      console.error('Error fetching pick:', err)
      setError('Failed to load pick')
    } finally {
      setIsLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    if (params.id) {
      fetchPick()
    }
  }, [params.id, session, fetchPick])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !pick) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span>Go back</span>
          </button>
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error || 'Pick not found'}
            </h2>
            <p className="text-gray-600 mb-6">
              The pick you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <button
              onClick={() => router.push('/feed')}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Browse All Picks
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>Go back</span>
        </button>

        <PickCard
          pick={pick}
          stats={stats || undefined}
          onStatsUpdate={fetchPick}
        />
      </div>
    </div>
  )
}
