import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const emailSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
})

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = emailSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: { message: validation.error.errors[0].message } },
        { status: 400 }
      )
    }

    const { email } = validation.data

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { error: { message: 'Email is already in use' } },
        { status: 400 }
      )
    }

    // Update email and reset verification status
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        email,
        emailVerified: null, // Reset verification when email changes
      },
      select: { email: true, emailVerified: true },
    })

    return NextResponse.json({
      ...updatedUser,
      message: 'Email updated successfully. Please verify your new email.',
    })
  } catch (error) {
    console.error('Email update error:', error)
    return NextResponse.json({ error: { message: 'Failed to update email' } }, { status: 500 })
  }
}
