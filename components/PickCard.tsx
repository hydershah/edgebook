'use client'

import Link from 'next/link'
import { Lock, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface PickCardProps {
  pick: {
    id: string
    user: {
      id: string
      name: string
      avatar?: string
    }
    pickType: string
    sport: string
    matchup: string
    details: string
    odds?: string
    confidence: number
    status: string
    isPremium: boolean
    price?: number
    createdAt: string
    gameDate: string
  }
}

export default function PickCard({ pick }: PickCardProps) {
  const statusColors = {
    PENDING: 'bg-gray-100 text-gray-700',
    WON: 'bg-green-100 text-green-700',
    LOST: 'bg-red-100 text-red-700',
    PUSH: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link href={`/profile/${pick.user.id}`} className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-700 font-semibold">
              {pick.user.name[0]}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{pick.user.name}</p>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(pick.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>

        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[pick.status as keyof typeof statusColors]}`}>
            {pick.status}
          </span>
          {pick.isPremium && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center">
              <Lock size={12} className="mr-1" />
              ${pick.price}
            </span>
          )}
        </div>
      </div>

      {/* Pick Info */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
            {pick.sport}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
            {pick.pickType}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium flex items-center">
            <TrendingUp size={12} className="mr-1" />
            {pick.confidence} Unit{pick.confidence > 1 ? 's' : ''}
          </span>
        </div>

        <h3 className="font-semibold text-lg text-gray-900">{pick.matchup}</h3>

        {pick.isPremium ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <Lock className="mx-auto text-gray-400 mb-2" size={24} />
            <p className="text-sm text-gray-600 mb-3">
              This pick is premium content
            </p>
            <button className="btn-primary">
              Unlock for ${pick.price}
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-700">{pick.details}</p>
            {pick.odds && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Odds:</span> {pick.odds}
              </p>
            )}
          </>
        )}

        <p className="text-sm text-gray-500">
          Game Date: {new Date(pick.gameDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
