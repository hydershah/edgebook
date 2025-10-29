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

    // Get the pick
    const pick = await prisma.pick.findUnique({
      where: { id: pickId },
    })

    if (!pick) {
      return NextResponse.json({ error: 'Pick not found' }, { status: 404 })
    }

    if (!pick.isPremium) {
      return NextResponse.json({ error: 'This pick is not premium' }, { status: 400 })
    }

    if (!pick.price) {
      return NextResponse.json({ error: 'Pick has no price set' }, { status: 400 })
    }

    // Anti-self-purchase: Prevent creators from buying their own picks
    if (pick.userId === session.user.id) {
      return NextResponse.json({
        error: 'You cannot purchase your own premium pick'
      }, { status: 403 })
    }

    // Check if already purchased
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_pickId: {
          userId: session.user.id,
          pickId,
        },
      },
    })

    if (existingPurchase) {
      return NextResponse.json({
        error: 'You have already unlocked this pick',
        alreadyPurchased: true
      }, { status: 400 })
    }

    // TODO: Implement actual wallet/payment logic here
    // For now, we'll create a purchase record with a placeholder payment ID
    const platformFee = pick.price * 0.15 // 15% platform fee

    const purchase = await prisma.purchase.create({
      data: {
        userId: session.user.id,
        pickId,
        amount: pick.price,
        platformFee,
        stripePaymentId: `temp_${Date.now()}`, // TODO: Replace with real Stripe payment ID
      },
    })

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: 'PURCHASE',
        amount: pick.price,
        platformFee,
        status: 'COMPLETED',
        stripePaymentId: purchase.stripePaymentId,
      },
    })

    return NextResponse.json({
      success: true,
      purchase,
      message: 'Pick unlocked successfully'
    })
  } catch (error) {
    console.error('Error unlocking pick:', error)
    return NextResponse.json({ error: 'Failed to unlock pick' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { pickId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { pickId } = params

    // Get unlock count
    const unlockCount = await prisma.purchase.count({
      where: { pickId },
    })

    // Check if current user has unlocked
    let isUnlocked = false
    if (session?.user?.id) {
      const purchase = await prisma.purchase.findUnique({
        where: {
          userId_pickId: {
            userId: session.user.id,
            pickId,
          },
        },
      })
      isUnlocked = !!purchase
    }

    return NextResponse.json({ count: unlockCount, isUnlocked })
  } catch (error) {
    console.error('Error fetching unlock status:', error)
    return NextResponse.json({ error: 'Failed to fetch unlock status' }, { status: 500 })
  }
}
