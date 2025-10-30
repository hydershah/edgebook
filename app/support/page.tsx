'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Mail,
  Phone,
  HelpCircle,
  Shield,
  CreditCard,
  UserCircle,
  Wrench,
  MessageCircle
} from 'lucide-react'

const supportCategories = [
  {
    icon: UserCircle,
    title: 'Account & Profile',
    description: 'Help with account settings, profile updates, and verification',
    topics: ['Account verification', 'Profile settings', 'Password reset', 'Account security']
  },
  {
    icon: CreditCard,
    title: 'Payments & Transactions',
    description: 'Questions about purchases, payouts, and billing',
    topics: ['Purchase issues', 'Payout questions', 'Refund requests', 'Payment methods']
  },
  {
    icon: Wrench,
    title: 'Technical Support',
    description: 'Technical issues, bugs, and platform functionality',
    topics: ['Login problems', 'App crashes', 'Feature requests', 'Bug reports']
  },
  {
    icon: Shield,
    title: 'Safety & Compliance',
    description: 'Report violations, content moderation, and legal concerns',
    topics: ['Report user', 'Content violations', 'Legal inquiries', 'Privacy concerns']
  }
]

const faqs = [
  {
    question: 'How do I verify my email address?',
    answer: 'After signing up, check your email inbox for a verification link from EdgeBook. Click the link to verify your account. If you did not receive the email, check your spam folder or request a new verification email from your profile settings.'
  },
  {
    question: 'How long does it take to receive payouts?',
    answer: 'Payouts are typically processed within 3-5 business days after the payment clears. You can track your payout status in your account dashboard under "Transactions".'
  },
  {
    question: 'What is EdgeBook\'s platform fee?',
    answer: 'EdgeBook charges a 15% platform fee on all premium pick sales. This fee covers payment processing, platform maintenance, and support services.'
  },
  {
    question: 'How do I report inappropriate content?',
    answer: 'You can report any pick, comment, or user profile by clicking the three-dot menu and selecting "Report". Our moderation team reviews all reports within 24 hours.'
  },
  {
    question: 'Can I get a refund on a purchased pick?',
    answer: 'Refunds are handled on a case-by-case basis. If you believe a pick was fraudulent or violated our terms, please contact support with details and we will review your request.'
  },
  {
    question: 'How do I delete my account?',
    answer: 'To delete your account, go to Settings > Account > Delete Account. Please note that this action is permanent and cannot be undone. All your data will be removed within 30 days.'
  }
]

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/support/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          category: '',
          subject: '',
          message: ''
        })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitStatus('error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-heading-2 font-bold mb-4">How can we help you?</h1>
            <p className="text-paragraph-1 text-white/90 max-w-2xl mx-auto">
              Get support for your EdgeBook account, find answers to common questions, or reach out to our team
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-12 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-subheader-1 font-bold text-gray-900 mb-2">Send us a message</h2>
            <p className="text-paragraph-2 text-gray-600">Fill out the form below and we'll get back to you within 24 hours</p>
          </div>

          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">Thank you! Your message has been sent successfully.</p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Sorry, there was an error sending your message. Please try again.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-900 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="select-field"
              >
                <option value="">Select a category</option>
                <option value="account">Account & Profile</option>
                <option value="payments">Payments & Transactions</option>
                <option value="technical">Technical Support</option>
                <option value="safety">Safety & Compliance</option>
                <option value="general">General Inquiry</option>
              </select>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-900 mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Brief description of your issue"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                required
                value={formData.message}
                onChange={handleInputChange}
                rows={6}
                className="input-field resize-none"
                placeholder="Please provide as much detail as possible..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5 mr-2" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>

        {/* Contact Methods */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-12">
          <h2 className="text-subheader-1 font-bold text-gray-900 mb-6 text-center">Other Ways to Reach Us</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <a
              href="mailto:support@edgebook.ai"
              className="flex items-start p-6 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all"
            >
              <Mail className="h-8 w-8 text-primary mr-4 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Email Support</h3>
                <p className="text-sm text-gray-600 mb-2">We typically respond within 24 hours</p>
                <p className="text-primary font-medium">support@edgebook.ai</p>
              </div>
            </a>

            <a
              href="tel:1-800-522-4700"
              className="flex items-start p-6 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all"
            >
              <Phone className="h-8 w-8 text-primary mr-4 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Problem Gaming Help</h3>
                <p className="text-sm text-gray-600 mb-2">24/7 confidential support hotline</p>
                <p className="text-primary font-medium">1-800-522-4700</p>
              </div>
            </a>
          </div>
        </div>

        {/* Support Categories */}
        <div className="mb-12">
          <h2 className="text-subheader-1 font-bold text-gray-900 mb-6 text-center">Support Categories</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {supportCategories.map((category, index) => {
              const Icon = category.icon
              return (
                <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start mb-4">
                    <Icon className="h-8 w-8 text-primary mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="text-subheader-2 font-semibold text-gray-900 mb-1">
                        {category.title}
                      </h3>
                      <p className="text-paragraph-2 text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2 ml-11">
                    {category.topics.map((topic, topicIndex) => (
                      <li key={topicIndex} className="text-sm text-gray-700 flex items-center">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 mb-12">
          <h2 className="text-subheader-1 font-bold text-gray-900 mb-6 text-center">Quick Links</h2>
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Link
              href="/legal/terms"
              className="bg-white p-5 rounded-xl text-center hover:shadow-md transition-all hover:scale-105"
            >
              <div className="font-semibold text-gray-900">Terms of Service</div>
              <div className="text-sm text-gray-600 mt-1">Platform rules & policies</div>
            </Link>
            <Link
              href="/legal/privacy"
              className="bg-white p-5 rounded-xl text-center hover:shadow-md transition-all hover:scale-105"
            >
              <div className="font-semibold text-gray-900">Privacy Policy</div>
              <div className="text-sm text-gray-600 mt-1">How we protect your data</div>
            </Link>
            <Link
              href="/legal/responsible-gaming"
              className="bg-white p-5 rounded-xl text-center hover:shadow-md transition-all hover:scale-105"
            >
              <div className="font-semibold text-gray-900">Responsible Gaming</div>
              <div className="text-sm text-gray-600 mt-1">Play safe & responsibly</div>
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-center mb-6">
            <HelpCircle className="h-8 w-8 text-primary mr-3" />
            <h2 className="text-subheader-1 font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full text-left p-5 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-gray-900 pr-8">{faq.question}</span>
                  <svg
                    className={`h-5 w-5 text-gray-500 flex-shrink-0 transform transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5 text-gray-700 bg-gray-50">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8">
            <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-subheader-2 font-bold text-gray-900 mb-2">Still need help?</h3>
            <p className="text-paragraph-1 text-gray-700 mb-6 max-w-2xl mx-auto">
              Our support team is here to assist you. Send us an email and we&apos;ll get back to you as soon as possible.
            </p>
            <a
              href="mailto:support@edgebook.ai"
              className="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors shadow-sm hover:shadow-md"
            >
              <Mail className="h-5 w-5 mr-2" />
              Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
