import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import RouteLoader from '@/components/RouteLoader'
import { Suspense } from 'react'
import ThemeFavicon from '@/components/ThemeFavicon'
import ConditionalLayout from '@/components/ConditionalLayout'
import StructuredData from '@/components/StructuredData'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://edgebook.ai'),
  title: {
    default: 'EdgeBook - Sports Picks Platform | Share & Monetize Your Predictions',
    template: '%s | EdgeBook'
  },
  description: 'Join EdgeBook, the premier sports prediction platform where you can showcase your picks, track performance, build your reputation, and earn from your insights. NBA, NFL, MLB, UFC & more.',
  keywords: [
    'sports predictions',
    'sports picks',
    'sports betting insights',
    'sports analysis platform',
    'NBA picks',
    'NFL picks',
    'MLB predictions',
    'UFC predictions',
    'sports handicapping',
    'betting tips',
    'sports analytics',
    'verified picks',
    'sports prediction marketplace',
    'monetize sports picks',
    'sports picks tracking'
  ],
  authors: [{ name: 'EdgeBook' }],
  creator: 'EdgeBook',
  publisher: 'EdgeBook',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://edgebook.ai',
    siteName: 'EdgeBook',
    title: 'EdgeBook - Sports Picks Platform | Share & Monetize Your Predictions',
    description: 'Join EdgeBook, the premier sports prediction platform where you can showcase your picks, track performance, build your reputation, and earn from your insights. NBA, NFL, MLB, UFC & more.',
    images: [
      {
        url: '/og-images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EdgeBook - Sports Prediction Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EdgeBook - Sports Picks Platform | Share & Monetize Your Predictions',
    description: 'Join EdgeBook, the premier sports prediction platform where you can showcase your picks, track performance, build your reputation, and earn from your insights.',
    images: ['/og-images/og-image.png'],
    creator: '@EdgeBook',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: 'https://edgebook.ai',
  },
  category: 'sports',
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#4F46E5" />
        <link rel="canonical" href="https://edgebook.ai" />
      </head>
      <body className="font-sans">
        <StructuredData />
        <AuthProvider>
          <Suspense fallback={null}>
            <RouteLoader />
          </Suspense>
          <ConditionalLayout>{children}</ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
