import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updatePickSchema = z.object({
  pickType: z.enum(['SINGLE', 'PARLAY']).optional(),
  sport: z.enum(['NFL', 'NBA', 'MLB', 'NHL', 'SOCCER', 'COLLEGE_FOOTBALL', 'COLLEGE_BASKETBALL']).optional(),
  matchup: z.string().min(1).optional(),
  details: z.string().min(1).max(1000).optional(),
  odds: z.string().optional(),
  gameDate: z.string().transform((str) => new Date(str)).optional(),
  confidence: z.coerce.number().min(1).max(5).optional(),
  isPremium: z.boolean().optional(),
  price: z.coerce.number().optional(),
  status: z.enum(['PENDING', 'WON', 'LOST', 'PUSH']).optional(),
})

/**
 * GET /api/picks/[pickId]
 * Returns pick data with content obfuscation for unpurchased premium picks
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { pickId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { pickId } = params

    const pick = await prisma.pick.findUnique({
      where: { id: pickId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            isVerified: true,
          },
        },
      },
    })

    if (!pick) {
      return NextResponse.json({ error: 'Pick not found' }, { status: 404 })
    }

    // Check if user is the owner
    const isOwner = session?.user?.id === pick.userId

    // Check if user has purchased the pick
    let hasPurchased = false
    if (session?.user?.id && pick.isPremium) {
      const purchase = await prisma.purchase.findUnique({
        where: {
          userId_pickId: {
            userId: session.user.id,
            pickId: pick.id,
          },
        },
      })
      hasPurchased = !!purchase
    }

    // Calculate if pick is currently locked
    const now = new Date()
    const isLocked = pick.lockedAt ? now >= pick.lockedAt : false

    // Fetch stats
    const [upvoteCount, downvoteCount, commentCount, unlockCount, userEngagement] = await Promise.all([
      prisma.like.count({ where: { pickId, voteType: 'UPVOTE' } }),
      prisma.like.count({ where: { pickId, voteType: 'DOWNVOTE' } }),
      prisma.comment.count({ where: { pickId } }),
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

    const [userVote, isBookmarked, isUnlocked] = userEngagement

    const stats = {
      upvotes: upvoteCount,
      downvotes: downvoteCount,
      score: upvoteCount - downvoteCount,
      comments: commentCount,
      views: pick.viewCount || 0,
      unlocks: unlockCount,
      userVoteType: userVote?.voteType || null,
      isBookmarked: !!isBookmarked,
      isUnlocked: !!isUnlocked,
    }

    // SECURITY: Obfuscate content for premium picks that haven't been purchased
    if (pick.isPremium && !isOwner && !hasPurchased) {
      // Return truncated/obfuscated content
      const truncatedDetails = pick.details.substring(0, 50) + '...'

      return NextResponse.json({
        pick: {
          ...pick,
          details: truncatedDetails,
          odds: null, // Hide odds for locked premium picks
          isLocked,
          isPremiumLocked: true,
        },
        stats,
      })
    }

    // Return full content for owners, purchasers, or free picks
    return NextResponse.json({
      pick: {
        ...pick,
        isLocked,
        isPremiumLocked: false,
      },
      stats,
    })
  } catch (error) {
    console.error('Error fetching pick:', error)
    return NextResponse.json({ error: 'Failed to fetch pick' }, { status: 500 })
  }
}

/**
 * PUT /api/picks/[pickId]
 * Updates a pick with timestamp locking validation
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { pickId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pickId } = params
    const body = await request.json()
    const data = updatePickSchema.parse(body)

    // Get existing pick
    const existingPick = await prisma.pick.findUnique({
      where: { id: pickId },
    })

    if (!existingPick) {
      return NextResponse.json({ error: 'Pick not found' }, { status: 404 })
    }

    // Check ownership
    if (existingPick.userId !== session.user.id) {
      return NextResponse.json({ error: 'You do not have permission to edit this pick' }, { status: 403 })
    }

    // CRITICAL: Check if pick is locked
    const now = new Date()
    const isLocked = existingPick.lockedAt ? now >= existingPick.lockedAt : false

    if (isLocked) {
      return NextResponse.json({
        error: 'Cannot edit pick after the event has started',
        lockedAt: existingPick.lockedAt?.toISOString(),
        currentTime: now.toISOString()
      }, { status: 403 })
    }

    // If gameDate is being changed, validate it and recalculate lockTime
    let newLockTime = existingPick.lockedAt
    if (data.gameDate) {
      const LOCK_GRACE_PERIOD = 5 * 60 * 1000 // 5 minutes
      newLockTime = new Date(data.gameDate.getTime() - LOCK_GRACE_PERIOD)

      if (now >= newLockTime) {
        return NextResponse.json({
          error: 'Cannot set game date to an event that has already started or is starting soon',
          lockTime: newLockTime.toISOString()
        }, { status: 400 })
      }
    }

    // Update the pick
    const updatedPick = await prisma.pick.update({
      where: { id: pickId },
      data: {
        ...data,
        lockedAt: newLockTime,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json(updatedPick)
  } catch (error) {
    console.error('Error updating pick:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update pick' }, { status: 500 })
  }
}

/**
 * DELETE /api/picks/[pickId]
 * Deletes a pick (only if not locked)
 */
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

    // Get existing pick
    const existingPick = await prisma.pick.findUnique({
      where: { id: pickId },
    })

    if (!existingPick) {
      return NextResponse.json({ error: 'Pick not found' }, { status: 404 })
    }

    // Check ownership
    if (existingPick.userId !== session.user.id) {
      return NextResponse.json({ error: 'You do not have permission to delete this pick' }, { status: 403 })
    }

    // Check if pick is locked
    const now = new Date()
    const isLocked = existingPick.lockedAt ? now >= existingPick.lockedAt : false

    if (isLocked) {
      return NextResponse.json({
        error: 'Cannot delete pick after the event has started',
        lockedAt: existingPick.lockedAt?.toISOString()
      }, { status: 403 })
    }

    await prisma.pick.delete({
      where: { id: pickId },
    })

    return NextResponse.json({ success: true, message: 'Pick deleted successfully' })
  } catch (error) {
    console.error('Error deleting pick:', error)
    return NextResponse.json({ error: 'Failed to delete pick' }, { status: 500 })
  }
}
