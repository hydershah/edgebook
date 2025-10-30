'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Mail, X, RefreshCw } from 'lucide-react'

export default function EmailVerificationBanner() {
  const { data: session, update, status } = useSession()
  const [isVisible, setIsVisible] = useState(true)
  const [isResending, setIsResending] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null)
  const [shouldShow, setShouldShow] = useState(false)

  // Only refresh session once on mount to get latest verification status
  useEffect(() => {
    if (status === 'authenticated' && session?.user && !session.user.emailVerified) {
      update()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Determine if we should show the banner (with anti-flicker delay)
  useEffect(() => {
    if (status === 'loading') {
      setShouldShow(false)
      return
    }

    if (session?.user && !session.user.emailVerified && isVisible) {
      // Small delay to prevent flicker on page load
      const timer = setTimeout(() => {
        setShouldShow(true)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setShouldShow(false)
    }
  }, [status, session, isVisible])

  // Don't render anything until we're sure we should show
  if (!shouldShow || !session?.user) {
    return null
  }

  const handleCheckVerification = async () => {
    setIsChecking(true)
    setMessage('')
    setMessageType(null)

    try {
      await update()
      // Give it a moment to update
      setTimeout(() => {
        setIsChecking(false)
      }, 500)
    } catch (error) {
      setMessage('Failed to check verification status.')
      setMessageType('error')
      setIsChecking(false)
    }
  }

  const handleResendEmail = async () => {
    setIsResending(true)
    setMessage('')
    setMessageType(null)

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Verification email sent! Please check your inbox.')
        setMessageType('success')
      } else {
        setMessage(data.error || 'Failed to send verification email. Please try again.')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Something went wrong. Please try again.')
      setMessageType('error')
    } finally {
      setIsResending(false)
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage('')
        setMessageType(null)
      }, 5000)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  return (
    <div className="relative border-b border-amber-200 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
              <Mail className="h-5 w-5 text-amber-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Please verify your email address
              </p>
              <p className="text-xs text-gray-600">
                We sent a verification link to{' '}
                <span className="font-semibold text-gray-900">{session.user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {message && (
              <p
                className={`text-xs font-medium ${
                  messageType === 'success' ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {message}
              </p>
            )}
            <button
              onClick={handleCheckVerification}
              disabled={isChecking}
              className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-white px-3 py-1.5 text-sm font-semibold text-green-900 shadow-sm transition hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Checking...' : 'I\'ve verified'}
            </button>
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-sm font-semibold text-amber-900 shadow-sm transition hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
              {isResending ? 'Sending...' : 'Resend email'}
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-lg p-1.5 text-gray-500 transition hover:bg-amber-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
