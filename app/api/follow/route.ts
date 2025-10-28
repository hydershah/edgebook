import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { followingId } = await request.json()

    if (!followingId || typeof followingId !== 'string') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    if (followingId === session.user.id) {
      return NextResponse.json({ error: 'You cannot follow yourself' }, { status: 400 })
    }

    await prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ success: true })
    }

    console.error('Error following user:', error)
    return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { followingId } = await request.json()

    if (!followingId || typeof followingId !== 'string') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    await prisma.follow.deleteMany({
      where: {
        followerId: session.user.id,
        followingId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unfollowing user:', error)
    return NextResponse.json({ error: 'Failed to unfollow user' }, { status: 500 })
  }
}
