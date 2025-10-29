import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isValidVerificationToken } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    // Validate token format
    if (!token || !isValidVerificationToken(token)) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      )
    }

    // Find the verification record
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            emailVerified: true,
          },
        },
      },
    })

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Check if already used
    if (verification.used) {
      return NextResponse.json(
        { error: 'This verification link has already been used' },
        { status: 400 }
      )
    }

    // Check if expired
    if (new Date() > verification.expires) {
      return NextResponse.json(
        { error: 'This verification link has expired' },
        { status: 400 }
      )
    }

    // Check if the email matches the current user email
    // (in case the user changed their email again before verifying)
    if (verification.email !== verification.user.email) {
      return NextResponse.json(
        {
          error: 'This verification link is for a different email address. Please use the most recent verification email.',
        },
        { status: 400 }
      )
    }

    // Mark verification as used and update user's emailVerified
    await prisma.$transaction([
      prisma.emailVerification.update({
        where: { id: verification.id },
        data: { used: true },
      }),
      prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerified: new Date() },
      }),
    ])

    return NextResponse.json({
      message: 'Email verified successfully',
      success: true,
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    // Validate token format
    if (!token || !isValidVerificationToken(token)) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      )
    }

    // Find the verification record
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      select: {
        id: true,
        email: true,
        expires: true,
        used: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    })

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token', valid: false },
        { status: 400 }
      )
    }

    // Check if already used
    if (verification.used) {
      return NextResponse.json(
        { error: 'This verification link has already been used', valid: false },
        { status: 400 }
      )
    }

    // Check if expired
    if (new Date() > verification.expires) {
      return NextResponse.json(
        { error: 'This verification link has expired', valid: false },
        { status: 400 }
      )
    }

    // Check if the email matches
    if (verification.email !== verification.user.email) {
      return NextResponse.json(
        {
          error: 'This verification link is for a different email address',
          valid: false,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      email: verification.email,
    })
  } catch (error) {
    console.error('Email verification check error:', error)
    return NextResponse.json(
      { error: 'Failed to check verification token', valid: false },
      { status: 500 }
    )
  }
}
