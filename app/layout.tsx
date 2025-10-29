import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/components/AuthProvider'
import RouteLoader from '@/components/RouteLoader'
import { Suspense } from 'react'
import ThemeFavicon from '@/components/ThemeFavicon'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EdgeBook - The social platform for sports predictions and picks',
  description: 'Share your predictions and insights with the community',
  icons: {
    apple: [
      { url: '/favicons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://edgebook.com',
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
    <html lang="en">
      <head>
        <ThemeFavicon />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Suspense fallback={null}>
            <RouteLoader />
          </Suspense>
          <div className="min-h-screen flex flex-col">
            <Navbar />
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
