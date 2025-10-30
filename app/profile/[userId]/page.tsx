import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserProfile } from '@/lib/profile'
import FollowButton from '@/components/FollowButton'
import PickCard from '@/components/PickCard'
import {
  Calendar,
  Target,
  Trophy,
  TrendingUp,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Music2,
  Globe,
} from 'lucide-react'

interface ProfilePageProps {
  params: {
    userId: string
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await getServerSession(authOptions)
  const viewerId = session?.user?.id

  // Redirect to dashboard if viewing own profile
  if (viewerId === params.userId) {
    redirect('/dashboard')
  }

  const profile = await getUserProfile(params.userId, viewerId)

  if (!profile) {
    notFound()
  }

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
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profile.user.name ?? 'Unnamed User'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                      @{profile.user.name?.toLowerCase().replace(/\s+/g, '') || 'user'}
                    </p>
                  </div>

                  {viewerId ? (
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
                <div className="flex items-center gap-6 mt-4 text-sm">
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

          {/* Stats Bar */}
          <div className="px-8 py-6 bg-white/40 backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Target className="text-primary" size={18} />
                  <p className="text-2xl font-bold text-gray-900">
                    {profile.stats.totalPicks.toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-gray-600">Total Picks</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Trophy className="text-yellow-500" size={18} />
                  <p className="text-2xl font-bold text-gray-900">
                    {profile.stats.accuracy}%
                  </p>
                </div>
                <p className="text-sm text-gray-600">Win Rate</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="text-emerald-500" size={18} />
                  <p className="text-2xl font-bold text-gray-900">
                    {profile.stats.winLossRecord}
                  </p>
                </div>
                <p className="text-sm text-gray-600">Record</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Picks */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 px-2">
            Recent Picks
          </h2>
          {profile.recentPicks.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/5 p-16 text-center">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                No picks shared yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {profile.recentPicks.map((pick) => (
                <div key={pick.id} className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 overflow-hidden">
                  <PickCard pick={pick} />
                </div>
              ))}
            </div>
          )}
        </div>
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
