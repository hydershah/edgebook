'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, Cookie, UserCheck } from 'lucide-react'

const STORAGE_KEY = 'edgebook-compliance-consent-v1'

const CONSENT_VALUE = {
  consent: true,
  over18: true,
  cookies: true,
}

export default function ComplianceConsent() {
  const [hasMounted, setHasMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [cookiesAccepted, setCookiesAccepted] = useState(false)

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

  const isDisabled = !ageConfirmed || !cookiesAccepted

  const handleAccept = () => {
    if (isDisabled) return

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
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-emerald-500 to-primary-dark" />

        <div className="space-y-6 p-8 sm:p-10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 id="compliance-consent-title" className="text-2xl font-semibold leading-tight text-gray-900">
                Stay compliant with EdgeBook
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                EdgeBook is designed for responsible betting communities. Please confirm you meet the legal requirements
                and agree to our data practices before continuing.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label
              htmlFor="compliance-age"
              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 transition hover:border-primary/60"
            >
              <input
                id="compliance-age"
                type="checkbox"
                checked={ageConfirmed}
                onChange={(event) => setAgeConfirmed(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <UserCheck className="h-4 w-4 text-primary" />
                  I confirm I am 18 years of age or older.
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Access to wagering insights is restricted to individuals who are legally permitted to view sports
                  betting content in their jurisdiction.
                </p>
              </div>
            </label>

            <label
              htmlFor="compliance-cookies"
              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 transition hover:border-primary/60"
            >
              <input
                id="compliance-cookies"
                type="checkbox"
                checked={cookiesAccepted}
                onChange={(event) => setCookiesAccepted(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Cookie className="h-4 w-4 text-primary" />
                  I accept cookies and acknowledge the linked policies.
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  We use essential and analytical cookies to protect your account, understand platform usage, and
                  personalize your experience.
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-primary">
                  <Link href="/legal/privacy" className="hover:text-primary-dark">
                    Privacy Policy
                  </Link>
                  <span className="text-gray-400">•</span>
                  <Link href="/legal/terms" className="hover:text-primary-dark">
                    Terms of Service
                  </Link>
                  <span className="text-gray-400">•</span>
                  <Link href="/legal/responsible-gaming" className="hover:text-primary-dark">
                    Responsible Gaming
                  </Link>
                </div>
              </div>
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
              Your consent is stored in your browser and you can update preferences at any time in your account settings.
            </p>
            <button
              type="button"
              onClick={handleAccept}
              disabled={isDisabled}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
            >
              Continue to EdgeBook
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
