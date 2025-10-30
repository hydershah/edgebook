'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { Loader2, Search, Sparkles } from 'lucide-react'

interface SearchResult {
  id: string
  name: string | null
  avatar: string | null
  bio?: string | null
  isPremium: boolean
  followers: number
  picks: number
}

interface UserSearchProps {
  onUserSelect?: (userId: string) => void
  className?: string
  variant?: 'desktop' | 'mobile'
  placeholder?: string
}

const MIN_QUERY_LENGTH = 2
const MAX_VISIBLE_RESULTS = 6

export default function UserSearch({ className = '', variant = 'desktop', onUserSelect, placeholder = 'Search analysts or creators...' }: UserSearchProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const showDropdown = isOpen && (loading || results.length > 0 || debouncedQuery.length >= MIN_QUERY_LENGTH)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, 220)

    return () => clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      setResults([])
      setLoading(false)
      setHighlightedIndex(-1)
      return
    }

    let cancelled = false
    setLoading(true)

    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(debouncedQuery)}`)

        if (!response.ok) {
          throw new Error('Failed to search users')
        }

        const data = await response.json()
        if (!cancelled) {
          setResults(Array.isArray(data.users) ? data.users.slice(0, MAX_VISIBLE_RESULTS) : [])
          setIsOpen(true)
          setHighlightedIndex(0)
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error)
          setResults([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchResults()

    return () => {
      cancelled = true
    }
  }, [debouncedQuery])

  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickAway)
    return () => document.removeEventListener('mousedown', handleClickAway)
  }, [])

  const handleSelect = useCallback(
    (result: SearchResult | undefined) => {
      if (!result) return

      setQuery('')
      setDebouncedQuery('')
      setResults([])
      setIsOpen(false)
      setHighlightedIndex(-1)
      onUserSelect?.(result.id)
    },
    [onUserSelect],
  )

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (results.length > 0) {
        handleSelect(results[highlightedIndex >= 0 ? highlightedIndex : 0])
      }
    },
    [handleSelect, highlightedIndex, results],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown) {
        if (event.key === 'ArrowDown' && results.length > 0) {
          setIsOpen(true)
          event.preventDefault()
        }
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setHighlightedIndex(prev => {
          const next = prev + 1
          return next >= results.length ? 0 : next
        })
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setHighlightedIndex(prev => {
          if (prev <= 0) {
            return results.length - 1
          }
          return prev - 1
        })
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        handleSelect(results[highlightedIndex])
      }

      if (event.key === 'Escape') {
        setIsOpen(false)
        setHighlightedIndex(-1)
        inputRef.current?.blur()
      }
    },
    [handleSelect, highlightedIndex, results, showDropdown],
  )

  const emptyStateMessage = useMemo(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      return 'Start typing to discover bet creators'
    }

    if (loading) {
      return null
    }

    return `No users matched "${debouncedQuery}"`
  }, [debouncedQuery, loading])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form
        onSubmit={handleSubmit}
        className={`group flex w-full items-center gap-2 rounded-full border border-gray-200 bg-white px-4 shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 ${
          variant === 'mobile' ? 'py-3' : 'py-2'
        }`}
      >
        <Search size={18} className="text-gray-400 transition group-focus-within:text-primary" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
          aria-label="Search users"
        />
        {loading && <Loader2 size={18} className="animate-spin text-primary" />}
      </form>

      {showDropdown && (
        <div
          className={`absolute left-0 right-0 top-[calc(100%+0.75rem)] z-40 origin-top rounded-2xl border border-gray-100 bg-white/95 p-2 shadow-2xl ring-1 ring-black/5 backdrop-blur ${
            variant === 'mobile' ? 'mt-1' : ''
          }`}
        >
          {results.length > 0 ? (
            <ul className="max-h-72 space-y-1 overflow-y-auto">
              {results.map((result, index) => (
                <li key={result.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(result)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 transition ${
                      highlightedIndex === index
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-sm font-semibold text-gray-600">
                      {result.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={result.avatar}
                          alt={result.name ?? 'User avatar'}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        result.name?.[0]?.toUpperCase() ?? 'U'
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col text-left">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-gray-900">
                          {result.name ?? 'Unnamed Bettor'}
                        </span>
                        {result.isPremium && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                            <Sparkles size={12} />
                            Premium
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.followers.toLocaleString()} followers · {result.picks.toLocaleString()} picks
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-3 rounded-xl px-3 py-4 text-sm text-gray-500">
              <Search size={18} className="text-gray-400" />
              <span>{emptyStateMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
