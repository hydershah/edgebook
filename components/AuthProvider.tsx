'use client'

import { SessionProvider } from 'next-auth/react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      // Disable automatic session refetching
      refetchInterval={0}
      // Only refetch session when window is focused if user hasn't verified email
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  )
}
