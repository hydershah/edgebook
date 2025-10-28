'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Loader2, Check, AlertCircle, Shield, Smartphone, Monitor, Trash2 } from 'lucide-react'
import Image from 'next/image'

type User = {
  password: string | null
  twoFactorEnabled: boolean
  accounts: Array<{ provider: string; providerAccountId: string }>
}

type Session = {
  id: string
  sessionToken: string
  expires: string
}

type LoginActivity = {
  id: string
  ipAddress: string | null
  userAgent: string | null
  location: string | null
  successful: boolean
  createdAt: string
}

export default function SecuritySettings({ user }: { user: User }) {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [twoFactorData, setTwoFactorData] = useState({
    secret: '',
    qrCodeUrl: '',
    token: '',
  })
  const [sessions, setSessions] = useState<Session[]>([])
  const [loginActivities, setLoginActivities] = useState<LoginActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/settings/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
        setLoginActivities(data.loginActivities || [])
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
    } finally {
      setLoadingSessions(false)
    }
  }

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch('/api/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to change password')
      }

      setMessage('Password changed successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleSetup2FA = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/settings/2fa', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate 2FA setup')
      }

      setTwoFactorData({
        secret: data.secret,
        qrCodeUrl: data.qrCodeUrl,
        token: '',
      })
      setShow2FASetup(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup 2FA')
    } finally {
      setLoading(false)
    }
  }

  const handleEnable2FA = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/settings/2fa', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: twoFactorData.secret,
          token: twoFactorData.token,
          enable: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to enable 2FA')
      }

      setMessage('2FA enabled successfully!')
      setShow2FASetup(false)
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable 2FA')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable 2FA?')) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/settings/2fa', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable: false }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to disable 2FA')
      }

      setMessage('2FA disabled successfully!')
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable 2FA')
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to revoke this session?')) return

    try {
      const response = await fetch(`/api/settings/sessions?sessionId=${sessionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSessions(sessions.filter((s) => s.id !== sessionId))
        setMessage('Session revoked successfully')
      }
    } catch (err) {
      setError('Failed to revoke session')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Security Settings</h2>
        <p className="text-sm text-gray-500">
          Manage your password, two-factor authentication, and active sessions
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

      {/* Connected Accounts */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield size={20} />
          Connected Accounts
        </h3>
        {user.accounts.length > 0 ? (
          <div className="space-y-3">
            {user.accounts.map((account) => (
              <div
                key={account.provider}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {account.provider === 'google' && '🔵'}
                    {account.provider === 'facebook' && '📘'}
                    {account.provider === 'twitter' && '🐦'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{account.provider}</p>
                    <p className="text-sm text-gray-500">Connected</p>
                  </div>
                </div>
                <span className="text-emerald-600 text-sm flex items-center gap-1">
                  <Check size={16} />
                  Connected
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No connected accounts</p>
        )}
      </div>

      {/* Password Change */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          {user.password && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                className="input-field"
                required={!!user.password}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="input-field"
              required
              minLength={8}
            />
            <p className="mt-1 text-xs text-gray-500">
              At least 8 characters with uppercase, lowercase, and number
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              className="input-field"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={loading}
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            Change Password
          </button>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Smartphone size={20} />
          Two-Factor Authentication
        </h3>
        {user.twoFactorEnabled ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-emerald-800 font-medium">2FA is enabled</p>
              <p className="text-sm text-emerald-700 mt-1">
                Your account has an extra layer of security
              </p>
            </div>
            <button
              onClick={handleDisable2FA}
              className="btn-secondary text-red-600 border-red-300 hover:bg-red-50"
              disabled={loading}
            >
              Disable 2FA
            </button>
          </div>
        ) : show2FASetup ? (
          <div className="space-y-4 max-w-md">
            <div className="p-4 border border-gray-200 rounded-lg space-y-4">
              <p className="text-sm text-gray-700">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              {twoFactorData.qrCodeUrl && (
                <div className="flex justify-center">
                  <Image
                    src={twoFactorData.qrCodeUrl}
                    alt="2FA QR Code"
                    width={200}
                    height={200}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter the 6-digit code from your app
                </label>
                <input
                  type="text"
                  value={twoFactorData.token}
                  onChange={(e) =>
                    setTwoFactorData({ ...twoFactorData, token: e.target.value })
                  }
                  className="input-field"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleEnable2FA}
                className="btn-primary"
                disabled={loading || twoFactorData.token.length !== 6}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Enable 2FA'}
              </button>
              <button
                onClick={() => setShow2FASetup(false)}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Add an extra layer of security to your account by enabling two-factor authentication.
            </p>
            <button onClick={handleSetup2FA} className="btn-primary" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Enable 2FA'}
            </button>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Monitor size={20} />
          Active Sessions
        </h3>
        {loadingSessions ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">Active Session</p>
                  <p className="text-sm text-gray-500">
                    Expires: {new Date(session.expires).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm"
                >
                  <Trash2 size={16} />
                  Revoke
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No active sessions</p>
        )}
      </div>

      {/* Login Activity */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Login Activity</h3>
        {loginActivities.length > 0 ? (
          <div className="space-y-2">
            {loginActivities.slice(0, 10).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg text-sm"
              >
                <div>
                  <p className="text-gray-900">
                    {activity.location || 'Unknown location'}
                    {activity.ipAddress && ` • ${activity.ipAddress}`}
                  </p>
                  <p className="text-gray-500">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    activity.successful
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {activity.successful ? 'Success' : 'Failed'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No login activity recorded</p>
        )}
      </div>
    </div>
  )
}
