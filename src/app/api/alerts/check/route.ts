import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseAvailable } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    if (!isDatabaseAvailable()) {
      return NextResponse.json({ triggeredAlerts: [] });
    }

    // Get user with active alerts
    const user = await prisma!.user.findUnique({
      where: { walletAddress },
      include: {
        alerts: {
          where: {
            isActive: true,
            triggered: false,
          },
        },
      },
    });

    if (!user || user.alerts.length === 0) {
      return NextResponse.json({ triggeredAlerts: [] });
    }

    // Fetch current prices for the tokens in alerts
    const tokenPrices = new Map<string, number>();

    // Fetch all tokens to get current prices
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tokens?limit=5000`);
    if (response.ok) {
      const data = await response.json();
      for (const token of data.tokens) {
        const key = `${token.exchange}-${token.symbol}`;
        tokenPrices.set(key, token.price);
      }
    }

    const triggeredAlerts: Array<{
      id: string;
      tokenSymbol: string;
      tokenName: string;
      exchange: string;
      condition: string;
      targetPrice: number;
      currentPrice: number;
    }> = [];

    // Check each alert
    for (const alert of user.alerts) {
      const key = `${alert.exchange}-${alert.tokenSymbol}`;
      const currentPrice = tokenPrices.get(key);

      if (currentPrice === undefined) continue;

      let isTriggered = false;

      if (alert.condition === 'above' && currentPrice >= alert.targetPrice) {
        isTriggered = true;
      } else if (alert.condition === 'below' && currentPrice <= alert.targetPrice) {
        isTriggered = true;
      }

      if (isTriggered) {
        // Mark alert as triggered
        await prisma!.priceAlert.update({
          where: { id: alert.id },
          data: { triggered: true, isActive: false },
        });

        // Create notification
        await prisma!.notification.create({
          data: {
            userId: user.id,
            type: 'price_alert',
            title: `Price Alert: ${alert.tokenSymbol}`,
            message: `${alert.tokenSymbol} is now ${alert.condition} $${alert.targetPrice.toFixed(2)}. Current price: $${currentPrice.toFixed(2)}`,
            tokenSymbol: alert.tokenSymbol,
            exchange: alert.exchange,
            targetPrice: alert.targetPrice,
            currentPrice: currentPrice,
            condition: alert.condition,
          },
        });

        triggeredAlerts.push({
          id: alert.id,
          tokenSymbol: alert.tokenSymbol,
          tokenName: alert.tokenName,
          exchange: alert.exchange,
          condition: alert.condition,
          targetPrice: alert.targetPrice,
          currentPrice: currentPrice,
        });
      }
    }

    return NextResponse.json({
      triggeredAlerts,
      checkedCount: user.alerts.length,
    });
  } catch (error) {
    console.error('Error checking alerts:', error);
    return NextResponse.json(
      { error: 'Failed to check alerts' },
      { status: 500 }
    );
  }
}
