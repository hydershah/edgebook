import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { authenticator } from 'otplib'
import qrcode from 'qrcode'

// Generate 2FA secret and QR code
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, twoFactorEnabled: true },
    })

    if (!user) {
      return NextResponse.json({ error: { message: 'User not found' } }, { status: 404 })
    }

    // Generate secret
    const secret = authenticator.generateSecret()

    // Generate OTP auth URL
    const otpauthUrl = authenticator.keyuri(user.email, 'EdgeBook', secret)

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl)

    return NextResponse.json({
      secret,
      qrCodeUrl,
    })
  } catch (error) {
    console.error('2FA setup error:', error)
    return NextResponse.json({ error: { message: 'Failed to generate 2FA setup' } }, { status: 500 })
  }
}

// Enable/Disable 2FA
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { secret, token, enable } = body

    if (enable) {
      // Verify token before enabling
      const isValid = authenticator.verify({ token, secret })

      if (!isValid) {
        return NextResponse.json(
          { error: { message: 'Invalid verification code' } },
          { status: 400 }
        )
      }

      // Enable 2FA
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorEnabled: true,
          twoFactorSecret: secret,
        },
      })

      return NextResponse.json({ success: true, message: '2FA enabled successfully' })
    } else {
      // Disable 2FA
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
        },
      })

      return NextResponse.json({ success: true, message: '2FA disabled successfully' })
    }
  } catch (error) {
    console.error('2FA update error:', error)
    return NextResponse.json({ error: { message: 'Failed to update 2FA settings' } }, { status: 500 })
  }
}
