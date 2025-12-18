import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '$0.00';
  if (value >= 1000000000000) {
    return `$${(value / 1000000000000).toFixed(2)}T`;
  }
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

export function formatPrice(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '$0.00';
  if (value >= 1000) {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (value >= 1) {
    return `$${value.toFixed(2)}`;
  }
  if (value >= 0.01) {
    return `$${value.toFixed(4)}`;
  }
  return `$${value.toFixed(6)}`;
}

export function formatPercentage(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '+0.00%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatVolume(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '0';
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(2)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  }
  return value.toFixed(2);
}

export function formatMarketCap(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '$0';
  if (value >= 1000000000000) {
    return `$${(value / 1000000000000).toFixed(2)}T`;
  }
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  return `$${value.toLocaleString()}`;
}

export function formatTimeAgo(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function getExchangeColor(exchange: string): string {
  const colors: Record<string, string> = {
    binance: '#F0B90B',
    coinbase: '#0052FF',
    bybit: '#F7A600',
    okx: '#000000',
    kraken: '#5741D9',
    kucoin: '#23AF91',
    bitfinex: '#16B157',
    gateio: '#17E6A1',
    htx: '#1890FF',
    mexc: '#00B897',
    upbit: '#0A4AFF',
    bitget: '#00F0FF',
    cryptocom: '#002D74',
    lbank: '#1E88E5',
    bitmart: '#00BFFF',
    bingx: '#2354E6',
  };
  return colors[exchange.toLowerCase()] || '#3b82f6';
}

export function getExchangeName(exchangeId: string): string {
  const names: Record<string, string> = {
    binance: 'Binance',
    coinbase: 'Coinbase',
    bybit: 'Bybit',
    okx: 'OKX',
    kraken: 'Kraken',
    kucoin: 'KuCoin',
    bitfinex: 'Bitfinex',
    gateio: 'Gate.io',
    htx: 'HTX',
    mexc: 'MEXC',
    upbit: 'Upbit',
    bitget: 'Bitget',
    cryptocom: 'Crypto.com',
    lbank: 'LBank',
    bitmart: 'BitMart',
    bingx: 'BingX',
  };
  return names[exchangeId.toLowerCase()] || exchangeId;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
