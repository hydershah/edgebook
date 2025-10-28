import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const MIN_QUERY_LENGTH = 2

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim() ?? ''

    if (query.length < MIN_QUERY_LENGTH) {
      return NextResponse.json({ users: [] })
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        isPremium: true,
        _count: {
          select: {
            following: true,
            picks: true,
          },
        },
      },
      orderBy: {
        following: {
          _count: 'desc',
        },
      },
      take: 12,
    })

    return NextResponse.json({
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        isPremium: user.isPremium,
        followers: user._count.following,
        picks: user._count.picks,
      })),
    })
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json({ error: 'Unable to search users' }, { status: 500 })
  }
}
