'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'
import PickFilters from '@/components/PickFilters'
import PickFeed from '@/components/PickFeed'

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'following'>('all')
  const [filters, setFilters] = useState({
    sport: 'all',
    status: 'all',
    units: 'all',
    premiumOnly: false,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* AI Sports Advisor Banner */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <TrendingUp className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Sports Advisor</h3>
                <p className="text-sm text-gray-600">
                  Get personalized insights and improve your edge
                </p>
              </div>
            </div>
            <Link href="/aiadvisor" className="btn-primary">
              Get Insights
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            All Picks
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'following'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Following
          </button>
        </div>

        {/* Filters */}
        <PickFilters filters={filters} setFilters={setFilters} />

        {/* Feed */}
        <PickFeed filters={filters} followingOnly={activeTab === 'following'} />
      </div>
    </div>
  )
}
