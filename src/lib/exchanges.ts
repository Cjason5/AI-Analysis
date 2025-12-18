import { Exchange, ExchangeId, Token } from '@/types';

export const EXCHANGES: Exchange[] = [
  {
    id: 'binance',
    name: 'Binance',
    logo: '/exchanges/binance.svg',
    website: 'https://www.binance.com',
    apiBaseUrl: 'https://api.binance.com',
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    logo: '/exchanges/coinbase.svg',
    website: 'https://www.coinbase.com',
    apiBaseUrl: 'https://api.exchange.coinbase.com',
  },
  {
    id: 'bybit',
    name: 'Bybit',
    logo: '/exchanges/bybit.svg',
    website: 'https://www.bybit.com',
    apiBaseUrl: 'https://api.bybit.com',
  },
  {
    id: 'okx',
    name: 'OKX',
    logo: '/exchanges/okx.svg',
    website: 'https://www.okx.com',
    apiBaseUrl: 'https://www.okx.com',
  },
  {
    id: 'kraken',
    name: 'Kraken',
    logo: '/exchanges/kraken.svg',
    website: 'https://www.kraken.com',
    apiBaseUrl: 'https://api.kraken.com',
  },
  {
    id: 'kucoin',
    name: 'KuCoin',
    logo: '/exchanges/kucoin.svg',
    website: 'https://www.kucoin.com',
    apiBaseUrl: 'https://api.kucoin.com',
  },
  {
    id: 'bitfinex',
    name: 'Bitfinex',
    logo: '/exchanges/bitfinex.svg',
    website: 'https://www.bitfinex.com',
    apiBaseUrl: 'https://api-pub.bitfinex.com',
  },
  {
    id: 'gateio',
    name: 'Gate.io',
    logo: '/exchanges/gateio.svg',
    website: 'https://www.gate.io',
    apiBaseUrl: 'https://api.gateio.ws',
  },
  {
    id: 'htx',
    name: 'HTX',
    logo: '/exchanges/htx.svg',
    website: 'https://www.htx.com',
    apiBaseUrl: 'https://api.huobi.pro',
  },
  {
    id: 'mexc',
    name: 'MEXC',
    logo: '/exchanges/mexc.svg',
    website: 'https://www.mexc.com',
    apiBaseUrl: 'https://api.mexc.com',
  },
  {
    id: 'upbit',
    name: 'Upbit',
    logo: '/exchanges/upbit.svg',
    website: 'https://www.upbit.com',
    apiBaseUrl: 'https://api.upbit.com',
  },
  {
    id: 'bitget',
    name: 'Bitget',
    logo: '/exchanges/bitget.svg',
    website: 'https://www.bitget.com',
    apiBaseUrl: 'https://api.bitget.com',
  },
  {
    id: 'cryptocom',
    name: 'Crypto.com',
    logo: '/exchanges/cryptocom.svg',
    website: 'https://crypto.com',
    apiBaseUrl: 'https://api.crypto.com',
  },
  {
    id: 'lbank',
    name: 'LBank',
    logo: '/exchanges/lbank.svg',
    website: 'https://www.lbank.com',
    apiBaseUrl: 'https://api.lbank.info',
  },
  {
    id: 'bitmart',
    name: 'BitMart',
    logo: '/exchanges/bitmart.svg',
    website: 'https://www.bitmart.com',
    apiBaseUrl: 'https://api-cloud.bitmart.com',
  },
  {
    id: 'bingx',
    name: 'BingX',
    logo: '/exchanges/bingx.svg',
    website: 'https://www.bingx.com',
    apiBaseUrl: 'https://open-api.bingx.com',
  },
];

export function getExchange(id: ExchangeId): Exchange | undefined {
  return EXCHANGES.find((e) => e.id === id);
}

export function getExchangeName(id: ExchangeId): string {
  const exchange = getExchange(id);
  return exchange?.name || id;
}

// Interval mapping for different exchanges
type IntervalType = '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

const INTERVAL_MAP: Record<ExchangeId, Record<IntervalType, string>> = {
  binance: { '5m': '5m', '15m': '15m', '1h': '1h', '4h': '4h', '1d': '1d', '1w': '1w' },
  coinbase: { '5m': '300', '15m': '900', '1h': '3600', '4h': '14400', '1d': '86400', '1w': '604800' },
  bybit: { '5m': '5', '15m': '15', '1h': '60', '4h': '240', '1d': 'D', '1w': 'W' },
  okx: { '5m': '5m', '15m': '15m', '1h': '1H', '4h': '4H', '1d': '1D', '1w': '1W' },
  kraken: { '5m': '5', '15m': '15', '1h': '60', '4h': '240', '1d': '1440', '1w': '10080' },
  kucoin: { '5m': '5min', '15m': '15min', '1h': '1hour', '4h': '4hour', '1d': '1day', '1w': '1week' },
  bitfinex: { '5m': '5m', '15m': '15m', '1h': '1h', '4h': '4h', '1d': '1D', '1w': '1W' },
  gateio: { '5m': '5m', '15m': '15m', '1h': '1h', '4h': '4h', '1d': '1d', '1w': '1w' },
  htx: { '5m': '5min', '15m': '15min', '1h': '60min', '4h': '4hour', '1d': '1day', '1w': '1week' },
  mexc: { '5m': '5m', '15m': '15m', '1h': '1h', '4h': '4h', '1d': '1d', '1w': '1W' },
  upbit: { '5m': '5', '15m': '15', '1h': '60', '4h': '240', '1d': 'days', '1w': 'weeks' },
  bitget: { '5m': '5min', '15m': '15min', '1h': '1h', '4h': '4h', '1d': '1day', '1w': '1week' },
  cryptocom: { '5m': '5m', '15m': '15m', '1h': '1h', '4h': '4h', '1d': '1D', '1w': '1W' },
  lbank: { '5m': 'minute5', '15m': 'minute15', '1h': 'hour1', '4h': 'hour4', '1d': 'day1', '1w': 'week1' },
  bitmart: { '5m': '5', '15m': '15', '1h': '60', '4h': '240', '1d': '1440', '1w': '10080' },
  bingx: { '5m': '5m', '15m': '15m', '1h': '1h', '4h': '4h', '1d': '1d', '1w': '1w' },
};

// Type definitions for exchange-specific candle formats
type BinanceCandle = [number, string, string, string, string, string, ...unknown[]];
type CoinbaseCandle = [number, number, number, number, number, number];
type BybitCandle = [string, string, string, string, string, string, string];
type OkxCandle = [string, string, string, string, string, string, ...unknown[]];
type KrakenCandle = [number, string, string, string, string, string, string, number];
type KucoinCandle = [string, string, string, string, string, string, string];
type BitfinexCandle = [number, number, number, number, number, number];
type GateioCandle = [string, string, string, string, string, string, ...unknown[]];
type HtxCandle = { id: number; open: number; high: number; low: number; close: number; vol: number };
type UpbitCandle = { timestamp: number; opening_price: number; high_price: number; low_price: number; trade_price: number; candle_acc_trade_volume: number };
type BitgetCandle = [string, string, string, string, string, string, ...unknown[]];
type CryptocomCandle = { t: number; o: number; h: number; l: number; c: number; v: number };
type LbankCandle = [number, number, number, number, number, number];
type BitmartCandle = [number, number, number, number, number, number];
type BingxCandle = { time: number; open: string; high: string; low: string; close: string; volume: string };

// Standardize candle data to [timestamp, open, high, low, close, volume] format
function standardizeCandles(data: unknown[], exchange: ExchangeId): number[][] {
  if (!Array.isArray(data) || data.length === 0) return [];

  try {
    switch (exchange) {
      case 'binance':
      case 'mexc':
        // [openTime, open, high, low, close, volume, closeTime, ...]
        return (data as BinanceCandle[]).map((c) => [c[0], parseFloat(c[1]), parseFloat(c[2]), parseFloat(c[3]), parseFloat(c[4]), parseFloat(c[5])]);

      case 'coinbase':
        // [time, low, high, open, close, volume]
        return (data as CoinbaseCandle[]).map((c) => [c[0] * 1000, c[3], c[2], c[1], c[4], c[5]]);

      case 'bybit':
        // result.list: [startTime, open, high, low, close, volume, turnover]
        return (data as BybitCandle[]).map((c) => [parseInt(c[0]), parseFloat(c[1]), parseFloat(c[2]), parseFloat(c[3]), parseFloat(c[4]), parseFloat(c[5])]);

      case 'okx':
        // [ts, o, h, l, c, vol, volCcy, volCcyQuote, confirm]
        return (data as OkxCandle[]).map((c) => [parseInt(c[0]), parseFloat(c[1]), parseFloat(c[2]), parseFloat(c[3]), parseFloat(c[4]), parseFloat(c[5])]);

      case 'kraken':
        // [time, open, high, low, close, vwap, volume, count]
        return (data as KrakenCandle[]).map((c) => [
          c[0] * 1000,
          parseFloat(c[1]),
          parseFloat(c[2]),
          parseFloat(c[3]),
          parseFloat(c[4]),
          parseFloat(c[6])
        ]);

      case 'kucoin':
        // [time, open, close, high, low, volume, turnover]
        return (data as KucoinCandle[]).map((c) => [parseInt(c[0]) * 1000, parseFloat(c[1]), parseFloat(c[3]), parseFloat(c[4]), parseFloat(c[2]), parseFloat(c[5])]);

      case 'bitfinex':
        // [MTS, OPEN, CLOSE, HIGH, LOW, VOLUME]
        return (data as BitfinexCandle[]).map((c) => [c[0], c[1], c[3], c[4], c[2], c[5]]);

      case 'gateio':
        // [time, volume, close, high, low, open, ...]
        return (data as GateioCandle[]).map((c) => [parseInt(c[0]) * 1000, parseFloat(c[5]), parseFloat(c[3]), parseFloat(c[4]), parseFloat(c[2]), parseFloat(c[1])]);

      case 'htx':
        // {id, open, close, low, high, amount, vol, count}
        return (data as HtxCandle[]).map((c) =>
          [c.id * 1000, c.open, c.high, c.low, c.close, c.vol]);

      case 'upbit':
        // {candle_date_time_utc, opening_price, high_price, low_price, trade_price, candle_acc_trade_volume}
        return (data as UpbitCandle[]).map((c) =>
          [c.timestamp, c.opening_price, c.high_price, c.low_price, c.trade_price, c.candle_acc_trade_volume]);

      case 'bitget':
        // [ts, open, high, low, close, volume, ...]
        return (data as BitgetCandle[]).map((c) => [parseInt(c[0]), parseFloat(c[1]), parseFloat(c[2]), parseFloat(c[3]), parseFloat(c[4]), parseFloat(c[5])]);

      case 'cryptocom':
        // {t, o, h, l, c, v}
        return (data as CryptocomCandle[]).map((c) =>
          [c.t, c.o, c.h, c.l, c.c, c.v]);

      case 'lbank':
        // [time, open, high, low, close, volume]
        return (data as LbankCandle[]).map((c) => [c[0] * 1000, c[1], c[2], c[3], c[4], c[5]]);

      case 'bitmart':
        // [timestamp, open, high, low, close, volume]
        return (data as BitmartCandle[]).map((c) => [c[0], c[1], c[2], c[3], c[4], c[5]]);

      case 'bingx':
        // [time, open, high, low, close, volume]
        return (data as BingxCandle[]).map((c) =>
          [c.time, parseFloat(c.open), parseFloat(c.high), parseFloat(c.low), parseFloat(c.close), parseFloat(c.volume)]);

      default:
        return data as number[][];
    }
  } catch {
    console.error(`Error standardizing candles for ${exchange}`);
    return [];
  }
}

// Exchange-specific candlestick fetching functions
async function fetchBinanceCandles(symbol: string, interval: string, limit: number): Promise<number[][]> {
  const endpoints = [
    'https://data-api.binance.vision',
    'https://api.binance.com',
    'https://api1.binance.com',
  ];

  for (const baseUrl of endpoints) {
    try {
      const response = await fetch(`${baseUrl}/api/v3/klines?symbol=${symbol}USDT&interval=${interval}&limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        return standardizeCandles(data, 'binance');
      }
    } catch { continue; }
  }
  return [];
}

// Cache for Coinbase products mapping
let coinbaseProductsCache: Set<string> | null = null;
let coinbaseProductsCacheTime = 0;
const COINBASE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function getCoinbaseProducts(): Promise<Set<string>> {
  const now = Date.now();
  if (coinbaseProductsCache && now - coinbaseProductsCacheTime < COINBASE_CACHE_TTL) {
    return coinbaseProductsCache;
  }

  try {
    const response = await fetch('https://api.exchange.coinbase.com/products');
    if (response.ok) {
      const data = await response.json();
      const products = new Set<string>();
      for (const product of data) {
        if (product.quote_currency === 'USD' && product.status === 'online') {
          products.add(product.base_currency.toUpperCase());
        }
      }
      coinbaseProductsCache = products;
      coinbaseProductsCacheTime = now;
      return products;
    }
  } catch (error) {
    console.error('Error fetching Coinbase products:', error);
  }

  return coinbaseProductsCache || new Set();
}

async function fetchCoinbaseCandles(symbol: string, interval: string, limit: number): Promise<number[][]> {
  try {
    // Check if product exists on Coinbase
    const products = await getCoinbaseProducts();
    const upperSymbol = symbol.toUpperCase();

    if (!products.has(upperSymbol)) {
      return []; // Product not available on Coinbase
    }

    const response = await fetch(`https://api.exchange.coinbase.com/products/${upperSymbol}-USD/candles?granularity=${interval}`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return standardizeCandles(data.slice(0, limit), 'coinbase');
      }
    }
  } catch { /* ignore */ }
  return [];
}

async function fetchBybitCandles(symbol: string, interval: string, limit: number): Promise<number[][]> {
  try {
    const response = await fetch(`https://api.bybit.com/v5/market/kline?category=spot&symbol=${symbol}USDT&interval=${interval}&limit=${limit}`);
    if (response.ok) {
      const data = await response.json();
      if (data.result?.list) {
        return standardizeCandles(data.result.list, 'bybit');
      }
    }
  } catch { /* ignore */ }
  return [];
}

async function fetchOkxCandles(symbol: string, interval: string, limit: number): Promise<number[][]> {
  try {
    const response = await fetch(`https://www.okx.com/api/v5/market/candles?instId=${symbol}-USDT&bar=${interval}&limit=${limit}`);
    if (response.ok) {
      const data = await response.json();
      if (data.data) {
        return standardizeCandles(data.data, 'okx');
      }
    }
  } catch { /* ignore */ }
  return [];
}

// Cache for Kraken asset pairs mapping
let krakenPairsCache: Map<string, string> | null = null;
let krakenPairsCacheTime = 0;
const KRAKEN_PAIRS_CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function getKrakenPairsMap(): Promise<Map<string, string>> {
  const now = Date.now();
  if (krakenPairsCache && now - krakenPairsCacheTime < KRAKEN_PAIRS_CACHE_TTL) {
    return krakenPairsCache;
  }

  try {
    const response = await fetch('https://api.kraken.com/0/public/AssetPairs');
    if (response.ok) {
      const data = await response.json();
      if (data.result) {
        const pairsMap = new Map<string, string>();

        for (const [pairName, pairInfo] of Object.entries(data.result)) {
          const info = pairInfo as { base: string; quote: string; wsname?: string };
          // Only care about USD pairs
          if (info.quote === 'ZUSD' || info.quote === 'USD') {
            // Map normalized symbol to Kraken pair name
            // Handle common prefix patterns: XXBT -> BTC, XETH -> ETH, etc.
            let baseSymbol = info.base;
            if (baseSymbol.startsWith('X') && baseSymbol.length === 4) {
              baseSymbol = baseSymbol.slice(1);
            }
            if (baseSymbol === 'XBT') baseSymbol = 'BTC';

            // Store both the original and normalized symbol mappings
            pairsMap.set(baseSymbol.toUpperCase(), pairName);
            pairsMap.set(info.base.toUpperCase(), pairName);

            // Also use wsname if available (e.g., "XBT/USD" -> "BTC")
            if (info.wsname) {
              const wsBase = info.wsname.split('/')[0];
              if (wsBase) {
                pairsMap.set(wsBase.toUpperCase(), pairName);
              }
            }
          }
        }

        krakenPairsCache = pairsMap;
        krakenPairsCacheTime = now;
        return pairsMap;
      }
    }
  } catch (error) {
    console.error('Error fetching Kraken asset pairs:', error);
  }

  return krakenPairsCache || new Map();
}

async function fetchKrakenCandles(symbol: string, interval: string, limit: number): Promise<number[][]> {
  try {
    // Get the proper Kraken pair name from our mapping
    const pairsMap = await getKrakenPairsMap();
    const krakenPair = pairsMap.get(symbol.toUpperCase());

    if (!krakenPair) {
      // Try common fallback formats
      const fallbackFormats = [
        `${symbol}USD`,
        `X${symbol}ZUSD`,
        `${symbol}ZUSD`,
      ];

      for (const format of fallbackFormats) {
        const response = await fetch(`https://api.kraken.com/0/public/OHLC?pair=${format}&interval=${interval}`);
        if (response.ok) {
          const data = await response.json();
          if (data.result && !data.error?.length) {
            const key = Object.keys(data.result).find(k => k !== 'last');
            if (key && data.result[key]?.length > 0) {
              return standardizeCandles(data.result[key].slice(-limit), 'kraken');
            }
          }
        }
      }
      return [];
    }

    const response = await fetch(`https://api.kraken.com/0/public/OHLC?pair=${krakenPair}&interval=${interval}`);
    if (response.ok) {
      const data = await response.json();
      if (data.result) {
        const key = Object.keys(data.result).find(k => k !== 'last');
        if (key && data.result[key]) {
          return standardizeCandles(data.result[key].slice(-limit), 'kraken');
        }
      }
    }
  } catch { /* ignore */ }
  return [];
}

async function fetchKucoinCandles(symbol: string, interval: string, limit: number): Promise<number[][]> {
  try {
    const endAt = Math.floor(Date.now() / 1000);
    const startAt = endAt - (limit * 300); // Approximate
    const response = await fetch(`https://api.kucoin.com/api/v1/market/candles?type=${interval}&symbol=${symbol}-USDT&startAt=${startAt}&endAt=${endAt}`);
    if (response.ok) {
      const data = await response.json();
      if (data.data) {
        return standardizeCandles(data.data, 'kucoin');
      }
    }
  } catch { /* ignore */ }
  return [];
}

async function fetchBitfinexCandles(symbol: string, interval: string, limit: number): Promise<number[][]> {
  try {
    const response = await fetch(`https://api-pub.bitfinex.com/v2/candles/trade:${interval}:t${symbol}USD/hist?limit=${limit}`);
    if (response.ok) {
      const data = await response.json();
      return standardizeCandles(data, 'bitfinex');
    }
  } catch { /* ignore */ }
  return [];
}

async function fetchGateioCandles(symbol: string, interval: string, limit: number): Promise<number[][]> {
  try {
    const response = await fetch(`https://api.gateio.ws/api/v4/spot/candlesticks?currency_pair=${symbol}_USDT&interval=${interval}&limit=${limit}`);
    if (response.ok) {
      const data = await response.json();
      return standardizeCandles(data, 'gateio');
    }
  } catch { /* ignore */ }
  return [];
}

async function fetchHtxCandles(symbol: string, interval: string, limit: number): Promise<number[][]> {
  try {
    const response = await fetch(`https://api.huobi.pro/market/history/kline?symbol=${symbol.toLowerCase()}usdt&period=${interval}&size=${limit}`);
    if (response.ok) {
      const data = await response.json();
      if (data.data) {
        return standardizeCandles(data.data, 'htx');
      }
    }
  } catch { /* ignore */ }
  return [];
}

async function fetchMexcCandles(symbol: string, interval: string, limit: number): Promise<number[][]> {
  try {
    const response = await fetch(`https://api.mexc.com/api/v3/klines?symbol=${symbol}USDT&interval=${interval}&limit=${limit}`);
    if (response.ok) {
      const data = await response.json();
      return standardizeCandles(data, 'mexc');
    }
  } catch { /* ignore */ }
  return [];
}

async function fetchUpbitCandles(symbol: string, interval: string, limit: number): Promise<number[][]> {
  try {
    // Upbit uses KRW pairs primarily
    const endpoint = interval === 'days' || interval === 'weeks'
      ? `https://api.upbit.com/v1/candles/${interval}?market=USDT-${symbol}&count=${limit}`
      : `https://api.upbit.com/v1/candles/minutes/${interval}?market=USDT-${symbol}&count=${limit}`;
    const response = await fetch(endpoint);
    if (response.ok) {
      const data = await response.json();
      return standardizeCandles(data, 'upbit');
    }
  } catch { /* ignore */ }
  return [];
}

async function fetchBitgetCandles(symbol: string, interval: string, limit: number): Promise<number[][]> {
  try {
    const response = await fetch(`https://api.bitget.com/api/v2/spot/market/candles?symbol=${symbol}USDT&granularity=${interval}&limit=${limit}`);
    if (response.ok) {
      const data = await response.json();
      if (data.data) {
        return standardizeCandles(data.data, 'bitget');
      }
    }
  } catch { /* ignore */ }
  return [];
}

async function fetchCryptocomCandles(symbol: string, interval: string, limit: number): Promise<number[][]> {
  try {
    const response = await fetch(`https://api.crypto.com/exchange/v1/public/get-candlestick?instrument_name=${symbol}_USDT&timeframe=${interval}&count=${limit}`);
    if (response.ok) {
      const data = await response.json();
      if (data.result?.data) {
        return standardizeCandles(data.result.data, 'cryptocom');
      }
    }
  } catch { /* ignore */ }
  return [];
}

async function fetchLbankCandles(symbol: string, interval: string, limit: number): Promise<number[][]> {
  try {
    const time = Math.floor(Date.now() / 1000);
    const response = await fetch(`https://api.lbank.info/v2/kline.do?symbol=${symbol.toLowerCase()}_usdt&type=${interval}&size=${limit}&time=${time}`);
    if (response.ok) {
      const data = await response.json();
      if (data.data) {
        return standardizeCandles(data.data, 'lbank');
      }
    }
  } catch { /* ignore */ }
  return [];
}

async function fetchBitmartCandles(symbol: string, interval: string, limit: number): Promise<number[][]> {
  try {
    const response = await fetch(`https://api-cloud.bitmart.com/spot/quotation/v3/lite-klines?symbol=${symbol}_USDT&step=${interval}&limit=${limit}`);
    if (response.ok) {
      const data = await response.json();
      if (data.data) {
        return standardizeCandles(data.data, 'bitmart');
      }
    }
  } catch { /* ignore */ }
  return [];
}

async function fetchBingxCandles(symbol: string, interval: string, limit: number): Promise<number[][]> {
  try {
    const response = await fetch(`https://open-api.bingx.com/openApi/spot/v1/market/kline?symbol=${symbol}-USDT&interval=${interval}&limit=${limit}`);
    if (response.ok) {
      const data = await response.json();
      if (data.data) {
        return standardizeCandles(data.data, 'bingx');
      }
    }
  } catch { /* ignore */ }
  return [];
}

// Main candlestick fetching function - routes to appropriate exchange API
// Note: Fallback to other exchanges is handled in fetchAllTimeframes as a last resort
export async function fetchCandlesticks(
  exchange: ExchangeId,
  symbol: string,
  interval: IntervalType,
  limit: number = 200
): Promise<number[][]> {
  const mappedInterval = INTERVAL_MAP[exchange]?.[interval] || interval;

  try {
    switch (exchange) {
      case 'binance':
        return await fetchBinanceCandles(symbol, mappedInterval, limit);
      case 'coinbase':
        return await fetchCoinbaseCandles(symbol, mappedInterval, limit);
      case 'bybit':
        return await fetchBybitCandles(symbol, mappedInterval, limit);
      case 'okx':
        return await fetchOkxCandles(symbol, mappedInterval, limit);
      case 'kraken':
        return await fetchKrakenCandles(symbol, mappedInterval, limit);
      case 'kucoin':
        return await fetchKucoinCandles(symbol, mappedInterval, limit);
      case 'bitfinex':
        return await fetchBitfinexCandles(symbol, mappedInterval, limit);
      case 'gateio':
        return await fetchGateioCandles(symbol, mappedInterval, limit);
      case 'htx':
        return await fetchHtxCandles(symbol, mappedInterval, limit);
      case 'mexc':
        return await fetchMexcCandles(symbol, mappedInterval, limit);
      case 'upbit':
        return await fetchUpbitCandles(symbol, mappedInterval, limit);
      case 'bitget':
        return await fetchBitgetCandles(symbol, mappedInterval, limit);
      case 'cryptocom':
        return await fetchCryptocomCandles(symbol, mappedInterval, limit);
      case 'lbank':
        return await fetchLbankCandles(symbol, mappedInterval, limit);
      case 'bitmart':
        return await fetchBitmartCandles(symbol, mappedInterval, limit);
      case 'bingx':
        return await fetchBingxCandles(symbol, mappedInterval, limit);
      default:
        console.warn(`Unknown exchange: ${exchange}, returning empty candles`);
        return [];
    }
  } catch (error) {
    console.error(`Error fetching candlesticks for ${symbol} on ${exchange}:`, error);
    return [];
  }
}

// Fetch all timeframe data for a symbol with fallback to other exchanges (as last resort)
export async function fetchAllTimeframes(
  exchange: ExchangeId,
  symbol: string
): Promise<{ timeframe: string; candles: number[][]; exchange?: ExchangeId }[]> {
  const timeframes: IntervalType[] = ['5m', '15m', '1h', '4h', '1d', '1w'];

  console.log(`[Candles] Fetching ${symbol} data from primary exchange: ${exchange}`);

  // Try primary exchange first
  let results = await Promise.all(
    timeframes.map(async (timeframe) => {
      const candles = await fetchCandlesticks(exchange, symbol, timeframe);
      return { timeframe, candles, exchange };
    })
  );

  // Check if we got meaningful data (at least one timeframe with candles)
  const hasData = results.some(r => r.candles.length > 0);
  const candleCount = results.reduce((sum, r) => sum + r.candles.length, 0);

  if (hasData) {
    console.log(`[Candles] Successfully fetched ${candleCount} candles for ${symbol} from ${exchange}`);
    return results;
  }

  // If primary exchange returned no data, try fallback exchanges as LAST RESORT
  // This handles cases where the token might exist but with different pair naming
  console.log(`[Candles] No data from ${exchange} for ${symbol}, trying fallback exchanges...`);

  const fallbackExchanges: ExchangeId[] = ['binance', 'bybit', 'okx', 'kucoin', 'mexc', 'gateio', 'bitget'];

  for (const fallbackExchange of fallbackExchanges) {
    if (fallbackExchange === exchange) continue;

    console.log(`[Candles] Trying fallback: ${fallbackExchange}...`);

    results = await Promise.all(
      timeframes.map(async (timeframe) => {
        const candles = await fetchCandlesticks(fallbackExchange, symbol, timeframe);
        return { timeframe, candles, exchange: fallbackExchange };
      })
    );

    const fallbackHasData = results.some(r => r.candles.length > 0);
    if (fallbackHasData) {
      const fallbackCandleCount = results.reduce((sum, r) => sum + r.candles.length, 0);
      console.log(`[Candles] Successfully fetched ${fallbackCandleCount} candles for ${symbol} from fallback: ${fallbackExchange}`);
      return results;
    }
  }

  console.log(`[Candles] No candle data found for ${symbol} on any exchange`);
  return results;
}

// Fetch trading pairs/tokens from each exchange
export async function fetchExchangeTokens(exchange: ExchangeId): Promise<Token[]> {
  try {
    switch (exchange) {
      case 'binance':
        return await fetchBinanceTokens();
      case 'coinbase':
        return await fetchCoinbaseTokens();
      case 'bybit':
        return await fetchBybitTokens();
      case 'okx':
        return await fetchOkxTokens();
      case 'kraken':
        return await fetchKrakenTokens();
      case 'kucoin':
        return await fetchKucoinTokens();
      case 'bitfinex':
        return await fetchBitfinexTokens();
      case 'gateio':
        return await fetchGateioTokens();
      case 'htx':
        return await fetchHtxTokens();
      case 'mexc':
        return await fetchMexcTokens();
      case 'upbit':
        return await fetchUpbitTokens();
      case 'bitget':
        return await fetchBitgetTokens();
      case 'cryptocom':
        return await fetchCryptocomTokens();
      case 'lbank':
        return await fetchLbankTokens();
      case 'bitmart':
        return await fetchBitmartTokens();
      case 'bingx':
        return await fetchBingxTokens();
      default:
        return [];
    }
  } catch (error) {
    console.error(`Error fetching tokens for ${exchange}:`, error);
    return [];
  }
}

// Exchange-specific token fetching functions
async function fetchBinanceTokens(): Promise<Token[]> {
  try {
    const [tickerResponse, infoResponse] = await Promise.all([
      fetch('https://data-api.binance.vision/api/v3/ticker/24hr'),
      fetch('https://data-api.binance.vision/api/v3/exchangeInfo')
    ]);

    if (!tickerResponse.ok || !infoResponse.ok) return [];

    const tickers = await tickerResponse.json();
    const info = await infoResponse.json();

    // Filter USDT pairs and map to tokens
    const usdtPairs = tickers.filter((t: { symbol: string }) => t.symbol.endsWith('USDT'));
    const symbolInfo = new Map(info.symbols.map((s: { symbol: string; baseAsset: string }) => [s.symbol, s]));

    return usdtPairs.slice(0, 200).map((ticker: { symbol: string; lastPrice: string; priceChangePercent: string; volume: string; quoteVolume: string }) => {
      const symbol = ticker.symbol.replace('USDT', '');
      const sInfo = symbolInfo.get(ticker.symbol) as { baseAsset: string } | undefined;
      return {
        id: `binance-${symbol}`,
        symbol: symbol,
        name: sInfo?.baseAsset || symbol,
        price: parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.priceChangePercent),
        volume24h: parseFloat(ticker.quoteVolume),
        marketCap: 0,
        exchange: 'binance' as ExchangeId,
        logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/1.png`,
      };
    });
  } catch { return []; }
}

async function fetchCoinbaseTokens(): Promise<Token[]> {
  try {
    const productsRes = await fetch('https://api.exchange.coinbase.com/products');

    if (!productsRes.ok) return [];

    const products = await productsRes.json();
    const usdProducts = products.filter((p: { quote_currency: string; status: string }) =>
      p.quote_currency === 'USD' && p.status === 'online'
    );

    return usdProducts.slice(0, 100).map((product: { id: string; base_currency: string; display_name: string }) => ({
      id: `coinbase-${product.base_currency}`,
      symbol: product.base_currency,
      name: product.display_name || product.base_currency,
      price: 0,
      change24h: 0,
      volume24h: 0,
      marketCap: 0,
      exchange: 'coinbase' as ExchangeId,
      logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/1.png`,
    }));
  } catch { return []; }
}

async function fetchBybitTokens(): Promise<Token[]> {
  try {
    const response = await fetch('https://api.bybit.com/v5/market/tickers?category=spot');
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.result?.list) return [];

    const usdtPairs = data.result.list.filter((t: { symbol: string }) => t.symbol.endsWith('USDT'));

    return usdtPairs.slice(0, 200).map((ticker: { symbol: string; lastPrice: string; price24hPcnt: string; volume24h: string; turnover24h: string }) => {
      const symbol = ticker.symbol.replace('USDT', '');
      return {
        id: `bybit-${symbol}`,
        symbol: symbol,
        name: symbol,
        price: parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.price24hPcnt) * 100,
        volume24h: parseFloat(ticker.turnover24h),
        marketCap: 0,
        exchange: 'bybit' as ExchangeId,
        logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/1.png`,
      };
    });
  } catch { return []; }
}

async function fetchOkxTokens(): Promise<Token[]> {
  try {
    const response = await fetch('https://www.okx.com/api/v5/market/tickers?instType=SPOT');
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.data) return [];

    const usdtPairs = data.data.filter((t: { instId: string }) => t.instId.endsWith('-USDT'));

    return usdtPairs.slice(0, 200).map((ticker: { instId: string; last: string; open24h: string; vol24h: string; volCcy24h: string }) => {
      const symbol = ticker.instId.replace('-USDT', '');
      const change = ((parseFloat(ticker.last) - parseFloat(ticker.open24h)) / parseFloat(ticker.open24h)) * 100;
      return {
        id: `okx-${symbol}`,
        symbol: symbol,
        name: symbol,
        price: parseFloat(ticker.last),
        change24h: change,
        volume24h: parseFloat(ticker.volCcy24h),
        marketCap: 0,
        exchange: 'okx' as ExchangeId,
        logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/1.png`,
      };
    });
  } catch { return []; }
}

async function fetchKrakenTokens(): Promise<Token[]> {
  try {
    const response = await fetch('https://api.kraken.com/0/public/Ticker');
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.result) return [];

    const tokens: Token[] = [];
    for (const [pair, ticker] of Object.entries(data.result)) {
      if (pair.endsWith('USD') || pair.endsWith('ZUSD')) {
        const symbol = pair.replace(/USD$|ZUSD$/, '').replace(/^X/, '');
        const t = ticker as { c: string[]; o: string; v: string[] };
        tokens.push({
          id: `kraken-${symbol}`,
          symbol: symbol === 'XBT' ? 'BTC' : symbol,
          name: symbol === 'XBT' ? 'Bitcoin' : symbol,
          price: parseFloat(t.c[0]),
          change24h: ((parseFloat(t.c[0]) - parseFloat(t.o)) / parseFloat(t.o)) * 100,
          volume24h: parseFloat(t.v[1]) * parseFloat(t.c[0]),
          marketCap: 0,
          exchange: 'kraken' as ExchangeId,
          logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/1.png`,
        });
      }
    }
    return tokens.slice(0, 100);
  } catch { return []; }
}

async function fetchKucoinTokens(): Promise<Token[]> {
  try {
    const response = await fetch('https://api.kucoin.com/api/v1/market/allTickers');
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.data?.ticker) return [];

    const usdtPairs = data.data.ticker.filter((t: { symbol: string }) => t.symbol.endsWith('-USDT'));

    return usdtPairs.slice(0, 200).map((ticker: { symbol: string; last: string; changeRate: string; volValue: string }) => {
      const symbol = ticker.symbol.replace('-USDT', '');
      return {
        id: `kucoin-${symbol}`,
        symbol: symbol,
        name: symbol,
        price: parseFloat(ticker.last),
        change24h: parseFloat(ticker.changeRate) * 100,
        volume24h: parseFloat(ticker.volValue),
        marketCap: 0,
        exchange: 'kucoin' as ExchangeId,
        logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/1.png`,
      };
    });
  } catch { return []; }
}

async function fetchBitfinexTokens(): Promise<Token[]> {
  try {
    const response = await fetch('https://api-pub.bitfinex.com/v2/tickers?symbols=ALL');
    if (!response.ok) return [];

    const data = await response.json();
    const usdPairs = data.filter((t: string[]) => typeof t[0] === 'string' && t[0].startsWith('t') && t[0].endsWith('USD') && !t[0].includes(':'));

    return usdPairs.slice(0, 100).map((ticker: (string | number)[]) => {
      const symbol = (ticker[0] as string).slice(1, -3);
      return {
        id: `bitfinex-${symbol}`,
        symbol: symbol,
        name: symbol,
        price: ticker[7] as number,
        change24h: (ticker[6] as number) * 100,
        volume24h: (ticker[8] as number) * (ticker[7] as number),
        marketCap: 0,
        exchange: 'bitfinex' as ExchangeId,
        logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/1.png`,
      };
    });
  } catch { return []; }
}

async function fetchGateioTokens(): Promise<Token[]> {
  try {
    const response = await fetch('https://api.gateio.ws/api/v4/spot/tickers');
    if (!response.ok) return [];

    const data = await response.json();
    const usdtPairs = data.filter((t: { currency_pair: string }) => t.currency_pair.endsWith('_USDT'));

    return usdtPairs.slice(0, 200).map((ticker: { currency_pair: string; last: string; change_percentage: string; quote_volume: string }) => {
      const symbol = ticker.currency_pair.replace('_USDT', '');
      return {
        id: `gateio-${symbol}`,
        symbol: symbol,
        name: symbol,
        price: parseFloat(ticker.last),
        change24h: parseFloat(ticker.change_percentage),
        volume24h: parseFloat(ticker.quote_volume),
        marketCap: 0,
        exchange: 'gateio' as ExchangeId,
        logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/1.png`,
      };
    });
  } catch { return []; }
}

async function fetchHtxTokens(): Promise<Token[]> {
  try {
    const response = await fetch('https://api.huobi.pro/market/tickers');
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.data) return [];

    const usdtPairs = data.data.filter((t: { symbol: string }) => t.symbol.endsWith('usdt'));

    return usdtPairs.slice(0, 200).map((ticker: { symbol: string; close: number; open: number; vol: number }) => {
      const symbol = ticker.symbol.replace('usdt', '').toUpperCase();
      const change = ((ticker.close - ticker.open) / ticker.open) * 100;
      return {
        id: `htx-${symbol}`,
        symbol: symbol,
        name: symbol,
        price: ticker.close,
        change24h: change,
        volume24h: ticker.vol * ticker.close,
        marketCap: 0,
        exchange: 'htx' as ExchangeId,
        logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/1.png`,
      };
    });
  } catch { return []; }
}

async function fetchMexcTokens(): Promise<Token[]> {
  try {
    const response = await fetch('https://api.mexc.com/api/v3/ticker/24hr');
    if (!response.ok) return [];

    const data = await response.json();
    const usdtPairs = data.filter((t: { symbol: string }) => t.symbol.endsWith('USDT'));

    return usdtPairs.slice(0, 200).map((ticker: { symbol: string; lastPrice: string; priceChangePercent: string; quoteVolume: string }) => {
      const symbol = ticker.symbol.replace('USDT', '');
      return {
        id: `mexc-${symbol}`,
        symbol: symbol,
        name: symbol,
        price: parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.priceChangePercent),
        volume24h: parseFloat(ticker.quoteVolume),
        marketCap: 0,
        exchange: 'mexc' as ExchangeId,
        logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/1.png`,
      };
    });
  } catch { return []; }
}

async function fetchUpbitTokens(): Promise<Token[]> {
  try {
    const response = await fetch('https://api.upbit.com/v1/market/all?isDetails=true');
    if (!response.ok) return [];

    const data = await response.json();
    const usdtPairs = data.filter((t: { market: string }) => t.market.startsWith('USDT-'));

    return usdtPairs.slice(0, 100).map((market: { market: string; english_name: string }) => {
      const symbol = market.market.replace('USDT-', '');
      return {
        id: `upbit-${symbol}`,
        symbol: symbol,
        name: market.english_name || symbol,
        price: 0,
        change24h: 0,
        volume24h: 0,
        marketCap: 0,
        exchange: 'upbit' as ExchangeId,
        logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/1.png`,
      };
    });
  } catch { return []; }
}

async function fetchBitgetTokens(): Promise<Token[]> {
  try {
    const response = await fetch('https://api.bitget.com/api/v2/spot/market/tickers');
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.data) return [];

    const usdtPairs = data.data.filter((t: { symbol: string }) => t.symbol.endsWith('USDT'));

    return usdtPairs.slice(0, 200).map((ticker: { symbol: string; lastPr: string; change24h: string; quoteVolume: string }) => {
      const symbol = ticker.symbol.replace('USDT', '');
      return {
        id: `bitget-${symbol}`,
        symbol: symbol,
        name: symbol,
        price: parseFloat(ticker.lastPr),
        change24h: parseFloat(ticker.change24h) * 100,
        volume24h: parseFloat(ticker.quoteVolume),
        marketCap: 0,
        exchange: 'bitget' as ExchangeId,
        logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/1.png`,
      };
    });
  } catch { return []; }
}

async function fetchCryptocomTokens(): Promise<Token[]> {
  try {
    const response = await fetch('https://api.crypto.com/exchange/v1/public/get-tickers');
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.result?.data) return [];

    const usdtPairs = data.result.data.filter((t: { i: string }) => t.i.endsWith('_USDT'));

    return usdtPairs.slice(0, 100).map((ticker: { i: string; a: number; c: string; vv: number }) => {
      const symbol = ticker.i.replace('_USDT', '');
      return {
        id: `cryptocom-${symbol}`,
        symbol: symbol,
        name: symbol,
        price: ticker.a,
        change24h: parseFloat(ticker.c),
        volume24h: ticker.vv,
        marketCap: 0,
        exchange: 'cryptocom' as ExchangeId,
        logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/1.png`,
      };
    });
  } catch { return []; }
}

async function fetchLbankTokens(): Promise<Token[]> {
  try {
    const response = await fetch('https://api.lbank.info/v2/ticker/24hr.do?symbol=all');
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.data) return [];

    const usdtPairs = data.data.filter((t: { symbol: string }) => t.symbol.endsWith('_usdt'));

    return usdtPairs.slice(0, 100).map((ticker: { symbol: string; ticker: { latest: number; change: number; turnover: number } }) => {
      const symbol = ticker.symbol.replace('_usdt', '').toUpperCase();
      return {
        id: `lbank-${symbol}`,
        symbol: symbol,
        name: symbol,
        price: ticker.ticker.latest,
        change24h: ticker.ticker.change * 100,
        volume24h: ticker.ticker.turnover,
        marketCap: 0,
        exchange: 'lbank' as ExchangeId,
        logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/1.png`,
      };
    });
  } catch { return []; }
}

async function fetchBitmartTokens(): Promise<Token[]> {
  try {
    const response = await fetch('https://api-cloud.bitmart.com/spot/quotation/v3/tickers');
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.data) return [];

    const usdtPairs = data.data.filter((t: string[]) => t[0].endsWith('_USDT'));

    return usdtPairs.slice(0, 100).map((ticker: string[]) => {
      const symbol = ticker[0].replace('_USDT', '');
      return {
        id: `bitmart-${symbol}`,
        symbol: symbol,
        name: symbol,
        price: parseFloat(ticker[1]),
        change24h: parseFloat(ticker[5]) * 100,
        volume24h: parseFloat(ticker[4]),
        marketCap: 0,
        exchange: 'bitmart' as ExchangeId,
        logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/1.png`,
      };
    });
  } catch { return []; }
}

async function fetchBingxTokens(): Promise<Token[]> {
  try {
    const response = await fetch('https://open-api.bingx.com/openApi/spot/v1/ticker/24hr');
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.data) return [];

    const usdtPairs = data.data.filter((t: { symbol: string }) => t.symbol.endsWith('-USDT'));

    return usdtPairs.slice(0, 100).map((ticker: { symbol: string; lastPrice: string; priceChangePercent: string; quoteVolume: string }) => {
      const symbol = ticker.symbol.replace('-USDT', '');
      return {
        id: `bingx-${symbol}`,
        symbol: symbol,
        name: symbol,
        price: parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.priceChangePercent),
        volume24h: parseFloat(ticker.quoteVolume),
        marketCap: 0,
        exchange: 'bingx' as ExchangeId,
        logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/1.png`,
      };
    });
  } catch { return []; }
}

// Fetch tokens from all exchanges
export async function fetchAllExchangeTokens(): Promise<Token[]> {
  const allTokens: Token[] = [];

  const results = await Promise.allSettled(
    EXCHANGES.map(exchange => fetchExchangeTokens(exchange.id as ExchangeId))
  );

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allTokens.push(...result.value);
    }
  });

  // Remove duplicates (keep first occurrence) and sort by volume
  const uniqueTokens = allTokens.reduce((acc, token) => {
    const key = `${token.exchange}-${token.symbol}`;
    if (!acc.has(key)) {
      acc.set(key, token);
    }
    return acc;
  }, new Map<string, Token>());

  return Array.from(uniqueTokens.values()).sort((a, b) => b.volume24h - a.volume24h);
}
