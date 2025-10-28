'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, AlertCircle, Sun, Moon, Monitor, Trash2 } from 'lucide-react'

type User = {
  id: string
  theme: string
}

export default function AppearanceSettings({ user }: { user: User }) {
  const router = useRouter()
  const [theme, setTheme] = useState(user.theme || 'light')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme)
    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || 'Failed to update theme')
      }

      setMessage('Theme updated successfully!')
      router.refresh()

      // Apply theme to document
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update theme')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async (e: FormEvent) => {
    e.preventDefault()
    if (deleteConfirmText !== 'DELETE') {
      setError('Please type DELETE to confirm')
      return
    }

    setDeleting(true)
    setError(null)

    try {
      const response = await fetch('/api/settings/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: deletePassword,
          confirmText: deleteConfirmText,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to delete account')
      }

      // Redirect to home page
      window.location.href = '/?deleted=true'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Appearance</h2>
        <p className="text-sm text-gray-500">
          Customize how EdgeBook looks on your device
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

      {/* Theme Selection */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme</h3>
        <div className="grid gap-4 md:grid-cols-3 max-w-2xl">
          {/* Light Theme */}
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            disabled={saving}
            className={`p-4 border-2 rounded-xl transition-all ${
              theme === 'light'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-full h-24 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                <Sun size={32} className="text-yellow-500" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900">Light</p>
                <p className="text-xs text-gray-500">Clean and bright</p>
              </div>
              {theme === 'light' && (
                <div className="flex items-center gap-1 text-primary text-sm">
                  <Check size={16} />
                  <span>Active</span>
                </div>
              )}
            </div>
          </button>

          {/* Dark Theme */}
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            disabled={saving}
            className={`p-4 border-2 rounded-xl transition-all ${
              theme === 'dark'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-full h-24 bg-gray-900 border border-gray-700 rounded-lg flex items-center justify-center">
                <Moon size={32} className="text-blue-400" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900">Dark</p>
                <p className="text-xs text-gray-500">Easy on the eyes</p>
              </div>
              {theme === 'dark' && (
                <div className="flex items-center gap-1 text-primary text-sm">
                  <Check size={16} />
                  <span>Active</span>
                </div>
              )}
            </div>
          </button>

          {/* Auto Theme (Future) */}
          <button
            type="button"
            disabled
            className="p-4 border-2 border-gray-200 rounded-xl opacity-50 cursor-not-allowed"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-full h-24 bg-gradient-to-r from-white to-gray-900 border border-gray-200 rounded-lg flex items-center justify-center">
                <Monitor size={32} className="text-gray-600" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900">Auto</p>
                <p className="text-xs text-gray-500">Coming soon</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Language & Region (Future) */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Language & Region</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select className="input-field" disabled>
              <option>English (US)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">More languages coming soon</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select className="input-field" disabled>
              <option>Auto-detect</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data & Privacy</h3>
        <div className="space-y-3">
          <button
            type="button"
            className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            onClick={() => {
              alert('Data download feature coming soon')
            }}
          >
            <p className="font-medium text-gray-900">Download Your Data</p>
            <p className="text-sm text-gray-600">Get a copy of all your EdgeBook data</p>
          </button>

          <a
            href="/support"
            className="block w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <p className="font-medium text-gray-900">Help & Support</p>
            <p className="text-sm text-gray-600">Get help or report a problem</p>
          </a>
        </div>
      </div>

      {/* Danger Zone - Delete Account */}
      <div className="border-t border-red-200 pt-6">
        <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
          <Trash2 size={20} />
          Danger Zone
        </h3>

        {!showDeleteConfirm ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="font-semibold text-red-900">Delete Account</p>
            <p className="text-sm text-red-700 mt-1">
              Once you delete your account, there is no going back. This action cannot be undone.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
            >
              Delete My Account
            </button>
          </div>
        ) : (
          <form onSubmit={handleDeleteAccount} className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-4">
            <div>
              <p className="font-semibold text-red-900">Are you absolutely sure?</p>
              <p className="text-sm text-red-700 mt-1">
                This will permanently delete your account, all your picks, followers, and data.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-red-900 mb-2">
                Type DELETE to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="input-field border-red-300"
                placeholder="DELETE"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-red-900 mb-2">
                Enter your password
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="input-field border-red-300"
                placeholder="Password"
              />
              <p className="mt-1 text-xs text-red-600">
                Required if you have a password set
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={deleting || deleteConfirmText !== 'DELETE'}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {deleting && <Loader2 size={16} className="animate-spin" />}
                {deleting ? 'Deleting...' : 'Delete Account Permanently'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteConfirmText('')
                  setDeletePassword('')
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm"
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
