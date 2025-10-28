'use client'

import { X, Lock, Filter as FilterIcon } from 'lucide-react'

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

  const activeFilterCount = [
    filters.sport !== 'all',
    filters.status !== 'all',
    filters.units !== 'all',
    filters.premiumOnly,
  ].filter(Boolean).length

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FilterIcon className="text-gray-600" size={18} />
            <h3 className="font-bold text-gray-900">Filters</h3>
            {activeFilterCount > 0 && (
              <span className="bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              <X size={16} />
              <span className="font-medium">Clear All</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Sport Filter */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sport</label>
            <select
              value={filters.sport}
              onChange={(e) => handleFilterChange('sport', e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none bg-white cursor-pointer text-sm font-medium"
            >
              <option value="all">All Sports</option>
              <option value="NFL">🏈 NFL</option>
              <option value="NBA">🏀 NBA</option>
              <option value="MLB">⚾ MLB</option>
              <option value="NHL">🏒 NHL</option>
              <option value="SOCCER">⚽ Soccer</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none bg-white cursor-pointer text-sm font-medium"
            >
              <option value="all">All Status</option>
              <option value="PENDING">⏳ Pending</option>
              <option value="WON">✅ Won</option>
              <option value="LOST">❌ Lost</option>
              <option value="PUSH">🔄 Push</option>
            </select>
          </div>

          {/* Units Filter */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confidence</label>
            <select
              value={filters.units}
              onChange={(e) => handleFilterChange('units', e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none bg-white cursor-pointer text-sm font-medium"
            >
              <option value="all">All Units</option>
              <option value="1">1 Unit</option>
              <option value="2">2 Units</option>
              <option value="3">3 Units</option>
              <option value="4">4 Units</option>
              <option value="5">5 Units</option>
            </select>
          </div>

          {/* Premium Only */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Content Type</label>
            <button
              onClick={() => handleFilterChange('premiumOnly', !filters.premiumOnly)}
              className={`w-full px-3 py-2.5 border-2 rounded-lg font-medium text-sm flex items-center justify-center space-x-2 transition-all ${
                filters.premiumOnly
                  ? 'border-primary bg-green-50 text-primary'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <Lock size={16} />
              <span>{filters.premiumOnly ? 'Premium Only' : 'All Content'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="bg-gray-50 px-4 sm:px-5 py-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.sport !== 'all' && (
              <span className="inline-flex items-center space-x-1 bg-white px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 border border-gray-200">
                <span>Sport: {filters.sport}</span>
                <button
                  onClick={() => handleFilterChange('sport', 'all')}
                  className="ml-1 hover:text-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            )}
            {filters.status !== 'all' && (
              <span className="inline-flex items-center space-x-1 bg-white px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 border border-gray-200">
                <span>Status: {filters.status}</span>
                <button
                  onClick={() => handleFilterChange('status', 'all')}
                  className="ml-1 hover:text-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            )}
            {filters.units !== 'all' && (
              <span className="inline-flex items-center space-x-1 bg-white px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 border border-gray-200">
                <span>{filters.units} Unit(s)</span>
                <button
                  onClick={() => handleFilterChange('units', 'all')}
                  className="ml-1 hover:text-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            )}
            {filters.premiumOnly && (
              <span className="inline-flex items-center space-x-1 bg-green-100 px-3 py-1.5 rounded-lg text-xs font-medium text-primary border border-green-200">
                <Lock size={12} />
                <span>Premium Only</span>
                <button
                  onClick={() => handleFilterChange('premiumOnly', false)}
                  className="ml-1 hover:text-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
