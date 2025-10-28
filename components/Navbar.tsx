'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Home, TrendingUp, PlusSquare, Brain, Menu, X, Bell, ChevronDown } from 'lucide-react'
import UserSearch from '@/components/UserSearch'

type NavItem = {
  href: string
  label: string
  icon: typeof Home
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)
  const avatarInitial = session?.user?.name?.[0]?.toUpperCase() || 'U'

  const navItems = useMemo<NavItem[]>(
    () => [
      { href: '/feed', label: 'Feed', icon: Home },
      { href: '/trending', label: 'Trending', icon: TrendingUp },
      { href: '/aiadvisor', label: 'AI Advisor', icon: Brain },
    ],
    [],
  )

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isProfileMenuOpen) return

    const handleClick = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isProfileMenuOpen])

  useEffect(() => {
    setIsProfileMenuOpen(false)
  }, [pathname, mobileMenuOpen])

  const handleSignOut = () => {
    setIsProfileMenuOpen(false)
    signOut({ callbackUrl: '/auth/signin' })
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  const handleUserSelect = (userId: string) => {
    setMobileMenuOpen(false)
    router.push(`/profile/${userId}`)
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 w-full items-center gap-4">
          {/* Logo + Primary Navigation */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white transition-transform duration-200 group-hover:rotate-3 group-hover:scale-105">
                <span className="text-lg font-bold">E</span>
              </div>
              <div>
                <span className="block text-lg font-semibold text-gray-900">EdgeBook</span>
                <span className={`block text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${
                  isScrolled ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  Find Your Edge
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 shadow-sm">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all ${
                    isActive(href)
                      ? 'bg-primary/10 text-primary shadow-inner'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Global Search */}
          <div className="hidden flex-1 justify-center md:flex">
            <UserSearch className="max-w-md" onUserSelect={handleUserSelect} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {session?.user ? (
              <>
                <button
                  type="button"
                  className="hidden rounded-full border border-gray-200 bg-white p-2 text-gray-500 transition hover:text-primary md:flex"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                </button>
                <Link
                  href="/createpick"
                  className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-dark px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md md:inline-flex"
                >
                  <PlusSquare size={18} />
                  <span>Create Pick</span>
                </Link>
                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen(prev => !prev)}
                    className="flex items-center gap-3 rounded-full border border-transparent px-2 py-1.5 text-left transition hover:border-gray-200 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    aria-haspopup="menu"
                    aria-expanded={isProfileMenuOpen}
                  >
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-sm font-semibold text-white">
                      {avatarInitial}
                    </div>
                    <div className="hidden lg:flex min-w-[140px] flex-col leading-tight">
                      <span className="truncate text-sm font-semibold text-gray-900">{session.user.name}</span>
                      {session.user.email && (
                        <span className="truncate text-xs text-gray-500">{session.user.email}</span>
                      )}
                    </div>
                    <ChevronDown size={16} className="hidden text-gray-400 lg:block" />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 z-50 mt-3 w-60 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg shadow-gray-200/40">
                      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-sm font-semibold text-white">
                          {avatarInitial}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">{session.user.name}</p>
                          {session.user.email && (
                            <p className="truncate text-xs text-gray-500">{session.user.email}</p>
                          )}
                        </div>
                      </div>
                      <div className="py-1">
                        <Link
                          href={`/profile/${session.user.id}`}
                          className="block px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          href="/profile/settings"
                          className="block px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Settings
                        </Link>
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="block w-full px-4 py-2 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="hidden rounded-full px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-primary md:inline-flex"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-dark px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
                >
                  Get Started
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:text-primary md:hidden"
              aria-label="Toggle navigation"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="pb-3 md:hidden">
          <UserSearch
            variant="mobile"
            className="mt-1"
            onUserSelect={handleUserSelect}
          />
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-2 border-t border-gray-200 py-4">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive(href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}

              {session?.user ? (
                <Link
                  href="/createpick"
                  className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <PlusSquare size={18} />
                  <span>Create Pick</span>
                </Link>
              ) : (
                <div className="flex gap-2 px-1">
                  <Link
                    href="/auth/signin"
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700 transition hover:border-primary hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Join
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
