import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserProfile } from '@/lib/profile'
import FollowButton from '@/components/FollowButton'
import PickCard from '@/components/PickCard'
import type { ReactNode } from 'react'
import {
  Activity,
  Bookmark,
  Calendar,
  Circle,
  Facebook,
  Globe,
  Instagram,
  Music2,
  Sparkles,
  Target,
  Trophy,
  Twitter,
  Users,
  Youtube,
} from 'lucide-react'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

interface ProfilePageProps {
  params: {
    userId: string
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await getServerSession(authOptions)
  const viewerId = session?.user?.id
  const profile = await getUserProfile(params.userId, viewerId)

  if (!profile) {
    notFound()
  }

  const isOwnProfile = viewerId === profile.user.id
  const memberSince = new Date(profile.user.createdAt)

  const socialLinks = [
    {
      key: 'instagram',
      label: 'Instagram',
      value: profile.socialLinks.instagram,
      icon: <Instagram size={16} />,
      href: formatSocialUrl('instagram', profile.socialLinks.instagram),
    },
    {
      key: 'facebook',
      label: 'Facebook',
      value: profile.socialLinks.facebook,
      icon: <Facebook size={16} />,
      href: formatSocialUrl('facebook', profile.socialLinks.facebook),
    },
    {
      key: 'youtube',
      label: 'YouTube',
      value: profile.socialLinks.youtube,
      icon: <Youtube size={16} />,
      href: formatSocialUrl('youtube', profile.socialLinks.youtube),
    },
    {
      key: 'twitter',
      label: 'Twitter / X',
      value: profile.socialLinks.twitter,
      icon: <Twitter size={16} />,
      href: formatSocialUrl('twitter', profile.socialLinks.twitter),
    },
    {
      key: 'tiktok',
      label: 'TikTok',
      value: profile.socialLinks.tiktok,
      icon: <Music2 size={16} />,
      href: formatSocialUrl('tiktok', profile.socialLinks.tiktok),
    },
    {
      key: 'website',
      label: 'Website',
      value: profile.socialLinks.website,
      icon: <Globe size={16} />,
      href: formatWebsiteUrl(profile.socialLinks.website),
    },
  ].filter((item) => !!item.value)

  const hasAvatar = Boolean(profile.user.avatar)
  const hasBio = Boolean(profile.user.bio)
  const hasSocialLinks = socialLinks.length > 0
  const profileSetupSteps = [
    !hasAvatar && { key: 'avatar', label: 'Upload a profile photo' },
    !hasBio && { key: 'bio', label: 'Write a short bio' },
    !hasSocialLinks && { key: 'social', label: 'Add at least one social link' },
  ].filter(Boolean) as { key: string; label: string }[]
  const profileNeedsSetup = isOwnProfile && profileSetupSteps.length > 0

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile header */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-3xl font-semibold">
              {profile.user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.user.avatar}
                  alt={`${profile.user.name ?? 'User'} avatar`}
                  className="w-full h-full object-cover"
                />
              ) : (
                profile.user.name?.[0]?.toUpperCase() ?? '?'
              )}
            </div>
            <div className="space-y-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.user.name ?? 'Unnamed Bettor'}
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar size={14} />
                  Joined {memberSince.toLocaleDateString()}
                </p>
              </div>
              {profile.user.bio ? (
                <p className="text-gray-700 max-w-xl whitespace-pre-line">
                  {profile.user.bio}
                </p>
              ) : (
                isOwnProfile && (
                  <p className="text-gray-500 text-sm">
                    Add a bio so people know what makes your edge unique.{' '}
                    <Link
                      href="/profile/settings"
                      className="text-primary font-medium hover:underline"
                    >
                      Update profile
                    </Link>
                    .
                  </p>
                )
              )}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <Link
                  href={`/profile/${profile.user.id}/followers`}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <Users size={16} className="text-primary" />
                  <span className="font-semibold text-gray-900">
                    {profile.followers.toLocaleString()}
                  </span>
                  <span>Followers</span>
                </Link>
                <span className="h-3 w-px bg-gray-300" />
                <Link
                  href={`/profile/${profile.user.id}/following`}
                  className="hover:text-primary transition-colors"
                >
                  <span className="font-semibold text-gray-900">
                    {profile.following.toLocaleString()}
                  </span>{' '}
                  Following
                </Link>
                {profile.stats.totalPicks > 0 && (
                  <>
                    <span className="h-3 w-px bg-gray-300" />
                    <div>
                      <span className="font-semibold text-gray-900">
                        {profile.stats.totalPicks.toLocaleString()}
                      </span>{' '}
                      Picks
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto md:justify-end">
            {isOwnProfile ? (
              <div className="flex flex-col gap-2 items-stretch text-left sm:items-end sm:text-right sm:gap-3">
                <Link href="/profile/settings" className="btn-secondary w-full sm:w-auto">
                  Edit Profile
                </Link>
                <p className="text-sm text-gray-500 sm:max-w-xs">
                  This is what other users see when they visit your profile.
                </p>
              </div>
            ) : viewerId ? (
              <FollowButton
                userId={profile.user.id}
                initialIsFollowing={profile.viewer.isFollowing}
                initialFollowerCount={profile.followers}
              />
            ) : (
              <Link
                href={`/auth/signin?callbackUrl=/profile/${profile.user.id}`}
                className="btn-primary"
              >
                Sign in to follow
              </Link>
            )}
          </div>
        </div>
      </div>

      {profileNeedsSetup && (
        <div className="bg-white border border-primary/15 rounded-2xl shadow-sm p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Sparkles size={20} className="text-primary" />
              Complete your profile setup
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Finish these essentials so followers can trust your edge.
            </p>
            <ul className="mt-3 space-y-2 md:max-w-md">
              {profileSetupSteps.map((step) => (
                <li key={step.key} className="flex items-center gap-3 text-sm text-gray-700">
                  <Circle size={14} className="text-primary shrink-0" />
                  {step.label}
                </li>
              ))}
            </ul>
          </div>
          <Link href="/profile/settings" className="btn-primary w-full md:w-auto md:self-start">
            Open Settings
          </Link>
        </div>
      )}

      {/* Stats overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Picks"
          value={profile.stats.totalPicks.toLocaleString()}
          description="Lifetime predictions posted"
        />
        <StatCard
          title="Accuracy"
          value={`${profile.stats.accuracy}%`}
          description={`${profile.stats.won} wins / ${profile.stats.lost} losses`}
          icon={<Target size={20} className="text-primary" />}
        />
        <StatCard
          title="Win/Loss"
          value={profile.stats.winLossRecord}
          description="Win / Loss / Push"
          icon={<Trophy size={20} className="text-yellow-500" />}
        />
        <StatCard
          title="Net Revenue"
          value={currencyFormatter.format(profile.earnings.netRevenue)}
          description={`Earnings: ${currencyFormatter.format(
            profile.earnings.totalRevenue
          )} • Fees: ${currencyFormatter.format(profile.earnings.platformFees)}`}
          icon={<Activity size={20} className="text-emerald-500" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Performance by sport */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Performance by Sport</h2>
            <span className="text-sm text-gray-500">
              {profile.performanceBySport.length}{' '}
              sport{profile.performanceBySport.length === 1 ? '' : 's'}
            </span>
          </div>
          {profile.performanceBySport.length === 0 ? (
            <div className="text-gray-500 text-sm">
              {isOwnProfile
                ? 'Start posting picks to unlock sport-level performance insights.'
                : 'No performance data available yet.'}
            </div>
          ) : (
            <div className="space-y-4">
              {profile.performanceBySport.map((sport) => (
                <div
                  key={sport.sport}
                  className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-4"
                >
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">
                      {sport.sport.replace(/_/g, ' ')}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {sport.won}-{sport.lost}
                      {sport.push > 0 ? `-${sport.push}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Win Rate</p>
                    <p className="text-xl font-semibold text-primary">{sport.winRate}%</p>
                    <p className="text-xs text-gray-500">
                      {sport.totalPicks} pick{sport.totalPicks === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Earnings & spending */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Earnings & Spending</h2>
          <div className="space-y-3">
            <SummaryRow
              label="Total Earnings"
              value={currencyFormatter.format(profile.earnings.totalRevenue)}
            />
            <SummaryRow
              label="Platform Fees"
              value={currencyFormatter.format(profile.earnings.platformFees)}
            />
            <SummaryRow
              label="Net Revenue"
              value={currencyFormatter.format(profile.earnings.netRevenue)}
              highlight
            />
            <SummaryRow
              label="Total Spending"
              value={currencyFormatter.format(profile.earnings.totalSpending)}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Latest Transactions
            </h3>
            {profile.transactions.length === 0 ? (
              <p className="text-sm text-gray-500">No transactions recorded yet.</p>
            ) : (
              <ul className="space-y-3">
                {profile.transactions.map((txn) => (
                  <li key={txn.id} className="text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{txn.type}</span>
                      <span>
                        {currencyFormatter.format(txn.amount)}{' '}
                        <span className="text-xs text-gray-500">({txn.status})</span>
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(txn.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Social connections */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Connections</h2>
        {socialLinks.length === 0 ? (
          isOwnProfile ? (
            <p className="text-sm text-gray-500">
              Add your social links to help followers connect with you across the web.{' '}
              <Link href="/profile/settings" className="text-primary font-medium hover:underline">
                Manage socials
              </Link>
              .
            </p>
          ) : (
            <p className="text-sm text-gray-500">No social accounts have been shared yet.</p>
          )
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {socialLinks.map((link) => (
              <a
                key={link.key}
                href={link.href ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 hover:border-primary transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  {link.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{link.label}</p>
                  <p className="text-xs text-gray-500 break-all">{link.value}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Saved Picks - Only visible for own profile */}
      {isOwnProfile && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Bookmark className="text-primary" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Saved Picks</h2>
                <p className="text-sm text-gray-500">
                  Picks you&apos;ve bookmarked for later
                </p>
              </div>
            </div>
            <Link
              href="/bookmarks"
              className="btn-secondary text-sm"
            >
              View All
            </Link>
          </div>
          <div className="bg-gradient-to-br from-primary/5 to-emerald-50 rounded-xl p-6 text-center">
            <Bookmark className="w-12 h-12 text-primary/40 mx-auto mb-3" />
            <p className="text-gray-700 font-medium mb-2">
              Quick Access to Your Saved Picks
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Bookmark picks from the feed to save them for later review and analysis
            </p>
            <Link
              href="/bookmarks"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              <Bookmark size={18} />
              Go to Bookmarks
            </Link>
          </div>
        </div>
      )}

      {/* Recent picks */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Picks</h2>
            <p className="text-sm text-gray-500">
              Latest predictions shared by {profile.user.name ?? 'this bettor'}
            </p>
          </div>
          {isOwnProfile && (
            <Link href="/createpick" className="btn-primary">
              Create Pick
            </Link>
          )}
        </div>
        {profile.recentPicks.length === 0 ? (
          <div className="text-sm text-gray-500">
            {isOwnProfile
              ? 'You have not shared any picks yet.'
              : 'No picks have been shared publicly yet.'}
          </div>
        ) : (
          <div className="space-y-4">
            {profile.recentPicks.map((pick) => (
              <PickCard key={pick.id} pick={pick} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatSocialUrl(platform: string, value?: string | null) {
  if (!value) return undefined
  const trimmed = value.trim()

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${trimmed.replace(/^@/, '')}`
    case 'facebook':
      return `https://facebook.com/${trimmed.replace(/^@/, '')}`
    case 'youtube':
      return `https://youtube.com/${trimmed}`
    case 'twitter':
      return `https://twitter.com/${trimmed.replace(/^@/, '')}`
    case 'tiktok':
      return `https://www.tiktok.com/@${trimmed.replace(/^@/, '')}`
    default:
      return trimmed
  }
}

function formatWebsiteUrl(value?: string | null) {
  if (!value) return undefined
  const trimmed = value.trim()
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  return `https://${trimmed}`
}

interface StatCardProps {
  title: string
  value: string
  description?: string
  icon?: ReactNode
}

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {icon}
      </div>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
  )
}

interface SummaryRowProps {
  label: string
  value: string
  highlight?: boolean
}

function SummaryRow({ label, value, highlight = false }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={`font-medium ${highlight ? 'text-emerald-600' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  )
}
