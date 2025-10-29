'use client'

import { useState, useMemo, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2, Upload, XCircle } from 'lucide-react'

interface ProfileSettingsFormProps {
  user: {
    id: string
    name: string | null
    bio: string | null
    avatar: string | null
    instagram: string | null
    facebook: string | null
    youtube: string | null
    twitter: string | null
    tiktok: string | null
    website: string | null
  }
}

export default function ProfileSettingsForm({ user }: ProfileSettingsFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: user.name ?? '',
    bio: user.bio ?? '',
    avatar: user.avatar ?? '',
    instagram: user.instagram ?? '',
    facebook: user.facebook ?? '',
    youtube: user.youtube ?? '',
    twitter: user.twitter ?? '',
    tiktok: user.tiktok ?? '',
    website: user.website ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const bioCharCount = useMemo(() => formData.bio.trim().length, [formData.bio])

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    setMessage(null)

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
      setFormData((prev) => ({ ...prev, avatar: url }))
      setMessage('Profile photo uploaded. Remember to save your changes.')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatar: '' }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error?.message || 'Failed to save profile')
      }

      setMessage('Profile updated successfully.')
      router.refresh()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {message && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
          <XCircle size={18} className="mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Profile Basics</h2>
          <p className="text-sm text-gray-500">
            Share who you are, what sports you cover, and how users can connect with you.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[180px_1fr]">
          <div className="space-y-3">
            <div className="relative h-40 w-40 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
              {formData.avatar ? (
                <Image
                  src={formData.avatar}
                  alt="Profile avatar preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
                  <Upload size={28} />
                  <span className="mt-2 text-xs font-medium">Upload Photo</span>
                </div>
              )}
            </div>
            <label className="block">
              <span className="sr-only">Upload profile image</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/gif"
                onChange={handleAvatarUpload}
                className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-dark disabled:opacity-50"
                disabled={uploading || saving}
              />
            </label>
            {formData.avatar && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="text-sm text-gray-600 underline hover:text-gray-900 disabled:opacity-50"
                disabled={saving}
              >
                Remove photo
              </button>
            )}
            {uploading && (
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Uploading...
              </p>
            )}
          </div>

          <div className="space-y-5">
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
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="bio">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                placeholder="Share your prediction style, favorite leagues, or track record highlights."
                value={formData.bio}
                onChange={handleChange}
                className="input-field h-32 resize-none"
                maxLength={600}
                disabled={saving}
              />
              <div className="mt-1 text-xs text-gray-500 text-right">{bioCharCount}/600</div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Social Accounts</h2>
          <p className="text-sm text-gray-500">
            Drop handles or full URLs. We&apos;ll link your profile so followers can explore more of
            your content.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            { key: 'instagram', label: 'Instagram', placeholder: '@edgebook' },
            { key: 'facebook', label: 'Facebook', placeholder: 'edgebook' },
            { key: 'youtube', label: 'YouTube', placeholder: 'youtube.com/edgebook' },
            { key: 'twitter', label: 'Twitter / X', placeholder: '@edgebook' },
            { key: 'tiktok', label: 'TikTok', placeholder: '@edgebook' },
            { key: 'website', label: 'Website', placeholder: 'edgebook.com' },
          ].map((field) => (
            <div key={field.key}>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor={field.key}
              >
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
                maxLength={field.key === 'website' ? 255 : 100}
                disabled={saving}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
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
