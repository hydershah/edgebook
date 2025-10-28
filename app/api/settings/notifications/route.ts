import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const notificationPreferencesSchema = z.object({
  email: z.object({
    enabled: z.boolean(),
    newFollowers: z.boolean(),
    likes: z.boolean(),
    comments: z.boolean(),
    purchases: z.boolean(),
    subscriptions: z.boolean(),
    messages: z.boolean(),
    promotions: z.boolean(),
  }),
  push: z.object({
    enabled: z.boolean(),
    newFollowers: z.boolean(),
    likes: z.boolean(),
    comments: z.boolean(),
    purchases: z.boolean(),
    subscriptions: z.boolean(),
    messages: z.boolean(),
  }),
  sms: z.object({
    enabled: z.boolean(),
    purchases: z.boolean(),
    subscriptions: z.boolean(),
  }),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { notificationPreferences: true },
    })

    // Default preferences
    const defaultPreferences = {
      email: {
        enabled: true,
        newFollowers: true,
        likes: true,
        comments: true,
        purchases: true,
        subscriptions: true,
        messages: true,
        promotions: false,
      },
      push: {
        enabled: true,
        newFollowers: true,
        likes: true,
        comments: true,
        purchases: true,
        subscriptions: true,
        messages: true,
      },
      sms: {
        enabled: false,
        purchases: true,
        subscriptions: true,
      },
    }

    return NextResponse.json(user?.notificationPreferences || defaultPreferences)
  } catch (error) {
    console.error('Notification preferences fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch notification preferences' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = notificationPreferencesSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: { message: 'Invalid notification preferences' } },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { notificationPreferences: validation.data },
      select: { notificationPreferences: true },
    })

    return NextResponse.json(updatedUser.notificationPreferences)
  } catch (error) {
    console.error('Notification preferences update error:', error)
    return NextResponse.json(
      { error: { message: 'Failed to update notification preferences' } },
      { status: 500 }
    )
  }
}
