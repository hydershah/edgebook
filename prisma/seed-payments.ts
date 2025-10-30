/**
 * Payment System Seed Script
 * Initializes payment configuration with default values
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPaymentConfiguration() {
  console.log('🌱 Seeding payment configuration...');

  // Check if configuration already exists
  const existing = await prisma.paymentConfiguration.findFirst();

  if (existing) {
    console.log('✅ Payment configuration already exists');
    return existing;
  }

  // Create default configuration
  const config = await prisma.paymentConfiguration.create({
    data: {
      platformFeePercent: parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '15'),
      minPickPrice: 50, // $0.50 in cents
      maxPickPrice: 1000000, // $10,000 in cents
      minSubscriptionPrice: 499, // $4.99 in cents
      maxSubscriptionPrice: 99999, // $999.99 in cents
      withdrawalMinimum: parseFloat(process.env.DEFAULT_MIN_PAYOUT || '1000'), // $10 in cents
      withdrawalEnabled: true,
      paymentProvider: 'whop',
    },
  });

  console.log('✅ Payment configuration created');
  console.log('   Platform Fee: ' + config.platformFeePercent + '%');
  console.log('   Pick Price Range: $' + (config.minPickPrice / 100) + ' - $' + (config.maxPickPrice / 100));
  console.log('   Subscription Range: $' + (config.minSubscriptionPrice / 100) + ' - $' + (config.maxSubscriptionPrice / 100));
  console.log('   Minimum Withdrawal: $' + (config.withdrawalMinimum / 100));

  return config;
}

async function main() {
  try {
    await seedPaymentConfiguration();
    console.log('✅ Payment system seed completed successfully');
  } catch (error) {
    console.error('❌ Error seeding payment system:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
