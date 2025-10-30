import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Batch view tracking endpoint
 * Processes multiple pick views in a single request
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { pickIds } = await request.json()

    if (!Array.isArray(pickIds) || pickIds.length === 0) {
      return NextResponse.json({ success: true, processed: 0 })
    }

    // Limit batch size
    const limitedPickIds = pickIds.slice(0, 50)
    const userId = session?.user?.id
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    // Process views in background (fire-and-forget pattern)
    recordViews(limitedPickIds, userId, ipAddress).catch((error) => {
      console.error('Error recording batch views:', error)
    })

    // Return success immediately without waiting
    return NextResponse.json({
      success: true,
      processed: limitedPickIds.length
    })
  } catch (error) {
    console.error('Error in batch view endpoint:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

/**
 * Background function to record views
 */
async function recordViews(
  pickIds: string[],
  userId: string | undefined,
  ipAddress: string
): Promise<void> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  // Process each pick view
  for (const pickId of pickIds) {
    try {
      // Check for duplicate views in the last hour
      const existingViews = await prisma.view.findMany({
        where: {
          pickId,
          createdAt: { gte: oneHourAgo },
          OR: [
            userId ? { userId } : { userId: null },
            { ipAddress }
          ].filter(Boolean)
        },
        select: { id: true },
        take: 1
      })

      // Skip if view already exists
      if (existingViews.length > 0) {
        continue
      }

      // Create view and increment count in a transaction
      await prisma.$transaction([
        prisma.view.create({
          data: {
            pickId,
            userId: userId || null,
            ipAddress,
          },
        }),
        prisma.pick.update({
          where: { id: pickId },
          data: {
            viewCount: {
              increment: 1,
            },
          },
        }),
      ])
    } catch (error) {
      // Log but don't throw - continue processing other views
      console.error(`Error recording view for pick ${pickId}:`, error)
    }
  }
}
