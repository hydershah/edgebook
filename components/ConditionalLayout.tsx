'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import EmailVerificationBanner from '@/components/EmailVerificationBanner'

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    // Admin routes have their own layout - just render children
    return <>{children}</>
  }

  // Regular routes get Navbar and Footer
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <EmailVerificationBanner />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
