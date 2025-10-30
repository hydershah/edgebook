import Link from 'next/link'
import { X, Facebook, Instagram, Linkedin } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-6">
          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">
                  About
                </Link>
              </li>
              <li>
                <Link href="/feed" className="text-sm text-gray-600 hover:text-gray-900">
                  Feed
                </Link>
              </li>
              <li>
                <Link href="/createpick" className="text-sm text-gray-600 hover:text-gray-900">
                  Create Pick
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/support" className="text-sm text-gray-600 hover:text-gray-900">
                  Support & Contact
                </Link>
              </li>
              <li>
                <a href="tel:1-800-522-4700" className="text-sm text-gray-600 hover:text-gray-900">
                  Help: 1-800-522-4700
                </a>
              </li>
              <li>
                <Link href="/legal/responsible-gaming" className="text-sm text-gray-600 hover:text-gray-900">
                  Responsible Gaming
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/terms" className="text-sm text-gray-600 hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/disclosures" className="text-sm text-gray-600 hover:text-gray-900">
                  Disclosures
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Compliance</h3>
            <ul className="space-y-2">
              <li className="text-sm text-gray-600">Must be 18+</li>
              <li className="text-sm text-gray-600">Play responsibly</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} EdgeBook. All rights reserved.
            </p>

            {/* Social Media Icons */}
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com/edgebook"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900 transition-colors"
                aria-label="X (formerly Twitter)"
              >
                <X size={20} />
              </a>
              <a
                href="https://facebook.com/edgebook"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://instagram.com/edgebook"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://linkedin.com/company/edgebook"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>

            <div className="flex items-center gap-6">
              <Link href="/legal/terms" className="text-sm text-gray-500 hover:text-gray-900">
                Terms
              </Link>
              <Link href="/legal/privacy" className="text-sm text-gray-500 hover:text-gray-900">
                Privacy
              </Link>
              <Link href="/legal/disclosures" className="text-sm text-gray-500 hover:text-gray-900">
                Disclosures
              </Link>
              <Link href="/support" className="text-sm text-gray-500 hover:text-gray-900">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
