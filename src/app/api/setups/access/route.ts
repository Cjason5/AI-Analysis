import { NextRequest, NextResponse } from 'next/server';
import { Connection } from '@solana/web3.js';
import { verifyPaymentTransaction, PAYMENT_CONFIG } from '@/lib/solana-payment';
import { prisma, isDatabaseAvailable } from '@/lib/prisma';

const ACCESS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

function getConnection(): Connection {
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
  return new Connection(rpcUrl, 'confirmed');
}

/**
 * GET /api/setups/access?walletAddress=X
 * Returns whether the wallet currently has paid access to the setups page.
 */
export async function GET(request: NextRequest) {
  const walletAddress = request.nextUrl.searchParams.get('walletAddress');

  if (!walletAddress) {
    return NextResponse.json({ hasAccess: false, expiresAt: null });
  }

  if (!isDatabaseAvailable()) {
    return NextResponse.json({ hasAccess: false, expiresAt: null });
  }

  try {
    const user = await prisma!.user.findUnique({
      where: { walletAddress },
      select: { setupsAccessExpiresAt: true },
    });

    const expiresAt = user?.setupsAccessExpiresAt ?? null;
    const hasAccess = expiresAt !== null && expiresAt.getTime() > Date.now();

    return NextResponse.json({
      hasAccess,
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      priceUsdc: PAYMENT_CONFIG.setupsAccessAmount,
    });
  } catch (error) {
    console.error('[Setups access GET] Error:', error);
    return NextResponse.json({ hasAccess: false, expiresAt: null }, { status: 500 });
  }
}

/**
 * POST /api/setups/access
 * Verifies a payment signature and grants 24h access to the setups page.
 * Body: { walletAddress, paymentSignature, referrerWallet? }
 */
export async function POST(request: NextRequest) {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { walletAddress, paymentSignature, referrerWallet } = body as {
      walletAddress?: string;
      paymentSignature?: string;
      referrerWallet?: string;
    };

    if (!walletAddress || !paymentSignature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const connection = getConnection();
    const verification = await verifyPaymentTransaction(connection, paymentSignature, {
      expectedAmountUsdc: PAYMENT_CONFIG.setupsAccessAmount,
      referrerWallet: referrerWallet || undefined,
    });

    if (!verification.verified) {
      return NextResponse.json(
        {
          error: `Payment verification failed: ${verification.error}`,
          diagnostic: verification.diagnostic,
        },
        { status: 402 }
      );
    }

    // Extend access from current expiry if it's still in the future, otherwise from now.
    const existing = await prisma!.user.findUnique({
      where: { walletAddress },
      select: { setupsAccessExpiresAt: true },
    });

    const now = Date.now();
    const startFrom =
      existing?.setupsAccessExpiresAt && existing.setupsAccessExpiresAt.getTime() > now
        ? existing.setupsAccessExpiresAt.getTime()
        : now;
    const newExpiry = new Date(startFrom + ACCESS_DURATION_MS);

    const user = await prisma!.user.upsert({
      where: { walletAddress },
      update: { setupsAccessExpiresAt: newExpiry },
      create: { walletAddress, setupsAccessExpiresAt: newExpiry },
    });

    // Record the referral commission if there's a referrer
    if (referrerWallet) {
      try {
        const referrer = await prisma!.user.findUnique({
          where: { walletAddress: referrerWallet },
        });

        if (referrer) {
          const totalFee = PAYMENT_CONFIG.setupsAccessAmount;
          const commissionAmount = totalFee * (PAYMENT_CONFIG.referralCommissionPercentage / 100);

          await prisma!.referralEarning.create({
            data: {
              referrerId: referrer.id,
              downlineId: user.id,
              txSignature: paymentSignature,
              commissionAmount,
              totalFee,
            },
          });
        }
      } catch (err) {
        // Don't fail the access grant if commission recording fails
        console.error('Error recording setups access referral earning:', err);
      }
    }

    return NextResponse.json({
      success: true,
      hasAccess: true,
      expiresAt: newExpiry.toISOString(),
    });
  } catch (error) {
    console.error('[Setups access POST] Error:', error);
    return NextResponse.json({ error: 'Failed to grant access' }, { status: 500 });
  }
}
