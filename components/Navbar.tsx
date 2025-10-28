'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, TrendingUp, PlusSquare, Brain, Menu, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path
  const isHomePage = pathname === '/'

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900">EdgeBook</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/feed"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/feed')
                  ? 'text-primary bg-primary/5'
                  : 'text-gray-700 hover:text-primary hover:bg-gray-50'
              }`}
            >
              <Home size={18} />
              <span>Feed</span>
            </Link>
            <Link
              href="/trending"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/trending')
                  ? 'text-primary bg-primary/5'
                  : 'text-gray-700 hover:text-primary hover:bg-gray-50'
              }`}
            >
              <TrendingUp size={18} />
              <span>Trending</span>
            </Link>
            <Link
              href="/aiadvisor"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/aiadvisor')
                  ? 'text-primary bg-primary/5'
                  : 'text-gray-700 hover:text-primary hover:bg-gray-50'
              }`}
            >
              <Brain size={18} />
              <span>AI Advisor</span>
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {session?.user ? (
              <>
                <Link
                  href="/createpick"
                  className="hidden md:flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white font-medium px-5 py-2 rounded-lg transition-colors"
                >
                  <PlusSquare size={18} />
                  <span>Create Pick</span>
                </Link>
                <Link href="/profile" className="flex items-center space-x-2 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {session.user.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-gray-900">
                    {session.user.name}
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="hidden md:block text-gray-700 hover:text-primary font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-primary hover:bg-primary-dark text-white font-medium px-5 py-2 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <Link
                href="/feed"
                className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home size={18} />
                <span>Feed</span>
              </Link>
              <Link
                href="/trending"
                className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <TrendingUp size={18} />
                <span>Trending</span>
              </Link>
              <Link
                href="/aiadvisor"
                className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Brain size={18} />
                <span>AI Advisor</span>
              </Link>
              {session?.user && (
                <Link
                  href="/createpick"
                  className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-primary/5 text-primary font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <PlusSquare size={18} />
                  <span>Create Pick</span>
                </Link>
              )}
              {!session?.user && (
                <Link
                  href="/auth/signin"
                  className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
