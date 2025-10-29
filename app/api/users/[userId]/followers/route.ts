import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const viewerId = session?.user?.id

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

    const followersWithStatus = followers.map((follow) => ({
      id: follow.follower.id,
      name: follow.follower.name,
      username: follow.follower.username,
      avatar: follow.follower.avatar,
      bio: follow.follower.bio,
      isPremium: follow.follower.isPremium,
      followerCount: follow.follower._count.followers,
      pickCount: follow.follower._count.picks,
      isFollowing: viewerFollowingIds.includes(follow.follower.id),
      followedAt: follow.createdAt.toISOString(),
    }))

    return NextResponse.json({ followers: followersWithStatus })
  } catch (error) {
    console.error('Error fetching followers:', error)
    return NextResponse.json({ error: 'Failed to fetch followers' }, { status: 500 })
  }
}