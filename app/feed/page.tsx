'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, ChevronDown, Filter as FilterIcon, X } from 'lucide-react'
import PickFeed from '@/components/PickFeed'
import AccountStatusBanner from '@/components/AccountStatusBanner'
import CreatePostBox from '@/components/CreatePostBox'

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
    dateRange: 'all',
  })
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [trendingSports, setTrendingSports] = useState<TrendingSport[]>([])
  const [topCreators, setTopCreators] = useState<TopCreator[]>([])
  const [loadingSports, setLoadingSports] = useState(true)
  const [loadingCreators, setLoadingCreators] = useState(true)
  const [sportDropdownOpen, setSportDropdownOpen] = useState(false)
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false)

  // Daily stats state
  const [dailyStats, setDailyStats] = useState({
    hotPicks: 0,
    topCreators: 0,
    winRate: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    fetchTrendingSports()
    fetchTopCreators()
    fetchDailyStats()
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

  const fetchDailyStats = async () => {
    try {
      const response = await fetch('/api/stats/daily')
      if (response.ok) {
        const data = await response.json()
        setDailyStats(data)
      }
    } catch (error) {
      console.error('Error fetching daily stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Account Status Banner */}
      <AccountStatusBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Hidden on mobile */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-6 space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="font-bold text-subheader-2 text-gray-900 mb-4">Today&apos;s Trends</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Hot Picks</span>
                    {loadingStats ? (
                      <div className="h-5 w-12 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      <span className="font-bold text-primary">{dailyStats.hotPicks.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Top Creators</span>
                    {loadingStats ? (
                      <div className="h-5 w-12 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      <span className="font-bold text-primary">{dailyStats.topCreators.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Win Rate</span>
                    {loadingStats ? (
                      <div className="h-5 w-12 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      <span className="font-bold text-green-600">{dailyStats.winRate}%</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="lg:col-span-6 space-y-4">
            {/* Create Post Box */}
            <CreatePostBox />

            {/* Header - Sticky Tabs */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200 -mx-4 sm:-mx-6 lg:mx-0 lg:rounded-t-2xl backdrop-blur-lg bg-white/95">
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

              {/* Filter Pills - Sports Dropdown + Date Filter + More Options */}
              <div className="px-4 py-3 flex items-center space-x-3">
                {/* Sports Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setSportDropdownOpen(!sportDropdownOpen)}
                    className="px-4 py-1.5 rounded-full text-sm font-medium bg-primary text-white shadow-sm hover:bg-primary-dark transition-all whitespace-nowrap flex items-center space-x-2"
                  >
                    <span>
                      {filters.sport === 'all' && '🏆 All Sports'}
                      {filters.sport === 'NFL' && '🏈 NFL'}
                      {filters.sport === 'NBA' && '🏀 NBA'}
                      {filters.sport === 'MLB' && '⚾ MLB'}
                      {filters.sport === 'NHL' && '🏒 NHL'}
                      {filters.sport === 'SOCCER' && '⚽ Soccer'}
                      {filters.sport === 'NCAAF' && '🏈 NCAAF'}
                      {filters.sport === 'NCAAB' && '🏀 NCAAB'}
                    </span>
                    <ChevronDown size={16} className={`transition-transform ${sportDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {sportDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setSportDropdownOpen(false)}
                      />
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-40 max-h-80 overflow-y-auto">
                        {[
                          { label: '🏆 All Sports', value: 'all' },
                          { label: '🏈 NFL', value: 'NFL' },
                          { label: '🏀 NBA', value: 'NBA' },
                          { label: '⚾ MLB', value: 'MLB' },
                          { label: '🏒 NHL', value: 'NHL' },
                          { label: '⚽ Soccer', value: 'SOCCER' },
                          { label: '🏈 NCAAF', value: 'NCAAF' },
                          { label: '🏀 NCAAB', value: 'NCAAB' },
                        ].map((sport) => (
                          <button
                            key={sport.value}
                            onClick={() => {
                              setFilters({ ...filters, sport: sport.value })
                              setSportDropdownOpen(false)
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              filters.sport === sport.value
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {sport.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Date Filter Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
                    className="px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all whitespace-nowrap flex items-center space-x-2"
                  >
                    <span>
                      {filters.dateRange === 'all' && '📅 All Time'}
                      {filters.dateRange === 'today' && '📅 Today'}
                      {filters.dateRange === 'week' && '📅 This Week'}
                      {filters.dateRange === 'month' && '📅 This Month'}
                      {filters.dateRange === 'year' && '📅 This Year'}
                    </span>
                    <ChevronDown size={16} className={`transition-transform ${dateDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dateDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setDateDropdownOpen(false)}
                      />
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-40">
                        {[
                          { label: '📅 All Time', value: 'all' },
                          { label: '📅 Today', value: 'today' },
                          { label: '📅 This Week', value: 'week' },
                          { label: '📅 This Month', value: 'month' },
                          { label: '📅 This Year', value: 'year' },
                        ].map((range) => (
                          <button
                            key={range.value}
                            onClick={() => {
                              setFilters({ ...filters, dateRange: range.value })
                              setDateDropdownOpen(false)
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              filters.dateRange === range.value
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {range.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Filter Panel Toggle Button (Reddit-style) */}
                <button
                  onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                  className={`p-2 rounded-lg transition-all ${
                    isFilterPanelOpen
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Advanced Filters"
                >
                  <FilterIcon size={18} />
                </button>

                <div className="w-px h-6 bg-gray-300"></div>

                {/* Other Filters - Horizontal Scroll with Fade Indicators */}
                <div className="relative flex-1 min-w-0">
                  {/* Left fade */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />

                  {/* Scrollable content */}
                  <div className="overflow-x-auto scrollbar-hide">
                    <div className="flex items-center space-x-2 min-w-max pl-4 pr-8">
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

                  {/* Right fade */}
                  <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Reddit-Style Filter Panel */}
            {isFilterPanelOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 z-40"
                  onClick={() => setIsFilterPanelOpen(false)}
                />

                {/* Filter Panel Modal */}
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
                      <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                        <FilterIcon size={24} className="text-primary" />
                        <span>Filter Picks</span>
                      </h2>
                      <button
                        onClick={() => setIsFilterPanelOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X size={20} className="text-gray-600" />
                      </button>
                    </div>

                    {/* Filter Options */}
                    <div className="p-6 space-y-6">
                      {/* Sport Filter */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Sport</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: '🏆 All Sports', value: 'all' },
                            { label: '🏈 NFL', value: 'NFL' },
                            { label: '🏀 NBA', value: 'NBA' },
                            { label: '⚾ MLB', value: 'MLB' },
                            { label: '🏒 NHL', value: 'NHL' },
                            { label: '⚽ Soccer', value: 'SOCCER' },
                            { label: '🏈 NCAAF', value: 'NCAAF' },
                            { label: '🏀 NCAAB', value: 'NCAAB' },
                          ].map((sport) => (
                            <button
                              key={sport.value}
                              onClick={() => setFilters({ ...filters, sport: sport.value })}
                              className={`px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                                filters.sport === sport.value
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {sport.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Status Filter */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Status</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: 'All Status', value: 'all' },
                            { label: '⏳ Pending', value: 'PENDING' },
                            { label: '✅ Won', value: 'WON' },
                            { label: '❌ Lost', value: 'LOST' },
                            { label: '🔄 Push', value: 'PUSH' },
                          ].map((status) => (
                            <button
                              key={status.value}
                              onClick={() => setFilters({ ...filters, status: status.value })}
                              className={`px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                                filters.status === status.value
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {status.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Confidence Filter */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Confidence (Units)</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: 'All Units', value: 'all' },
                            { label: '1 Unit', value: '1' },
                            { label: '2 Units', value: '2' },
                            { label: '3 Units', value: '3' },
                            { label: '4 Units', value: '4' },
                            { label: '5 Units', value: '5' },
                          ].map((unit) => (
                            <button
                              key={unit.value}
                              onClick={() => setFilters({ ...filters, units: unit.value })}
                              className={`px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                                filters.units === unit.value
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {unit.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Date Range Filter */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Date Range</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: 'All Time', value: 'all' },
                            { label: 'Today', value: 'today' },
                            { label: 'This Week', value: 'week' },
                            { label: 'This Month', value: 'month' },
                            { label: 'This Year', value: 'year' },
                          ].map((range) => (
                            <button
                              key={range.value}
                              onClick={() => setFilters({ ...filters, dateRange: range.value })}
                              className={`px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                                filters.dateRange === range.value
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {range.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Content Type Filter */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Content Type</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: 'All Content', value: false },
                            { label: '💎 Premium Only', value: true },
                          ].map((type) => (
                            <button
                              key={type.value.toString()}
                              onClick={() => setFilters({ ...filters, premiumOnly: type.value })}
                              className={`px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                                filters.premiumOnly === type.value
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {type.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 p-6 flex gap-3 bg-gray-50 rounded-b-2xl sticky bottom-0">
                      <button
                        onClick={() => {
                          setFilters({
                            sport: 'all',
                            status: 'all',
                            units: 'all',
                            premiumOnly: false,
                            dateRange: 'all',
                          })
                        }}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Reset Filters
                      </button>
                      <button
                        onClick={() => setIsFilterPanelOpen(false)}
                        className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

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
                  <h3 className="font-bold text-subheader-2 text-gray-900">Trending</h3>
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
                <h3 className="font-bold text-subheader-2 text-gray-900 mb-4">Top Creators</h3>
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
