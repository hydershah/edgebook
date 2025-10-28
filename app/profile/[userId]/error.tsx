'use client'

interface ProfileErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Friendly error state for the profile route so failures surface to the user.
 */
export default function ProfileError({ error, reset }: ProfileErrorProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-8 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v4m0 4h.01M4.93 19.07a10 10 0 1114.14 0 10 10 0 01-14.14 0z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">We hit a snag loading this profile</h1>
          <p className="mt-2 text-sm text-gray-600">
            {error?.message
              ? error.message
              : 'An unexpected error occurred while fetching the profile. Please try again.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-primary"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
