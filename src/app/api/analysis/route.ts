import { NextRequest, NextResponse } from 'next/server';
import { Connection } from '@solana/web3.js';
import { fetchAllTimeframes } from '@/lib/exchanges';
import { findExchangeForToken } from '@/lib/coinmarketcap';
import { fetchCryptoNews } from '@/lib/newsapi';
import { analyzeSentiment } from '@/lib/openai';
import { generateTradingSignals } from '@/lib/gemini';
import { verifyPaymentTransaction, PAYMENT_CONFIG } from '@/lib/solana-payment';
import { ExchangeId } from '@/types';
import { prisma, isDatabaseAvailable } from '@/lib/prisma';

// Get Solana connection
function getConnection(): Connection {
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
  return new Connection(rpcUrl, 'confirmed');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tokenSymbol,
      tokenName,
      tokenId, // CMC ID for accurate exchange matching
      exchange,
      currentPrice,
      walletAddress,
      paymentSignature,
      referrerWallet, // Wallet address of the referrer (if any)
    } = body;

    if (!tokenSymbol || !exchange || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify payment - require payment signature
    if (paymentSignature) {
      const connection = getConnection();
      console.log(`Verifying payment transaction: ${paymentSignature}`);
      // Pass referrerWallet to verification so it counts the referral commission as part of total payment
      const verification = await verifyPaymentTransaction(connection, paymentSignature, undefined, referrerWallet);

      if (!verification.verified) {
        console.error('Payment verification failed:', verification.error);
        return NextResponse.json(
          { error: `Payment verification failed: ${verification.error}` },
          { status: 402 }
        );
      }
      console.log('Payment verified successfully');

      // Record referral earning if there's a referrer
      if (referrerWallet && isDatabaseAvailable()) {
        try {
          // Find or create the user
          const user = await prisma!.user.upsert({
            where: { walletAddress },
            update: {},
            create: { walletAddress },
          });

          // Find the referrer
          const referrer = await prisma!.user.findUnique({
            where: { walletAddress: referrerWallet },
          });

          if (referrer) {
            // Calculate commission amount (10% of total fee)
            const totalFee = PAYMENT_CONFIG.totalAmount;
            const commissionAmount = totalFee * (PAYMENT_CONFIG.referralCommissionPercentage / 100);

            // Record the referral earning
            await prisma!.referralEarning.create({
              data: {
                referrerId: referrer.id,
                downlineId: user.id,
                txSignature: paymentSignature,
                commissionAmount,
                totalFee,
              },
            });

            console.log(`Recorded referral earning: ${commissionAmount} USDC to ${referrerWallet}`);
          }
        } catch (err) {
          // Log but don't fail the analysis if referral recording fails
          console.error('Error recording referral earning:', err);
        }
      }
    } else {
      // No payment provided - for development only
      console.warn('No payment provided - proceeding without verification (dev mode)');
    }

    // Determine which exchange to use for candlestick data
    let analysisExchange: ExchangeId = exchange as ExchangeId;

    // If "all" exchanges selected, find an exchange where this token is listed
    if (exchange === 'all' || !exchange) {
      // Pass CMC ID for accurate matching (avoids symbol collisions like multiple "MAT" tokens)
      const cmcId = tokenId ? parseInt(tokenId, 10) : undefined;
      const foundExchange = await findExchangeForToken(tokenSymbol, cmcId);
      if (foundExchange) {
        analysisExchange = foundExchange;
        console.log(`Token ${tokenSymbol} (ID: ${cmcId}) found on ${foundExchange}, using for analysis`);
      } else {
        // Default to Binance if token not found on any exchange
        analysisExchange = 'binance';
        console.log(`Token ${tokenSymbol} not found on specific exchange, defaulting to Binance`);
      }
    }

    console.log(`Starting analysis for ${tokenSymbol} on ${analysisExchange}`);

    // Fetch all data in parallel
    const [candleData, newsArticles] = await Promise.all([
      fetchAllTimeframes(analysisExchange, tokenSymbol),
      fetchCryptoNews(),
    ]);

    console.log(`Fetched ${candleData.length} timeframes and ${newsArticles.length} news articles`);

    // Generate sentiment analysis
    const sentiment = await analyzeSentiment(newsArticles);
    console.log('Sentiment analysis complete');

    // Generate trading signals
    const analysis = await generateTradingSignals(
      tokenSymbol,
      analysisExchange,
      candleData,
      sentiment
    );
    console.log('Trading signals generated');

    return NextResponse.json({
      success: true,
      analysis,
      sentiment,
      tokenSymbol,
      tokenName,
      exchange: analysisExchange, // Return the actual exchange used for analysis
      currentPrice,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating analysis:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}
