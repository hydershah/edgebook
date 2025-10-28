import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const socialFieldSchema = z
  .string()
  .max(100)
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  })

const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  bio: z
    .string()
    .max(600)
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : null
    }),
  avatar: z
    .string()
    .url()
    .max(500)
    .optional()
    .or(z.literal(''))
    .transform((value) => {
      if (value === undefined) return undefined
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : null
    }),
  instagram: socialFieldSchema,
  facebook: socialFieldSchema,
  youtube: socialFieldSchema,
  twitter: socialFieldSchema,
  tiktok: socialFieldSchema,
  website: z
    .string()
    .max(255)
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : null
    }),
})

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const parsed = updateProfileSchema.parse(json)

    const updateData: Record<string, string | null> = {}

    if (parsed.name !== undefined) {
      updateData.name = parsed.name
    }
    if (parsed.bio !== undefined) {
      updateData.bio = parsed.bio
    }
    if (parsed.avatar !== undefined) {
      updateData.avatar = parsed.avatar
    }
    if (parsed.instagram !== undefined) {
      updateData.instagram = parsed.instagram
    }
    if (parsed.facebook !== undefined) {
      updateData.facebook = parsed.facebook
    }
    if (parsed.youtube !== undefined) {
      updateData.youtube = parsed.youtube
    }
    if (parsed.twitter !== undefined) {
      updateData.twitter = parsed.twitter
    }
    if (parsed.tiktok !== undefined) {
      updateData.tiktok = parsed.tiktok
    }
    if (parsed.website !== undefined) {
      updateData.website = parsed.website
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        bio: true,
        avatar: true,
        instagram: true,
        facebook: true,
        youtube: true,
        twitter: true,
        tiktok: true,
        website: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Error updating profile:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
