'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserCheck, UserPlus } from 'lucide-react'

interface FollowButtonProps {
  userId: string
  initialIsFollowing: boolean
  initialFollowerCount: number
}

export default function FollowButton({ userId, initialIsFollowing, initialFollowerCount }: FollowButtonProps) {
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [followerCount, setFollowerCount] = useState(initialFollowerCount)
  const [loading, setLoading] = useState(false)

  const handleToggleFollow = async () => {
    if (loading) return

    setLoading(true)
    const method = isFollowing ? 'DELETE' : 'POST'

    try {
      const response = await fetch('/api/follow', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followingId: userId }),
      })

      if (!response.ok) {
        throw new Error('Failed to update follow status')
      }

      setIsFollowing(!isFollowing)
      setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1)
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isFollowing
          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          : 'bg-primary text-white hover:bg-primary-dark'
      } disabled:opacity-75 disabled:cursor-not-allowed`}
    >
      {isFollowing ? (
        <>
          <UserCheck size={18} />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlus size={18} />
          <span>Follow</span>
        </>
      )}
      <span className="ml-2 text-sm font-normal">
        {followerCount.toLocaleString()} follower{followerCount === 1 ? '' : 's'}
      </span>
    </button>
  )
}
