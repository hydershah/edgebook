import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { pickId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pickId } = params

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_pickId: {
          userId: session.user.id,
          pickId,
        },
      },
    })

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      })
      return NextResponse.json({ liked: false })
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: session.user.id,
          pickId,
        },
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { pickId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { pickId } = params

    const likeCount = await prisma.like.count({
      where: { pickId },
    })

    let isLiked = false
    if (session?.user?.id) {
      const like = await prisma.like.findUnique({
        where: {
          userId_pickId: {
            userId: session.user.id,
            pickId,
          },
        },
      })
      isLiked = !!like
    }

    return NextResponse.json({ count: likeCount, isLiked })
  } catch (error) {
    console.error('Error fetching likes:', error)
    return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 })
  }
}
