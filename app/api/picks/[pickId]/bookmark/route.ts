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

    // Check if already bookmarked
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_pickId: {
          userId: session.user.id,
          pickId,
        },
      },
    })

    if (existingBookmark) {
      return NextResponse.json(
        { error: 'Pick already bookmarked', bookmarked: true },
        { status: 409 }
      )
    }

    // Add bookmark
    await prisma.bookmark.create({
      data: {
        userId: session.user.id,
        pickId,
      },
    })

    return NextResponse.json({ bookmarked: true }, { status: 201 })
  } catch (error) {
    console.error('Error creating bookmark:', error)
    return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { pickId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pickId } = params

    // Check if bookmark exists
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_pickId: {
          userId: session.user.id,
          pickId,
        },
      },
    })

    if (!existingBookmark) {
      return NextResponse.json(
        { error: 'Bookmark not found', bookmarked: false },
        { status: 404 }
      )
    }

    // Remove bookmark
    await prisma.bookmark.delete({
      where: { id: existingBookmark.id },
    })

    return NextResponse.json({ bookmarked: false })
  } catch (error) {
    console.error('Error deleting bookmark:', error)
    return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { pickId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { pickId } = params

    let isBookmarked = false
    if (session?.user?.id) {
      const bookmark = await prisma.bookmark.findUnique({
        where: {
          userId_pickId: {
            userId: session.user.id,
            pickId,
          },
        },
      })
      isBookmarked = !!bookmark
    }

    return NextResponse.json({ isBookmarked })
  } catch (error) {
    console.error('Error fetching bookmark:', error)
    return NextResponse.json({ error: 'Failed to fetch bookmark' }, { status: 500 })
  }
}
