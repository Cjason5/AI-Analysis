import { Token, ExchangeId } from '@/types';

const CMC_API_KEY = process.env.COINMARKETCAP_API_KEY;
const CMC_BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

interface CMCQuote {
  price: number;
  volume_24h: number;
  percent_change_24h: number;
  market_cap: number;
}

interface CMCCoin {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number;
  quote: {
    USD: CMCQuote;
  };
}

interface CMCListingsResponse {
  data: CMCCoin[];
  status: {
    total_count: number;
  };
}

// Map exchange ID to CMC exchange slug
const EXCHANGE_SLUGS: Record<ExchangeId, string> = {
  binance: 'binance',
  coinbase: 'coinbase-exchange',
  bybit: 'bybit',
  okx: 'okx',
  kraken: 'kraken',
  kucoin: 'kucoin',
  bitfinex: 'bitfinex',
  gateio: 'gate-io',
  htx: 'htx',
  mexc: 'mexc',
  upbit: 'upbit',
  bitget: 'bitget',
  cryptocom: 'crypto-com-exchange',
  lbank: 'lbank',
  bitmart: 'bitmart',
  bingx: 'bingx',
};

// Cache for exchange symbols (which tokens are listed on which exchange)
// Now stores Map<symbol, Set<cmcId>> to handle symbol collisions (e.g., multiple tokens with symbol "MAT")
const exchangeSymbolsCache: Map<ExchangeId, { symbols: Map<string, Set<number>>; timestamp: number }> = new Map();
const EXCHANGE_CACHE_TTL = 300000; // 5 minutes

// Helper function to fetch with timeout and retries
async function fetchWithRetry(urls: string[], timeout: number = 15000): Promise<Response | null> {
  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
        cache: 'no-store',
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        console.log(`Successfully fetched: ${url}`);
        return res;
      }
      console.log(`Failed to fetch ${url}: HTTP ${res.status}`);
    } catch (error) {
      console.log(`Failed to fetch ${url}:`, (error as Error).message);
    }
  }
  return null;
}

// Fallback symbols for exchanges that can't be reached directly
// Top 500+ cryptocurrencies by market cap from CoinMarketCap
const COMMON_CRYPTO_SYMBOLS = [
  // Top 100
  'BTC', 'ETH', 'XRP', 'BNB', 'SOL', 'TRX', 'DOGE', 'ADA', 'BCH', 'LINK',
  'XLM', 'XMR', 'LTC', 'SUI', 'AVAX', 'HBAR', 'SHIB', 'CRO', 'TON', 'DOT',
  'UNI', 'TAO', 'AAVE', 'OKB', 'NEAR', 'ETC', 'ICP', 'PEPE', 'KAS', 'WLD',
  'KCS', 'APT', 'POL', 'ALGO', 'ARB', 'QNT', 'VET', 'FIL', 'ATOM', 'RENDER',
  'SEI', 'GT', 'CAKE', 'BONK', 'JUP', 'DASH', 'OP', 'IMX', 'CRV', 'INJ',
  'FET', 'STX', 'LDO', 'XTZ', 'TIA', 'FLOKI', 'ENS', 'IOTA', 'PENDLE', 'PYTH',
  'WIF', 'BAT', 'SAND', 'CFX', 'HNT', 'FLOW', 'GALA', 'JASMY', 'GNO', 'THETA',
  'COMP', 'RAY', 'CHZ', 'MANA', 'NEO', 'LUNC', 'AR', 'EGLD', 'RUNE', 'GLM',
  'DYDX', 'LPT', 'JTO', 'AXS', 'SNX', 'APE', 'BEAM', 'TURBO', 'ZEN', 'QTUM',
  'KSM', 'AIOZ', 'CORE', 'YFI', 'CKB', 'AKT', 'KAVA', 'ZRX', 'AXL', 'RVN',
  // 100-200
  'MINA', 'RON', 'MOG', 'DOG', 'SNEK', 'ASTR', 'EDU', 'SAFE', 'ZIL', 'CELO',
  'DRIFT', 'MEW', 'ALEO', 'SUSHI', 'BIO', 'BLUR', 'VTHO', 'SC', 'GMX', 'HOT',
  'WAVES', 'OM', 'ORDI', 'GRASS', 'ORCA', 'SKL', 'ANKR', 'IOTX', 'ELF', 'CSPR',
  'SNT', 'LUNA', 'MEME', 'LRC', 'BAND', 'COTI', 'MASK', 'RLC', 'POLYX', 'ONT',
  'ALT', 'STORJ', 'ENJ', 'ONE', 'IOST', 'NOT', 'GMT', 'RPL', 'HIVE', 'KNC',
  'SSV', 'LSK', 'FLUX', 'ARKM', 'YGG', 'ILV', 'WOO', 'BOME', 'BIGTIME', 'ORBS',
  'BAL', 'AUDIO', 'METIS', 'SPELL', 'API3', 'CHR', 'IQ', 'PRIME', 'SXP', 'MANTA',
  'SCRT', 'STEEM', 'WAXP', 'ONG', 'DIA', 'USUAL', 'GOAT', 'GNS', 'DYM', 'LUSD',
  'AUCTION', 'POND', 'MTL', 'SONIC', 'CTSI', 'PHA', 'POKT', 'PIXEL', 'BANANA', 'XAI',
  'MAGIC', 'CELR', 'MOVR', 'REZ', 'JOE', 'WIN', 'DEGEN', 'VRA', 'OXT', 'C98',
  // 200-300
  'GODS', 'GLMR', 'ACT', 'PYR', 'WXT', 'BOBA', 'AGLD', 'CETUS', 'MAV', 'FUN',
  'DENT', 'SAGA', 'OGN', 'ALICE', 'ARPA', 'HFT', 'VANRY', 'GPS', 'NTRN', 'RARE',
  'HIGH', 'PONKE', 'PHB', 'ATA', 'LYX', 'EVER', 'MBOX', 'SYS', 'ACE', 'SHELL',
  'KLV', 'SCR', 'AVAIL', 'TKO', 'GEAR', 'TRU', 'DODO', 'ZEX', 'RAD', 'NEON',
  'RAMP', 'NFP', 'TLM', 'EDEN', 'HMSTR', 'WAN', 'BTG', 'OAS', 'RDNT', 'FARM',
  'GTC', 'DF', 'ICE', 'XEM', 'IDEX', 'RSS3', 'FUEL', 'PNK', 'REP', 'ACA',
  'FWOG', 'NOS', 'RACA', 'OMG', 'POLIS', 'APX', 'MAVIA', 'HOOK', 'PSP', 'BEL',
  'PUFFER', 'TLOS', 'BETA', 'BRISE', 'POLS', 'PNG', 'PERP', 'FXS', 'OCEAN',
  'REN', 'NKN', 'LOOM', 'REQ', 'AMP', 'CVX', 'TFUEL', 'GAS', 'BNT', 'SWFTC',
  'STRAX', 'FIRO', 'ERG', 'USTC', 'NYM', 'FORTH', 'ALCX', 'OLAS', 'BONE',
  // 300-400
  'BADGER', 'SHDW', 'SWEAT', 'SLP', 'BTRST', 'QKC', 'AERGO', 'WILD', 'WRX',
  'SANTOS', 'LAZIO', 'PORTO', 'PSG', 'ASR', 'ATM', 'JUV', 'BAR', 'ACM', 'CITY',
  'OG', 'TRB', 'ARDR', 'ARK', 'CVC', 'DNT', 'MLN', 'ADX', 'VITE', 'DOCK',
  'KEY', 'MFT', 'TROY', 'VIDT', 'HARD', 'STPT', 'SYN', 'TRIBE', 'POND', 'QUICK',
  'GHST', 'ALPHA', 'TORN', 'LINA', 'FIS', 'UNFI', 'MDX', 'TWT', 'BURGER', 'WING',
  'CHESS', 'FIDA', 'MNGO', 'STEP', 'COPE', 'SBR', 'TULIP', 'SLIM', 'SUNNY',
  'ATLAS', 'POLIS', 'GST', 'SAMO', 'ORCA', 'MNDE', 'PORT', 'LARIX', 'JET',
  'PRISM', 'MEAN', 'UXD', 'RATIO', 'HUBBLE', 'NINJA', 'BOKU', 'DUST', 'FORGE',
  'CROWN', 'CHICKS', 'HADES', 'YAKU', 'AURORA', 'FLX', 'PERION', 'SHRAP', 'SUPER',
  // 400-500
  'LEVER', 'PROS', 'VOXEL', 'RARE', 'COMBO', 'MAV', 'PENDLE', 'CYBER', 'ARKM',
  'ORION', 'GHST', 'PUNDIX', 'STRK', 'ZKF', 'DYP', 'EURT', 'SEUR', 'BICO',
  'OOKI', 'UFT', 'PROM', 'ORN', 'DEGO', 'TVK', 'POND', 'KP3R', 'BOND', 'ALPHA',
  'HEGIC', 'CREAM', 'COVER', 'MPL', 'DOLA', 'FRAX', 'MIM', 'SPELL', 'ICE',
  'agEUR', 'EURA', 'GHO', 'crvUSD', 'PYUSD', 'FDUSD', 'TUSD', 'USDP', 'GUSD',
  'PAX', 'BUSD', 'DAI', 'USDD', 'FRAX', 'LUSD', 'SUSD', 'MIM', 'UST', 'USTC',
  'CUSD', 'RSV', 'FEI', 'BEAN', 'OHM', 'KLIMA', 'BTRFLY', 'SPA', 'FXS', 'FPIS',
  'VSTA', 'LQTY', 'SDL', 'CVX', 'CONVEX', 'BTRST', 'GEL', 'INDEX', 'MVI', 'BED'
];

// Interface for CMC market pairs response
interface CMCMarketPair {
  market_id: number;
  market_pair: string;
  category: string;
  fee_type: string;
  market_pair_base: {
    currency_id: number;
    currency_symbol: string;
    currency_type: string;
    exchange_symbol: string;
  };
  market_pair_quote: {
    currency_id: number;
    currency_symbol: string;
    currency_type: string;
    exchange_symbol: string;
  };
}

interface CMCMarketPairsResponse {
  data: {
    id: number;
    name: string;
    slug: string;
    num_market_pairs: number;
    market_pairs: CMCMarketPair[];
  };
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    credit_count: number;
  };
}

// Fetch exchange market pairs from CMC API (Standard Plan endpoint)
// This is the primary and most accurate source for exchange token listings
// Returns Map<symbol, Set<cmcId>> to handle tokens with same symbol (e.g., multiple "MAT" tokens)
async function fetchExchangeMarketPairs(exchange: ExchangeId): Promise<Map<string, Set<number>> | null> {
  if (!CMC_API_KEY) {
    console.log('CMC API key not configured');
    return null;
  }

  const exchangeSlug = EXCHANGE_SLUGS[exchange];
  if (!exchangeSlug) {
    console.log(`No slug mapping for exchange: ${exchange}`);
    return null;
  }

  try {
    // Use CMC exchange/market-pairs/latest endpoint (Standard Plan)
    // This returns ALL market pairs for the exchange
    // We fetch up to 5000 market pairs per exchange to ensure comprehensive coverage
    const response = await fetch(
      `${CMC_BASE_URL}/exchange/market-pairs/latest?slug=${exchangeSlug}&limit=5000&category=spot`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': CMC_API_KEY,
          Accept: 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CMC market-pairs API error for ${exchange}: ${response.status}`, errorText);
      return null;
    }

    const data: CMCMarketPairsResponse = await response.json();
    // Map symbol -> Set of CMC IDs (to handle symbol collisions like multiple "MAT" tokens)
    const symbolIdMap = new Map<string, Set<number>>();

    if (data.data?.market_pairs && Array.isArray(data.data.market_pairs)) {
      data.data.market_pairs.forEach((pair) => {
        // Get the base currency symbol and ID (the token being traded)
        // We want spot pairs with common quote currencies (USDT, USD, USDC, BTC, ETH, etc.)
        const baseSymbol = pair.market_pair_base?.currency_symbol;
        const baseCmcId = pair.market_pair_base?.currency_id;
        const quoteSymbol = pair.market_pair_quote?.currency_symbol;

        // Include tokens from spot market pairs with stable/major quote currencies
        if (baseSymbol && baseCmcId && pair.category === 'spot') {
          // Filter for common quote currencies to get actual tradeable tokens
          const validQuotes = ['USDT', 'USD', 'USDC', 'BUSD', 'BTC', 'ETH', 'TUSD', 'DAI', 'FDUSD'];
          if (validQuotes.includes(quoteSymbol)) {
            if (!symbolIdMap.has(baseSymbol)) {
              symbolIdMap.set(baseSymbol, new Set<number>());
            }
            symbolIdMap.get(baseSymbol)!.add(baseCmcId);
          }
        }
      });

      console.log(`CMC market-pairs API returned ${symbolIdMap.size} unique symbols for ${exchange} (${data.data.num_market_pairs} total pairs)`);
      return symbolIdMap;
    }

    console.log(`CMC market-pairs API returned no data for ${exchange}`);
    return null;
  } catch (error) {
    console.error(`CMC market-pairs API failed for ${exchange}:`, (error as Error).message);
    return null;
  }
}

// Legacy function - kept for backwards compatibility but now uses market-pairs endpoint
async function fetchExchangeSymbolsFromCMC(exchange: ExchangeId): Promise<Map<string, Set<number>> | null> {
  // Use the new market-pairs endpoint as primary source
  return fetchExchangeMarketPairs(exchange);
}

// Fetch which symbols are listed on a specific exchange
// Primary source: CoinMarketCap /exchange/market-pairs/latest (Standard Plan)
// Fallback: Individual exchange APIs (for when CMC is unavailable)
// Returns Map<symbol, Set<cmcId>> to handle symbol collisions
async function fetchExchangeSymbols(exchange: ExchangeId): Promise<Map<string, Set<number>>> {
  const cached = exchangeSymbolsCache.get(exchange);
  if (cached && Date.now() - cached.timestamp < EXCHANGE_CACHE_TTL) {
    console.log(`Using cached symbols for ${exchange}: ${cached.symbols.size} symbols`);
    return cached.symbols;
  }

  let symbolIdMap = new Map<string, Set<number>>();

  // PRIMARY SOURCE: CMC market-pairs endpoint (most accurate, covers all exchanges)
  console.log(`Fetching symbols for ${exchange} from CMC market-pairs API...`);
  const cmcSymbols = await fetchExchangeMarketPairs(exchange);
  if (cmcSymbols && cmcSymbols.size > 0) {
    symbolIdMap = cmcSymbols;
    exchangeSymbolsCache.set(exchange, { symbols: symbolIdMap, timestamp: Date.now() });
    console.log(`Cached ${symbolIdMap.size} symbols for ${exchange} from CMC`);
    return symbolIdMap;
  }

  // FALLBACK: Individual exchange APIs (only if CMC fails)
  // Note: Fallback APIs don't provide CMC IDs, so we use ID=0 as placeholder
  // meaning "unknown - match any token with this symbol" (less accurate but better than nothing)
  console.log(`CMC market-pairs failed for ${exchange}, trying direct exchange API...`);

  // Helper to add symbol to map with unknown ID (0)
  const addSymbol = (sym: string) => {
    if (!symbolIdMap.has(sym)) {
      symbolIdMap.set(sym, new Set<number>());
    }
    symbolIdMap.get(sym)!.add(0); // ID=0 means "unknown, match by symbol only"
  };

  try {
    switch (exchange) {
      case 'binance': {
        // Use data-api.binance.vision - globally accessible
        const res = await fetchWithRetry([
          'https://data-api.binance.vision/api/v3/exchangeInfo',
          'https://api1.binance.com/api/v3/exchangeInfo',
          'https://api2.binance.com/api/v3/exchangeInfo',
        ]);
        if (res) {
          const data = await res.json();
          data.symbols
            ?.filter((s: { quoteAsset: string; status: string }) => s.quoteAsset === 'USDT' && s.status === 'TRADING')
            .forEach((s: { baseAsset: string }) => addSymbol(s.baseAsset));
          console.log(`Binance: Found ${symbolIdMap.size} symbols`);
        }
        break;
      }
      case 'coinbase': {
        // Coinbase public API endpoints
        const res = await fetchWithRetry([
          'https://api.exchange.coinbase.com/products',
          'https://api.pro.coinbase.com/products',
          'https://api.coinbase.com/v2/exchange-rates?currency=USD',
        ]);
        if (res) {
          const data = await res.json();
          // Handle different response formats
          if (Array.isArray(data)) {
            data
              .filter((p: { quote_currency?: string; status?: string }) =>
                (p.quote_currency === 'USD' || p.quote_currency === 'USDT') &&
                (!p.status || p.status === 'online'))
              .forEach((p: { base_currency: string }) => addSymbol(p.base_currency));
          } else if (data.data?.rates) {
            // Exchange rates format - extract currency symbols
            Object.keys(data.data.rates).forEach((symbol: string) => {
              if (symbol.length >= 2 && symbol.length <= 10) {
                addSymbol(symbol);
              }
            });
          }
          console.log(`Coinbase: Found ${symbolIdMap.size} symbols`);
        }
        break;
      }
      case 'bybit': {
        // Bybit API endpoints
        const res = await fetchWithRetry([
          'https://api.bybit.com/v5/market/instruments-info?category=spot',
          'https://api.bytick.com/v5/market/instruments-info?category=spot',
        ]);
        if (res) {
          const data = await res.json();
          data.result?.list
            ?.filter((s: { quoteCoin: string; status: string }) => s.quoteCoin === 'USDT' && s.status === 'Trading')
            .forEach((s: { baseCoin: string }) => addSymbol(s.baseCoin));
          console.log(`Bybit: Found ${symbolIdMap.size} symbols`);
        }
        break;
      }
      case 'okx': {
        // OKX public API
        const res = await fetchWithRetry([
          'https://www.okx.com/api/v5/public/instruments?instType=SPOT',
          'https://aws.okx.com/api/v5/public/instruments?instType=SPOT',
        ]);
        if (res) {
          const data = await res.json();
          data.data
            ?.filter((s: { instId: string; state: string }) => s.instId.endsWith('-USDT') && s.state === 'live')
            .forEach((s: { baseCcy: string }) => addSymbol(s.baseCcy));
          console.log(`OKX: Found ${symbolIdMap.size} symbols`);
        }
        break;
      }
      case 'kraken': {
        // Kraken public API
        const res = await fetchWithRetry([
          'https://api.kraken.com/0/public/AssetPairs',
          'https://futures.kraken.com/derivatives/api/v3/instruments',
        ]);
        if (res) {
          const data = await res.json();
          if (data.result) {
            Object.values(data.result).forEach((pair: unknown) => {
              const p = pair as { quote: string; base: string; wsname?: string };
              if (p.quote === 'ZUSD' || p.quote === 'USD' || p.quote === 'USDT') {
                let base = p.base;
                if (base.startsWith('X') && base.length > 3) base = base.slice(1);
                if (base === 'XBT') base = 'BTC';
                addSymbol(base);
              }
            });
          } else if (data.instruments) {
            // Futures API format
            data.instruments
              .filter((i: { symbol: string }) => i.symbol.includes('USD'))
              .forEach((i: { symbol: string }) => {
                const base = i.symbol.split('_')[0].replace('XBT', 'BTC');
                addSymbol(base);
              });
          }
          console.log(`Kraken: Found ${symbolIdMap.size} symbols`);
        }
        break;
      }
      case 'kucoin': {
        // KuCoin API endpoints
        const res = await fetchWithRetry([
          'https://api.kucoin.com/api/v1/symbols',
          'https://api.kucoin.com/api/v2/symbols',
        ]);
        if (res) {
          const data = await res.json();
          data.data
            ?.filter((s: { quoteCurrency: string; enableTrading: boolean }) => s.quoteCurrency === 'USDT' && s.enableTrading)
            .forEach((s: { baseCurrency: string }) => addSymbol(s.baseCurrency));
          console.log(`KuCoin: Found ${symbolIdMap.size} symbols`);
        }
        break;
      }
      case 'bitfinex': {
        // Bitfinex public API
        const res = await fetchWithRetry([
          'https://api-pub.bitfinex.com/v2/conf/pub:list:pair:exchange',
          'https://api.bitfinex.com/v1/symbols',
        ]);
        if (res) {
          const data = await res.json();
          if (Array.isArray(data) && Array.isArray(data[0])) {
            // v2 format
            data[0]
              ?.filter((pair: string) => pair.endsWith('USD') || pair.endsWith('UST'))
              .forEach((pair: string) => {
                const base = pair.replace(/USD$|UST$/, '');
                if (base.length >= 2) addSymbol(base.toUpperCase());
              });
          } else if (Array.isArray(data)) {
            // v1 format
            data
              .filter((pair: string) => pair.endsWith('usd'))
              .forEach((pair: string) => addSymbol(pair.slice(0, -3).toUpperCase()));
          }
          console.log(`Bitfinex: Found ${symbolIdMap.size} symbols`);
        }
        break;
      }
      case 'gateio': {
        // Gate.io public API
        const res = await fetchWithRetry([
          'https://api.gateio.ws/api/v4/spot/currency_pairs',
        ]);
        if (res) {
          const data = await res.json();
          data
            .filter((p: { quote: string; trade_status: string }) => p.quote === 'USDT' && p.trade_status === 'tradable')
            .forEach((p: { base: string }) => addSymbol(p.base));
          console.log(`Gate.io: Found ${symbolIdMap.size} symbols`);
        }
        break;
      }
      case 'htx': {
        // HTX (Huobi) API
        const res = await fetchWithRetry([
          'https://api.huobi.pro/v1/common/symbols',
          'https://api-aws.huobi.pro/v1/common/symbols',
        ]);
        if (res) {
          const data = await res.json();
          data.data
            ?.filter((s: { 'quote-currency': string; state: string }) => s['quote-currency'] === 'usdt' && s.state === 'online')
            .forEach((s: { 'base-currency': string }) => addSymbol(s['base-currency'].toUpperCase()));
          console.log(`HTX: Found ${symbolIdMap.size} symbols`);
        }
        break;
      }
      case 'mexc': {
        // MEXC API - status is "1" for active, uses isSpotTradingAllowed
        const res = await fetchWithRetry([
          'https://api.mexc.com/api/v3/exchangeInfo',
        ]);
        if (res) {
          const data = await res.json();
          if (data.symbols && Array.isArray(data.symbols)) {
            data.symbols
              .filter((s: { quoteAsset?: string; status?: string; isSpotTradingAllowed?: boolean }) =>
                s.quoteAsset === 'USDT' && (s.status === '1' || s.isSpotTradingAllowed === true))
              .forEach((s: { baseAsset?: string }) => {
                if (s.baseAsset && /^[A-Z0-9]+$/.test(s.baseAsset)) {
                  addSymbol(s.baseAsset);
                }
              });
          }
          console.log(`MEXC: Found ${symbolIdMap.size} symbols`);
        }
        break;
      }
      case 'upbit': {
        // Upbit API
        const res = await fetchWithRetry([
          'https://api.upbit.com/v1/market/all',
        ]);
        if (res) {
          const data = await res.json();
          data
            .filter((m: { market: string }) => m.market.startsWith('USDT-') || m.market.startsWith('KRW-'))
            .forEach((m: { market: string }) => {
              const parts = m.market.split('-');
              if (parts[1]) addSymbol(parts[1]);
            });
          console.log(`Upbit: Found ${symbolIdMap.size} symbols`);
        }
        break;
      }
      case 'bitget': {
        // Bitget API
        const res = await fetchWithRetry([
          'https://api.bitget.com/api/v2/spot/public/symbols',
          'https://api.bitget.com/api/spot/v1/public/products',
        ]);
        if (res) {
          const data = await res.json();
          if (data.data) {
            data.data
              ?.filter((s: { quoteCoin?: string; status?: string; quoteCurrency?: string }) =>
                (s.quoteCoin === 'USDT' && s.status === 'online') ||
                (s.quoteCurrency === 'USDT'))
              .forEach((s: { baseCoin?: string; baseCurrency?: string }) => addSymbol(s.baseCoin || s.baseCurrency || ''));
          }
          console.log(`Bitget: Found ${symbolIdMap.size} symbols`);
        }
        break;
      }
      case 'cryptocom': {
        // Crypto.com API
        const res = await fetchWithRetry([
          'https://api.crypto.com/exchange/v1/public/get-instruments',
          'https://api.crypto.com/v2/public/get-instruments',
        ]);
        if (res) {
          const data = await res.json();
          const instruments = data.result?.data || data.result?.instruments || [];
          instruments
            ?.filter((i: { quote_currency?: string; quote_ccy?: string }) =>
              i.quote_currency === 'USDT' || i.quote_currency === 'USD' || i.quote_ccy === 'USDT')
            .forEach((i: { base_currency?: string; base_ccy?: string }) => addSymbol(i.base_currency || i.base_ccy || ''));
          console.log(`Crypto.com: Found ${symbolIdMap.size} symbols`);
        }
        break;
      }
      case 'lbank': {
        // LBank API
        const res = await fetchWithRetry([
          'https://api.lbank.info/v2/currencyPairs.do',
          'https://api.lbkex.com/v2/currencyPairs.do',
        ]);
        if (res) {
          const data = await res.json();
          data.data
            ?.filter((p: string) => p.endsWith('_usdt'))
            .forEach((p: string) => addSymbol(p.replace('_usdt', '').toUpperCase()));
          console.log(`LBank: Found ${symbolIdMap.size} symbols`);
        }
        break;
      }
      case 'bitmart': {
        // BitMart API
        const res = await fetchWithRetry([
          'https://api-cloud.bitmart.com/spot/v1/symbols',
          'https://api-cloud.bitmart.com/spot/v1/symbols/details',
        ]);
        if (res) {
          const data = await res.json();
          const symbolList = data.data?.symbols || data.data || [];
          if (Array.isArray(symbolList)) {
            symbolList
              .filter((s: string | { symbol: string }) => {
                const symbol = typeof s === 'string' ? s : s.symbol;
                return symbol?.endsWith('_USDT');
              })
              .forEach((s: string | { symbol: string }) => {
                const symbol = typeof s === 'string' ? s : s.symbol;
                addSymbol(symbol.replace('_USDT', ''));
              });
          }
          console.log(`BitMart: Found ${symbolIdMap.size} symbols`);
        }
        break;
      }
      case 'bingx': {
        // BingX API
        const res = await fetchWithRetry([
          'https://open-api.bingx.com/openApi/spot/v1/common/symbols',
          'https://open-api.bingx.com/openApi/swap/v2/quote/contracts',
        ]);
        if (res) {
          const data = await res.json();
          if (data.data?.symbols) {
            data.data.symbols
              ?.filter((s: { quoteAsset: string }) => s.quoteAsset === 'USDT')
              .forEach((s: { baseAsset: string }) => addSymbol(s.baseAsset));
          } else if (data.data) {
            // Swap contracts format
            data.data
              ?.filter((s: { currency: string }) => s.currency)
              .forEach((s: { currency: string }) => addSymbol(s.currency.replace('-USDT', '')));
          }
          console.log(`BingX: Found ${symbolIdMap.size} symbols`);
        }
        break;
      }
    }
  } catch (error) {
    console.error(`Error fetching symbols for ${exchange}:`, error);
  }

  // IMPORTANT: Do NOT use generic fallback symbols anymore
  // With CMC Standard Plan, we should always get accurate data from market-pairs endpoint
  // If both CMC and direct exchange API fail, return empty map rather than inaccurate data
  if (symbolIdMap.size === 0) {
    console.warn(`No symbols found for ${exchange} from any source. Exchange may be temporarily unavailable.`);
    // Return empty map - better to show no tokens than wrong tokens
  }

  // Cache the result (even if empty, to avoid repeated failed requests)
  exchangeSymbolsCache.set(exchange, { symbols: symbolIdMap, timestamp: Date.now() });
  console.log(`Cached ${symbolIdMap.size} symbols for ${exchange}`);
  return symbolIdMap;
}

// Get all exchange symbols (for "All Exchanges" view)
// Returns Map<cmcId, { symbol: string, exchanges: ExchangeId[] }>
// This allows proper handling of symbol collisions (multiple tokens with same symbol)
async function fetchAllExchangeSymbols(): Promise<Map<number, { symbol: string; exchanges: ExchangeId[] }>> {
  const cmcIdExchanges = new Map<number, { symbol: string; exchanges: ExchangeId[] }>();
  const exchanges: ExchangeId[] = ['binance', 'coinbase', 'bybit', 'okx', 'kraken', 'kucoin', 'bitfinex', 'gateio', 'htx', 'mexc', 'upbit', 'bitget', 'cryptocom', 'lbank', 'bitmart', 'bingx'];

  const results = await Promise.allSettled(
    exchanges.map(async (exchange) => {
      const symbolIdMap = await fetchExchangeSymbols(exchange);
      return { exchange, symbolIdMap };
    })
  );

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      const { exchange, symbolIdMap } = result.value;
      symbolIdMap.forEach((cmcIds, symbol) => {
        cmcIds.forEach((cmcId) => {
          // Skip ID=0 (unknown) for aggregation - only use specific IDs
          if (cmcId === 0) return;

          const existing = cmcIdExchanges.get(cmcId);
          if (existing) {
            if (!existing.exchanges.includes(exchange)) {
              existing.exchanges.push(exchange);
            }
          } else {
            cmcIdExchanges.set(cmcId, { symbol, exchanges: [exchange] });
          }
        });
      });
    }
  });

  return cmcIdExchanges;
}

// Cache for CMC tokens
let cmcTokensCache: { tokens: CMCCoin[]; timestamp: number } | null = null;
const CMC_CACHE_TTL = 60000; // 1 minute for fresher prices

// Cache for global metrics
let globalMetricsCache: { data: GlobalMetrics; timestamp: number } | null = null;

// Global metrics interface
export interface GlobalMetrics {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  ethDominance: number;
  activeCryptocurrencies: number;
}

// Fetch global market metrics from CoinMarketCap
export async function fetchGlobalMetrics(): Promise<GlobalMetrics> {
  // Check cache first
  if (globalMetricsCache && Date.now() - globalMetricsCache.timestamp < CMC_CACHE_TTL) {
    return globalMetricsCache.data;
  }

  if (!CMC_API_KEY) {
    console.warn('CoinMarketCap API key not configured for global metrics');
    return {
      totalMarketCap: 0,
      totalVolume24h: 0,
      btcDominance: 0,
      ethDominance: 0,
      activeCryptocurrencies: 0,
    };
  }

  try {
    const response = await fetch(
      `${CMC_BASE_URL}/global-metrics/quotes/latest`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': CMC_API_KEY,
          Accept: 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error(`CMC Global Metrics API error: ${response.status}`);
      throw new Error('Failed to fetch global metrics');
    }

    const data = await response.json();
    const quote = data.data?.quote?.USD;

    const metrics: GlobalMetrics = {
      totalMarketCap: quote?.total_market_cap || 0,
      totalVolume24h: quote?.total_volume_24h || 0,
      btcDominance: data.data?.btc_dominance || 0,
      ethDominance: data.data?.eth_dominance || 0,
      activeCryptocurrencies: data.data?.active_cryptocurrencies || 0,
    };

    // Cache the result
    globalMetricsCache = { data: metrics, timestamp: Date.now() };
    console.log(`Fetched global metrics: Market Cap $${(metrics.totalMarketCap / 1e12).toFixed(2)}T, Volume $${(metrics.totalVolume24h / 1e9).toFixed(2)}B`);

    return metrics;
  } catch (error) {
    console.error('Error fetching global metrics:', error);
    return {
      totalMarketCap: 0,
      totalVolume24h: 0,
      btcDominance: 0,
      ethDominance: 0,
      activeCryptocurrencies: 0,
    };
  }
}

// Fetch top tokens by market cap from CoinMarketCap
export async function fetchTopTokens(
  limit: number = 5000,
  start: number = 1
): Promise<CMCCoin[]> {
  // Check cache first
  if (cmcTokensCache && Date.now() - cmcTokensCache.timestamp < CMC_CACHE_TTL) {
    console.log(`Using cached CMC data (${cmcTokensCache.tokens.length} tokens)`);
    return cmcTokensCache.tokens;
  }

  if (!CMC_API_KEY) {
    console.warn('CoinMarketCap API key not configured, using mock data');
    return [];
  }

  try {
    console.log(`Fetching ${limit} tokens from CoinMarketCap...`);
    const response = await fetch(
      `${CMC_BASE_URL}/cryptocurrency/listings/latest?limit=${limit}&start=${start}&convert=USD`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': CMC_API_KEY,
          Accept: 'application/json',
        },
        cache: 'no-store', // Disable Next.js cache to avoid stale data issues
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CMC API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`CMC API error: ${response.statusText}`);
    }

    const data: CMCListingsResponse = await response.json();
    console.log(`Fetched ${data.data?.length || 0} tokens from CoinMarketCap`);

    // Cache the result
    if (data.data && data.data.length > 0) {
      cmcTokensCache = { tokens: data.data, timestamp: Date.now() };
    }

    return data.data || [];
  } catch (error) {
    console.error('Error fetching from CoinMarketCap:', error);
    return [];
  }
}

// Fetch tokens for a specific exchange (filtered by what's listed on that exchange)
export async function fetchExchangeTokens(
  exchange: ExchangeId | 'all',
  limit: number = 5000
): Promise<{ tokens: Token[]; total: number }> {
  // Get top 5000 tokens from CMC (covers most tokens on any exchange)
  const cmcTokens = await fetchTopTokens(5000, 1);

  console.log(`fetchExchangeTokens: Got ${cmcTokens.length} tokens from CMC for exchange=${exchange}`);

  if (cmcTokens.length === 0) {
    // Fallback to mock data
    console.warn('No CMC tokens, falling back to mock data');
    return {
      tokens: getMockTokens(exchange === 'all' ? 'binance' : exchange, limit),
      total: 20, // Mock has 20 tokens
    };
  }

  let filteredTokens: Token[];

  if (exchange === 'all') {
    // Get CMC IDs from all exchanges (handles symbol collisions properly)
    const cmcIdExchanges = await fetchAllExchangeSymbols();
    console.log(`fetchExchangeTokens: Found ${cmcIdExchanges.size} unique tokens (by CMC ID) across all exchanges`);

    filteredTokens = cmcTokens
      .filter((coin) => cmcIdExchanges.has(coin.id)) // Filter by CMC ID, not symbol
      .map((coin) => {
        const tokenData = cmcIdExchanges.get(coin.id)!;
        return {
          id: coin.id.toString(),
          symbol: coin.symbol,
          name: coin.name,
          logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
          price: coin.quote.USD.price,
          change24h: coin.quote.USD.percent_change_24h,
          volume24h: coin.quote.USD.volume_24h,
          marketCap: coin.quote.USD.market_cap,
          exchange: tokenData.exchanges[0], // Primary exchange (first one found)
          rank: coin.cmc_rank,
          availableExchanges: tokenData.exchanges, // Store all available exchanges
        };
      });
  } else {
    // Get symbols for specific exchange (Map<symbol, Set<cmcId>>)
    const symbolIdMap = await fetchExchangeSymbols(exchange);
    console.log(`fetchExchangeTokens: Found ${symbolIdMap.size} symbols on ${exchange}`);

    filteredTokens = cmcTokens
      .filter((coin) => {
        // Check if this exchange has this symbol
        const cmcIds = symbolIdMap.get(coin.symbol);
        if (!cmcIds) return false;

        // Check if the specific CMC ID matches OR if ID=0 (fallback, match by symbol only)
        return cmcIds.has(coin.id) || cmcIds.has(0);
      })
      .map((coin) => ({
        id: coin.id.toString(),
        symbol: coin.symbol,
        name: coin.name,
        logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
        price: coin.quote.USD.price,
        change24h: coin.quote.USD.percent_change_24h,
        volume24h: coin.quote.USD.volume_24h,
        marketCap: coin.quote.USD.market_cap,
        exchange: exchange,
        rank: coin.cmc_rank,
      }));
  }

  console.log(`fetchExchangeTokens: Returning ${filteredTokens.length} filtered tokens`);

  return {
    tokens: filteredTokens,
    total: filteredTokens.length,
  };
}

// Get token logo URL from CMC
export function getTokenLogoUrl(cmcId: string | number): string {
  return `https://s2.coinmarketcap.com/static/img/coins/64x64/${cmcId}.png`;
}

// Find which exchange has a token listed (for analysis)
// If cmcId is provided, it will check for exact match; otherwise, it will match by symbol only
export async function findExchangeForToken(symbol: string, cmcId?: number): Promise<ExchangeId | null> {
  const exchanges: ExchangeId[] = ['binance', 'bybit', 'okx', 'kucoin', 'gateio', 'mexc', 'bitget', 'htx', 'coinbase', 'kraken', 'bitfinex', 'upbit', 'cryptocom', 'lbank', 'bitmart', 'bingx'];

  for (const exchange of exchanges) {
    const symbolIdMap = await fetchExchangeSymbols(exchange);
    const cmcIds = symbolIdMap.get(symbol);
    if (cmcIds) {
      // If cmcId provided, check for exact match; otherwise, just check if symbol exists
      if (!cmcId || cmcIds.has(cmcId) || cmcIds.has(0)) {
        return exchange;
      }
    }
  }

  return null;
}

// Mock data for development/testing
function getMockTokens(exchange: ExchangeId, limit: number): Token[] {
  const mockTokens: Partial<Token>[] = [
    { id: '1', symbol: 'BTC', name: 'Bitcoin', price: 97234.56, change24h: 2.45, volume24h: 24500000000, marketCap: 1920000000000, rank: 1 },
    { id: '1027', symbol: 'ETH', name: 'Ethereum', price: 3456.78, change24h: 1.23, volume24h: 12300000000, marketCap: 415000000000, rank: 2 },
    { id: '1839', symbol: 'BNB', name: 'BNB', price: 654.32, change24h: -0.87, volume24h: 1230000000, marketCap: 95000000000, rank: 3 },
    { id: '5426', symbol: 'SOL', name: 'Solana', price: 234.56, change24h: 5.67, volume24h: 4560000000, marketCap: 112000000000, rank: 4 },
    { id: '52', symbol: 'XRP', name: 'XRP', price: 2.34, change24h: 3.45, volume24h: 8900000000, marketCap: 134000000000, rank: 5 },
    { id: '74', symbol: 'DOGE', name: 'Dogecoin', price: 0.4123, change24h: -2.34, volume24h: 2340000000, marketCap: 60000000000, rank: 6 },
    { id: '2010', symbol: 'ADA', name: 'Cardano', price: 1.12, change24h: 1.89, volume24h: 890000000, marketCap: 39000000000, rank: 7 },
    { id: '5805', symbol: 'AVAX', name: 'Avalanche', price: 45.67, change24h: 4.56, volume24h: 567000000, marketCap: 18600000000, rank: 8 },
    { id: '1975', symbol: 'LINK', name: 'Chainlink', price: 23.45, change24h: 2.34, volume24h: 456000000, marketCap: 14500000000, rank: 9 },
    { id: '6636', symbol: 'DOT', name: 'Polkadot', price: 8.90, change24h: -1.23, volume24h: 345000000, marketCap: 12800000000, rank: 10 },
    { id: '3890', symbol: 'MATIC', name: 'Polygon', price: 0.567, change24h: 3.21, volume24h: 234000000, marketCap: 5200000000, rank: 11 },
    { id: '7083', symbol: 'UNI', name: 'Uniswap', price: 12.34, change24h: 1.56, volume24h: 178000000, marketCap: 9300000000, rank: 12 },
    { id: '5994', symbol: 'SHIB', name: 'Shiba Inu', price: 0.0000234, change24h: -3.45, volume24h: 567000000, marketCap: 13800000000, rank: 13 },
    { id: '2', symbol: 'LTC', name: 'Litecoin', price: 123.45, change24h: 0.89, volume24h: 345000000, marketCap: 9200000000, rank: 14 },
    { id: '3794', symbol: 'ATOM', name: 'Cosmos', price: 9.87, change24h: 2.67, volume24h: 234000000, marketCap: 3800000000, rank: 15 },
    { id: '512', symbol: 'XLM', name: 'Stellar', price: 0.456, change24h: 4.32, volume24h: 567000000, marketCap: 13200000000, rank: 16 },
    { id: '6535', symbol: 'NEAR', name: 'NEAR Protocol', price: 6.78, change24h: 5.43, volume24h: 345000000, marketCap: 7800000000, rank: 17 },
    { id: '21794', symbol: 'APT', name: 'Aptos', price: 12.34, change24h: -0.56, volume24h: 234000000, marketCap: 5600000000, rank: 18 },
    { id: '11841', symbol: 'ARB', name: 'Arbitrum', price: 1.23, change24h: 2.34, volume24h: 456000000, marketCap: 4900000000, rank: 19 },
    { id: '11840', symbol: 'OP', name: 'Optimism', price: 2.45, change24h: 3.67, volume24h: 234000000, marketCap: 2800000000, rank: 20 },
  ];

  return mockTokens.slice(0, limit).map((token) => ({
    id: token.id!,
    symbol: token.symbol!,
    name: token.name!,
    logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/${token.id}.png`,
    price: token.price!,
    change24h: token.change24h!,
    volume24h: token.volume24h!,
    marketCap: token.marketCap!,
    exchange,
    rank: token.rank,
  }));
}
