import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .toLowerCase(),
})

// Check username availability
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const validation = usernameSchema.safeParse({ username })
    if (!validation.success) {
      return NextResponse.json(
        { available: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { username: validation.data.username },
      select: { id: true },
    })

    return NextResponse.json({ available: !existingUser })
  } catch (error) {
    console.error('Username check error:', error)
    return NextResponse.json({ error: 'Failed to check username' }, { status: 500 })
  }
}

// Update username
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = usernameSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: { message: validation.error.errors[0].message } },
        { status: 400 }
      )
    }

    const { username } = validation.data

    // Check if username is already taken
    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    })

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { error: { message: 'Username is already taken' } },
        { status: 400 }
      )
    }

    // Update username
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { username },
      select: { username: true },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Username update error:', error)
    return NextResponse.json({ error: { message: 'Failed to update username' } }, { status: 500 })
  }
}
