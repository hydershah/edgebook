import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const subscriptionPricingSchema = z.object({
  subscriptionPrice: z.number().min(0).max(999.99).nullable(),
  stripeAccountId: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscriptionPrice: true,
        stripeAccountId: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Subscription pricing fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch subscription pricing' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = subscriptionPricingSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: { message: validation.error.errors[0].message } },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: validation.data,
      select: {
        subscriptionPrice: true,
        stripeAccountId: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Subscription pricing update error:', error)
    return NextResponse.json(
      { error: { message: 'Failed to update subscription pricing' } },
      { status: 500 }
    )
  }
}
