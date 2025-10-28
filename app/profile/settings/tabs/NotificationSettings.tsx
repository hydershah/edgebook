'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Loader2, Check, AlertCircle, Mail, Smartphone, MessageSquare } from 'lucide-react'

type User = {
  id: string
  notificationPreferences: any
}

type NotificationPreferences = {
  email: {
    enabled: boolean
    newFollowers: boolean
    likes: boolean
    comments: boolean
    purchases: boolean
    subscriptions: boolean
    messages: boolean
    promotions: boolean
  }
  push: {
    enabled: boolean
    newFollowers: boolean
    likes: boolean
    comments: boolean
    purchases: boolean
    subscriptions: boolean
    messages: boolean
  }
  sms: {
    enabled: boolean
    purchases: boolean
    subscriptions: boolean
  }
}

export default function NotificationSettings({ user }: { user: User }) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      enabled: true,
      newFollowers: true,
      likes: true,
      comments: true,
      purchases: true,
      subscriptions: true,
      messages: true,
      promotions: false,
    },
    push: {
      enabled: true,
      newFollowers: true,
      likes: true,
      comments: true,
      purchases: true,
      subscriptions: true,
      messages: true,
    },
    sms: {
      enabled: false,
      purchases: true,
      subscriptions: true,
    },
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/settings/notifications')
      if (response.ok) {
        const data = await response.json()
        setPreferences(data)
      }
    } catch (err) {
      console.error('Failed to fetch notification preferences:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || 'Failed to update notification preferences')
      }

      setMessage('Notification preferences updated successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification preferences')
    } finally {
      setSaving(false)
    }
  }

  const updateEmailPref = (key: keyof typeof preferences.email, value: boolean) => {
    setPreferences({
      ...preferences,
      email: { ...preferences.email, [key]: value },
    })
  }

  const updatePushPref = (key: keyof typeof preferences.push, value: boolean) => {
    setPreferences({
      ...preferences,
      push: { ...preferences.push, [key]: value },
    })
  }

  const updateSMSPref = (key: keyof typeof preferences.sms, value: boolean) => {
    setPreferences({
      ...preferences,
      sms: { ...preferences.sms, [key]: value },
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Notification Preferences</h2>
        <p className="text-sm text-gray-500">
          Choose how you want to be notified about activity on your account
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

      {/* Email Notifications */}
      <div className="space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Mail size={20} />
            Email Notifications
          </h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm font-medium text-gray-700">Enable All</span>
            <input
              type="checkbox"
              checked={preferences.email.enabled}
              onChange={(e) => updateEmailPref('enabled', e.target.checked)}
              className="h-5 w-5"
            />
          </label>
        </div>

        <div className="space-y-3 pl-8">
          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <span className="text-gray-700">New followers</span>
            <input
              type="checkbox"
              checked={preferences.email.newFollowers}
              onChange={(e) => updateEmailPref('newFollowers', e.target.checked)}
              disabled={!preferences.email.enabled}
              className="h-5 w-5"
            />
          </label>
          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <span className="text-gray-700">Likes on your picks</span>
            <input
              type="checkbox"
              checked={preferences.email.likes}
              onChange={(e) => updateEmailPref('likes', e.target.checked)}
              disabled={!preferences.email.enabled}
              className="h-5 w-5"
            />
          </label>
          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <span className="text-gray-700">Comments on your picks</span>
            <input
              type="checkbox"
              checked={preferences.email.comments}
              onChange={(e) => updateEmailPref('comments', e.target.checked)}
              disabled={!preferences.email.enabled}
              className="h-5 w-5"
            />
          </label>
          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <span className="text-gray-700">Pick purchases</span>
            <input
              type="checkbox"
              checked={preferences.email.purchases}
              onChange={(e) => updateEmailPref('purchases', e.target.checked)}
              disabled={!preferences.email.enabled}
              className="h-5 w-5"
            />
          </label>
          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <span className="text-gray-700">New subscriptions</span>
            <input
              type="checkbox"
              checked={preferences.email.subscriptions}
              onChange={(e) => updateEmailPref('subscriptions', e.target.checked)}
              disabled={!preferences.email.enabled}
              className="h-5 w-5"
            />
          </label>
          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <span className="text-gray-700">Direct messages</span>
            <input
              type="checkbox"
              checked={preferences.email.messages}
              onChange={(e) => updateEmailPref('messages', e.target.checked)}
              disabled={!preferences.email.enabled}
              className="h-5 w-5"
            />
          </label>
          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <span className="text-gray-700">Promotions and tips</span>
            <input
              type="checkbox"
              checked={preferences.email.promotions}
              onChange={(e) => updateEmailPref('promotions', e.target.checked)}
              disabled={!preferences.email.enabled}
              className="h-5 w-5"
            />
          </label>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Smartphone size={20} />
            Push Notifications
          </h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm font-medium text-gray-700">Enable All</span>
            <input
              type="checkbox"
              checked={preferences.push.enabled}
              onChange={(e) => updatePushPref('enabled', e.target.checked)}
              className="h-5 w-5"
            />
          </label>
        </div>

        <div className="space-y-3 pl-8">
          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <span className="text-gray-700">New followers</span>
            <input
              type="checkbox"
              checked={preferences.push.newFollowers}
              onChange={(e) => updatePushPref('newFollowers', e.target.checked)}
              disabled={!preferences.push.enabled}
              className="h-5 w-5"
            />
          </label>
          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <span className="text-gray-700">Likes on your picks</span>
            <input
              type="checkbox"
              checked={preferences.push.likes}
              onChange={(e) => updatePushPref('likes', e.target.checked)}
              disabled={!preferences.push.enabled}
              className="h-5 w-5"
            />
          </label>
          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <span className="text-gray-700">Comments on your picks</span>
            <input
              type="checkbox"
              checked={preferences.push.comments}
              onChange={(e) => updatePushPref('comments', e.target.checked)}
              disabled={!preferences.push.enabled}
              className="h-5 w-5"
            />
          </label>
          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <span className="text-gray-700">Pick purchases</span>
            <input
              type="checkbox"
              checked={preferences.push.purchases}
              onChange={(e) => updatePushPref('purchases', e.target.checked)}
              disabled={!preferences.push.enabled}
              className="h-5 w-5"
            />
          </label>
          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <span className="text-gray-700">New subscriptions</span>
            <input
              type="checkbox"
              checked={preferences.push.subscriptions}
              onChange={(e) => updatePushPref('subscriptions', e.target.checked)}
              disabled={!preferences.push.enabled}
              className="h-5 w-5"
            />
          </label>
          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <span className="text-gray-700">Direct messages</span>
            <input
              type="checkbox"
              checked={preferences.push.messages}
              onChange={(e) => updatePushPref('messages', e.target.checked)}
              disabled={!preferences.push.enabled}
              className="h-5 w-5"
            />
          </label>
        </div>
      </div>

      {/* SMS Notifications */}
      <div className="space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare size={20} />
            SMS Notifications
          </h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm font-medium text-gray-700">Enable All</span>
            <input
              type="checkbox"
              checked={preferences.sms.enabled}
              onChange={(e) => updateSMSPref('enabled', e.target.checked)}
              className="h-5 w-5"
            />
          </label>
        </div>

        <div className="space-y-3 pl-8">
          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <span className="text-gray-700">Pick purchases</span>
            <input
              type="checkbox"
              checked={preferences.sms.purchases}
              onChange={(e) => updateSMSPref('purchases', e.target.checked)}
              disabled={!preferences.sms.enabled}
              className="h-5 w-5"
            />
          </label>
          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <span className="text-gray-700">New subscriptions</span>
            <input
              type="checkbox"
              checked={preferences.sms.subscriptions}
              onChange={(e) => updateSMSPref('subscriptions', e.target.checked)}
              disabled={!preferences.sms.enabled}
              className="h-5 w-5"
            />
          </label>
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
          Save Preferences
        </button>
      </div>
    </form>
  )
}
