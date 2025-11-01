"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";

export interface FilterOptions {
  sport?: string;
  status?: string;
  confidence?: number;
  pickType?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface PicksFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  sports?: string[];
  pickTypes?: string[];
}

export default function PicksFilter({
  onFilterChange,
  sports = ["NFL", "NBA", "MLB", "NHL", "SOCCER", "UFC", "BOXING", "OTHER"],
  pickTypes = ["MONEYLINE", "SPREAD", "TOTAL", "PROP"],
}: PicksFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Filter size={18} />
        <span className="font-medium">Filters</span>
        {activeFilterCount > 0 && (
          <span className="px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />

          {/* Filter Content */}
          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-40 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">Filter Picks</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter Options */}
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {/* Sport */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport
                </label>
                <select
                  value={filters.sport || ""}
                  onChange={(e) =>
                    handleFilterChange("sport", e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">All Sports</option>
                  {sports.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status || ""}
                  onChange={(e) =>
                    handleFilterChange("status", e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="WON">Won</option>
                  <option value="LOST">Lost</option>
                  <option value="PUSH">Push</option>
                </select>
              </div>

              {/* Pick Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pick Type
                </label>
                <select
                  value={filters.pickType || ""}
                  onChange={(e) =>
                    handleFilterChange("pickType", e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">All Types</option>
                  {pickTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Confidence */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confidence Level (Units)
                </label>
                <select
                  value={filters.confidence || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "confidence",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">All Levels</option>
                  <option value="1">1 Unit</option>
                  <option value="2">2 Units</option>
                  <option value="3">3 Units</option>
                  <option value="4">4 Units</option>
                  <option value="5">5 Units</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={filters.dateFrom || ""}
                    onChange={(e) =>
                      handleFilterChange("dateFrom", e.target.value || undefined)
                    }
                    placeholder="From"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <input
                    type="date"
                    value={filters.dateTo || ""}
                    onChange={(e) =>
                      handleFilterChange("dateTo", e.target.value || undefined)
                    }
                    placeholder="To"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
