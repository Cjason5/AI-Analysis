import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseAvailable } from '@/lib/prisma';
import { getTopRankedSymbols } from '@/lib/coinmarketcap';

const API_SECRET = process.env.SETUPS_API_SECRET || '';

// Only display signals for the top-N tradeable tokens by market cap. The droplet
// forwarder already restricts to its own (stablecoin-free) top-N, but we re-check
// against CoinMarketCap's authoritative ranking on BOTH paths: POST rejects (and
// purges) below-rank tokens at ingest, and GET filters them out at serve time as
// the correctness backstop (catches rows that stopped being forwarded, pre-guard
// rows, and CMC fail-open batches). Stablecoins are excluded so the guard mirrors
// the forwarder's universe (see getTopRankedSymbols).
const TOP_N_BY_MARKET_CAP = 35;

function verifyAuth(request: NextRequest): boolean {
  if (!API_SECRET) return true; // No secret configured = open (dev mode)
  const auth = request.headers.get('x-api-key');
  return auth === API_SECRET;
}

/**
 * GET /api/setups — Fetch all active setups for the Setups page.
 * Query params: status, market, limit, offset
 */
export async function GET(request: NextRequest) {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ setups: [], total: 0 }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // ACTIVE | PENDING
    const market = searchParams.get('market'); // SPOT | FUTURES
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (market) where.market = market;

    // Only show non-expired setups
    where.OR = [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } },
    ];

    // Display only top-N-by-market-cap tokens (authoritative CMC rank). This is
    // the correctness backstop: it hides any stored below-rank row regardless of
    // how it got there (a token that simply stopped being forwarded, a deploy
    // before this guard existed, or a CMC fail-open ingest batch). Fail OPEN —
    // no rank filter when the ranking is unavailable — so a CMC outage never
    // blanks the feed. Match both CMC casing and uppercased form for robustness.
    const topSymbols = await getTopRankedSymbols(TOP_N_BY_MARKET_CAP);
    if (topSymbols) {
      // Prisma `in` is case-sensitive, so include every realistic casing of each
      // allowed symbol (CMC original e.g. "XAUt", upper, lower) to stay symmetric
      // with the case-insensitive ingest check.
      where.symbol = {
        in: [
          ...new Set(
            [...topSymbols].flatMap((s) => [s, s.toUpperCase(), s.toLowerCase()]),
          ),
        ],
      };
    }

    const [setups, total] = await Promise.all([
      prisma!.setup.findMany({
        where,
        orderBy: [
          // Pure freshness — no preference by status or confluence. The newest
          // signals sit at the top regardless of type. The forwarder re-POSTs
          // every cycle, so updatedAt = "last confirmed" time; signals the engine
          // stops producing go stale, sink, and expire out.
          { updatedAt: 'desc' },
          { createdAt: 'desc' }, // stable tie-break for identical updatedAt
        ],
        take: limit,
        skip: offset,
      }),
      prisma!.setup.count({ where }),
    ]);

    return NextResponse.json({
      setups: setups.map((s) => ({
        id: s.id,
        symbol: s.symbol,
        name: s.name,
        exchange: s.exchange,
        market: s.market,
        action: s.action,
        direction: s.direction,
        status: s.status,
        confluenceScore: s.confluenceScore,
        confidence: s.confidence,
        entryMid: s.entryMid,
        stopLoss: s.stopLoss,
        tp1: s.tp1,
        tp2: s.tp2,
        riskReward: s.riskReward,
        currentPrice: s.currentPrice,
        distancePct: s.distancePct,
        marketCap: s.marketCap,
        modules: s.modules ? s.modules.split(',') : [],
        tradeHorizon: s.tradeHorizon,
        htfTrend: s.htfTrend,
        zoneGrade: s.zoneGrade,
        analysisTier: s.analysisTier,
        positionSize: s.positionSize,
        riskUsd: s.riskUsd,
        logoUrl: s.logoUrl,
        scanSource: s.scanSource,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
        expiresAt: s.expiresAt?.toISOString() || null,
      })),
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[Setups GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch setups' }, { status: 500 });
  }
}

/**
 * POST /api/setups — Receive signals from the Python signal forwarder.
 * Protected by x-api-key header.
 * Body: { signals: [...] }
 */
export async function POST(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isDatabaseAvailable()) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const signals = body.signals;

    if (!Array.isArray(signals) || signals.length === 0) {
      return NextResponse.json({ error: 'signals array required' }, { status: 400 });
    }

    // Authoritative top-N-by-market-cap guard (CoinMarketCap rank, stablecoins
    // excluded). Null when the ranking is unavailable (no API key / CMC outage) —
    // in that case we fail OPEN and skip the guard rather than hiding signals.
    // Compare uppercased (CMC uses mixed case for some symbols, e.g. XAUt).
    const topSymbols = await getTopRankedSymbols(TOP_N_BY_MARKET_CAP);
    const allowUpper = topSymbols
      ? new Set([...topSymbols].map((s) => s.toUpperCase()))
      : null;

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let filteredByRank = 0;
    const droppedSymbols = new Set<string>(); // below top-N → purge from display

    for (const sig of signals) {
      if (!sig.signal_hash || !sig.symbol) {
        skipped++;
        continue;
      }

      // Reject signals for tokens outside the top-N tradeable by market cap.
      if (allowUpper && !allowUpper.has(String(sig.symbol).toUpperCase())) {
        filteredByRank++;
        droppedSymbols.add(sig.symbol); // original case → matches stored rows
        continue;
      }

      const data = {
        symbol: sig.symbol,
        name: sig.name || null,
        exchange: sig.exchange || 'binance',
        market: sig.market || 'FUTURES',
        action: sig.action || sig.direction,
        direction: sig.direction || 'LONG',
        status: sig.status || 'PENDING',
        confluenceScore: sig.confluence_score || 1,
        confidence: sig.confidence || 0,
        entryMid: sig.entry_mid || null,
        stopLoss: sig.stop_loss || null,
        tp1: sig.tp1 || null,
        tp2: sig.tp2 || null,
        riskReward: sig.risk_reward || null,
        currentPrice: sig.current_price || sig.price || null,
        distancePct: sig.distance_pct || null,
        marketCap: sig.market_cap || null,
        modules: Array.isArray(sig.modules) ? sig.modules.join(',') : (sig.modules || ''),
        tradeHorizon: sig.trade_horizon || null,
        htfTrend: sig.htf_trend || null,
        zoneGrade: sig.zone_grade || null,
        analysisTier: sig.analysis_tier || null,
        positionSize: sig.position_size || null,
        riskUsd: sig.risk_usd || null,
        logoUrl: sig.logo || null,
        scanSource: sig.scan_source || 'auto',
        expiresAt: sig.expires_at ? new Date(sig.expires_at) : null,
      };

      // Upsert: update if same signal_hash exists, create if new
      const existing = await prisma!.setup.findUnique({
        where: { signalHash: sig.signal_hash },
      });

      if (existing) {
        await prisma!.setup.update({
          where: { signalHash: sig.signal_hash },
          data: {
            ...data,
            updatedAt: new Date(),
          },
        });
        updated++;
      } else {
        await prisma!.setup.create({
          data: {
            signalHash: sig.signal_hash,
            ...data,
          },
        });
        created++;
      }
    }

    // Purge any previously-stored rows for tokens that have now dropped below the
    // top-N threshold, so they disappear from the setups page immediately rather
    // than lingering until expiry.
    let purged = 0;
    if (droppedSymbols.size > 0) {
      const res = await prisma!.setup.deleteMany({
        where: { symbol: { in: [...droppedSymbols] } },
      });
      purged = res.count;
    }

    return NextResponse.json({
      success: true,
      created,
      updated,
      skipped,
      filteredByRank,
      purged,
      total: signals.length,
    });
  } catch (error) {
    console.error('[Setups POST] Error:', error);
    return NextResponse.json({ error: 'Failed to save setups' }, { status: 500 });
  }
}

/**
 * DELETE /api/setups — Clean up expired setups.
 * Protected by x-api-key header.
 */
export async function DELETE(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isDatabaseAvailable()) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  try {
    const result = await prisma!.setup.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    console.error('[Setups DELETE] Error:', error);
    return NextResponse.json({ error: 'Failed to clean setups' }, { status: 500 });
  }
}
