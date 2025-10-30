/**
 * Simple in-memory cache with TTL support
 * For production, consider using Redis for distributed caching
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000)
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.value as T
  }

  /**
   * Set a value in cache with TTL in seconds
   */
  set<T>(key: string, value: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000)
    this.cache.set(key, { value, expiresAt })
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    // Convert entries to array for ES5 compatibility
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => this.cache.delete(key))
  }

  /**
   * Destroy the cache and cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.clear()
  }
}

// Global cache instance
export const cache = new SimpleCache()

/**
 * Helper function to get or set cache with a factory function
 */
export async function getOrSetCache<T>(
  key: string,
  ttlSeconds: number,
  factory: () => Promise<T>
): Promise<T> {
  // Try to get from cache
  const cached = cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // Generate new value
  const value = await factory()

  // Store in cache
  cache.set(key, value, ttlSeconds)

  return value
}

/**
 * Cache key builders for consistent naming
 */
export const CacheKeys = {
  trendingSports: () => 'trending:sports',
  topCreators: () => 'top:creators',
  pickStats: (pickIds: string[]) => `picks:stats:${pickIds.sort().join(',')}`,
  pickStatsMany: (pickIds: string[]) => {
    // For large arrays, use a hash to avoid extremely long keys
    const sortedIds = pickIds.sort().join(',')
    if (sortedIds.length > 100) {
      // Simple hash function
      let hash = 0
      for (let i = 0; i < sortedIds.length; i++) {
        const char = sortedIds.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
      }
      return `picks:stats:hash:${hash}:count:${pickIds.length}`
    }
    return `picks:stats:${sortedIds}`
  }
}
