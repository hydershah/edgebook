'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { AlertTriangle, Ban, ShieldAlert, X } from 'lucide-react'
import { useAccountStatus } from '@/hooks/useAccountStatus'

export default function AccountStatusBanner() {
  const { data: session, status } = useSession()
  const [isVisible, setIsVisible] = useState(true)
  const [shouldShow, setShouldShow] = useState(false)

  // Initialize real-time account status monitoring
  const { isConnected } = useAccountStatus()

  // Determine if we should show the banner (with anti-flicker delay)
  useEffect(() => {
    if (status === 'loading') {
      setShouldShow(false)
      return
    }

    const user = session?.user as any
    if (user && isVisible) {
      const accountStatus = user.accountStatus
      const warningCount = user.warningCount || 0
      const suspendedUntil = user.suspendedUntil

      // Show banner if:
      // 1. User is suspended or banned
      // 2. User has warnings
      // 3. Check if suspension has expired
      const now = new Date()
      const isSuspended = accountStatus === 'SUSPENDED' && suspendedUntil && new Date(suspendedUntil) > now
      const isBanned = accountStatus === 'BANNED'
      const hasWarnings = warningCount > 0

      if (isSuspended || isBanned || hasWarnings) {
        // Small delay to prevent flicker on page load
        const timer = setTimeout(() => {
          setShouldShow(true)
        }, 100)
        return () => clearTimeout(timer)
      }
    }

    setShouldShow(false)
  }, [status, session, isVisible])

  // Don't render anything until we're sure we should show
  if (!shouldShow || !session?.user) {
    return null
  }

  const user = session.user as any
  const accountStatus = user.accountStatus
  const warningCount = user.warningCount || 0
  const suspendedUntil = user.suspendedUntil
  const suspensionReason = user.suspensionReason
  const banReason = user.banReason

  const now = new Date()
  const isSuspended = accountStatus === 'SUSPENDED' && suspendedUntil && new Date(suspendedUntil) > now
  const isBanned = accountStatus === 'BANNED'
  const hasWarnings = warningCount > 0 && !isSuspended && !isBanned

  const handleDismiss = () => {
    setIsVisible(false)
  }

  // Format the suspension expiry date
  const formatExpiryDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Connection status indicator (subtle, bottom-right corner)
  const ConnectionIndicator = () => {
    if (!isConnected) return null

    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-gray-900/90 px-3 py-1.5 text-xs text-white shadow-lg backdrop-blur-sm" title="Real-time monitoring active">
        <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
        <span>Live</span>
      </div>
    )
  }

  // Banned Banner
  if (isBanned) {
    return (
      <>
        <ConnectionIndicator />
        <div className="relative border-b border-red-200 bg-gradient-to-r from-red-50 via-red-100 to-red-50">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-1 items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-200">
                  <Ban className="h-5 w-5 text-red-800" />
                </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-red-900">
                  Account Permanently Banned
                </p>
                <p className="mt-1 text-sm text-red-800">
                  Your account has been permanently banned from EdgeBook. You cannot post picks or interact with the community.
                </p>
                {banReason && (
                  <p className="mt-1 text-xs text-red-700">
                    <span className="font-semibold">Reason:</span> {banReason}
                  </p>
                )}
                <p className="mt-2 text-xs text-red-700">
                  If you believe this is a mistake, please{' '}
                  <a
                    href="mailto:support@edgebook.ai"
                    className="font-semibold underline hover:text-red-900"
                  >
                    contact support
                  </a>{' '}
                  at support@edgebook.ai.
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </>
    )
  }

  // Suspended Banner
  if (isSuspended) {
    return (
      <>
        <ConnectionIndicator />
        <div className="relative border-b border-orange-200 bg-gradient-to-r from-orange-50 via-orange-100 to-orange-50">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-1 items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-200">
                <ShieldAlert className="h-5 w-5 text-orange-800" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-orange-900">
                  Account Suspended
                </p>
                <p className="mt-1 text-sm text-orange-800">
                  Your account has been temporarily suspended. You cannot post picks until your suspension expires.
                </p>
                {suspensionReason && (
                  <p className="mt-1 text-xs text-orange-700">
                    <span className="font-semibold">Reason:</span> {suspensionReason}
                  </p>
                )}
                <p className="mt-1 text-xs text-orange-700">
                  <span className="font-semibold">Suspension expires:</span>{' '}
                  {formatExpiryDate(suspendedUntil)}
                </p>
                <p className="mt-2 text-xs text-orange-700">
                  If you have questions, please{' '}
                  <a
                    href="mailto:support@edgebook.ai"
                    className="font-semibold underline hover:text-orange-900"
                  >
                    contact support
                  </a>{' '}
                  at support@edgebook.ai.
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </>
    )
  }

  // Warning Banner
  if (hasWarnings) {
    const warningLevel = warningCount >= 5 ? 'critical' : warningCount >= 3 ? 'high' : 'moderate'
    const warningColors = {
      critical: {
        bg: 'from-red-50 via-red-100 to-red-50',
        border: 'border-red-200',
        iconBg: 'bg-red-200',
        iconColor: 'text-red-800',
        textMain: 'text-red-900',
        textSecondary: 'text-red-800',
        textTertiary: 'text-red-700',
        buttonBorder: 'border-red-200',
        buttonHover: 'hover:bg-red-100',
        buttonText: 'text-red-700',
      },
      high: {
        bg: 'from-orange-50 via-orange-100 to-orange-50',
        border: 'border-orange-200',
        iconBg: 'bg-orange-200',
        iconColor: 'text-orange-800',
        textMain: 'text-orange-900',
        textSecondary: 'text-orange-800',
        textTertiary: 'text-orange-700',
        buttonBorder: 'border-orange-200',
        buttonHover: 'hover:bg-orange-100',
        buttonText: 'text-orange-700',
      },
      moderate: {
        bg: 'from-yellow-50 via-yellow-100 to-yellow-50',
        border: 'border-yellow-200',
        iconBg: 'bg-yellow-200',
        iconColor: 'text-yellow-800',
        textMain: 'text-yellow-900',
        textSecondary: 'text-yellow-800',
        textTertiary: 'text-yellow-700',
        buttonBorder: 'border-yellow-200',
        buttonHover: 'hover:bg-yellow-100',
        buttonText: 'text-yellow-700',
      },
    }

    const colors = warningColors[warningLevel]

    return (
      <>
        <ConnectionIndicator />
        <div className={`relative border-b ${colors.border} bg-gradient-to-r ${colors.bg}`}>
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-1 items-start gap-3">
              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${colors.iconBg}`}>
                <AlertTriangle className={`h-5 w-5 ${colors.iconColor}`} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-bold ${colors.textMain}`}>
                  Account Warning ({warningCount} warning{warningCount > 1 ? 's' : ''})
                </p>
                <p className={`mt-1 text-sm ${colors.textSecondary}`}>
                  {warningCount >= 5
                    ? 'Your account is under review due to multiple warnings. Further violations may result in suspension or permanent ban.'
                    : warningCount >= 3
                    ? 'You have received multiple warnings. Please review our community guidelines. Additional violations may lead to suspension.'
                    : 'You have received a warning. Please ensure you follow our community guidelines to avoid further action.'}
                </p>
                <p className={`mt-2 text-xs ${colors.textTertiary}`}>
                  Review our{' '}
                  <a
                    href="/community-guidelines"
                    className="font-semibold underline hover:opacity-80"
                  >
                    community guidelines
                  </a>
                  {' '}to avoid future warnings.
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className={`rounded-lg p-1.5 ${colors.buttonText} transition ${colors.buttonHover} focus:outline-none focus:ring-2 focus:ring-offset-2`}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        </div>
      </>
    )
  }

  return (
    <>
      <ConnectionIndicator />
    </>
  )
}
