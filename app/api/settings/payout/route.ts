import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Encrypt sensitive data before storing
function encrypt(text: string): string {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-encryption-key-change-this', 'utf-8').slice(0, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        payoutMethod: true,
        cryptoWalletAddress: true,
        bankAccountId: true,
        whopAccountId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      payoutMethod: user.payoutMethod || 'BANK',
      hasCryptoWallet: !!user.cryptoWalletAddress,
      hasBankAccount: !!user.bankAccountId,
      hasWhopAccount: !!user.whopAccountId,
    });
  } catch (error) {
    console.error('Error fetching payout settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payout settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      payoutMethod,
      cryptoWalletAddress,
      cryptoNetwork,
      bankAccountNumber,
      bankRoutingNumber,
      bankAccountName,
    } = body;

    // Validate payout method
    if (!['BANK', 'CRYPTO', 'WHOP_BALANCE', 'PAYPAL'].includes(payoutMethod)) {
      return NextResponse.json(
        { error: 'Invalid payout method' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      payoutMethod,
    };

    // Handle crypto wallet
    if (payoutMethod === 'CRYPTO') {
      if (!cryptoWalletAddress) {
        return NextResponse.json(
          { error: 'Wallet address is required for crypto payouts' },
          { status: 400 }
        );
      }

      // Basic Ethereum address validation
      if (!/^0x[a-fA-F0-9]{40}$/.test(cryptoWalletAddress)) {
        return NextResponse.json(
          { error: 'Invalid Ethereum wallet address' },
          { status: 400 }
        );
      }

      updateData.cryptoWalletAddress = cryptoWalletAddress;
    }

    // Handle bank account
    if (payoutMethod === 'BANK') {
      if (!bankAccountNumber || !bankRoutingNumber || !bankAccountName) {
        return NextResponse.json(
          { error: 'All bank account details are required' },
          { status: 400 }
        );
      }

      // Basic routing number validation (9 digits)
      if (!/^\d{9}$/.test(bankRoutingNumber)) {
        return NextResponse.json(
          { error: 'Invalid routing number' },
          { status: 400 }
        );
      }

      // For production, you would integrate with Plaid or similar service
      // For now, we'll store an encrypted identifier
      const bankIdentifier = encrypt(`${bankRoutingNumber}:${bankAccountNumber}`);
      updateData.bankAccountId = bankIdentifier;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        payoutMethod: true,
      },
    });

    return NextResponse.json({
      success: true,
      payoutMethod: updatedUser.payoutMethod,
    });
  } catch (error) {
    console.error('Error updating payout settings:', error);
    return NextResponse.json(
      { error: 'Failed to update payout settings' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clear payout settings
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        payoutMethod: 'BANK',
        cryptoWalletAddress: null,
        bankAccountId: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing payout settings:', error);
    return NextResponse.json(
      { error: 'Failed to clear payout settings' },
      { status: 500 }
    );
  }
}