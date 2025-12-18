import { NextRequest, NextResponse } from 'next/server';
import { fetchExchangeTokens, fetchGlobalMetrics } from '@/lib/coinmarketcap';
import { ExchangeId } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const exchange = searchParams.get('exchange') as ExchangeId | 'all' | null;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'marketCap';
    const direction = searchParams.get('direction') || 'desc';

    // Fetch tokens from CoinMarketCap filtered by exchange (up to 5000 tokens)
    const { tokens, total } = await fetchExchangeTokens(exchange || 'all', 5000);

    // Apply search filter
    let filteredTokens = [...tokens];
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTokens = tokens.filter(
        (token) =>
          token.symbol.toLowerCase().includes(searchLower) ||
          token.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filteredTokens.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortBy) {
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'volume':
          aValue = a.volume24h || 0;
          bValue = b.volume24h || 0;
          break;
        case 'change24h':
          aValue = a.change24h || 0;
          bValue = b.change24h || 0;
          break;
        case 'marketCap':
        default:
          aValue = a.marketCap || 0;
          bValue = b.marketCap || 0;
          break;
      }

      return direction === 'desc' ? bValue - aValue : aValue - bValue;
    });

    // Apply pagination
    const paginatedTokens = filteredTokens.slice(offset, offset + limit);

    // Fetch global metrics from CoinMarketCap
    const globalMetrics = await fetchGlobalMetrics();

    return NextResponse.json({
      tokens: paginatedTokens,
      total: filteredTokens.length,
      page: Math.floor(offset / limit) + 1,
      limit,
      // Global market stats from CoinMarketCap
      totalVolume: globalMetrics.totalVolume24h,
      totalMarketCap: globalMetrics.totalMarketCap,
    });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    );
  }
}
