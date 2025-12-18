import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseAvailable } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json({ signals: [] });
    }

    if (!isDatabaseAvailable()) {
      return NextResponse.json({ signals: [] });
    }

    const user = await prisma!.user.findUnique({
      where: { walletAddress },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    return NextResponse.json({
      signals: user?.analyses || [],
    });
  } catch (error) {
    console.error('Error fetching signal history:', error);
    return NextResponse.json({ signals: [] });
  }
}
