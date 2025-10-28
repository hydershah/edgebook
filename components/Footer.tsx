import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">✓</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EdgeBook</span>
            </div>
            <p className="text-gray-600 text-sm">
              The social platform for sports betting insights and picks.
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/terms" className="text-gray-600 hover:text-gray-900 text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-gray-600 hover:text-gray-900 text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/disclosures" className="text-gray-600 hover:text-gray-900 text-sm">
                  Disclosures
                </Link>
              </li>
              <li>
                <Link href="/legal/responsible-gaming" className="text-gray-600 hover:text-gray-900 text-sm">
                  Responsible Gaming
                </Link>
              </li>
            </ul>
          </div>

          {/* Responsible Gaming */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Responsible Gaming</h3>
            <p className="text-gray-600 text-sm mb-2">
              Gambling problem? Call 1-800-522-4700
            </p>
            <p className="text-gray-600 text-sm">
              You must be 18+ to use this platform. Please gamble responsibly.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            © 2025 EdgeBook. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
