import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PERFORMANCE: Process view recording in background without blocking response
async function recordViewInBackground(
  pickId: string,
  userId: string | undefined,
  ipAddress: string
) {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    let existingView = null

    if (userId) {
      existingView = await prisma.view.findFirst({
        where: {
          pickId,
          userId,
          createdAt: { gte: oneHourAgo },
        },
      })
    }

    if (!existingView) {
      existingView = await prisma.view.findFirst({
        where: {
          pickId,
          ipAddress,
          createdAt: { gte: oneHourAgo },
        },
      })
    }

    if (!existingView) {
      await prisma.$transaction([
        prisma.view.create({
          data: {
            pickId,
            userId,
            ipAddress,
          },
        }),
        prisma.pick.update({
          where: { id: pickId },
          data: { viewCount: { increment: 1 } },
        }),
      ])
    }
  } catch (error) {
    console.error('Background view recording error:', error)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { pickId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { pickId } = params

    // Get IP address for tracking
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // PERFORMANCE: Fire-and-forget background processing - instant response
    recordViewInBackground(pickId, session?.user?.id, ipAddress).catch(err => {
      console.error('Failed to queue view recording:', err)
    })

    // Return immediately - don't wait for database operations
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in view endpoint:', error)
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
