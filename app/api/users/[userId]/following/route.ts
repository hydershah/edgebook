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

    const following = await prisma.follow.findMany({
      where: {
        followerId: params.userId,
      },
      include: {
        followedBy: {
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

    const followingWithStatus = following.map((follow) => ({
      id: follow.followedBy.id,
      name: follow.followedBy.name,
      username: follow.followedBy.username,
      avatar: follow.followedBy.avatar,
      bio: follow.followedBy.bio,
      isPremium: follow.followedBy.isPremium,
      followerCount: follow.followedBy._count.followers,
      pickCount: follow.followedBy._count.picks,
      isFollowing: viewerFollowingIds.includes(follow.followedBy.id),
      followedAt: follow.createdAt.toISOString(),
    }))

    return NextResponse.json({ following: followingWithStatus })
  } catch (error) {
    console.error('Error fetching following:', error)
    return NextResponse.json({ error: 'Failed to fetch following' }, { status: 500 })
  }
}
