'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Lock, TrendingUp, ThumbsUp, ThumbsDown, MessageCircle, Share2, Bookmark, Eye, MoreHorizontal, CheckCircle, Send, Trash2, X, Link as LinkIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useSession } from 'next-auth/react'
import Modal from './Modal'

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
    <article className="bg-white">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <Link
            href={`/profile/${pick.user.id}`}
            className="flex items-center space-x-3 group/user hover:opacity-80 transition-opacity flex-1 min-w-0"
          >
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
                <span className="text-white font-bold text-lg">
                  {pick.user.name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              {/* Verified badge */}
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 shadow-sm">
                <CheckCircle className="text-white" size={14} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1.5 flex-wrap">
                <p className="font-semibold text-gray-900 truncate text-[15px]">
                  {pick.user.name || 'Anonymous'}
                </p>
                <span className="text-gray-400">·</span>
                <p className="text-sm text-gray-500 flex-shrink-0">
                  {formatDistanceToNow(new Date(pick.createdAt), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-0.5 flex-wrap gap-1">
                <span className="text-xs text-gray-500 font-medium">
                  {pick.sport}
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-500">
                  {pick.pickType}
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-xs font-semibold text-blue-600 flex items-center gap-0.5">
                  <TrendingUp size={11} />
                  {pick.confidence}U
                </span>
              </div>
            </div>
          </Link>

          <div className="flex items-center space-x-1 ml-2">
            {pick.isPremium && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded text-xs font-semibold">
                <Lock size={11} />
                <span>${pick.price}</span>
              </div>
            )}
            <button className="p-1.5 hover:bg-gray-200 rounded-full transition-colors">
              <MoreHorizontal size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Status Badge - More subtle placement */}
        <div className="mb-4">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${status.bg} ${status.text} ${status.border} border`}>
            {status.label}
          </span>
        </div>

        {/* Matchup */}
        <h3 className="font-bold text-subheader-2 text-gray-900 mb-3 leading-tight">
          {pick.matchup}
        </h3>

        {/* Content */}
        {pick.isPremium && !isUnlocked && !isOwnPick ? (
          <div className="relative rounded-xl bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border-2 border-green-200 p-8 text-center">
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
        ) : (
          <div>
            {pick.isPremium && isUnlocked && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center space-x-2">
                <CheckCircle className="text-green-600 flex-shrink-0" size={18} />
                <span className="text-sm font-medium text-green-800">You&apos;ve unlocked this premium pick</span>
              </div>
            )}
            <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
              {pick.details}
            </p>
            {pick.odds && (
              <div className="mt-4 inline-flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <span className="text-sm font-semibold text-gray-700">Odds:</span>
                <span className="text-sm font-bold text-primary">{pick.odds}</span>
              </div>
            )}
          </div>
        )}

        {/* Game Date & Lock Status */}
        <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-500 flex items-center space-x-2">
              <span className="font-medium">Game Date:</span>
              <span>
                {new Date(pick.gameDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </p>
          </div>
          {pick.isLocked && (
            <div className="inline-flex items-center space-x-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-200">
              <Lock size={14} />
              <span className="text-sm font-medium">Locked - Event Started</span>
            </div>
          )}
          {!pick.isLocked && timeUntilLock && (
            <div className="inline-flex items-center space-x-2 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg border border-yellow-200">
              <span className="text-sm font-medium">{timeUntilLock}</span>
            </div>
          )}
        </div>
      </div>

      {/* Engagement Section */}
      <div className="border-t border-gray-100 px-6 py-3 bg-gray-50/50">
        <div className="flex items-center justify-between max-w-full">
          {/* Left actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-1 min-w-0">
            {/* Upvote button */}
            <button
              onClick={() => handleVote('UPVOTE')}
              className={`group flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all duration-200 ${
                userVoteType === 'UPVOTE'
                  ? 'bg-green-50 text-green-600 hover:bg-green-100'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Upvote"
            >
              <ThumbsUp
                size={18}
                className={`${userVoteType === 'UPVOTE' ? 'fill-green-600' : ''} transition-all`}
              />
              <span className="text-sm font-medium">{upvotes}</span>
            </button>

            {/* Downvote button */}
            <button
              onClick={() => handleVote('DOWNVOTE')}
              className={`group flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all duration-200 ${
                userVoteType === 'DOWNVOTE'
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Downvote"
            >
              <ThumbsDown
                size={18}
                className={`${userVoteType === 'DOWNVOTE' ? 'fill-red-600' : ''} transition-all`}
              />
              <span className="text-sm font-medium">{downvotes}</span>
            </button>

            <button
              onClick={toggleComments}
              className={`group flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                showComments
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Comments"
            >
              <MessageCircle size={18} className={showComments ? 'fill-primary' : ''} />
              <span className="text-sm font-medium">{commentCount || comments.length}</span>
            </button>

            <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
              <Eye size={18} />
              <span className="text-sm font-medium">{views}</span>
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-1">
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                title="Share"
              >
                <Share2 size={18} />
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
              className={`p-2 rounded-lg transition-all duration-200 ${
                isSaved
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={isSaved ? 'Saved' : 'Save'}
            >
              <Bookmark
                size={18}
                className={isSaved ? 'fill-primary' : ''}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 px-6 py-4 bg-white">
          {/* Comment Input */}
          {session && (
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">
                    {session.user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm"
                    rows={2}
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {commentText.length}/500
                    </span>
                    <button
                      type="submit"
                      disabled={!commentText.trim() || isSubmittingComment}
                      className="flex items-center space-x-1 px-4 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      <Send size={14} />
                      <span>{isSubmittingComment ? 'Posting...' : 'Post'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-3">
            {isLoadingComments ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-2.5">
                  <Link
                    href={`/profile/${comment.user.id}`}
                    className="flex-shrink-0"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {comment.user.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2">
                      <div className="flex items-center space-x-1.5 mb-1">
                        <Link
                          href={`/profile/${comment.user.id}`}
                          className="font-semibold text-sm text-gray-900 hover:underline"
                        >
                          {comment.user.name || 'Anonymous'}
                        </Link>
                        {comment.user.isVerified && (
                          <CheckCircle size={13} className="text-blue-500" />
                        )}
                        <span className="text-gray-400">·</span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                    {session?.user?.id === comment.user.id && (
                      <div className="mt-1 px-3">
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
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
