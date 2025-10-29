import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Filter } from 'bad-words'

// Reserved usernames that cannot be used
const RESERVED_USERNAMES = [
  'admin',
  'administrator',
  'support',
  'edgebook',
  'api',
  'help',
  'system',
  'root',
  'moderator',
  'mod',
  'staff',
  'official',
  'team',
  'info',
  'contact',
  'sales',
  'billing',
  'legal',
  'privacy',
  'terms',
  'about',
  'null',
  'undefined',
  'test',
  'demo',
  'sample',
]

// Initialize profanity filter
const profanityFilter = new Filter()

// Custom validator for username format
const validateUsernameFormat = (username: string): string | null => {
  // Prevent consecutive underscores or starting/ending with underscore
  if (!/^[a-zA-Z0-9]+(_[a-zA-Z0-9]+)*$/.test(username)) {
    return 'Username cannot have consecutive underscores or start/end with underscores'
  }
  return null
}

// Check if username is reserved
const isReservedUsername = (username: string): boolean => {
  const normalizedUsername = username.toLowerCase()
  return RESERVED_USERNAMES.includes(normalizedUsername)
}

// Check if username contains profanity
const containsProfanity = (username: string): boolean => {
  return profanityFilter.isProfane(username)
}

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .transform((val) => val.toLowerCase()),
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

    const normalizedUsername = validation.data.username

    // Check format (consecutive underscores, etc.)
    const formatError = validateUsernameFormat(normalizedUsername)
    if (formatError) {
      return NextResponse.json({ available: false, error: formatError }, { status: 400 })
    }

    // Check if reserved
    if (isReservedUsername(normalizedUsername)) {
      return NextResponse.json(
        { available: false, error: 'This username is reserved' },
        { status: 400 }
      )
    }

    // Check for profanity
    if (containsProfanity(normalizedUsername)) {
      return NextResponse.json(
        { available: false, error: 'Username contains inappropriate content' },
        { status: 400 }
      )
    }

    // Check if username is already taken
    const existingUser = await prisma.user.findUnique({
      where: { username: normalizedUsername },
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

    const normalizedUsername = validation.data.username

    // Check format (consecutive underscores, etc.)
    const formatError = validateUsernameFormat(normalizedUsername)
    if (formatError) {
      return NextResponse.json({ error: { message: formatError } }, { status: 400 })
    }

    // Check if reserved
    if (isReservedUsername(normalizedUsername)) {
      return NextResponse.json(
        { error: { message: 'This username is reserved' } },
        { status: 400 }
      )
    }

    // Check for profanity
    if (containsProfanity(normalizedUsername)) {
      return NextResponse.json(
        { error: { message: 'Username contains inappropriate content' } },
        { status: 400 }
      )
    }

    // Check rate limiting: max 3 username changes per month
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    const recentChanges = await prisma.usernameChange.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: oneMonthAgo,
        },
      },
    })

    if (recentChanges >= 3) {
      return NextResponse.json(
        {
          error: {
            message:
              'You have reached the maximum number of username changes (3 per month). Please try again later.',
          },
        },
        { status: 429 }
      )
    }

    // Check if username is already taken
    const existingUser = await prisma.user.findUnique({
      where: { username: normalizedUsername },
      select: { id: true },
    })

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { error: { message: 'Username is already taken' } },
        { status: 400 }
      )
    }

    // Get current user to track old username
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true },
    })

    // Update username and create change record in a transaction
    const result = await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { username: normalizedUsername },
        select: { username: true },
      }),
      prisma.usernameChange.create({
        data: {
          userId: session.user.id,
          oldUsername: currentUser?.username,
          newUsername: normalizedUsername,
        },
      }),
    ])

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Username update error:', error)
    return NextResponse.json({ error: { message: 'Failed to update username' } }, { status: 500 })
  }
}
