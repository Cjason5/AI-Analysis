import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseAvailable } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json({ watchlist: [] });
    }

    if (!isDatabaseAvailable()) {
      return NextResponse.json({ watchlist: [] });
    }

    const user = await prisma!.user.findUnique({
      where: { walletAddress },
      include: { watchlist: true },
    });

    return NextResponse.json({
      watchlist: user?.watchlist || [],
    });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return NextResponse.json({ watchlist: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, tokenSymbol, tokenName, exchange } = body;

    if (!walletAddress || !tokenSymbol || !exchange) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    // Get or create user
    let user = await prisma!.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      user = await prisma!.user.create({
        data: { walletAddress },
      });
    }

    // Add to watchlist (upsert to handle duplicates gracefully)
    const watchlistItem = await prisma!.watchlist.upsert({
      where: {
        userId_tokenSymbol_exchange: {
          userId: user.id,
          tokenSymbol,
          exchange,
        },
      },
      update: {}, // No update needed, just return existing
      create: {
        userId: user.id,
        tokenSymbol,
        tokenName: tokenName || tokenSymbol,
        exchange,
      },
    });

    return NextResponse.json({ success: true, watchlistItem });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to add to watchlist' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');
    const tokenSymbol = searchParams.get('tokenSymbol');
    const exchange = searchParams.get('exchange');

    if (!walletAddress || !tokenSymbol || !exchange) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const user = await prisma!.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      return NextResponse.json({ success: true });
    }

    await prisma!.watchlist.deleteMany({
      where: {
        userId: user.id,
        tokenSymbol,
        exchange,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove from watchlist' },
      { status: 500 }
    );
  }
}
