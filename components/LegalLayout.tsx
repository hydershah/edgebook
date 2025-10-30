'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Section {
  id: string
  title: string
}

interface LegalLayoutProps {
  title: string
  sections: Section[]
  children: React.ReactNode
}

export default function LegalLayout({ title, sections, children }: LegalLayoutProps) {
  const [activeSection, setActiveSection] = useState<string>('')

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(section => ({
        id: section.id,
        element: document.getElementById(section.id)
      }))

      const scrollPosition = window.scrollY + 100

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i]
        if (section.element && section.element.offsetTop <= scrollPosition) {
          setActiveSection(section.id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sections])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <nav className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  On This Page
                </h2>
                <ul className="space-y-2">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <button
                        onClick={() => scrollToSection(section.id)}
                        className={`text-left w-full text-sm px-3 py-2 rounded-md transition-colors ${
                          activeSection === section.id
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {section.title}
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Legal Pages Navigation */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                    Legal
                  </h3>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href="/legal/terms"
                        className={`block text-sm px-3 py-2 rounded-md transition-colors ${
                          title === 'Terms of Service'
                            ? 'bg-gray-100 text-gray-900 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        Terms of Service
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/legal/privacy"
                        className={`block text-sm px-3 py-2 rounded-md transition-colors ${
                          title === 'Privacy Policy'
                            ? 'bg-gray-100 text-gray-900 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/legal/disclosures"
                        className={`block text-sm px-3 py-2 rounded-md transition-colors ${
                          title === 'Disclosures'
                            ? 'bg-gray-100 text-gray-900 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        Disclosures
                      </Link>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-white rounded-lg shadow-sm p-8 lg:p-12">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
