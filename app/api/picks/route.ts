import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createPickSchema = z.object({
  pickType: z.enum(['SINGLE', 'PARLAY']),
  sport: z.enum(['NFL', 'NBA', 'MLB', 'NHL', 'SOCCER', 'COLLEGE_FOOTBALL', 'COLLEGE_BASKETBALL']),
  matchup: z.string().min(1),
  details: z.string().min(1).max(1000),
  odds: z.string().optional(),
  gameDate: z.string().transform((str) => new Date(str)),
  confidence: z.coerce.number().min(1).max(5),
  isPremium: z.boolean(),
  price: z.coerce.number().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')
    const status = searchParams.get('status')
    const confidence = searchParams.get('confidence')
    const premiumOnly = searchParams.get('premiumOnly') === 'true'
    const followingOnly = searchParams.get('followingOnly') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const session = await getServerSession(authOptions)

    const where: any = {}
    if (sport && sport !== 'all') where.sport = sport
    if (status && status !== 'all') where.status = status
    if (confidence && confidence !== 'all') where.confidence = parseInt(confidence)
    if (premiumOnly) where.isPremium = true

    if (followingOnly && session?.user?.id) {
      const following = await prisma.follow.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true },
      })
      where.userId = { in: following.map((f) => f.followingId) }
    }

    const skip = (page - 1) * limit

    const picks = await prisma.pick.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    return NextResponse.json(picks)
  } catch (error) {
    console.error('Error fetching picks:', error)
    return NextResponse.json({ error: 'Failed to fetch picks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createPickSchema.parse(body)

    const pick = await prisma.pick.create({
      data: {
        userId: session.user.id,
        pickType: data.pickType,
        sport: data.sport,
        matchup: data.matchup,
        details: data.details,
        odds: data.odds,
        gameDate: data.gameDate,
        confidence: data.confidence,
        isPremium: data.isPremium,
        price: data.price,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json(pick, { status: 201 })
  } catch (error) {
    console.error('Error creating pick:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create pick' }, { status: 500 })
  }
}
