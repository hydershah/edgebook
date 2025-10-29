import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import FollowButton from '@/components/FollowButton'
import { ArrowLeft, Users } from 'lucide-react'

interface FollowersPageProps {
  params: {
    userId: string
  }
}

export default async function FollowersPage({ params }: FollowersPageProps) {
  const session = await getServerSession(authOptions)
  const viewerId = session?.user?.id

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      id: true,
      name: true,
      avatar: true,
    },
  })

  if (!user) {
    notFound()
  }

  // Get followers
  const followers = await prisma.follow.findMany({
    where: {
      followingId: params.userId,
    },
    include: {
      follower: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          bio: true,
          isPremium: true,
          _count: {
            select: {
              followers: true,
              picks: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Check if viewer is following each user
  let viewerFollowingIds: string[] = []
  if (viewerId) {
    const viewerFollowing = await prisma.follow.findMany({
      where: { followerId: viewerId },
      select: { followingId: true },
    })
    viewerFollowingIds = viewerFollowing.map((f) => f.followingId)
  }

  const isOwnProfile = viewerId === params.userId

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link
          href={`/profile/${params.userId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={16} />
          Back to Profile
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-lg font-semibold">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={`${user.name ?? 'User'} avatar`}
                className="w-full h-full object-cover"
              />
            ) : (
              user.name?.[0]?.toUpperCase() ?? '?'
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isOwnProfile ? 'Your Followers' : `${user.name}'s Followers`}
            </h1>
            <p className="text-sm text-gray-500">
              {followers.length} {followers.length === 1 ? 'follower' : 'followers'}
            </p>
          </div>
        </div>
      </div>

      {followers.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isOwnProfile ? 'No followers yet' : 'No followers'}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {isOwnProfile
              ? 'Share your profile and start posting picks to gain followers.'
              : 'This user doesn\'t have any followers yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm divide-y divide-gray-200">
          {followers.map((follow) => {
            const follower = follow.follower
            const isViewerFollowing = viewerFollowingIds.includes(follower.id)
            const isCurrentUser = viewerId === follower.id

            return (
              <div
                key={follower.id}
                className="p-6 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <Link
                  href={`/profile/${follower.id}`}
                  className="flex items-start gap-4 flex-1 min-w-0"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-lg font-semibold flex-shrink-0">
                    {follower.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={follower.avatar}
                        alt={`${follower.name ?? 'User'} avatar`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      follower.name?.[0]?.toUpperCase() ?? '?'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {follower.name ?? 'Unnamed User'}
                      </h3>
                      {follower.isPremium && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                          Premium
                        </span>
                      )}
                    </div>
                    {follower.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {follower.bio}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        <span className="font-semibold text-gray-900">
                          {follower._count.followers}
                        </span>{' '}
                        followers
                      </span>
                      <span>
                        <span className="font-semibold text-gray-900">
                          {follower._count.picks}
                        </span>{' '}
                        picks
                      </span>
                    </div>
                  </div>
                </Link>
                {!isCurrentUser && viewerId ? (
                  <div className="flex-shrink-0">
                    <FollowButton
                      userId={follower.id}
                      initialIsFollowing={isViewerFollowing}
                      initialFollowerCount={follower._count.followers}
                    />
                  </div>
                ) : !viewerId ? (
                  <Link
                    href={`/auth/signin?callbackUrl=/profile/${follower.id}`}
                    className="btn-primary flex-shrink-0"
                  >
                    Sign in
                  </Link>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
