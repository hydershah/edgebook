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
    const { pickId } = params

    // Get IP address for tracking (even for logged-in users)
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // Check if this user/IP has already viewed this pick recently (within last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    const existingView = await prisma.view.findFirst({
      where: {
        pickId,
        createdAt: { gte: oneHourAgo },
        OR: [
          session?.user?.id ? { userId: session.user.id } : {},
          { ipAddress },
        ],
      },
    })

    if (!existingView) {
      // Record new view
      await prisma.view.create({
        data: {
          pickId,
          userId: session?.user?.id,
          ipAddress,
        },
      })

      // Increment view count on the pick
      await prisma.pick.update({
        where: { id: pickId },
        data: { viewCount: { increment: 1 } },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error recording view:', error)
    return NextResponse.json({ error: 'Failed to record view' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { pickId: string } }
) {
  try {
    const { pickId } = params

    const viewCount = await prisma.view.count({
      where: { pickId },
    })

    return NextResponse.json({ count: viewCount })
  } catch (error) {
    console.error('Error fetching views:', error)
    return NextResponse.json({ error: 'Failed to fetch views' }, { status: 500 })
  }
}
