import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseAvailable } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');

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

    const user = await prisma!.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      return NextResponse.json({ success: true });
    }

    await prisma!.notification.deleteMany({
      where: {
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing all notifications:', error);
    return NextResponse.json(
      { error: 'Failed to clear all notifications' },
      { status: 500 }
    );
  }
}
