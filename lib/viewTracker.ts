/**
 * Client-side batch view tracking service
 * Accumulates view requests and flushes them periodically to reduce server load
 */

class ViewTracker {
  private pendingViews: Set<string> = new Set()
  private flushInterval: NodeJS.Timeout | null = null
  private flushDelay = 2000 // 2 seconds
  private isProcessing = false

  constructor() {
    // Start the periodic flush
    if (typeof window !== 'undefined') {
      this.startFlushTimer()

      // Flush on page unload to capture pending views
      window.addEventListener('beforeunload', () => {
        this.flush(true) // Synchronous flush
      })
    }
  }

  /**
   * Track a view for a pick (adds to batch)
   */
  trackView(pickId: string): void {
    this.pendingViews.add(pickId)

    // If we have many pending views, flush immediately
    if (this.pendingViews.size >= 20) {
      this.flush()
    }
  }

  /**
   * Start the periodic flush timer
   */
  private startFlushTimer(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }

    this.flushInterval = setInterval(() => {
      this.flush()
    }, this.flushDelay)
  }

  /**
   * Flush pending views to the server
   */
  private async flush(synchronous = false): Promise<void> {
    if (this.isProcessing || this.pendingViews.size === 0) {
      return
    }

    this.isProcessing = true
    const viewsToSend = Array.from(this.pendingViews)
    this.pendingViews.clear()

    try {
      if (synchronous) {
        // Use sendBeacon for synchronous send during page unload
        const data = JSON.stringify({ pickIds: viewsToSend })
        const blob = new Blob([data], { type: 'application/json' })
        navigator.sendBeacon('/api/picks/views/batch', blob)
      } else {
        // Use fetch for normal async sends
        await fetch('/api/picks/views/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pickIds: viewsToSend }),
        })
      }
    } catch (error) {
      console.error('Error flushing views:', error)
      // On error, add views back to pending queue
      viewsToSend.forEach(id => this.pendingViews.add(id))
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Destroy the tracker and cleanup
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }
    this.flush(true) // Final flush
  }
}

// Global singleton instance
let globalTracker: ViewTracker | null = null

export function getViewTracker(): ViewTracker {
  if (typeof window === 'undefined') {
    // Server-side: create a no-op tracker
    return {
      trackView: () => {},
      destroy: () => {},
    } as any
  }

  if (!globalTracker) {
    globalTracker = new ViewTracker()
  }

  return globalTracker
}

export function trackPickView(pickId: string): void {
  getViewTracker().trackView(pickId)
}
