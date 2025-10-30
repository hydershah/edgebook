'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'

interface AccountStatusUpdate {
  type: 'connected' | 'status_change'
  userId?: string
  accountStatus?: 'ACTIVE' | 'SUSPENDED' | 'BANNED'
  suspendedUntil?: string | null
  suspensionReason?: string | null
  banReason?: string | null
  timestamp?: string
}

/**
 * Hook for monitoring account status changes in real-time
 * Uses SSE for minimal server load
 */
export function useAccountStatus() {
  const { data: session, update, status } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const lastUpdateRef = useRef<number>(0)

  useEffect(() => {
    // Only set up monitoring for authenticated users
    if (status !== 'authenticated' || !session?.user?.id) {
      setIsConnected(false)
      return
    }

    const userId = session.user.id
    let reconnectTimeout: NodeJS.Timeout | null = null

    const connectSSE = () => {
      try {
        // Close existing connection if any
        if (eventSourceRef.current) {
          eventSourceRef.current.close()
        }

        const eventSource = new EventSource('/api/account-status/stream')
        eventSourceRef.current = eventSource

        eventSource.onopen = () => {
          setIsConnected(true)
          console.log('[AccountStatus] SSE connected')
        }

        eventSource.onmessage = (event) => {
          try {
            const data: AccountStatusUpdate = JSON.parse(event.data)

            if (data.type === 'status_change' && data.userId === userId) {
              console.log('[AccountStatus] Status change received:', data)

              // Throttle updates to prevent excessive calls
              const now = Date.now()
              if (now - lastUpdateRef.current > 5000) { // At least 5 seconds between updates
                lastUpdateRef.current = now
                update()
              }
            }
          } catch (error) {
            console.error('[AccountStatus] Error parsing SSE message:', error)
          }
        }

        eventSource.onerror = () => {
          console.log('[AccountStatus] SSE connection error')
          setIsConnected(false)
          eventSource.close()

          // Simple reconnect after 5 seconds
          reconnectTimeout = setTimeout(() => {
            connectSSE()
          }, 5000)
        }
      } catch (error) {
        console.error('[AccountStatus] Error creating SSE connection:', error)
        setIsConnected(false)
      }
    }

    // Start SSE connection
    connectSSE()

    // Cleanup
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }

      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }

      setIsConnected(false)
    }
  }, [status, session?.user?.id, update])

  return {
    isConnected,
    accountStatus: (session?.user as any)?.accountStatus,
  }
}
