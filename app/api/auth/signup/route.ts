import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { validateEmail, generateVerificationToken } from '@/lib/validation'
import { sendVerificationEmail } from '@/lib/email'

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().min(1), // Basic check, full validation done by validateEmail
  password: z.string().min(8),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = signupSchema.parse(body)

    // Normalize email
    const normalizedEmail = data.email.trim().toLowerCase()

    // Robust email validation
    const emailValidation = validateEmail(normalizedEmail)
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user (emailVerified is null - requires verification)
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: normalizedEmail,
        password: hashedPassword,
        emailVerified: null, // User must verify email
      },
    })

    // Generate verification token
    const verificationToken = generateVerificationToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour expiry

    // Store verification token
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        email: normalizedEmail,
        token: verificationToken,
        expires: expiresAt,
      },
    })

    // Send verification email (don't block on this)
    sendVerificationEmail(normalizedEmail, verificationToken, user.name || undefined)
      .catch((error) => {
        console.error('Failed to send verification email:', error)
      })

    return NextResponse.json(
      {
        message: 'User created successfully. Please check your email to verify your account.',
        userId: user.id,
        requiresVerification: true,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
