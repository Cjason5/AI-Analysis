// Exchange types
export type ExchangeId =
  | 'binance'
  | 'coinbase'
  | 'bybit'
  | 'okx'
  | 'kraken'
  | 'kucoin'
  | 'bitfinex'
  | 'gateio'
  | 'htx'
  | 'mexc'
  | 'upbit'
  | 'bitget'
  | 'cryptocom'
  | 'lbank'
  | 'bitmart'
  | 'bingx';

export interface Exchange {
  id: ExchangeId;
  name: string;
  logo: string;
  website: string;
  apiBaseUrl: string;
  tokenCount?: number;
}

// Token types
export interface Token {
  id: string;
  symbol: string;
  name: string;
  logo?: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  exchange: ExchangeId;
  rank?: number;
  availableExchanges?: ExchangeId[]; // All exchanges where this token is listed
}

export interface TokenCache {
  id: string;
  exchange: string;
  tokenSymbol: string;
  tokenName: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  logoUrl?: string;
  updatedAt: Date;
}

// Candlestick data
export interface Candlestick {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
  quoteVolume: number;
  trades: number;
  takerBuyBaseVolume: number;
  takerBuyQuoteVolume: number;
}

export interface TimeframeData {
  timeframe: '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
  candles: Candlestick[];
}

// Sentiment analysis
export interface SentimentResult {
  shortTermSentiment: {
    category: 'Positive' | 'Neutral' | 'Negative';
    score: number;
    rationale: string;
  };
  longTermSentiment: {
    category: 'Positive' | 'Neutral' | 'Negative';
    score: number;
    rationale: string;
  };
}

// Trading analysis
export interface TradingRecommendation {
  action: 'BUY' | 'SELL' | 'HOLD';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  rationale: {
    primarySignals: string;
    laggingIndicators: string;
    sentimentAnalysis: string;
  };
}

export interface LeveragedRecommendation {
  position: 'LONG' | 'SHORT';
  leverage: string;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  rationale: {
    primarySignals: string;
    laggingIndicators: string;
    sentimentMacro: string;
  };
}

export interface AnalysisResult {
  tokenSymbol: string;
  tokenName: string;
  exchange: ExchangeId;
  timestamp: string;
  currentPrice: number;
  spotRecommendations: {
    shortTerm: TradingRecommendation;
    longTerm: TradingRecommendation;
  };
  leveragedRecommendations: {
    shortTerm: LeveragedRecommendation;
    longTerm: LeveragedRecommendation;
  };
  sentiment: SentimentResult;
  rawAnalysis: string;
}

// News article
export interface NewsArticle {
  title: string;
  description: string;
}

// User data types
export interface WatchlistItem {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  exchange: string;
  createdAt: string;
}

export interface PriceAlert {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  exchange: string;
  condition: 'above' | 'below';
  targetPrice: number;
  isActive: boolean;
  triggered: boolean;
  email?: string;
  createdAt: string;
}

export interface SignalHistoryItem {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  exchange: string;
  priceAtAnalysis: number;
  analysis: string;
  txSignature?: string;
  createdAt: string;
}

// API response types
export interface TokensResponse {
  tokens: Token[];
  total: number;
  page: number;
  limit: number;
}

export interface ExchangesResponse {
  exchanges: Exchange[];
}

export interface AnalysisResponse {
  success: boolean;
  analysis?: AnalysisResult;
  error?: string;
}
