import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createPickSchema = z
  .object({
    pickType: z.enum(['SINGLE', 'PARLAY'], {
      errorMap: () => ({ message: 'Pick type must be either SINGLE or PARLAY' }),
    }),
    sport: z.enum(['NFL', 'NBA', 'MLB', 'NHL', 'SOCCER', 'COLLEGE_FOOTBALL', 'COLLEGE_BASKETBALL'], {
      errorMap: () => ({ message: 'Invalid sport selection' }),
    }),
    matchup: z
      .string()
      .trim()
      .min(1, 'Matchup is required')
      .max(200, 'Matchup must be less than 200 characters')
      .regex(
        /^[a-zA-Z0-9\s@\-.,()&]+$/,
        'Matchup can only contain letters, numbers, spaces, and common punctuation (@-.,()&)'
      ),
    details: z
      .string()
      .trim()
      .optional()
      .transform((value) => {
        // Handle empty strings and whitespace-only strings
        if (!value || value.length === 0) return undefined
        return value
      })
      .refine(
        (val) => {
          if (!val) return true
          return val.length <= 1000
        },
        { message: 'Pick details must be less than 1000 characters' }
      ),
    odds: z
      .string()
      .trim()
      .optional()
      .transform((val) => {
        // Handle empty strings and whitespace-only strings
        if (!val || val.length === 0) return undefined
        return val
      })
      .refine(
        (val) => {
          if (!val) return true
          // Valid odds formats: -110, +150, 2.5, 1.91, etc.
          return /^[+-]?\d+(\.\d{1,2})?$/.test(val)
        },
        { message: 'Odds must be in valid format (e.g., -110, +150, 2.5)' }
      ),
    gameDate: z
      .string()
      .min(1, 'Game date is required')
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
      })
      .transform((str) => new Date(str)),
    confidence: z
      .number({
        required_error: 'Confidence level is required',
        invalid_type_error: 'Confidence must be a number',
      })
      .int('Confidence must be a whole number')
      .min(1, 'Confidence must be at least 1')
      .max(5, 'Confidence cannot exceed 5'),
    isPremium: z.boolean({
      required_error: 'Premium status is required',
      invalid_type_error: 'Premium status must be true or false',
    }),
    price: z
      .number({
        invalid_type_error: 'Price must be a number',
      })
      .positive('Price must be greater than 0')
      .max(10000, 'Price cannot exceed $10,000')
      .multipleOf(0.01, 'Price can only have up to 2 decimal places')
      .optional(),
    mediaUrl: z
      .string()
      .url('Media URL must be a valid URL')
      .optional(),

    // Sportradar game data
    sportradarGameId: z.string().optional(),
    homeTeam: z.string().optional(),
    awayTeam: z.string().optional(),
    gameStatus: z.string().optional(),
    venue: z.string().optional(),

    // Prediction data
    predictionType: z.enum(['WINNER', 'SPREAD', 'TOTAL']).optional(),
    predictedWinner: z.string().optional(),
    spreadValue: z.number().optional(),
    spreadTeam: z.string().optional(),
    totalValue: z.number().optional(),
    totalPrediction: z.enum(['OVER', 'UNDER']).optional(),
  })
  .superRefine((data, ctx) => {
    // Validate that premium picks have a valid price
    if (data.isPremium) {
      if (data.price === undefined || data.price === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['price'],
          message: 'Price is required for premium picks',
        })
      } else if (data.price < 0.5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['price'],
          message: 'Minimum price for premium picks is $0.50',
        })
      }
    }
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
            isVerified: true,
            winRate: true,
            totalPicks: true,
            streak: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    // SECURITY: Obfuscate premium content for unpurchased picks
    const now = new Date()

    // Fetch all purchases for this user in a single query (fix N+1)
    const purchasedPickIds = new Set<string>()
    if (session?.user?.id) {
      const pickIds = picks.filter(p => p.isPremium).map(p => p.id)
      if (pickIds.length > 0) {
        const purchases = await prisma.purchase.findMany({
          where: {
            userId: session.user.id,
            pickId: { in: pickIds },
          },
          select: { pickId: true },
        })
        purchases.forEach(p => purchasedPickIds.add(p.pickId))
      }
    }

    const processedPicks = picks.map((pick) => {
      const isOwner = session?.user?.id === pick.userId
      const isLocked = pick.lockedAt ? now >= pick.lockedAt : false
      const hasPurchased = purchasedPickIds.has(pick.id)

      // SECURITY: Hide sensitive content for premium picks that haven't been purchased
      // But keep prediction type info visible as a teaser
      if (pick.isPremium && !isOwner && !hasPurchased) {
        return {
          ...pick,
          details: '', // Completely hide details - no truncation/preview
          // Keep prediction fields visible as a teaser
          predictionType: pick.predictionType,
          predictedWinner: pick.predictedWinner,
          spreadValue: pick.spreadValue,
          spreadTeam: pick.spreadTeam,
          totalValue: pick.totalValue,
          totalPrediction: pick.totalPrediction,
          odds: pick.odds, // Show odds as part of the preview
          isLocked,
          isPremiumLocked: true,
        }
      }

      return {
        ...pick,
        isLocked,
        isPremiumLocked: false,
      }
    })

    return NextResponse.json(processedPicks)
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

    // Check account status - suspended and banned users cannot create picks
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        accountStatus: true,
        suspendedUntil: true,
        banReason: true,
        suspensionReason: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is banned
    if (user.accountStatus === 'BANNED') {
      return NextResponse.json({
        error: 'Your account has been permanently banned. You cannot create picks.',
        reason: user.banReason || 'Account banned',
        contactSupport: 'support@edgebook.ai'
      }, { status: 403 })
    }

    // Check if user is suspended and suspension hasn't expired
    const now = new Date()
    if (user.accountStatus === 'SUSPENDED' && user.suspendedUntil && user.suspendedUntil > now) {
      return NextResponse.json({
        error: 'Your account is temporarily suspended. You cannot create picks.',
        reason: user.suspensionReason || 'Account suspended',
        suspendedUntil: user.suspendedUntil.toISOString(),
        contactSupport: 'support@edgebook.ai'
      }, { status: 403 })
    }

    const body = await request.json()
    const data = createPickSchema.parse(body)

    // CRITICAL: Prevent creating picks for events that have already started
    const LOCK_GRACE_PERIOD = 5 * 60 * 1000 // 5 minutes in milliseconds
    const lockTime = new Date(data.gameDate.getTime() - LOCK_GRACE_PERIOD)

    if (now >= lockTime) {
      return NextResponse.json({
        error: 'Cannot create pick for an event that has already started or is starting soon',
        lockTime: lockTime.toISOString()
      }, { status: 400 })
    }

    const pick = await prisma.pick.create({
      data: {
        userId: session.user.id,
        pickType: data.pickType,
        sport: data.sport,
        matchup: data.matchup,
        details: data.details,
        odds: data.odds,
        mediaUrl: data.mediaUrl,
        gameDate: data.gameDate,
        lockedAt: lockTime,
        confidence: data.confidence,
        isPremium: data.isPremium,
        price: data.price,

        // Sportradar game data
        sportradarGameId: data.sportradarGameId,
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        gameStatus: data.gameStatus,
        venue: data.venue,

        // Prediction data
        predictionType: data.predictionType,
        predictedWinner: data.predictedWinner,
        spreadValue: data.spreadValue,
        spreadTeam: data.spreadTeam,
        totalValue: data.totalValue,
        totalPrediction: data.totalPrediction,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            isVerified: true,
            winRate: true,
            totalPicks: true,
            streak: true,
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
