import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { validateEmail, generateVerificationToken } from '@/lib/validation'
import { sendEmailChangeNotification, sendEmailChangeConfirmation } from '@/lib/email'

const emailSchema = z.object({
  email: z.string().min(1), // Basic check, full validation done by validateEmail
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

    // Normalize email
    const normalizedEmail = validation.data.email.trim().toLowerCase()

    // Robust email validation
    const emailValidation = validateEmail(normalizedEmail)
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: { message: emailValidation.error } },
        { status: 400 }
      )
    }

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if email is the same as current
    if (currentUser.email === normalizedEmail) {
      return NextResponse.json(
        { error: { message: 'This is already your current email address' } },
        { status: 400 }
      )
    }

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: { message: 'Email is already in use' } },
        { status: 400 }
      )
    }

    // Update email and reset verification status
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        email: normalizedEmail,
        emailVerified: null, // Reset verification when email changes
      },
      select: { email: true, emailVerified: true },
    })

    // Generate verification token for new email
    const verificationToken = generateVerificationToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour expiry

    // Store verification token
    await prisma.emailVerification.create({
      data: {
        userId: session.user.id,
        email: normalizedEmail,
        token: verificationToken,
        expires: expiresAt,
      },
    })

    // Send notification to old email (don't block on this)
    sendEmailChangeNotification(
      currentUser.email,
      normalizedEmail,
      currentUser.name || undefined
    ).catch((error) => {
      console.error('Failed to send email change notification:', error)
    })

    // Send confirmation to new email (don't block on this)
    sendEmailChangeConfirmation(
      normalizedEmail,
      verificationToken,
      currentUser.name || undefined
    ).catch((error) => {
      console.error('Failed to send email change confirmation:', error)
    })

    return NextResponse.json({
      ...updatedUser,
      message: 'Email updated successfully. Please check both your old and new email addresses for confirmation.',
    })
  } catch (error) {
    console.error('Email update error:', error)
    return NextResponse.json({ error: { message: 'Failed to update email' } }, { status: 500 })
  }
}
