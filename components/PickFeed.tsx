'use client'

import { useEffect, useState } from 'react'
import PickCard from './PickCard'

interface Pick {
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

interface PickFeedProps {
  filters: {
    sport: string
    status: string
    units: string
    premiumOnly: boolean
  }
  followingOnly: boolean
}

export default function PickFeed({ filters, followingOnly }: PickFeedProps) {
  const [picks, setPicks] = useState<Pick[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPicks()
  }, [filters, followingOnly])

  const fetchPicks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.sport !== 'all') params.append('sport', filters.sport)
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.units !== 'all') params.append('confidence', filters.units)
      if (filters.premiumOnly) params.append('premiumOnly', 'true')
      if (followingOnly) params.append('followingOnly', 'true')

      const response = await fetch(`/api/picks?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setPicks(data)
      }
    } catch (error) {
      console.error('Error fetching picks:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading picks...</p>
      </div>
    )
  }

  if (picks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No picks found</h3>
        <p className="text-gray-600">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {picks.map((pick) => (
        <PickCard key={pick.id} pick={pick} />
      ))}
    </div>
  )
}
