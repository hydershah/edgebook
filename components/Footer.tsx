import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center space-y-3">
          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
            <Link
              href="/legal/terms"
              className="text-gray-500 hover:underline transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/legal/privacy"
              className="text-gray-500 hover:underline transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/legal/disclosures"
              className="text-gray-500 hover:underline transition-colors"
            >
              Disclosures
            </Link>
            <Link
              href="/legal/responsible-gaming"
              className="text-gray-500 hover:underline transition-colors"
            >
              Responsible Gaming
            </Link>
          </nav>

          {/* Compliance Info */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span>
              Gambling problem? Call{' '}
              <a
                href="tel:1-800-522-4700"
                className="hover:underline"
              >
                1-800-522-4700
              </a>
            </span>
            <span className="text-gray-300">·</span>
            <span>Must be 18+</span>
            <span className="text-gray-300">·</span>
            <span>Please gamble responsibly</span>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-400">
            © {currentYear} EdgeBook. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
