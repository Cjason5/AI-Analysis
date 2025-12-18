import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseAvailable } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');

    // Get base URL from request headers or environment
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;

    if (!walletAddress) {
      return NextResponse.json({
        referralLink: '',
        downlineCount: 0,
        totalEarnings: 0,
        recentEarnings: [],
        downlines: [],
      });
    }

    if (!isDatabaseAvailable()) {
      return NextResponse.json({
        referralLink: '',
        downlineCount: 0,
        totalEarnings: 0,
        recentEarnings: [],
        downlines: [],
      });
    }

    // Get user with their referrals and earnings
    const user = await prisma!.user.findUnique({
      where: { walletAddress },
      include: {
        referrals: {
          select: {
            id: true,
            walletAddress: true,
            createdAt: true,
            _count: {
              select: { analyses: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        referralEarnings: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            downline: {
              select: { walletAddress: true },
            },
          },
        },
        referredBy: {
          select: { walletAddress: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({
        referralLink: `${baseUrl}/?ref=${walletAddress}`,
        downlineCount: 0,
        totalEarnings: 0,
        recentEarnings: [],
        downlines: [],
        referredBy: null,
      });
    }

    // Calculate total earnings
    const totalEarnings = user.referralEarnings.reduce(
      (sum: number, earning: { commissionAmount: number }) => sum + earning.commissionAmount,
      0
    );

    // Format downlines with their stats
    const downlines = user.referrals.map((ref: { walletAddress: string; createdAt: Date; _count: { analyses: number } }) => ({
      walletAddress: ref.walletAddress,
      joinedAt: ref.createdAt,
      analysisCount: ref._count.analyses,
    }));

    // Format recent earnings
    const recentEarnings = user.referralEarnings.map((earning: { id: string; downline: { walletAddress: string }; commissionAmount: number; totalFee: number; txSignature: string; createdAt: Date }) => ({
      id: earning.id,
      downlineWallet: earning.downline.walletAddress,
      commissionAmount: earning.commissionAmount,
      totalFee: earning.totalFee,
      txSignature: earning.txSignature,
      createdAt: earning.createdAt,
    }));

    return NextResponse.json({
      referralLink: `${baseUrl}/?ref=${walletAddress}`,
      downlineCount: user.referrals.length,
      totalEarnings,
      recentEarnings,
      downlines,
      referredBy: user.referredBy?.walletAddress || null,
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referral stats' },
      { status: 500 }
    );
  }
}
