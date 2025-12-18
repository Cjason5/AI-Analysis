import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseAvailable } from '@/lib/prisma';
import { sanitizeWalletAddress, validateAlertCondition, validatePrice } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = sanitizeWalletAddress(searchParams.get('walletAddress'));

    if (!walletAddress) {
      return NextResponse.json({ alerts: [] });
    }

    if (!isDatabaseAvailable()) {
      return NextResponse.json({ alerts: [] });
    }

    const user = await prisma!.user.findUnique({
      where: { walletAddress },
      include: { alerts: { orderBy: { createdAt: 'desc' } } },
    });

    return NextResponse.json({
      alerts: user?.alerts || [],
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ alerts: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenSymbol, tokenName, exchange, email } = body;

    // Validate and sanitize inputs
    const walletAddress = sanitizeWalletAddress(body.walletAddress);
    const condition = validateAlertCondition(body.condition);
    const targetPrice = validatePrice(body.targetPrice);

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    if (!tokenSymbol || !exchange || !condition || targetPrice === null) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
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

    // Create alert
    const alert = await prisma!.priceAlert.create({
      data: {
        userId: user.id,
        tokenSymbol,
        tokenName: tokenName || tokenSymbol,
        exchange,
        condition,
        targetPrice,
        email,
      },
    });

    return NextResponse.json({ success: true, alert });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertId, isActive } = body;

    // Validate wallet address
    const walletAddress = sanitizeWalletAddress(body.walletAddress);

    if (!alertId || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
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

    const alert = await prisma!.priceAlert.updateMany({
      where: {
        id: alertId,
        userId: user.id,
      },
      data: { isActive },
    });

    return NextResponse.json({ success: true, alert });
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const alertId = searchParams.get('alertId');

    // Validate wallet address
    const walletAddress = sanitizeWalletAddress(searchParams.get('walletAddress'));

    if (!alertId || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
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

    await prisma!.priceAlert.deleteMany({
      where: {
        id: alertId,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    );
  }
}
