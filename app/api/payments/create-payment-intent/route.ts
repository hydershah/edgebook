import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const PLATFORM_FEE_PERCENTAGE = 0.15 // 15%

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pickId } = await request.json()

    // Get the pick
    const pick = await prisma.pick.findUnique({
      where: { id: pickId },
      include: { user: true },
    })

    if (!pick || !pick.isPremium || !pick.price) {
      return NextResponse.json({ error: 'Invalid pick' }, { status: 400 })
    }

    // Check if user already purchased
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_pickId: {
          userId: session.user.id,
          pickId: pickId,
        },
      },
    })

    if (existingPurchase) {
      return NextResponse.json({ error: 'Already purchased' }, { status: 400 })
    }

    const amount = Math.round(pick.price * 100) // Convert to cents
    const platformFee = Math.round(amount * PLATFORM_FEE_PERCENTAGE)

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        pickId: pick.id,
        userId: session.user.id,
        sellerId: pick.userId,
        platformFee: platformFee.toString(),
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
