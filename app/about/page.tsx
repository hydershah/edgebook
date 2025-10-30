import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Target, Users, TrendingUp, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About EdgeBook | Social Sports Betting Picks Platform',
  description: 'Learn about EdgeBook, the premier platform for sharing and tracking sports betting picks. Join a community of expert handicappers and sports enthusiasts.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Minimal & Elegant */}
      <div className="relative overflow-hidden">
        {/* Subtle green gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-primary/10" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center space-y-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-phantom tracking-tight">
              About EdgeBook
            </h1>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
            <p className="text-xl sm:text-2xl text-gray-graphite max-w-3xl mx-auto leading-relaxed font-light">
              The premier social platform for sports betting picks, where expert handicappers
              and sports enthusiasts connect, share, and track their predictions.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section - Clean & Spacious */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-phantom mb-12 text-center">
            Our Mission
          </h2>
          <p className="text-xl text-gray-graphite leading-relaxed text-center font-light">
            EdgeBook was created to bring transparency and community to sports betting.
            We provide a platform where handicappers can showcase their expertise, build their
            reputation, and help others make informed betting decisions. Whether you&apos;re a
            seasoned professional or just starting out, EdgeBook gives you the tools to share
            your picks, track your performance, and grow your following.
          </p>
        </div>

        {/* Features Grid - Minimalist Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24">
          <div className="group p-8 rounded-2xl bg-white border border-gray-cloud hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <Target className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-phantom mb-3">Expert Picks</h3>
            <p className="text-gray-graphite leading-relaxed">
              Access picks from verified handicappers with proven track records across all major sports.
            </p>
          </div>

          <div className="group p-8 rounded-2xl bg-white border border-gray-cloud hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-phantom mb-3">Community</h3>
            <p className="text-gray-graphite leading-relaxed">
              Join a thriving community of sports enthusiasts and learn from the best in the business.
            </p>
          </div>

          <div className="group p-8 rounded-2xl bg-white border border-gray-cloud hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <TrendingUp className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-phantom mb-3">Performance Tracking</h3>
            <p className="text-gray-graphite leading-relaxed">
              Transparent statistics and historical data to help you identify the most reliable handicappers.
            </p>
          </div>

          <div className="group p-8 rounded-2xl bg-white border border-gray-cloud hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-phantom mb-3">Trust & Safety</h3>
            <p className="text-gray-graphite leading-relaxed">
              We prioritize responsible gaming and maintain strict verification standards for all users.
            </p>
          </div>
        </div>

        {/* How It Works - Elegant & Simple */}
        <div className="mt-32 mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-phantom mb-16 text-center">
            How EdgeBook Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center space-y-6">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
                <div className="relative w-20 h-20 bg-primary rounded-full flex items-center justify-center text-2xl font-bold text-white">
                  1
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-phantom">Create Account</h3>
              <p className="text-gray-graphite leading-relaxed">
                Sign up and set up your profile to start sharing or following picks.
              </p>
            </div>
            <div className="text-center space-y-6">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
                <div className="relative w-20 h-20 bg-primary rounded-full flex items-center justify-center text-2xl font-bold text-white">
                  2
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-phantom">Share or Follow</h3>
              <p className="text-gray-graphite leading-relaxed">
                Post your picks or follow top handicappers to see their predictions.
              </p>
            </div>
            <div className="text-center space-y-6">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
                <div className="relative w-20 h-20 bg-primary rounded-full flex items-center justify-center text-2xl font-bold text-white">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-phantom">Track Results</h3>
              <p className="text-gray-graphite leading-relaxed">
                Monitor performance with detailed stats and transparent records.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section - Clean Cards */}
        <div className="mt-32">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-phantom mb-16 text-center">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-10 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-gray-cloud">
              <h3 className="text-2xl font-bold text-gray-phantom mb-4">Transparency</h3>
              <p className="text-gray-graphite leading-relaxed">
                Every pick is tracked and verified. No hiding losses or cherry-picking wins.
                What you see is what you get.
              </p>
            </div>
            <div className="p-10 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-gray-cloud">
              <h3 className="text-2xl font-bold text-gray-phantom mb-4">Community</h3>
              <p className="text-gray-graphite leading-relaxed">
                We believe in the power of shared knowledge and helping each other succeed
                in the sports betting world.
              </p>
            </div>
            <div className="p-10 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-gray-cloud">
              <h3 className="text-2xl font-bold text-gray-phantom mb-4">Responsibility</h3>
              <p className="text-gray-graphite leading-relaxed">
                We promote responsible gaming and provide resources to ensure betting
                remains fun and never becomes a problem.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section - Premium & Elegant */}
        <div className="mt-32 relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark" />
          <div className="relative px-8 py-16 sm:p-20 text-center text-white">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Ready to Join EdgeBook?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto font-light">
              Start sharing your picks or follow the best handicappers in the business.
              Join thousands of members already on EdgeBook.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="group inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-primary bg-white rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/feed"
                className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
              >
                View Picks
              </Link>
            </div>
          </div>
        </div>

        {/* Responsible Gaming Notice - Subtle & Clean */}
        <div className="mt-16 bg-amber-50/50 border border-amber-200/50 rounded-2xl p-8">
          <h3 className="text-lg font-semibold text-amber-900 mb-3">Responsible Gaming</h3>
          <p className="text-amber-800/90 mb-3 leading-relaxed">
            EdgeBook is committed to promoting responsible gaming. If you or someone you know
            has a gambling problem, help is available.
          </p>
          <p className="text-amber-800/90">
            Call <a href="tel:1-800-522-4700" className="font-semibold underline hover:text-amber-900">1-800-522-4700</a> or
            visit our <Link href="/legal/responsible-gaming" className="font-semibold underline hover:text-amber-900">Responsible Gaming</Link> page.
          </p>
        </div>
      </div>
    </div>
  )
}
