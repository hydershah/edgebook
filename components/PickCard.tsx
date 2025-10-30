'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Lock, TrendingUp, ThumbsUp, ThumbsDown, MessageCircle, Share2, Bookmark, Eye, MoreHorizontal, CheckCircle, Send, Trash2 } from 'lucide-react'
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
  const [isSharing, setIsSharing] = useState(false)

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

  const handleShare = async () => {
    if (isSharing) return

    setIsSharing(true)

    const shareUrl = `${window.location.origin}/pick/${pick.id}`
    const shareText = `Check out this ${pick.sport} pick: ${pick.matchup}`

    try {
      // Try Web Share API first (works on mobile and some desktop browsers)
      if (navigator.share) {
        await navigator.share({
          title: `${pick.user.name}'s Pick - ${pick.matchup}`,
          text: shareText,
          url: shareUrl,
        })
        setModal({
          isOpen: true,
          title: 'Shared!',
          message: 'Pick shared successfully.',
          type: 'success',
        })
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl)
        setModal({
          isOpen: true,
          title: 'Link Copied!',
          message: 'Pick link has been copied to your clipboard.',
          type: 'success',
        })
      }
    } catch (error) {
      // Only show error if it's not a user cancellation
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing pick:', error)
        setModal({
          isOpen: true,
          title: 'Share Failed',
          message: 'Unable to share pick. Please try again.',
          type: 'error',
        })
      }
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <article className="bg-white border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
      {/* Header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3">
          <Link
            href={`/profile/${pick.user.id}`}
            className="flex items-center space-x-3 group/user hover:opacity-80 transition-opacity flex-1 min-w-0"
          >
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-base">
                  {pick.user.name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              {/* Verified badge */}
              <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5">
                <CheckCircle className="text-white" size={12} />
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
        <div className="mb-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${status.bg} ${status.text}`}>
            {status.label}
          </span>
        </div>

        {/* Matchup */}
        <h3 className="font-semibold text-[17px] text-gray-900 mb-2.5 leading-snug">
          {pick.matchup}
        </h3>

        {/* Content */}
        {pick.isPremium && !isUnlocked && !isOwnPick ? (
          <div className="relative rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-full mb-3">
                <Lock className="text-white" size={20} />
              </div>
              <p className="text-gray-700 text-sm font-medium mb-4">
                Unlock to view full analysis
              </p>
              <button
                onClick={handleUnlock}
                disabled={isUnlocking}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isUnlocking ? 'Unlocking...' : `Unlock for $${pick.price}`}
              </button>
              <div className="mt-3 flex items-center justify-center space-x-3 text-xs text-gray-500">
                <span>{unlocks} unlocked</span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {pick.isPremium && isUnlocked && (
              <div className="bg-green-50 rounded-md p-2 mb-3 flex items-center space-x-2">
                <CheckCircle className="text-green-600 flex-shrink-0" size={16} />
                <span className="text-xs font-medium text-green-800">Premium unlocked</span>
              </div>
            )}
            <p className="text-gray-800 leading-relaxed text-[15px]">
              {pick.details}
            </p>
            {pick.odds && (
              <div className="mt-3 inline-flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-md">
                <span className="text-xs font-medium text-gray-600">Odds:</span>
                <span className="text-sm font-semibold text-gray-900">{pick.odds}</span>
              </div>
            )}
          </div>
        )}

        {/* Game Date & Lock Status */}
        <div className="mt-4 pt-3 space-y-2">
          <p className="text-xs text-gray-500">
            {new Date(pick.gameDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
            {(pick.isLocked || timeUntilLock) && (
              <>
                {' · '}
                {pick.isLocked ? (
                  <span className="text-red-600 font-medium">Locked</span>
                ) : (
                  <span className="text-yellow-700 font-medium">{timeUntilLock}</span>
                )}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Engagement Section */}
      <div className="border-t border-gray-200 px-4 sm:px-5 py-2">
        <div className="flex items-center justify-between max-w-full">
          {/* Left actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-1 min-w-0">
            {/* Upvote button */}
            <button
              onClick={() => handleVote('UPVOTE')}
              className={`group flex items-center space-x-1 px-2 sm:px-3 py-1.5 rounded-full transition-colors ${
                userVoteType === 'UPVOTE'
                  ? 'text-green-600'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
              title="Upvote"
            >
              <ThumbsUp
                size={18}
                className={`${userVoteType === 'UPVOTE' ? 'fill-green-600' : ''} transition-all`}
              />
              <span className="text-xs sm:text-sm font-medium">{upvotes}</span>
            </button>

            {/* Downvote button */}
            <button
              onClick={() => handleVote('DOWNVOTE')}
              className={`group flex items-center space-x-1 px-2 sm:px-3 py-1.5 rounded-full transition-colors ${
                userVoteType === 'DOWNVOTE'
                  ? 'text-red-600'
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
              }`}
              title="Downvote"
            >
              <ThumbsDown
                size={18}
                className={`${userVoteType === 'DOWNVOTE' ? 'fill-red-600' : ''} transition-all`}
              />
              <span className="text-xs sm:text-sm font-medium">{downvotes}</span>
            </button>

            <button
              onClick={toggleComments}
              className={`group flex items-center space-x-1 px-2 sm:px-3 py-1.5 rounded-full transition-colors ${
                showComments
                  ? 'text-primary'
                  : 'text-gray-600 hover:text-primary hover:bg-primary/5'
              }`}
              title="Comments"
            >
              <MessageCircle size={18} className="transition-all" />
              <span className="text-xs sm:text-sm font-medium">{commentCount || comments.length}</span>
            </button>

            <div className="hidden sm:flex items-center space-x-1 px-2 sm:px-3 py-1.5 text-gray-500 text-xs sm:text-sm">
              <Eye size={16} />
              <span>{views}</span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="p-2 rounded-full text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Share"
            >
              <Share2 size={18} />
            </button>

            <button
              onClick={handleSave}
              className={`p-2 rounded-full transition-colors ${
                isSaved
                  ? 'text-primary'
                  : 'text-gray-600 hover:text-primary hover:bg-primary/5'
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
        <div className="border-t border-gray-200 px-4 sm:px-5 py-4 bg-gray-50/30">
          {/* Comment Input */}
          {session && (
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <div className="flex items-start space-x-2.5">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none text-sm bg-white"
                    rows={2}
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {commentText.length}/500
                    </span>
                    <button
                      type="submit"
                      disabled={!commentText.trim() || isSubmittingComment}
                      className="flex items-center space-x-1.5 px-4 py-1.5 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
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
