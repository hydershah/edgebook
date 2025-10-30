import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/components/AuthProvider'
import RouteLoader from '@/components/RouteLoader'
import { Suspense } from 'react'
import ThemeFavicon from '@/components/ThemeFavicon'
import dynamic from 'next/dynamic'

const EmailVerificationBanner = dynamic(
  () => import('@/components/EmailVerificationBanner'),
  { ssr: false }
)

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
})

export const metadata: Metadata = {
  title: 'EdgeBook - The social platform for sports predictions and picks',
  description: 'Share your predictions and insights with the community',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://edgebook.ai',
    siteName: 'EdgeBook',
    title: 'EdgeBook - The social platform for sports predictions and picks',
    description: 'Share your predictions and insights with the community',
    images: [
      {
        url: '/og-images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EdgeBook - Find Your Edge',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EdgeBook - The social platform for sports predictions and picks',
    description: 'Share your predictions and insights with the community',
    images: ['/og-images/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={manrope.variable}>
      <head>
        <ThemeFavicon />
      </head>
      <body className="font-sans">
        <AuthProvider>
          <Suspense fallback={null}>
            <RouteLoader />
          </Suspense>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <EmailVerificationBanner />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
