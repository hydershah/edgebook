const { PrismaClient, PickType, Sport, PickStatus } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const users = [
  {
    name: 'Arianna Shaw',
    email: 'arianna.shaw@example.com',
    password: 'Edgebook123!',
    bio: 'Former collegiate point guard turned NBA betting analyst. Focused on pace, matchup data, and injury reports.',
    instagram: 'ari_shaw_edge',
    youtube: 'https://youtube.com/@arishawedge',
    twitter: 'arishawedge',
    website: 'https://edgewithari.com',
    picks: [
      {
        pickType: PickType.SINGLE,
        sport: Sport.NBA,
        matchup: 'Los Angeles Lakers vs Golden State Warriors',
        details: 'Taking the Lakers -4.5. Lakers play faster at home, Warriors on second night of a back-to-back without rest.',
        odds: '-110',
        gameDate: new Date('2024-02-10T03:00:00Z'),
        confidence: 4,
        status: PickStatus.WON,
        isPremium: false,
      },
      {
        pickType: PickType.PARLAY,
        sport: Sport.NBA,
        matchup: 'Parlay: BOS ML + DEN ML',
        details: 'Two-team moneyline parlay. Boston faces a depleted Bulls roster while Denver matches up well vs. the Jazz.',
        odds: '+195',
        gameDate: new Date('2024-02-12T01:30:00Z'),
        confidence: 3,
        status: PickStatus.WON,
        isPremium: true,
        price: 12.0,
      },
      {
        pickType: PickType.SINGLE,
        sport: Sport.NBA,
        matchup: 'Phoenix Suns vs Sacramento Kings',
        details: 'Suns +3.5. Phoenix pushes tempo and Sacramento struggles defending stretch bigs without Sabonis on the floor.',
        odds: '-105',
        gameDate: new Date('2024-02-15T02:00:00Z'),
        confidence: 2,
        status: PickStatus.PENDING,
        isPremium: false,
      },
    ],
  },
  {
    name: 'Marcus Delgado',
    email: 'marcus.delgado@example.com',
    password: 'Edgebook123!',
    bio: 'Ex-scout focusing on NFL matchup advantages and advanced line movement. Premium picks every Sunday morning.',
    instagram: 'marcusdelgado',
    youtube: 'https://youtube.com/@marcusdelgadoedge',
    twitter: 'mdelgadoedge',
    picks: [
      {
        pickType: PickType.SINGLE,
        sport: Sport.NFL,
        matchup: 'Kansas City Chiefs vs Buffalo Bills',
        details: 'Bills +2.5. Buffalo defensive line depth can generate pressure without blitzing and slow down Mahomes.',
        odds: '-108',
        gameDate: new Date('2023-12-03T21:25:00Z'),
        confidence: 5,
        status: PickStatus.WON,
        isPremium: true,
        price: 18.0,
      },
      {
        pickType: PickType.SINGLE,
        sport: Sport.NFL,
        matchup: 'Miami Dolphins vs New York Jets',
        details: 'Under 44.5. Both defenses rank top-five in EPA allowed over the last month, windy conditions in East Rutherford.',
        odds: '-112',
        gameDate: new Date('2023-12-17T18:00:00Z'),
        confidence: 3,
        status: PickStatus.LOST,
        isPremium: false,
      },
    ],
  },
  {
    name: 'Sophie Nguyen',
    email: 'sophie.nguyen@example.com',
    password: 'Edgebook123!',
    bio: 'Data scientist covering European soccer and Champions League markets. Models built on expected goal differential.',
    instagram: 'betwithsophie',
    youtube: 'https://youtube.com/@sophienguyenedge',
    twitter: 'sophiewins',
    tiktok: 'sophiestats',
    website: 'https://sophiestats.com',
    picks: [
      {
        pickType: PickType.SINGLE,
        sport: Sport.SOCCER,
        matchup: 'Manchester City vs Arsenal',
        details: 'Over 2.5 goals. Both clubs in the top-three for xG over the last six matches and City’s press creates high-value chances.',
        odds: '-125',
        gameDate: new Date('2024-03-02T17:30:00Z'),
        confidence: 4,
        status: PickStatus.WON,
        isPremium: true,
        price: 15.0,
      },
      {
        pickType: PickType.SINGLE,
        sport: Sport.SOCCER,
        matchup: 'Real Madrid vs Barcelona',
        details: 'Real Madrid +0.5 (double chance). Barcelona on the road with short rest after UCL tie, Madrid depth advantage.',
        odds: '-135',
        gameDate: new Date('2024-04-20T19:00:00Z'),
        confidence: 2,
        status: PickStatus.PUSH,
        isPremium: false,
      },
      {
        pickType: PickType.PARLAY,
        sport: Sport.SOCCER,
        matchup: 'Parlay: PSG ML + Bayern ML',
        details: 'Two heavy favorites with significant rest advantage, price still fair at plus money.',
        odds: '+145',
        gameDate: new Date('2024-05-05T19:00:00Z'),
        confidence: 3,
        status: PickStatus.WON,
        isPremium: true,
        price: 10.0,
      },
    ],
  },
]

const followerPairs = [
  ['arianna.shaw@example.com', 'marcus.delgado@example.com'],
  ['arianna.shaw@example.com', 'sophie.nguyen@example.com'],
  ['marcus.delgado@example.com', 'arianna.shaw@example.com'],
  ['sophie.nguyen@example.com', 'arianna.shaw@example.com'],
]

async function seedUsers() {
  const results = []

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10)

    const record = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        bio: user.bio,
        avatar: user.avatar,
        instagram: user.instagram,
        facebook: user.facebook,
        youtube: user.youtube,
        twitter: user.twitter,
        tiktok: user.tiktok,
        website: user.website,
        emailVerified: new Date(),
        password: hashedPassword,
      },
      create: {
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        instagram: user.instagram,
        facebook: user.facebook,
        youtube: user.youtube,
        twitter: user.twitter,
        tiktok: user.tiktok,
        website: user.website,
        emailVerified: new Date(),
        password: hashedPassword,
      },
    })

    const existingPickCount = await prisma.pick.count({
      where: { userId: record.id },
    })

    if (existingPickCount === 0 && user.picks?.length) {
      await prisma.pick.createMany({
        data: user.picks.map((pick) => ({
          userId: record.id,
          pickType: pick.pickType,
          sport: pick.sport,
          matchup: pick.matchup,
          details: pick.details,
          odds: pick.odds,
          mediaUrl: pick.mediaUrl,
          gameDate: pick.gameDate,
          confidence: pick.confidence,
          status: pick.status,
          isPremium: pick.isPremium ?? false,
          price: pick.price ?? null,
        })),
      })
    }

    results.push(record)
  }

  return results
}

async function seedFollowers(userRecords) {
  const usersByEmail = new Map(userRecords.map((user) => [user.email, user]))

  for (const [followerEmail, followingEmail] of followerPairs) {
    const follower = usersByEmail.get(followerEmail)
    const following = usersByEmail.get(followingEmail)

    if (!follower || !following) continue

    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: follower.id,
          followingId: following.id,
        },
      },
      update: {},
      create: {
        followerId: follower.id,
        followingId: following.id,
      },
    })
  }
}

async function main() {
  console.log('🌱 Seeding EdgeBook sample data...')
  const userRecords = await seedUsers()
  await seedFollowers(userRecords)
  console.log(`✅ Seed complete. Created/updated ${userRecords.length} sample users.`)
  console.log('Sample credentials (email / password):')
  for (const user of users) {
    console.log(` - ${user.email} / ${user.password}`)
  }
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
