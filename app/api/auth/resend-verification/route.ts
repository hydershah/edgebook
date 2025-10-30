import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateVerificationToken } from '@/lib/validation'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if email is already verified
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, emailVerified: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 })
    }

    // Check for existing non-expired verification token
    const existingToken = await prisma.emailVerification.findFirst({
      where: {
        userId: session.user.id,
        email: user.email,
        used: false,
        expires: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // If token was created less than 1 minute ago, prevent spam
    if (existingToken && new Date().getTime() - existingToken.createdAt.getTime() < 60000) {
      return NextResponse.json(
        { error: 'Please wait a minute before requesting another verification email' },
        { status: 429 }
      )
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour expiry

    // Store verification token
    await prisma.emailVerification.create({
      data: {
        userId: session.user.id,
        email: user.email,
        token: verificationToken,
        expires: expiresAt,
      },
    })

    // Send verification email
    const emailResult = await sendVerificationEmail(
      user.email,
      verificationToken,
      user.name || undefined
    )

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Verification email sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error resending verification email:', error)
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    )
  }
}
