'use client'

import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import Link from 'next/link'

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Trending Bettors</h1>
              <p className="text-gray-600">Top performers with proven track records</p>
            </div>
          </div>
        </div>

        {/* Trending Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : trendingUsers.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No trending users yet
              </h3>
              <p className="text-gray-600">Users need at least 5 picks to be featured</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trendingUsers.map((user, index) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}`}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center font-semibold text-gray-700">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">
                        {user.stats.totalPicks} picks
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      {user.stats.winRate}% Win Rate
                    </p>
                    <p className="text-sm text-gray-600">
                      {user.stats.roi}% ROI
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
