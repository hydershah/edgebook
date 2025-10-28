import Link from 'next/link'
import { Phone, AlertCircle, Shield } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-8">
          {/* Logo and Description */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">✓</span>
              </div>
              <span className="text-lg font-bold text-gray-900">EdgeBook</span>
            </div>
          </div>

          {/* Links - Horizontal Layout */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-6">
            <Link
              href="/legal/terms"
              className="text-gray-600 hover:text-primary text-sm font-medium transition-colors"
            >
              Terms
            </Link>
            <span className="text-gray-300">·</span>
            <Link
              href="/legal/privacy"
              className="text-gray-600 hover:text-primary text-sm font-medium transition-colors"
            >
              Privacy
            </Link>
            <span className="text-gray-300">·</span>
            <Link
              href="/legal/disclosures"
              className="text-gray-600 hover:text-primary text-sm font-medium transition-colors"
            >
              Disclosures
            </Link>
            <span className="text-gray-300">·</span>
            <Link
              href="/legal/responsible-gaming"
              className="text-gray-600 hover:text-primary text-sm font-medium transition-colors"
            >
              Responsible Gaming
            </Link>
          </div>

          {/* Responsible Gaming Notices */}
          <div className="max-w-2xl mx-auto space-y-3">
            {/* Helpline */}
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Phone size={16} className="text-red-500" />
              <span className="text-sm">
                Gambling problem? Call{' '}
                <a
                  href="tel:1-800-522-4700"
                  className="font-semibold text-red-600 hover:text-red-700 transition-colors"
                >
                  1-800-522-4700
                </a>
              </span>
            </div>

            {/* Age & Responsibility Notice */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <AlertCircle size={14} className="text-amber-500" />
                <span>Must be 18+ to use this platform</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield size={14} className="text-primary" />
                <span>Please gamble responsibly</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <p>© {currentYear} EdgeBook. All rights reserved.</p>
            <p className="text-gray-400">The social platform for sports betting insights</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
