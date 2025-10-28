'use client'

import { useState } from 'react'
import { User, Lock, Bell, Eye, DollarSign, Palette } from 'lucide-react'
import AccountSettings from './tabs/AccountSettings'
import SecuritySettings from './tabs/SecuritySettings'
import NotificationSettings from './tabs/NotificationSettings'
import PrivacySettings from './tabs/PrivacySettings'
import CreatorSettings from './tabs/CreatorSettings'
import AppearanceSettings from './tabs/AppearanceSettings'

type UserData = {
  id: string
  email: string
  username: string | null
  name: string | null
  bio: string | null
  avatar: string | null
  coverPhoto: string | null
  phone: string | null
  birthday: Date | null
  gender: string | null
  location: string | null
  instagram: string | null
  facebook: string | null
  youtube: string | null
  twitter: string | null
  tiktok: string | null
  website: string | null
  password: string | null
  twoFactorEnabled: boolean
  theme: string
  subscriptionPrice: number | null
  stripeAccountId: string | null
  privacySettings: any
  notificationPreferences: any
  isVerified: boolean
  accounts: Array<{ provider: string; providerAccountId: string }>
}

type Tab = {
  id: string
  label: string
  icon: React.ElementType
}

const tabs: Tab[] = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'privacy', label: 'Privacy', icon: Eye },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'creator', label: 'Creator', icon: DollarSign },
  { id: 'appearance', label: 'Appearance', icon: Palette },
]

export default function SettingsTabs({ user }: { user: UserData }) {
  const [activeTab, setActiveTab] = useState('account')

  return (
    <div className="flex gap-8">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <nav className="space-y-1 bg-white border border-gray-200 rounded-xl p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl p-8">
        {activeTab === 'account' && <AccountSettings user={user} />}
        {activeTab === 'security' && <SecuritySettings user={user} />}
        {activeTab === 'privacy' && <PrivacySettings user={user} />}
        {activeTab === 'notifications' && <NotificationSettings user={user} />}
        {activeTab === 'creator' && <CreatorSettings user={user} />}
        {activeTab === 'appearance' && <AppearanceSettings user={user} />}
      </div>
    </div>
  )
}
