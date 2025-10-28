'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Loader2, Check, AlertCircle, Eye, EyeOff } from 'lucide-react'

type User = {
  id: string
  privacySettings: any
}

type PrivacySettings = {
  profileVisibility: 'public' | 'private'
  showEmail: boolean
  showPhone: boolean
  showBirthday: boolean
  whoCanFollow: 'everyone' | 'approval'
  whoCanMessage: 'everyone' | 'followers' | 'none'
  whoCanComment: 'everyone' | 'followers' | 'none'
  whoCanTag: 'everyone' | 'followers' | 'none'
  showOnlineStatus: boolean
  showActivity: boolean
}

export default function PrivacySettings({ user }: { user: User }) {
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showBirthday: false,
    whoCanFollow: 'everyone',
    whoCanMessage: 'followers',
    whoCanComment: 'everyone',
    whoCanTag: 'followers',
    showOnlineStatus: true,
    showActivity: true,
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user.privacySettings) {
      setSettings((prev) => ({ ...prev, ...user.privacySettings }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.privacySettings])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privacySettings: settings }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || 'Failed to update privacy settings')
      }

      setMessage('Privacy settings updated successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update privacy settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof PrivacySettings, value: any) => {
    setSettings({ ...settings, [key]: value })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Privacy Settings</h2>
        <p className="text-sm text-gray-500">
          Control who can see your information and interact with you
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

      {/* Profile Visibility */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          {settings.profileVisibility === 'public' ? <Eye size={20} /> : <EyeOff size={20} />}
          Profile Visibility
        </h3>
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="profileVisibility"
              value="public"
              checked={settings.profileVisibility === 'public'}
              onChange={(e) => updateSetting('profileVisibility', e.target.value)}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">Public Profile</p>
              <p className="text-sm text-gray-500">
                Anyone can view your profile, picks, and activity
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="profileVisibility"
              value="private"
              checked={settings.profileVisibility === 'private'}
              onChange={(e) => updateSetting('profileVisibility', e.target.value)}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">Private Profile</p>
              <p className="text-sm text-gray-500">
                Only approved followers can view your content
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900">Contact Information Visibility</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <div>
              <p className="font-medium text-gray-900">Show Email on Profile</p>
              <p className="text-sm text-gray-500">Let others see your email address</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showEmail}
              onChange={(e) => updateSetting('showEmail', e.target.checked)}
              className="h-5 w-5"
            />
          </label>
          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <div>
              <p className="font-medium text-gray-900">Show Phone Number</p>
              <p className="text-sm text-gray-500">Let others see your phone number</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showPhone}
              onChange={(e) => updateSetting('showPhone', e.target.checked)}
              className="h-5 w-5"
            />
          </label>
          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <div>
              <p className="font-medium text-gray-900">Show Birthday</p>
              <p className="text-sm text-gray-500">Display your birthday on your profile</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showBirthday}
              onChange={(e) => updateSetting('showBirthday', e.target.checked)}
              className="h-5 w-5"
            />
          </label>
        </div>
      </div>

      {/* Interaction Controls */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900">Who Can Interact With You</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Who can follow you
            </label>
            <select
              value={settings.whoCanFollow}
              onChange={(e) => updateSetting('whoCanFollow', e.target.value)}
              className="input-field"
            >
              <option value="everyone">Everyone</option>
              <option value="approval">Requires approval</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Who can message you
            </label>
            <select
              value={settings.whoCanMessage}
              onChange={(e) => updateSetting('whoCanMessage', e.target.value)}
              className="input-field"
            >
              <option value="everyone">Everyone</option>
              <option value="followers">People you follow</option>
              <option value="none">No one</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Who can comment on your picks
            </label>
            <select
              value={settings.whoCanComment}
              onChange={(e) => updateSetting('whoCanComment', e.target.value)}
              className="input-field"
            >
              <option value="everyone">Everyone</option>
              <option value="followers">Only followers</option>
              <option value="none">No one</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Who can tag you
            </label>
            <select
              value={settings.whoCanTag}
              onChange={(e) => updateSetting('whoCanTag', e.target.value)}
              className="input-field"
            >
              <option value="everyone">Everyone</option>
              <option value="followers">Only followers</option>
              <option value="none">No one</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity & Status */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900">Activity & Status</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <div>
              <p className="font-medium text-gray-900">Show Online Status</p>
              <p className="text-sm text-gray-500">Let others know when you&apos;re online</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showOnlineStatus}
              onChange={(e) => updateSetting('showOnlineStatus', e.target.checked)}
              className="h-5 w-5"
            />
          </label>
          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <div>
              <p className="font-medium text-gray-900">Show Activity Status</p>
              <p className="text-sm text-gray-500">
                Show your recent activity (likes, comments, etc.)
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.showActivity}
              onChange={(e) => updateSetting('showActivity', e.target.checked)}
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
          Save Changes
        </button>
      </div>
    </form>
  )
}
