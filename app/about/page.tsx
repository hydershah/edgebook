import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Target, Users, TrendingUp, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About EdgeBook | Social Sports Betting Picks Platform',
  description: 'Learn about EdgeBook, the premier platform for sharing and tracking sports betting picks. Join a community of expert handicappers and sports enthusiasts.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              About EdgeBook
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto">
              The premier social platform for sports betting picks, where expert handicappers
              and sports enthusiasts connect, share, and track their predictions.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 text-center">
            Our Mission
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto text-center">
            EdgeBook was created to bring transparency and community to sports betting.
            We provide a platform where handicappers can showcase their expertise, build their
            reputation, and help others make informed betting decisions. Whether you&apos;re a
            seasoned professional or just starting out, EdgeBook gives you the tools to share
            your picks, track your performance, and grow your following.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Picks</h3>
            <p className="text-gray-600">
              Access picks from verified handicappers with proven track records across all major sports.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Community</h3>
            <p className="text-gray-600">
              Join a thriving community of sports enthusiasts and learn from the best in the business.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Performance Tracking</h3>
            <p className="text-gray-600">
              Transparent statistics and historical data to help you identify the most reliable handicappers.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Trust & Safety</h3>
            <p className="text-gray-600">
              We prioritize responsible gaming and maintain strict verification standards for all users.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl p-8 sm:p-12 text-white mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
            How EdgeBook Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Create Account</h3>
              <p className="text-gray-300">
                Sign up and set up your profile to start sharing or following picks.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Share or Follow</h3>
              <p className="text-gray-300">
                Post your picks or follow top handicappers to see their predictions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Track Results</h3>
              <p className="text-gray-300">
                Monitor performance with detailed stats and transparent records.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Transparency</h3>
              <p className="text-gray-600 leading-relaxed">
                Every pick is tracked and verified. No hiding losses or cherry-picking wins.
                What you see is what you get.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Community</h3>
              <p className="text-gray-600 leading-relaxed">
                We believe in the power of shared knowledge and helping each other succeed
                in the sports betting world.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Responsibility</h3>
              <p className="text-gray-600 leading-relaxed">
                We promote responsible gaming and provide resources to ensure betting
                remains fun and never becomes a problem.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 rounded-2xl shadow-xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Join EdgeBook?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start sharing your picks or follow the best handicappers in the business.
            Join thousands of members already on EdgeBook.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/feed"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
            >
              View Picks
            </Link>
          </div>
        </div>

        {/* Responsible Gaming Notice */}
        <div className="mt-12 bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-orange-900 mb-2">Responsible Gaming</h3>
          <p className="text-orange-800 mb-2">
            EdgeBook is committed to promoting responsible gaming. If you or someone you know
            has a gambling problem, help is available.
          </p>
          <p className="text-orange-800">
            Call <a href="tel:1-800-522-4700" className="font-semibold underline">1-800-522-4700</a> or
            visit our <Link href="/legal/responsible-gaming" className="font-semibold underline">Responsible Gaming</Link> page.
          </p>
        </div>
      </div>
    </div>
  )
}
