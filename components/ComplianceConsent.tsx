'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const STORAGE_KEY = 'edgebook-compliance-consent-v1'

const CONSENT_VALUE = {
  consent: true,
  over18: true,
  cookies: true,
}

export default function ComplianceConsent() {
  const [hasMounted, setHasMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setHasMounted(true)

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        setIsOpen(true)
      }
    } catch (error) {
      // Gracefully surface the popup if local storage is blocked
      setIsOpen(true)
    }
  }, [])

  const handleAccept = () => {
    try {
      const payload = { ...CONSENT_VALUE, timestamp: new Date().toISOString() }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (error) {
      // If storage fails we still dismiss so the user can continue browsing
    }

    setIsOpen(false)
  }

  if (!hasMounted || !isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="compliance-consent-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
      >
        <div className="space-y-6 p-8 text-center">
          <div className="flex justify-center">
            <Image
              src="/logos/emblem.svg"
              alt="EdgeBook"
              width={48}
              height={48}
              className="h-12 w-12"
            />
          </div>
          
          <div>
            <h2 id="compliance-consent-title" className="text-2xl font-semibold text-gray-900">
              Welcome to EdgeBook!
            </h2>
            <p className="mt-3 text-sm text-gray-600">
              By continuing, you confirm you&rsquo;re 18+ and agree to our{' '}
              <Link href="/legal/terms" className="text-primary hover:text-primary-dark">
                Terms
              </Link>
              {' '}&amp;{' '}
              <Link href="/legal/privacy" className="text-primary hover:text-primary-dark">
                Privacy Policy
              </Link>
            </p>
          </div>

          <button
            type="button"
            onClick={handleAccept}
            className="w-full rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
