import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate reset token
      const resetToken = randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 3600000) // 1 hour from now

      // Store reset token in database
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token: resetToken,
          expires,
        },
      })

      // Send password reset email
      await sendPasswordResetEmail(email, resetToken)
    }

    return NextResponse.json({
      message: 'If an account exists with this email, you will receive a password reset link shortly.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}