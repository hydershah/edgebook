/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['edgebook-uploads.s3.amazonaws.com'],
  },
  // Skip static generation for pages that need database access
  // This prevents build failures when DATABASE_URL is not available
  experimental: {
    // Skip trailing slash for API routes
  },
  // Provide fallback values for environment variables during build
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://edgebook.ai',
  },
  // Output standalone for Docker/Railway deployment
  output: 'standalone',
}

module.exports = nextConfig
