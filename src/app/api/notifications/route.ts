import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseAvailable } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json({ notifications: [] });
    }

    if (!isDatabaseAvailable()) {
      return NextResponse.json({ notifications: [] });
    }

    const user = await prisma!.user.findUnique({
      where: { walletAddress },
      include: {
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 50, // Limit to last 50 notifications
        },
      },
    });

    return NextResponse.json({
      notifications: user?.notifications || [],
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ notifications: [] });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, notificationId, read } = body;

    if (!walletAddress || !notificationId) {
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
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await prisma!.notification.updateMany({
      where: {
        id: notificationId,
        userId: user.id,
      },
      data: { read },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');
    const notificationId = searchParams.get('notificationId');

    if (!walletAddress || !notificationId) {
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

    await prisma!.notification.deleteMany({
      where: {
        id: notificationId,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
