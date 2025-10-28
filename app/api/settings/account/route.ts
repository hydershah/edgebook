import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { password, confirmText } = body

    // Verify confirmation text
    if (confirmText !== 'DELETE') {
      return NextResponse.json(
        { error: { message: 'Please type DELETE to confirm account deletion' } },
        { status: 400 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    if (!user) {
      return NextResponse.json({ error: { message: 'User not found' } }, { status: 404 })
    }

    // Verify password if user has one
    if (user.password) {
      if (!password) {
        return NextResponse.json(
          { error: { message: 'Password is required for account deletion' } },
          { status: 400 }
        )
      }

      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        return NextResponse.json(
          { error: { message: 'Incorrect password' } },
          { status: 400 }
        )
      }
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: session.user.id },
    })

    return NextResponse.json({ success: true, message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ error: { message: 'Failed to delete account' } }, { status: 500 })
  }
}
