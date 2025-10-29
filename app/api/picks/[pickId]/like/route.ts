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
    const body = await request.json()
    const { voteType } = body // 'UPVOTE' or 'DOWNVOTE'

    if (!voteType || !['UPVOTE', 'DOWNVOTE'].includes(voteType)) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 })
    }

    // Check if already voted
    const existingVote = await prisma.like.findUnique({
      where: {
        userId_pickId: {
          userId: session.user.id,
          pickId,
        },
      },
    })

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote if clicking the same button
        await prisma.like.delete({
          where: { id: existingVote.id },
        })
        return NextResponse.json({ voteType: null })
      } else {
        // Update vote type if switching from upvote to downvote or vice versa
        await prisma.like.update({
          where: { id: existingVote.id },
          data: { voteType },
        })
        return NextResponse.json({ voteType })
      }
    } else {
      // Create new vote
      await prisma.like.create({
        data: {
          userId: session.user.id,
          pickId,
          voteType,
        },
      })
      return NextResponse.json({ voteType })
    }
  } catch (error) {
    console.error('Error toggling vote:', error)
    return NextResponse.json({ error: 'Failed to toggle vote' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { pickId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { pickId } = params

    // Count upvotes and downvotes
    const upvoteCount = await prisma.like.count({
      where: { pickId, voteType: 'UPVOTE' },
    })

    const downvoteCount = await prisma.like.count({
      where: { pickId, voteType: 'DOWNVOTE' },
    })

    let userVoteType = null
    if (session?.user?.id) {
      const userVote = await prisma.like.findUnique({
        where: {
          userId_pickId: {
            userId: session.user.id,
            pickId,
          },
        },
      })
      userVoteType = userVote?.voteType || null
    }

    return NextResponse.json({
      upvotes: upvoteCount,
      downvotes: downvoteCount,
      userVoteType,
      score: upvoteCount - downvoteCount
    })
  } catch (error) {
    console.error('Error fetching votes:', error)
    return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 })
  }
}
