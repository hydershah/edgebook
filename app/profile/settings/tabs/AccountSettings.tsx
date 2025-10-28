'use client'

import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2, Upload, Check, X, AlertCircle } from 'lucide-react'

type User = {
  id: string
  email: string
  username: string | null
  name: string | null
  bio: string | null
  avatar: string | null
  coverPhoto: string | null
  phone: string | null
  birthday: Date | null
  gender: string | null
  location: string | null
  instagram: string | null
  facebook: string | null
  youtube: string | null
  twitter: string | null
  tiktok: string | null
  website: string | null
}

export default function AccountSettings({ user }: { user: User }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: user.username ?? '',
    email: user.email ?? '',
    name: user.name ?? '',
    bio: user.bio ?? '',
    avatar: user.avatar ?? '',
    coverPhoto: user.coverPhoto ?? '',
    phone: user.phone ?? '',
    birthday: user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '',
    gender: user.gender ?? '',
    location: user.location ?? '',
    instagram: user.instagram ?? '',
    facebook: user.facebook ?? '',
    youtube: user.youtube ?? '',
    twitter: user.twitter ?? '',
    tiktok: user.tiktok ?? '',
    website: user.website ?? '',
  })
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (!formData.username || formData.username === user.username) {
        setUsernameAvailable(null)
        return
      }

      if (formData.username.length < 3) {
        setUsernameAvailable(false)
        return
      }

      setCheckingUsername(true)
      try {
        const response = await fetch(
          `/api/settings/username?username=${encodeURIComponent(formData.username)}`
        )
        const data = await response.json()
        setUsernameAvailable(data.available)
      } catch (err) {
        console.error('Username check error:', err)
      } finally {
        setCheckingUsername(false)
      }
    }

    const timeoutId = setTimeout(checkUsername, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.username, user.username])

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>, type: 'avatar' | 'coverPhoto') => {
    const file = event.target.files?.[0]
    if (!file) return

    const setUploadingState = type === 'avatar' ? setUploading : setUploadingCover
    setUploadingState(true)
    setError(null)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to upload file')
      }

      const { url } = await response.json()
      setFormData((prev) => ({ ...prev, [type]: url }))
      setMessage(`${type === 'avatar' ? 'Profile photo' : 'Cover photo'} uploaded. Remember to save.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      setUploadingState(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      // Update username if changed
      if (formData.username !== user.username && formData.username) {
        const usernameResponse = await fetch('/api/settings/username', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: formData.username }),
        })

        if (!usernameResponse.ok) {
          const data = await usernameResponse.json()
          throw new Error(data.error?.message || 'Failed to update username')
        }
      }

      // Update email if changed
      if (formData.email !== user.email) {
        const emailResponse = await fetch('/api/settings/email', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        })

        if (!emailResponse.ok) {
          const data = await emailResponse.json()
          throw new Error(data.error?.message || 'Failed to update email')
        }
      }

      // Update profile
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error?.message || 'Failed to save profile')
      }

      setMessage('Account settings updated successfully!')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Account Information</h2>
        <p className="text-sm text-gray-500">
          Update your account details and profile information
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

      {/* Cover Photo */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Cover Photo</label>
        <div className="relative h-48 w-full overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-primary/10 to-primary/5">
          {formData.coverPhoto ? (
            <Image src={formData.coverPhoto} alt="Cover photo" fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              <Upload size={32} />
            </div>
          )}
        </div>
        <label className="inline-block">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'coverPhoto')}
            className="hidden"
            disabled={uploadingCover || saving}
          />
          <span className="btn-secondary cursor-pointer inline-flex items-center gap-2">
            {uploadingCover && <Loader2 size={16} className="animate-spin" />}
            {uploadingCover ? 'Uploading...' : 'Upload Cover Photo'}
          </span>
        </label>
        {formData.coverPhoto && (
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, coverPhoto: '' }))}
            className="ml-3 text-sm text-red-600 hover:text-red-700"
            disabled={saving}
          >
            Remove
          </button>
        )}
      </div>

      {/* Profile Photo */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
        <div className="flex items-center gap-6">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-50">
            {formData.avatar ? (
              <Image src={formData.avatar} alt="Profile avatar" fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <Upload size={24} />
              </div>
            )}
          </div>
          <div>
            <label className="inline-block">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'avatar')}
                className="hidden"
                disabled={uploading || saving}
              />
              <span className="btn-secondary cursor-pointer inline-flex items-center gap-2">
                {uploading && <Loader2 size={16} className="animate-spin" />}
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </span>
            </label>
            {formData.avatar && (
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, avatar: '' }))}
                className="ml-3 text-sm text-red-600 hover:text-red-700"
                disabled={saving}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="username">
            Username *
          </label>
          <div className="relative">
            <input
              id="username"
              name="username"
              type="text"
              placeholder="edgemaster"
              value={formData.username}
              onChange={handleChange}
              className="input-field pr-10"
              disabled={saving}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {checkingUsername && <Loader2 size={18} className="animate-spin text-gray-400" />}
              {!checkingUsername && usernameAvailable === true && (
                <Check size={18} className="text-emerald-600" />
              )}
              {!checkingUsername && usernameAvailable === false && (
                <X size={18} className="text-red-600" />
              )}
            </div>
          </div>
          {usernameAvailable === false && (
            <p className="mt-1 text-xs text-red-600">Username is taken</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Your unique handle (e.g., @{formData.username || 'username'})</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
            disabled={saving}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">
            Display Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Edge Master"
            value={formData.name}
            onChange={handleChange}
            className="input-field"
            maxLength={100}
            disabled={saving}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="phone">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChange={handleChange}
            className="input-field"
            disabled={saving}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="birthday">
            Birthday
          </label>
          <input
            id="birthday"
            name="birthday"
            type="date"
            value={formData.birthday}
            onChange={handleChange}
            className="input-field"
            disabled={saving}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="gender">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="input-field"
            disabled={saving}
          >
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="location">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="New York, NY"
            value={formData.location}
            onChange={handleChange}
            className="input-field"
            disabled={saving}
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="bio">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          placeholder="Share your betting style, favorite leagues, or track record highlights."
          value={formData.bio}
          onChange={handleChange}
          className="input-field h-32 resize-none"
          maxLength={600}
          disabled={saving}
        />
        <div className="mt-1 text-xs text-gray-500 text-right">{formData.bio.length}/600</div>
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Social Accounts</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { key: 'instagram', label: 'Instagram', placeholder: '@edgebook' },
            { key: 'twitter', label: 'Twitter / X', placeholder: '@edgebook' },
            { key: 'facebook', label: 'Facebook', placeholder: 'edgebook' },
            { key: 'youtube', label: 'YouTube', placeholder: 'youtube.com/edgebook' },
            { key: 'tiktok', label: 'TikTok', placeholder: '@edgebook' },
            { key: 'website', label: 'Website', placeholder: 'edgebook.com' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={field.key}>
                {field.label}
              </label>
              <input
                id={field.key}
                name={field.key}
                type="text"
                value={formData[field.key as keyof typeof formData]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="input-field"
                disabled={saving}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t">
        <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving || (usernameAvailable === false)}>
          {saving && <Loader2 size={18} className="animate-spin" />}
          Save Changes
        </button>
      </div>
    </form>
  )
}
