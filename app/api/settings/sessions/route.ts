import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get all active sessions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessions = await prisma.session.findMany({
      where: {
        userId: session.user.id,
        expires: { gte: new Date() },
      },
      select: {
        id: true,
        sessionToken: true,
        expires: true,
      },
      orderBy: { expires: 'desc' },
    })

    // Get login activities
    const loginActivities = await prisma.loginActivity.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        location: true,
        successful: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({ sessions, loginActivities })
  } catch (error) {
    console.error('Sessions fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

// Revoke a session
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Verify session belongs to user before deleting
    const sessionToDelete = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    })

    if (!sessionToDelete || sessionToDelete.userId !== session.user.id) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    await prisma.session.delete({
      where: { id: sessionId },
    })

    return NextResponse.json({ success: true, message: 'Session revoked successfully' })
  } catch (error) {
    console.error('Session revoke error:', error)
    return NextResponse.json({ error: 'Failed to revoke session' }, { status: 500 })
  }
}
