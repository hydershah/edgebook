'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Apple } from 'lucide-react'

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status } = useSession()
  const rawCallbackUrl = searchParams.get('callbackUrl')
  const callbackUrl = useMemo(() => {
    if (!rawCallbackUrl) {
      return '/feed'
    }

    if (rawCallbackUrl.startsWith('/')) {
      return rawCallbackUrl
    }

    if (rawCallbackUrl.startsWith('http')) {
      try {
        const url = new URL(rawCallbackUrl)
        if (typeof window !== 'undefined' && url.origin === window.location.origin) {
          return `${url.pathname}${url.search}${url.hash}`
        }
      } catch {
        // Ignore malformed URLs and fall back to default
      }
    }

    return '/feed'
  }, [rawCallbackUrl])

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(callbackUrl)
    }
  }, [status, router, callbackUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const normalizedEmail = formData.email.trim().toLowerCase()
    const validationErrors: typeof fieldErrors = {}

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      validationErrors.email = 'Enter a valid email address'
    }

    if (formData.password.length < 8) {
      validationErrors.password = 'Password must be at least 8 characters'
    }

    setFieldErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: normalizedEmail,
        password: formData.password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialSignIn = async (provider: string) => {
    setSocialLoading(provider)
    setError('')
    try {
      await signIn(provider, { callbackUrl })
    } catch (error) {
      setError('Failed to sign in. Please try again.')
      setSocialLoading(null)
    }
  }

  return (
    <div className="relative isolate min-h-fit bg-gradient-to-br from-white via-background to-white/95">
      <div className="pointer-events-none absolute inset-x-0 top-[-12rem] -z-10 flex justify-center">
        <div className="h-[22rem] w-[22rem] rounded-full bg-primary/25 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
      </div>
      <div className="pointer-events-none absolute bottom-[-12rem] right-[-8rem] -z-10 h-[26rem] w-[26rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-8rem] left-[-8rem] -z-10 hidden h-[22rem] w-[22rem] rounded-full bg-primary/5 blur-3xl md:block" />

      <div className="mx-auto flex w-full max-w-md justify-center px-4 py-16 sm:px-6">
        <div className="w-full rounded-3xl border border-gray-200/70 bg-white/95 p-8 shadow-xl shadow-gray-200/60 sm:p-10">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">Sign in to continue to your EdgeBook account.</p>
          </div>

          {error && (
            <div className="mb-6 flex items-start rounded-2xl border border-red-100 bg-red-50/90 p-4">
              <svg className="mt-0.5 h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-3 text-sm text-red-800">{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleSocialSignIn('google')}
              disabled={socialLoading !== null || loading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200/80 bg-white/90 px-4 py-3.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:border-primary/40 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
            >
              {socialLoading === 'google' ? (
                <svg className="h-5 w-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialSignIn('apple')}
              disabled={socialLoading !== null || loading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200/80 bg-white/90 px-4 py-3.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:border-primary/40 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
            >
              {socialLoading === 'apple' ? (
                <svg className="h-5 w-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <Apple className="h-5 w-5" />
              )}
              <span>Continue with Apple</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialSignIn('facebook')}
              disabled={socialLoading !== null || loading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200/80 bg-white/90 px-4 py-3.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:border-primary/40 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
            >
              {socialLoading === 'facebook' ? (
                <svg className="h-5 w-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              )}
              <span>Continue with Facebook</span>
            </button>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-900">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: undefined }))
                    }
                  }}
                  className={`w-full rounded-2xl border px-4 py-3 text-base text-gray-900 shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                    fieldErrors.email ? 'border-red-400 focus:ring-red-200' : 'border-gray-200'
                  }`}
                  required
                  disabled={loading || socialLoading !== null}
                  aria-invalid={fieldErrors.email ? 'true' : 'false'}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                />
              </div>
              {fieldErrors.email && (
                <p id="email-error" className="mt-2 text-xs text-red-600">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-900">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: undefined }))
                    }
                  }}
                  className={`w-full rounded-2xl border px-4 py-3 text-base text-gray-900 shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                    fieldErrors.password ? 'border-red-400 focus:ring-red-200' : 'border-gray-200'
                  }`}
                  required
                  disabled={loading}
                  aria-invalid={fieldErrors.password ? 'true' : 'false'}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 transition hover:text-primary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3.98 8.223a10.477 10.477 0 011.65-1.933m2.772-1.836A10.45 10.45 0 0112 3c5.052 0 9.298 3.553 10.5 8.25a10.523 10.523 0 01-1.563 3.029m-1.522 1.712A10.451 10.451 0 0112 19.5a10.45 10.45 0 01-4.273-.912m-1.712-1.024A10.523 10.523 0 011.5 11.25a10.5 10.5 0 011.113-2.507M9.53 9.53a3 3 0 014.243 4.243m0 0l3.182 3.182M13.773 13.773a3 3 0 01-4.243-4.243m0 0L6.53 6.53"
                      />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .638C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" className="mt-2 text-xs text-red-600">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm font-semibold text-primary transition hover:text-primary-dark"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || socialLoading !== null}
              className="w-full rounded-2xl bg-gradient-to-r from-primary to-primary-dark px-4 py-3.5 text-base font-semibold text-white shadow-md transition hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Signing in...</span>
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-semibold text-primary transition hover:text-primary-dark">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading…</div>}>
      <SignInContent />
    </Suspense>
  )
}
