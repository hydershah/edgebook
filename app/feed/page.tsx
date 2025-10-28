'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, Sparkles } from 'lucide-react'
import PickFeed from '@/components/PickFeed'

interface TrendingSport {
  sport: string
  picks: number
  trend: string
  trendValue: number
}

interface TopCreator {
  id: string
  name: string
  avatar?: string
  winRate: number
  followerCount: number
  pickCount: number
}

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'following'>('all')
  const [filters, setFilters] = useState({
    sport: 'all',
    status: 'all',
    units: 'all',
    premiumOnly: false,
  })
  const [trendingSports, setTrendingSports] = useState<TrendingSport[]>([])
  const [topCreators, setTopCreators] = useState<TopCreator[]>([])
  const [loadingSports, setLoadingSports] = useState(true)
  const [loadingCreators, setLoadingCreators] = useState(true)

  useEffect(() => {
    fetchTrendingSports()
    fetchTopCreators()
  }, [])

  const fetchTrendingSports = async () => {
    try {
      const response = await fetch('/api/sports/trending')
      if (response.ok) {
        const data = await response.json()
        setTrendingSports(data)
      }
    } catch (error) {
      console.error('Error fetching trending sports:', error)
    } finally {
      setLoadingSports(false)
    }
  }

  const fetchTopCreators = async () => {
    try {
      const response = await fetch('/api/users/top-creators')
      if (response.ok) {
        const data = await response.json()
        setTopCreators(data)
      }
    } catch (error) {
      console.error('Error fetching top creators:', error)
    } finally {
      setLoadingCreators(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Hidden on mobile */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-6 space-y-6">
              {/* AI Sports Advisor Card */}
              <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Sparkles className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">AI Advisor</h3>
                    <p className="text-xs text-white/80">Smart Insights</p>
                  </div>
                </div>
                <p className="text-sm text-white/90 mb-4 leading-relaxed">
                  Get personalized predictions and improve your betting edge with AI
                </p>
                <Link
                  href="/aiadvisor"
                  className="block w-full bg-white text-primary font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-center text-sm"
                >
                  Try Now
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Today&apos;s Trends</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Hot Picks</span>
                    <span className="font-bold text-primary">247</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Top Creators</span>
                    <span className="font-bold text-primary">89</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Win Rate</span>
                    <span className="font-bold text-green-600">67%</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="lg:col-span-6 space-y-4">
            {/* Mobile AI Banner */}
            <div className="lg:hidden bg-gradient-to-r from-primary to-primary-dark rounded-xl p-5 text-white shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Sparkles className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">AI Sports Advisor</h3>
                    <p className="text-xs text-white/80">Get smart insights</p>
                  </div>
                </div>
                <Link
                  href="/aiadvisor"
                  className="bg-white text-primary font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                >
                  Try
                </Link>
              </div>
            </div>

            {/* Header - Sticky Tabs */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200 -mx-4 sm:-mx-6 lg:mx-0 lg:rounded-t-2xl overflow-hidden backdrop-blur-lg bg-white/95">
              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`relative flex-1 sm:flex-none sm:px-8 py-4 font-semibold transition-all ${
                    activeTab === 'all'
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                  }`}
                >
                  <span className="text-[15px]">For You</span>
                  {activeTab === 'all' && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('following')}
                  className={`relative flex-1 sm:flex-none sm:px-8 py-4 font-semibold transition-all ${
                    activeTab === 'following'
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                  }`}
                >
                  <span className="text-[15px]">Following</span>
                  {activeTab === 'following' && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full"></div>
                  )}
                </button>
              </div>

              {/* Filter Pills - Horizontal Scroll */}
              <div className="overflow-x-auto scrollbar-hide px-4 py-3">
                <div className="flex items-center space-x-2 min-w-max">
                  {/* Sport Pills */}
                  {['All Sports', 'NFL', 'NBA', 'MLB', 'NHL', 'Soccer'].map((sport) => {
                    const value = sport === 'All Sports' ? 'all' : sport.toUpperCase()
                    const isActive = filters.sport === value
                    return (
                      <button
                        key={sport}
                        onClick={() => setFilters({ ...filters, sport: value })}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                          isActive
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {sport === 'NFL' && '🏈 '}
                        {sport === 'NBA' && '🏀 '}
                        {sport === 'MLB' && '⚾ '}
                        {sport === 'NHL' && '🏒 '}
                        {sport === 'Soccer' && '⚽ '}
                        {sport}
                      </button>
                    )
                  })}

                  <div className="w-px h-6 bg-gray-300"></div>

                  {/* Status Pills */}
                  {[
                    { label: 'All Status', value: 'all' },
                    { label: 'Pending', value: 'PENDING', emoji: '⏳' },
                    { label: 'Won', value: 'WON', emoji: '✅' },
                    { label: 'Lost', value: 'LOST', emoji: '❌' },
                  ].map((status) => {
                    const isActive = filters.status === status.value
                    return (
                      <button
                        key={status.value}
                        onClick={() => setFilters({ ...filters, status: status.value })}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                          isActive
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status.emoji && `${status.emoji} `}
                        {status.label}
                      </button>
                    )
                  })}

                  <div className="w-px h-6 bg-gray-300"></div>

                  {/* Units Pills */}
                  {['All Units', '1U', '2U', '3U', '4U', '5U'].map((unit) => {
                    const value = unit === 'All Units' ? 'all' : unit.charAt(0)
                    const isActive = filters.units === value
                    return (
                      <button
                        key={unit}
                        onClick={() => setFilters({ ...filters, units: value })}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                          isActive
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {unit}
                      </button>
                    )
                  })}

                  <div className="w-px h-6 bg-gray-300"></div>

                  {/* Premium Toggle */}
                  <button
                    onClick={() => setFilters({ ...filters, premiumOnly: !filters.premiumOnly })}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center space-x-1 ${
                      filters.premiumOnly
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>💎</span>
                    <span>{filters.premiumOnly ? 'Premium' : 'All Content'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Feed */}
            <PickFeed filters={filters} followingOnly={activeTab === 'following'} />
          </main>

          {/* Right Sidebar - Hidden on mobile */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-6 space-y-6">
              {/* Trending Sports */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="text-primary" size={20} />
                  <h3 className="font-bold text-gray-900">Trending</h3>
                </div>
                <div className="space-y-3">
                  {loadingSports ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg animate-pulse"
                      >
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-12"></div>
                      </div>
                    ))
                  ) : trendingSports.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No trending sports yet
                    </p>
                  ) : (
                    trendingSports.map((item) => (
                      <div
                        key={item.sport}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{item.sport}</p>
                          <p className="text-xs text-gray-500">{item.picks} picks</p>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            item.trendValue >= 0
                              ? 'text-green-600 bg-green-50'
                              : 'text-red-600 bg-red-50'
                          }`}
                        >
                          {item.trend}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Suggested Creators */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Top Creators</h3>
                <div className="space-y-4">
                  {loadingCreators ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center space-x-3 animate-pulse">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                      </div>
                    ))
                  ) : topCreators.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No creators yet
                    </p>
                  ) : (
                    topCreators.map((creator) => (
                      <Link
                        key={creator.id}
                        href={`/profile/${creator.id}`}
                        className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      >
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
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {creator.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {creator.name}
                          </p>
                          <p className="text-xs text-gray-500">{creator.winRate}% Win Rate</p>
                        </div>
                        <button className="text-xs font-semibold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors">
                          Follow
                        </button>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
