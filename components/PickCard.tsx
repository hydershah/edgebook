'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Lock, ThumbsUp, ThumbsDown, MessageCircle, Share2, Bookmark, Eye, CheckCircle, Send, Link as LinkIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useSession } from 'next-auth/react'
import Modal from './Modal'
import { trackPickView } from '@/lib/viewTracker'

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    username: string | null
    name: string | null
    avatar: string | null
    isVerified: boolean
  }
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

interface PickCardProps {
  pick: {
    id: string
    user: {
      id: string
      name: string | null
      avatar?: string | null
      isVerified?: boolean
      winRate?: number | null
      totalPicks?: number | null
      streak?: number | null
    }
    pickType: string
    sport: string
    matchup: string
    details: string | null
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
    // Prediction fields
    predictionType?: 'WINNER' | 'SPREAD' | 'TOTAL' | null
    predictedWinner?: string | null
    spreadValue?: number | null
    spreadTeam?: string | null
    totalValue?: number | null
    totalPrediction?: string | null
  }
  stats?: PickStats
  onStatsUpdate?: () => void
}

export default function PickCard({ pick, stats, onStatsUpdate }: PickCardProps) {
  const { data: session } = useSession()
  const [userVoteType, setUserVoteType] = useState<'UPVOTE' | 'DOWNVOTE' | null>(stats?.userVoteType || null)
  const [isSaved, setIsSaved] = useState(stats?.isBookmarked || false)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [timeUntilLock, setTimeUntilLock] = useState<string>('')
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

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

  // Track view on mount (batched for performance)
  useEffect(() => {
    trackPickView(pick.id)
  }, [pick.id])

  // Countdown timer for lock time
  useEffect(() => {
    if (!pick.lockedAt || pick.isLocked) {
      setTimeUntilLock('')
      return
    }

    const updateCountdown = () => {
      const lockTime = new Date(pick.lockedAt!)
      const now = new Date()
      const diff = lockTime.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeUntilLock('Locked')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeUntilLock(`Locks in ${days}d ${hours}h`)
      } else if (hours > 0) {
        setTimeUntilLock(`Locks in ${hours}h ${minutes}m`)
      } else if (minutes > 0) {
        setTimeUntilLock(`Locks in ${minutes}m ${seconds}s`)
      } else {
        setTimeUntilLock(`Locks in ${seconds}s`)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [pick.lockedAt, pick.isLocked])

  const upvotes = stats?.upvotes || 0
  const downvotes = stats?.downvotes || 0
  const score = stats?.score || 0
  const commentCount = stats?.comments || 0
  const views = stats?.views || 0
  const unlocks = stats?.unlocks || 0
  const isUnlocked = stats?.isUnlocked || false
  const isOwnPick = session?.user?.id === pick.user.id

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
      const method = isSaved ? 'DELETE' : 'POST'
      const response = await fetch(`/api/picks/${pick.id}/bookmark`, {
        method,
      })

      if (response.ok || response.status === 404 || response.status === 409) {
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
      message: `Unlock this premium pick for $${pick.price}? You'll be redirected to complete your purchase securely.`,
      type: 'confirm',
      onConfirm: async () => {
        setModal({ ...modal, isOpen: false })
        setIsUnlocking(true)

        try {
          const response = await fetch(`/api/picks/${pick.id}/purchase`, {
            method: 'POST',
          })

          const data = await response.json()

          if (response.ok && data.payment?.checkoutUrl) {
            // Redirect to Whop checkout
            window.location.href = data.payment.checkoutUrl
          } else if (response.ok) {
            // Payment completed immediately (shouldn't happen with Whop)
            setModal({
              isOpen: true,
              title: 'Success!',
              message: 'Pick unlocked successfully! You can now view the full analysis.',
              type: 'success',
            })
            onStatsUpdate?.()
            setIsUnlocking(false)
          } else {
            setModal({
              isOpen: true,
              title: 'Purchase Failed',
              message: data.error || 'Failed to initiate purchase. Please try again.',
              type: 'error',
            })
            setIsUnlocking(false)
          }
        } catch (error) {
          console.error('Error purchasing pick:', error)
          setModal({
            isOpen: true,
            title: 'Error',
            message: 'An error occurred while processing your purchase. Please try again.',
            type: 'error',
          })
          setIsUnlocking(false)
        }
      },
    })
  }

  const fetchComments = async () => {
    if (isLoadingComments) return

    setIsLoadingComments(true)
    try {
      const response = await fetch(`/api/picks/${pick.id}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      setModal({
        isOpen: true,
        title: 'Sign In Required',
        message: 'Please sign in to comment on picks and join the conversation.',
        type: 'info',
      })
      return
    }

    if (!commentText.trim()) return

    setIsSubmittingComment(true)
    try {
      const response = await fetch(`/api/picks/${pick.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: commentText }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments([data.comment, ...comments])
        setCommentText('')
        onStatsUpdate?.()
      } else {
        const data = await response.json()
        setModal({
          isOpen: true,
          title: 'Error',
          message: data.error || 'Failed to post comment',
          type: 'error',
        })
      }
    } catch (error) {
      console.error('Error posting comment:', error)
      setModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to post comment. Please try again.',
        type: 'error',
      })
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/picks/${pick.id}/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setComments(comments.filter(c => c.id !== commentId))
        onStatsUpdate?.()
      } else {
        const data = await response.json()
        setModal({
          isOpen: true,
          title: 'Error',
          message: data.error || 'Failed to delete comment',
          type: 'error',
        })
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const toggleComments = () => {
    if (!showComments && comments.length === 0) {
      fetchComments()
    }
    setShowComments(!showComments)
  }

  const handleShareToFacebook = () => {
    const shareUrl = `${window.location.origin}/pick/${pick.id}`
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(facebookUrl, '_blank', 'width=600,height=400')
    setShowShareMenu(false)
  }

  const handleShareToTwitter = () => {
    const shareUrl = `${window.location.origin}/pick/${pick.id}`
    const shareText = `Check out this ${pick.sport} pick: ${pick.matchup}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
    setShowShareMenu(false)
  }

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/pick/${pick.id}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setModal({
        isOpen: true,
        title: 'Link Copied!',
        message: 'Pick link has been copied to your clipboard.',
        type: 'success',
      })
      setShowShareMenu(false)
    } catch (error) {
      console.error('Error copying link:', error)
      setModal({
        isOpen: true,
        title: 'Copy Failed',
        message: 'Unable to copy link. Please try again.',
        type: 'error',
      })
    }
  }

  return (
    <article className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Link
            href={`/profile/${pick.user.id}`}
            className="flex items-center space-x-2.5 group/user hover:opacity-80 transition-opacity flex-1 min-w-0"
          >
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">
                  {pick.user.name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900 text-sm">
                    {pick.user.name || 'Anonymous'}
                  </p>
                  {/* User Stats as Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Verification Badge */}
                    {pick.user.isVerified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        Verified
                        <CheckCircle className="text-blue-500" size={10} />
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        Not Verified
                      </span>
                    )}

                    {/* Win Rate Badge */}
                    <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                      Win Rate: {pick.user.winRate !== null && pick.user.winRate !== undefined ? `${Math.round(pick.user.winRate)}%` : '0%'}
                    </span>

                    {/* Win Streak Badge */}
                    {pick.user.streak && pick.user.streak > 0 ? (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                        🔥 Win Streak: {pick.user.streak}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        Win Streak: 0
                      </span>
                    )}

                    {/* Total Picks Badge */}
                    <span className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      Total Picks: {pick.user.totalPicks || 0}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatDistanceToNow(new Date(pick.createdAt), { addSuffix: true })}
              </p>
            </div>
          </Link>

          <div className="flex items-center space-x-2 ml-2">
            {pick.isPremium && (
              <div className="flex items-center space-x-1 px-2.5 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-md text-xs font-bold shadow-sm">
                <Lock size={12} />
                <span>${pick.price}</span>
              </div>
            )}
          </div>
        </div>

        {/* Compact Header Row with Sport, Type, Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
              {pick.sport}
            </span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
              {pick.pickType}
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${status.bg} ${status.text} border ${status.border}`}>
            {status.label}
          </span>
        </div>

        {/* Matchup Title */}
        <h3 className="font-bold text-lg text-gray-900 mb-3">
          {pick.matchup}
        </h3>

        {/* Compact Prediction & Game Info Grid */}
        <div className={`bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200 ${
          (pick.isPremium && !isUnlocked && !isOwnPick) || pick.isPremiumLocked ? 'blur-sm' : ''
        }`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
            {/* Prediction Info */}
            {pick.predictionType && (
              <div className="col-span-1">
                <p className="text-xs text-gray-500 mb-0.5">Prediction</p>
                <p className="text-sm font-bold text-gray-900">
                  {pick.predictionType === 'WINNER' && pick.predictedWinner ?
                    pick.predictedWinner :
                   pick.predictionType === 'SPREAD' && pick.spreadTeam ?
                    `${pick.spreadTeam} ${pick.spreadValue && pick.spreadValue > 0 ? '+' : ''}${pick.spreadValue}` :
                   pick.predictionType === 'TOTAL' && pick.totalPrediction ?
                    `${pick.totalPrediction} ${pick.totalValue}` :
                    pick.predictionType}
                </p>
              </div>
            )}

            {/* Odds */}
            {pick.odds && (
              <div className="col-span-1">
                <p className="text-xs text-gray-500 mb-0.5">Odds</p>
                <p className="text-sm font-bold text-primary">{pick.odds}</p>
              </div>
            )}

            {/* Confidence */}
            <div className="col-span-1">
              <p className="text-xs text-gray-500 mb-0.5">Confidence</p>
              <div className="flex items-center">
                <span className="text-sm font-bold text-gray-900 mr-1.5">{pick.confidence}U</span>
                <div className="flex space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${
                        i < pick.confidence ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Game Date */}
            <div className="col-span-1">
              <p className="text-xs text-gray-500 mb-0.5">Game Time</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(pick.gameDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}, {new Date(pick.gameDate).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Lock Status - Inline Alert */}
          {(pick.isLocked || timeUntilLock) && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              {pick.isLocked ? (
                <span className="inline-flex items-center space-x-1 text-xs font-medium text-red-600">
                  <Lock size={12} />
                  <span>Locked</span>
                </span>
              ) : timeUntilLock ? (
                <span className="text-xs font-medium text-amber-600">{timeUntilLock}</span>
              ) : null}
            </div>
          )}
        </div>

        {/* Content */}
        {(pick.isPremium && !isUnlocked && !isOwnPick) || pick.isPremiumLocked ? (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-green-700 rounded-full flex items-center justify-center">
                <Lock className="text-white" size={18} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Premium Analysis</h4>
                <p className="text-xs text-gray-600">Expert pick with detailed breakdown</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Eye size={12} className="mr-0.5" />
                    {views}
                  </span>
                  <span className="flex items-center">
                    <Lock size={12} className="mr-0.5" />
                    {unlocks}
                  </span>
                </div>
              </div>
              <button
                onClick={handleUnlock}
                disabled={isUnlocking}
                className="bg-gradient-to-r from-primary to-green-700 hover:from-primary-dark hover:to-green-800 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {isUnlocking ? '...' : `Unlock $${pick.price}`}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {pick.isPremium && isUnlocked && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-2 flex items-center space-x-2">
                <CheckCircle className="text-green-600 flex-shrink-0" size={14} />
                <span className="text-xs font-medium text-green-800">Premium pick unlocked</span>
              </div>
            )}
            {pick.details && (
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                  {pick.details}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Engagement Section */}
      <div className="border-t border-gray-200 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between max-w-full">
          {/* Left actions */}
          <div className="flex items-center space-x-1 flex-1 min-w-0">
            {/* Upvote button */}
            <button
              onClick={() => handleVote('UPVOTE')}
              className={`group flex items-center space-x-1 px-2 py-1 rounded-md transition-all duration-200 ${
                userVoteType === 'UPVOTE'
                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Upvote"
            >
              <ThumbsUp
                size={14}
                className={`${userVoteType === 'UPVOTE' ? 'fill-green-600' : ''} transition-all`}
              />
              <span className="text-xs font-semibold">{upvotes}</span>
            </button>

            {/* Downvote button */}
            <button
              onClick={() => handleVote('DOWNVOTE')}
              className={`group flex items-center space-x-1 px-2 py-1 rounded-md transition-all duration-200 ${
                userVoteType === 'DOWNVOTE'
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Downvote"
            >
              <ThumbsDown
                size={14}
                className={`${userVoteType === 'DOWNVOTE' ? 'fill-red-600' : ''} transition-all`}
              />
              <span className="text-xs font-semibold">{downvotes}</span>
            </button>

            <button
              onClick={toggleComments}
              className={`group flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
                showComments
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Comments"
            >
              <MessageCircle size={14} className={showComments ? 'fill-blue-600' : ''} />
              <span className="text-xs font-semibold">{commentCount || comments.length}</span>
            </button>

            <div className="flex items-center space-x-1 px-2 py-1 text-gray-500">
              <Eye size={14} />
              <span className="text-xs font-semibold">{views}</span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-1">
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-1 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                title="Share"
              >
                <Share2 size={14} />
              </button>

              {/* Share Menu */}
              {showShareMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowShareMenu(false)}
                  />

                  {/* Menu */}
                  <div className="absolute right-0 bottom-full mb-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">Share this pick</p>
                    </div>

                    <button
                      onClick={handleShareToFacebook}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3"
                    >
                      <div className="w-8 h-8 bg-[#1877F2] rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-900">Share on Facebook</span>
                    </button>

                    <button
                      onClick={handleShareToTwitter}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3"
                    >
                      <div className="w-8 h-8 bg-[#1DA1F2] rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-900">Share on Twitter</span>
                    </button>

                    <button
                      onClick={handleCopyLink}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 border-t border-gray-100"
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <LinkIcon className="text-gray-600" size={16} />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Copy link</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleSave}
              className={`p-1 rounded-md transition-all duration-200 ${
                isSaved
                  ? 'bg-amber-100 text-amber-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={isSaved ? 'Saved' : 'Save'}
            >
              <Bookmark
                size={14}
                className={isSaved ? 'fill-amber-600' : ''}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 px-4 py-3 bg-white">
          {/* Comment Input */}
          {session && (
            <form onSubmit={handleCommentSubmit} className="mb-3">
              <div className="flex items-start space-x-2">
                <div className="w-7 h-7 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-xs">
                    {session.user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm"
                    rows={1}
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-gray-400">
                      {commentText.length}/500
                    </span>
                    <button
                      type="submit"
                      disabled={!commentText.trim() || isSubmittingComment}
                      className="flex items-center space-x-1 px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                    >
                      <Send size={12} />
                      <span>{isSubmittingComment ? '...' : 'Post'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-2">
            {isLoadingComments ? (
              <div className="text-center py-3">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-xs">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-2">
                  <Link
                    href={`/profile/${comment.user.id}`}
                    className="flex-shrink-0"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xs">
                        {comment.user.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
                      <div className="flex items-center space-x-1 mb-0.5">
                        <Link
                          href={`/profile/${comment.user.id}`}
                          className="font-semibold text-xs text-gray-900 hover:underline"
                        >
                          {comment.user.name || 'Anonymous'}
                        </Link>
                        {comment.user.isVerified && (
                          <CheckCircle size={10} className="text-blue-500" />
                        )}
                        <span className="text-gray-400 text-xs">·</span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-800 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                    {session?.user?.id === comment.user.id && (
                      <div className="mt-0.5 px-2">
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

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
