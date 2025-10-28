'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Loader2, Check, AlertCircle, DollarSign, CreditCard, TrendingUp, BadgeCheck } from 'lucide-react'

type User = {
  id: string
  subscriptionPrice: number | null
  stripeAccountId: string | null
  isVerified: boolean
}

export default function CreatorSettings({ user }: { user: User }) {
  const [formData, setFormData] = useState({
    subscriptionPrice: user.subscriptionPrice || 0,
    stripeAccountId: user.stripeAccountId || '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch('/api/settings/subscription-pricing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionPrice: formData.subscriptionPrice > 0 ? formData.subscriptionPrice : null,
          stripeAccountId: formData.stripeAccountId || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || 'Failed to update creator settings')
      }

      setMessage('Creator settings updated successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update creator settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Creator Settings</h2>
        <p className="text-sm text-gray-500">
          Manage your monetization and subscription settings
        </p>
      </div>

      {message && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
          <Check size={18} />
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
          <AlertCircle size={18} className="mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Verification Status */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BadgeCheck size={20} />
          Verification Status
        </h3>
        {user.isVerified ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
            <BadgeCheck size={24} className="text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-900">Verified Creator</p>
              <p className="text-sm text-emerald-700 mt-1">
                Your account is verified. This badge shows you&apos;re a trusted creator on EdgeBook.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-700">Your account is not yet verified.</p>
            <p className="text-sm text-gray-600 mt-1">
              Build your reputation by posting quality picks and engaging with your followers. Verified status helps increase trust with potential subscribers.
            </p>
            <button type="button" className="btn-secondary mt-4">
              Apply for Verification
            </button>
          </div>
        )}
      </div>

      {/* Subscription Pricing */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign size={20} />
          Subscription Pricing
        </h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Subscription Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={formData.subscriptionPrice}
                onChange={(e) =>
                  setFormData({ ...formData, subscriptionPrice: parseFloat(e.target.value) || 0 })
                }
                className="input-field pl-8"
                min="0"
                max="999.99"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Set to $0 to disable subscriptions. Subscribers get access to all your premium picks.
            </p>
          </div>

          {formData.subscriptionPrice > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <TrendingUp size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-900">Estimated Earnings</p>
                  <p className="text-blue-700 mt-1">
                    You&apos;ll earn <span className="font-bold">${(formData.subscriptionPrice * 0.85).toFixed(2)}</span> per subscriber per month
                    <br />
                    <span className="text-xs">(EdgeBook takes a 15% platform fee)</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stripe Account */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard size={20} />
          Payment Account
        </h3>
        <div className="space-y-4">
          {formData.stripeAccountId ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="font-semibold text-emerald-900">Stripe Account Connected</p>
              <p className="text-sm text-emerald-700 mt-1">
                Account ID: {formData.stripeAccountId}
              </p>
              <button
                type="button"
                className="btn-secondary mt-3"
                onClick={() => {
                  // Open Stripe Dashboard
                  window.open('https://dashboard.stripe.com', '_blank')
                }}
              >
                Open Stripe Dashboard
              </button>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-semibold text-yellow-900 flex items-center gap-2">
                <AlertCircle size={18} />
                No Payment Account Connected
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Connect a Stripe account to receive payments from subscriptions and premium pick sales.
              </p>
              <button
                type="button"
                className="btn-primary mt-4"
                onClick={() => {
                  // Initiate Stripe Connect flow
                  alert('Stripe Connect integration would be implemented here')
                }}
              >
                Connect Stripe Account
              </button>
            </div>
          )}

          <div className="text-sm text-gray-600 space-y-2">
            <p className="font-medium">Requirements for receiving payments:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Connect your Stripe account</li>
              <li>Complete identity verification</li>
              <li>Add bank account for payouts</li>
              <li>Accept EdgeBook&apos;s Creator Terms of Service</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Creator Analytics Link */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Creator Tools</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            onClick={() => {
              // Navigate to analytics
              window.location.href = '/creator/analytics'
            }}
          >
            <div className="flex items-center gap-3">
              <TrendingUp size={24} className="text-primary" />
              <div>
                <p className="font-semibold text-gray-900">Analytics Dashboard</p>
                <p className="text-sm text-gray-600">View your performance metrics</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            onClick={() => {
              // Navigate to earnings
              window.location.href = '/creator/earnings'
            }}
          >
            <div className="flex items-center gap-3">
              <DollarSign size={24} className="text-primary" />
              <div>
                <p className="font-semibold text-gray-900">Earnings & Payouts</p>
                <p className="text-sm text-gray-600">Track your revenue</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t">
        <button
          type="submit"
          className="btn-primary flex items-center gap-2"
          disabled={saving}
        >
          {saving && <Loader2 size={18} className="animate-spin" />}
          Save Settings
        </button>
      </div>
    </form>
  )
}
