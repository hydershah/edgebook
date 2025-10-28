'use client'

import { X } from 'lucide-react'

interface PickFiltersProps {
  filters: {
    sport: string
    status: string
    units: string
    premiumOnly: boolean
  }
  setFilters: (filters: any) => void
}

export default function PickFilters({ filters, setFilters }: PickFiltersProps) {
  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    setFilters({
      sport: 'all',
      status: 'all',
      units: 'all',
      premiumOnly: false,
    })
  }

  const hasActiveFilters =
    filters.sport !== 'all' ||
    filters.status !== 'all' ||
    filters.units !== 'all' ||
    filters.premiumOnly

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
        {/* Sport Filter */}
        <select
          value={filters.sport}
          onChange={(e) => handleFilterChange('sport', e.target.value)}
          className="select-field"
        >
          <option value="all">All - Sports</option>
          <option value="NFL">NFL</option>
          <option value="NBA">NBA</option>
          <option value="MLB">MLB</option>
          <option value="NHL">NHL</option>
          <option value="SOCCER">Soccer</option>
        </select>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="select-field"
        >
          <option value="all">All - Status</option>
          <option value="PENDING">Pending</option>
          <option value="WON">Won</option>
          <option value="LOST">Lost</option>
          <option value="PUSH">Push</option>
        </select>

        {/* Units Filter */}
        <select
          value={filters.units}
          onChange={(e) => handleFilterChange('units', e.target.value)}
          className="select-field"
        >
          <option value="all">All - Units</option>
          <option value="1">1 Unit</option>
          <option value="2">2 Units</option>
          <option value="3">3 Units</option>
          <option value="4">4 Units</option>
          <option value="5">5 Units</option>
        </select>

        {/* Premium Only */}
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.premiumOnly}
            onChange={(e) => handleFilterChange('premiumOnly', e.target.checked)}
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <span className="text-sm font-medium text-gray-700">Premium Only</span>
        </label>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <X size={16} />
          <span>Clear</span>
        </button>
      )}
    </div>
  )
}
