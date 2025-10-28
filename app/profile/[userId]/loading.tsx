'use client'

/**
 * Skeleton UI for the profile page so route transitions feel responsive.
 * Uses a lightweight shimmer effect that mirrors the structure of the page.
 */
export default function LoadingProfilePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-full bg-gray-200" />
            <div className="space-y-3 flex-1">
              <div className="space-y-2">
                <div className="h-6 w-40 rounded-lg bg-gray-200" />
                <div className="h-4 w-32 rounded-lg bg-gray-200" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full rounded-lg bg-gray-200" />
                <div className="h-4 w-3/4 rounded-lg bg-gray-200" />
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="h-5 w-24 rounded-full bg-gray-200" />
                <div className="h-5 w-24 rounded-full bg-gray-200" />
                <div className="h-5 w-24 rounded-full bg-gray-200" />
              </div>
            </div>
          </div>
          <div className="h-10 w-40 rounded-full bg-gray-200" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div
            // Use index since this is static skeleton content
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4"
          >
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="h-8 w-32 rounded bg-gray-200" />
            <div className="h-4 w-40 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-32 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
          </div>
          {[...Array(3)].map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="h-4 w-28 rounded bg-gray-200" />
              <div className="h-5 w-24 rounded bg-gray-200" />
              <div className="h-4 w-20 rounded bg-gray-200" />
            </div>
          ))}
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="h-5 w-40 rounded bg-gray-200" />
          {[...Array(4)].map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index} className="h-4 w-32 rounded bg-gray-200" />
          ))}
          <div className="space-y-3">
            <div className="h-4 w-28 rounded bg-gray-200" />
            {[...Array(3)].map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={index} className="h-10 rounded bg-gray-200" />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="h-5 w-48 rounded bg-gray-200" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index} className="h-16 rounded-xl border border-gray-200 bg-gray-100" />
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-5 w-40 rounded bg-gray-200" />
            <div className="h-4 w-56 rounded bg-gray-200 mt-2" />
          </div>
          <div className="h-9 w-32 rounded bg-gray-200" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index} className="h-20 rounded-xl border border-gray-200 bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  )
}
