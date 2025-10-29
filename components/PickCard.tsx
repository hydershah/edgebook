'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Lock, TrendingUp, ThumbsUp, ThumbsDown, MessageCircle, Share2, Bookmark, Eye, MoreHorizontal, CheckCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useSession } from 'next-auth/react'
import Modal from './Modal'

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

interface PickCardProps {
  pick: {
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
  }
  stats?: PickStats
  onStatsUpdate?: () => void
}

export default function PickCard({ pick, stats, onStatsUpdate }: PickCardProps) {
  const { data: session } = useSession()
  const [userVoteType, setUserVoteType] = useState<'UPVOTE' | 'DOWNVOTE' | null>(stats?.userVoteType || null)
  const [isSaved, setIsSaved] = useState(stats?.isBookmarked || false)
  const [isUnlocking, setIsUnlocking] = useState(false)

  // Modal state
  const [modal, setModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'info' | 'success' | 'error' | 'confirm'
    onConfirm?: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  })

  useEffect(() => {
    if (stats) {
      setUserVoteType(stats.userVoteType)
      setIsSaved(stats.isBookmarked)
    }
  }, [stats])

  // Track view on mount
  useEffect(() => {
    const trackView = async () => {
      try {
        await fetch(`/api/picks/${pick.id}/view`, { method: 'POST' })
      } catch (error) {
        console.error('Error tracking view:', error)
      }
    }
    trackView()
  }, [pick.id])

  const upvotes = stats?.upvotes || 0
  const downvotes = stats?.downvotes || 0
  const score = stats?.score || 0
  const comments = stats?.comments || 0
  const views = stats?.views || 0
  const unlocks = stats?.unlocks || 0
  const isUnlocked = stats?.isUnlocked || false

  const statusConfig = {
    PENDING: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Pending' },
    WON: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Won' },
    LOST: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Lost' },
    PUSH: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Push' },
  }

  const status = statusConfig[pick.status as keyof typeof statusConfig]

  const handleVote = async (voteType: 'UPVOTE' | 'DOWNVOTE') => {
    if (!session) {
      setModal({
        isOpen: true,
        title: 'Sign In Required',
        message: 'Please sign in to vote on picks and engage with the community.',
        type: 'info',
      })
      return
    }

    try {
      const response = await fetch(`/api/picks/${pick.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteType }),
      })

      if (response.ok) {
        const data = await response.json()
        setUserVoteType(data.voteType)
        onStatsUpdate?.()
      }
    } catch (error) {
      console.error('Error toggling vote:', error)
    }
  }

  const handleSave = async () => {
    if (!session) {
      setModal({
        isOpen: true,
        title: 'Sign In Required',
        message: 'Please sign in to bookmark picks and save them for later.',
        type: 'info',
      })
      return
    }

    try {
      const response = await fetch(`/api/picks/${pick.id}/bookmark`, {
        method: 'POST',
      })

      if (response.ok) {
        setIsSaved(!isSaved)
        onStatsUpdate?.()
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
    }
  }

  const handleUnlock = async () => {
    if (!session) {
      setModal({
        isOpen: true,
        title: 'Sign In Required',
        message: 'Please sign in to unlock premium picks and access expert analysis.',
        type: 'info',
      })
      return
    }

    if (!pick.price) return

    setModal({
      isOpen: true,
      title: 'Unlock Premium Pick',
      message: `Unlock this premium pick for $${pick.price}? This will be deducted from your wallet.`,
      type: 'confirm',
      onConfirm: async () => {
        setModal({ ...modal, isOpen: false })
        setIsUnlocking(true)

        try {
          const response = await fetch(`/api/picks/${pick.id}/unlock`, {
            method: 'POST',
          })

          const data = await response.json()

          if (response.ok) {
            setModal({
              isOpen: true,
              title: 'Success!',
              message: 'Pick unlocked successfully! You can now view the full analysis.',
              type: 'success',
            })
            onStatsUpdate?.()
          } else {
            setModal({
              isOpen: true,
              title: 'Unlock Failed',
              message: data.error || 'Failed to unlock pick. Please try again.',
              type: 'error',
            })
          }
        } catch (error) {
          console.error('Error unlocking pick:', error)
          setModal({
            isOpen: true,
            title: 'Error',
            message: 'An error occurred while unlocking the pick. Please try again.',
            type: 'error',
          })
        } finally {
          setIsUnlocking(false)
        }
      },
    })
  }

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden group">
      {/* Header */}
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <Link
            href={`/profile/${pick.user.id}`}
            className="flex items-center space-x-3 group/user hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center ring-2 ring-white shadow-md">
                <span className="text-white font-bold text-lg">
                  {pick.user.name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              {/* Verified badge */}
              <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5">
                <CheckCircle className="text-white" size={14} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="font-bold text-gray-900 truncate">
                  {pick.user.name || 'Anonymous'}
                </p>
              </div>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(pick.createdAt), { addSuffix: true })}
              </p>
            </div>
          </Link>

          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreHorizontal size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tags & Status */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-3 py-1.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-full text-xs font-semibold shadow-sm">
            {pick.sport}
          </span>
          <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            {pick.pickType}
          </span>
          <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1 border border-blue-200">
            <TrendingUp size={12} />
            <span className="font-semibold">{pick.confidence}U</span>
          </span>
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${status.bg} ${status.text} ${status.border}`}>
            {status.label}
          </span>
          {pick.isPremium && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-primary to-green-700 text-white rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm">
              <Lock size={12} />
              ${pick.price}
            </span>
          )}
        </div>

        {/* Matchup */}
        <h3 className="font-bold text-xl text-gray-900 mb-3 leading-tight">
          {pick.matchup}
        </h3>

        {/* Content */}
        {pick.isPremium && !isUnlocked ? (
          <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border-2 border-green-200">
            {/* Blurred preview effect */}
            <div className="absolute inset-0 backdrop-blur-md bg-white/30 z-10"></div>
            <div className="relative z-20 p-8 text-center">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-green-700 rounded-full shadow-lg mb-3">
                  <Lock className="text-white" size={28} />
                </div>
              </div>
              <h4 className="font-bold text-gray-900 text-lg mb-2">
                Premium Pick
              </h4>
              <p className="text-gray-600 text-sm mb-4 max-w-xs mx-auto">
                Unlock this expert analysis and prediction
              </p>
              <button
                onClick={handleUnlock}
                disabled={isUnlocking}
                className="bg-gradient-to-r from-primary to-green-700 hover:from-primary-dark hover:to-green-800 text-white font-bold px-8 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isUnlocking ? 'Unlocking...' : `Unlock for $${pick.price}`}
              </button>
              <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Eye size={14} />
                  <span>{views} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Lock size={14} />
                  <span>{unlocks} unlocked</span>
                </div>
              </div>
            </div>
            {/* Decorative blur preview text in background */}
            <div className="absolute inset-0 p-8 text-gray-900 opacity-20 blur-sm select-none">
              <p className="text-sm leading-relaxed">
                This is a premium prediction with detailed analysis, statistics, and insights that will help you make an informed decision...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {pick.isPremium && isUnlocked && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3 flex items-center space-x-2">
                <CheckCircle className="text-green-600" size={18} />
                <span className="text-sm font-medium text-green-800">You&apos;ve unlocked this premium pick</span>
              </div>
            )}
            <p className="text-gray-700 leading-relaxed text-[15px]">
              {pick.details}
            </p>
            {pick.odds && (
              <div className="inline-flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <span className="text-sm font-semibold text-gray-700">Odds:</span>
                <span className="text-sm font-bold text-primary">{pick.odds}</span>
              </div>
            )}
          </div>
        )}

        {/* Game Date */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 flex items-center space-x-2">
            <span className="font-medium">Game Date:</span>
            <span>{new Date(pick.gameDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}</span>
          </p>
        </div>
      </div>

      {/* Engagement Section */}
      <div className="border-t border-gray-100 px-4 sm:px-6 py-3 bg-gray-50/50">
        <div className="flex items-center justify-between">
          {/* Left actions */}
          <div className="flex items-center space-x-1">
            {/* Upvote button */}
            <button
              onClick={() => handleVote('UPVOTE')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all duration-200 ${
                userVoteType === 'UPVOTE'
                  ? 'bg-green-50 text-green-600 hover:bg-green-100'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ThumbsUp
                size={18}
                className={userVoteType === 'UPVOTE' ? 'fill-green-600' : ''}
              />
              <span className="text-sm font-medium">{upvotes}</span>
            </button>

            {/* Downvote button */}
            <button
              onClick={() => handleVote('DOWNVOTE')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all duration-200 ${
                userVoteType === 'DOWNVOTE'
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ThumbsDown
                size={18}
                className={userVoteType === 'DOWNVOTE' ? 'fill-red-600' : ''}
              />
              <span className="text-sm font-medium">{downvotes}</span>
            </button>

            <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
              <MessageCircle size={18} />
              <span className="text-sm font-medium">{comments}</span>
            </button>

            <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
              <Eye size={18} />
              <span className="text-sm font-medium">{views}</span>
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-1">
            <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
              <Share2 size={18} />
            </button>

            <button
              onClick={handleSave}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isSaved
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Bookmark
                size={18}
                className={isSaved ? 'fill-primary' : ''}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmText={modal.type === 'confirm' ? 'Confirm' : 'OK'}
        isLoading={isUnlocking}
      />
    </article>
  )
}
