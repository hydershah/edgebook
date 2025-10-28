'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

/**
 * Lightweight top-of-page progress indicator for route transitions.
 */
export default function RouteLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  const key = useMemo(() => {
    const search = searchParams?.toString() ?? ''
    return `${pathname}?${search}`
  }, [pathname, searchParams])

  useEffect(() => {
    let cleanup = false
    const timers: Array<ReturnType<typeof setTimeout>> = []

    setIsVisible(true)
    setProgress(12)

    timers.push(
      setTimeout(() => {
        if (!cleanup) setProgress(45)
      }, 120)
    )

    timers.push(
      setTimeout(() => {
        if (!cleanup) setProgress(70)
      }, 240)
    )

    timers.push(
      setTimeout(() => {
        if (!cleanup) setProgress(90)
      }, 420)
    )

    timers.push(
      setTimeout(() => {
        if (!cleanup) setProgress(100)
      }, 600)
    )

    timers.push(
      setTimeout(() => {
        if (!cleanup) {
          setIsVisible(false)
          setProgress(0)
        }
      }, 850)
    )

    return () => {
      cleanup = true
      timers.forEach(clearTimeout)
    }
  }, [key])

  if (!isVisible) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60]">
      <div
        className="h-1 bg-primary transition-all duration-150 ease-out"
        style={{ width: `${progress}%`, opacity: progress >= 100 ? 0 : 1 }}
      />
    </div>
  )
}
