'use client';

import Image from 'next/image';
import { Brain, Star, Bell, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Token } from '@/types';
import { formatPrice, formatCurrency, formatPercentage, getExchangeName } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TokenCardProps {
  token: Token;
  onAnalyze: (token: Token) => void;
  onWatchlist: (token: Token) => void;
  onAlert: (token: Token) => void;
  isInWatchlist?: boolean;
}

export function TokenCard({
  token,
  onAnalyze,
  onWatchlist,
  onAlert,
  isInWatchlist = false,
}: TokenCardProps) {
  const isPositive = token.change24h >= 0;

  return (
    <Card className="flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-bg-secondary flex items-center justify-center">
            {token.logo ? (
              <Image
                src={token.logo}
                alt={token.name}
                width={40}
                height={40}
                className="object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-text-muted">
                {token.symbol.slice(0, 2)}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">{token.symbol}</h3>
            <p className="text-xs text-text-muted line-clamp-1">{token.name}</p>
          </div>
        </div>
        <button
          onClick={() => onWatchlist(token)}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            isInWatchlist
              ? 'text-yellow-500 bg-yellow-500/20'
              : 'text-text-muted hover:text-yellow-500 hover:bg-yellow-500/10'
          )}
        >
          <Star className={cn('h-5 w-5', isInWatchlist && 'fill-current')} />
        </button>
      </div>

      {/* Exchange Badge */}
      <div className="mb-3">
        <Badge variant="outline" className="text-xs">
          {getExchangeName(token.exchange)}
        </Badge>
      </div>

      {/* Price and Change */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xl font-bold text-text-primary">
          {formatPrice(token.price)}
        </span>
        <div
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium',
            isPositive
              ? 'bg-accent-green/20 text-accent-green'
              : 'bg-accent-red/20 text-accent-red'
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {formatPercentage(token.change24h)}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
        <div>
          <span className="text-text-muted">Volume 24h</span>
          <p className="text-text-secondary font-medium">
            {formatCurrency(token.volume24h)}
          </p>
        </div>
        <div>
          <span className="text-text-muted">Market Cap</span>
          <p className="text-text-secondary font-medium">
            {formatCurrency(token.marketCap)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          onClick={() => onAnalyze(token)}
        >
          <Brain className="h-4 w-4 mr-1" />
          Analyze
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="px-2"
          onClick={() => onAlert(token)}
        >
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
