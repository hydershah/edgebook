import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { pickId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { pickId } = params

    // Get all stats in parallel
    const [likeCount, commentCount, viewCount, unlockCount, userEngagement] = await Promise.all([
      prisma.like.count({ where: { pickId } }),
      prisma.comment.count({ where: { pickId } }),
      prisma.pick.findUnique({ where: { id: pickId }, select: { viewCount: true } }),
      prisma.purchase.count({ where: { pickId } }),
      session?.user?.id
        ? Promise.all([
            prisma.like.findUnique({
              where: { userId_pickId: { userId: session.user.id, pickId } },
            }),
            prisma.bookmark.findUnique({
              where: { userId_pickId: { userId: session.user.id, pickId } },
            }),
            prisma.purchase.findUnique({
              where: { userId_pickId: { userId: session.user.id, pickId } },
            }),
          ])
        : [null, null, null],
    ])

    const [isLiked, isBookmarked, isUnlocked] = userEngagement

    return NextResponse.json({
      likes: likeCount,
      comments: commentCount,
      views: viewCount?.viewCount || 0,
      unlocks: unlockCount,
      isLiked: !!isLiked,
      isBookmarked: !!isBookmarked,
      isUnlocked: !!isUnlocked,
    })
  } catch (error) {
    console.error('Error fetching pick stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
