import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseAvailable } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, referrerWalletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    // Don't allow self-referral
    if (walletAddress === referrerWalletAddress) {
      return NextResponse.json(
        { error: 'Cannot refer yourself' },
        { status: 400 }
      );
    }

    // Check if user already exists
    let user = await prisma!.user.findUnique({
      where: { walletAddress },
    });

    // If user exists and already has a referrer, don't change it
    if (user && user.referredById) {
      return NextResponse.json({
        success: true,
        message: 'User already has a referrer',
        hasReferrer: true,
      });
    }

    // Find the referrer
    let referrer = null;
    if (referrerWalletAddress) {
      referrer = await prisma!.user.findUnique({
        where: { walletAddress: referrerWalletAddress },
      });

      // If referrer doesn't exist, create them
      if (!referrer) {
        referrer = await prisma!.user.create({
          data: { walletAddress: referrerWalletAddress },
        });
      }
    }

    if (user) {
      // Update existing user with referrer
      if (referrer) {
        await prisma!.user.update({
          where: { id: user.id },
          data: { referredById: referrer.id },
        });
      }
    } else {
      // Create new user with referrer
      user = await prisma!.user.create({
        data: {
          walletAddress,
          referredById: referrer?.id || null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: referrer ? 'Referral registered successfully' : 'User registered',
      hasReferrer: !!referrer,
    });
  } catch (error) {
    console.error('Error registering referral:', error);
    return NextResponse.json(
      { error: 'Failed to register referral' },
      { status: 500 }
    );
  }
}
