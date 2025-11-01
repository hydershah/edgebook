import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserProfile } from '@/lib/profile'
import FollowButton from '@/components/FollowButton'
import ProfileRecentPicks from '@/components/ProfileRecentPicks'
import {
  Calendar,
  Trophy,
  TrendingUp,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Music2,
  Globe,
  Settings,
  DollarSign,
  BadgeCheck,
  Eye,
  Target,
} from 'lucide-react'

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

  const isOwnProfile = viewerId === params.userId

  const memberSince = new Date(profile.user.createdAt)

  const socialLinks = [
    {
      key: 'instagram',
      label: 'Instagram',
      value: profile.socialLinks.instagram,
      icon: <Instagram size={18} />,
      href: formatSocialUrl('instagram', profile.socialLinks.instagram),
      color: 'text-pink-600',
    },
    {
      key: 'twitter',
      label: 'Twitter',
      value: profile.socialLinks.twitter,
      icon: <Twitter size={18} />,
      href: formatSocialUrl('twitter', profile.socialLinks.twitter),
      color: 'text-blue-500',
    },
    {
      key: 'youtube',
      label: 'YouTube',
      value: profile.socialLinks.youtube,
      icon: <Youtube size={18} />,
      href: formatSocialUrl('youtube', profile.socialLinks.youtube),
      color: 'text-red-600',
    },
    {
      key: 'facebook',
      label: 'Facebook',
      value: profile.socialLinks.facebook,
      icon: <Facebook size={18} />,
      href: formatSocialUrl('facebook', profile.socialLinks.facebook),
      color: 'text-blue-600',
    },
    {
      key: 'tiktok',
      label: 'TikTok',
      value: profile.socialLinks.tiktok,
      icon: <Music2 size={18} />,
      href: formatSocialUrl('tiktok', profile.socialLinks.tiktok),
      color: 'text-gray-900',
    },
    {
      key: 'website',
      label: 'Website',
      value: profile.socialLinks.website,
      icon: <Globe size={18} />,
      href: formatWebsiteUrl(profile.socialLinks.website),
      color: 'text-gray-700',
    },
  ].filter((item) => !!item.value)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Preview Banner for Own Profile */}
        {isOwnProfile && (
          <div className="mb-6 bg-blue-500 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <Eye size={24} />
              <div>
                <p className="font-semibold">Public Profile Preview</p>
                <p className="text-sm text-blue-100">This is how others see your profile</p>
              </div>
            </div>
            <Link
              href="/profile/settings"
              className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              <Settings size={18} />
              Edit Profile
            </Link>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/5 overflow-hidden">
          {/* Profile Header */}
          <div className="px-8 py-8">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {profile.user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.user.avatar}
                    alt={profile.user.name ?? 'User'}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-3xl font-bold ring-4 ring-white shadow-xl">
                    {profile.user.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profile.user.name ?? 'Unnamed User'}
                    </h1>
                    {profile.user.isVerified && (
                      <div title="Verified Creator">
                        <BadgeCheck className="text-blue-500" size={24} />
                      </div>
                    )}
                  </div>

                  {isOwnProfile ? (
                    <Link
                      href="/profile/settings"
                      className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-full transition-all"
                    >
                      <Settings size={18} />
                      Edit Profile
                    </Link>
                  ) : viewerId ? (
                    <FollowButton
                      userId={profile.user.id}
                      initialIsFollowing={profile.viewer.isFollowing}
                      initialFollowerCount={profile.followers}
                    />
                  ) : (
                    <Link
                      href={`/auth/signin?callbackUrl=/profile/${profile.user.id}`}
                      className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark hover:shadow-xl hover:shadow-primary/30 text-white font-bold rounded-full transition-all duration-300 shadow-lg shadow-primary/20"
                    >
                      Follow
                    </Link>
                  )}
                </div>
                <p className="text-gray-500 mt-1">
                  @{profile.user.name?.toLowerCase().replace(/\s+/g, '') || 'user'}
                </p>

                {profile.user.bio && (
                  <p className="text-gray-700 mt-4 leading-relaxed">
                    {profile.user.bio}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Joined {memberSince.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Social Stats */}
                <div className="flex items-center gap-6 mt-4 text-sm flex-wrap">
                  <Link
                    href={`/profile/${profile.user.id}/following`}
                    className="hover:underline transition-colors"
                  >
                    <span className="font-bold text-gray-900">
                      {profile.following.toLocaleString()}
                    </span>{' '}
                    <span className="text-gray-600">Following</span>
                  </Link>
                  <Link
                    href={`/profile/${profile.user.id}/followers`}
                    className="hover:underline transition-colors"
                  >
                    <span className="font-bold text-gray-900">
                      {profile.followers.toLocaleString()}
                    </span>{' '}
                    <span className="text-gray-600">Followers</span>
                  </Link>
                  {profile.user.subscriptionEnabled && profile.subscribers > 0 && (
                    <div className="flex items-center gap-1.5">
                      <DollarSign size={16} className="text-emerald-600" />
                      <span className="font-bold text-emerald-700">
                        {profile.subscribers.toLocaleString()}
                      </span>{' '}
                      <span className="text-gray-600">Subscriber{profile.subscribers !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {socialLinks.length > 0 && (
                  <div className="flex items-center gap-3 mt-4">
                    {socialLinks.map((link) => (
                      <a
                        key={link.key}
                        href={link.href ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${link.color} hover:scale-110 transition-transform duration-200`}
                        title={link.label}
                      >
                        {link.icon}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Stats Section */}
          <div className="px-8 py-6 bg-gradient-to-br from-emerald-50 via-white to-blue-50">
            {/* Primary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Win Rate */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="text-yellow-500" size={20} />
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Win Rate</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {profile.stats.accuracy}%
                </p>
                <p className="text-xs text-gray-500 mt-1">{profile.stats.settled} settled picks</p>
              </div>

              {/* Total Wins */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="text-blue-600" size={20} />
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Wins</p>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {profile.stats.won.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">{profile.stats.settled > 0 ? `${((profile.stats.won / profile.stats.settled) * 100).toFixed(0)}% success rate` : 'No settled picks'}</p>
              </div>

              {/* Total Picks */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-primary" size={20} />
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Picks</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {profile.stats.totalPicks.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {profile.stats.winLossRecord}
                </p>
              </div>
            </div>

            {/* Sport Breakdown */}
            {profile.performanceBySport.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Performance by Sport</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {profile.performanceBySport.slice(0, 5).map((sport) => (
                    <div key={sport.sport} className="text-center">
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-gray-600 uppercase">{sport.sport}</p>
                      </div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <p className={`text-2xl font-bold ${sport.winRate >= 60 ? 'text-emerald-600' : sport.winRate >= 50 ? 'text-blue-600' : 'text-gray-700'}`}>
                          {sport.winRate}%
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {sport.won}-{sport.lost} ({sport.totalPicks} picks)
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Subscription Section - Only show if subscriptions enabled and has price */}
          {profile.user.subscriptionEnabled && profile.user.subscriptionPrice && profile.user.subscriptionPrice > 0 && !isOwnProfile && (
            <div className="px-8 py-6 bg-gradient-to-r from-primary/10 to-emerald-500/10 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
                    <DollarSign className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Subscribe for Premium Access</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${profile.user.subscriptionPrice.toFixed(2)}
                      <span className="text-sm font-normal text-gray-600">/month</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">Get access to all premium picks</p>
                      {profile.subscribers > 0 && (
                        <>
                          <span className="text-gray-300">•</span>
                          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                            Join {profile.subscribers.toLocaleString()} subscriber{profile.subscribers !== 1 ? 's' : ''}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {profile.viewer.isSubscribed ? (
                  <div className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-full flex items-center gap-2">
                    <BadgeCheck size={18} />
                    Subscribed
                  </div>
                ) : viewerId ? (
                  <Link
                    href={`/api/subscriptions/${profile.user.id}/checkout`}
                    className="px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 hover:shadow-xl hover:shadow-primary/30 text-white font-bold rounded-full transition-all duration-300 shadow-lg shadow-primary/20"
                  >
                    Subscribe Now
                  </Link>
                ) : (
                  <Link
                    href={`/auth/signin?callbackUrl=/profile/${profile.user.id}`}
                    className="px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 hover:shadow-xl hover:shadow-primary/30 text-white font-bold rounded-full transition-all duration-300 shadow-lg shadow-primary/20"
                  >
                    Subscribe Now
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Subscription Info for Own Profile */}
          {profile.user.subscriptionEnabled && profile.user.subscriptionPrice && profile.user.subscriptionPrice > 0 && isOwnProfile && (
            <div className="px-8 py-6 bg-gradient-to-r from-emerald-50 to-blue-50 border-t border-gray-200">
              <div className="space-y-4">
                {/* MRR Display */}
                <div className="flex items-center justify-between pb-4 border-b border-emerald-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                      <TrendingUp className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-emerald-700 font-semibold">Monthly Recurring Revenue</p>
                      <p className="text-3xl font-bold text-gray-900">
                        ${((profile.user.subscriptionPrice * profile.subscribers) * 0.85).toFixed(2)}
                        <span className="text-sm font-normal text-gray-600">/month</span>
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        From {profile.subscribers} active subscriber{profile.subscribers !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/earnings"
                    className="px-4 py-2 bg-white border border-emerald-500 text-emerald-700 font-medium rounded-lg hover:bg-emerald-50 transition-all text-sm"
                  >
                    View Earnings
                  </Link>
                </div>

                {/* Pricing Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <DollarSign className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 font-semibold">Your Subscription Price</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${profile.user.subscriptionPrice.toFixed(2)}
                        <span className="text-sm font-normal text-gray-600">/month per subscriber</span>
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        You earn ${(profile.user.subscriptionPrice * 0.85).toFixed(2)}/month per subscriber (15% platform fee)
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/profile/settings"
                    className="px-4 py-2 bg-white border border-blue-500 text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-all text-sm"
                  >
                    Manage Pricing
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Picks with Filters */}
        <ProfileRecentPicks
          picks={profile.recentPicks as any}
          sports={profile.performanceBySport.map((s) => s.sport)}
        />
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
