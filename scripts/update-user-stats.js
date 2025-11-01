// Script to update user stats for testing
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUserStats() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      take: 10 // Update first 10 users for testing
    });

    console.log(`Found ${users.length} users to update`);

    for (const user of users) {
      // Generate random stats for testing
      const winRate = Math.random() * 100; // Random win rate 0-100%
      const totalPicks = Math.floor(Math.random() * 200) + 1; // 1-200 picks
      const streak = Math.random() > 0.7 ? Math.floor(Math.random() * 10) + 1 : 0; // 30% chance of having a streak

      await prisma.user.update({
        where: { id: user.id },
        data: {
          winRate: parseFloat(winRate.toFixed(1)),
          totalPicks,
          streak,
          isVerified: Math.random() > 0.5 // 50% chance of being verified
        }
      });

      console.log(`Updated ${user.name || user.email}: Win Rate: ${winRate.toFixed(1)}%, Total Picks: ${totalPicks}, Streak: ${streak}`);
    }

    console.log('✅ User stats updated successfully');
  } catch (error) {
    console.error('Error updating user stats:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserStats();