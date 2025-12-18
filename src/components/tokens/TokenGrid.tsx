'use client';

import { TokenCard } from './TokenCard';
import { TokenCardSkeleton } from '@/components/ui/Skeleton';
import { Token } from '@/types';

interface TokenGridProps {
  tokens: Token[];
  isLoading: boolean;
  onAnalyze: (token: Token) => void;
  onWatchlist: (token: Token) => void;
  onAlert: (token: Token) => void;
  watchlistIds: string[];
  title?: string;
  showCount?: boolean;
}

export function TokenGrid({
  tokens,
  isLoading,
  onAnalyze,
  onWatchlist,
  onAlert,
  watchlistIds,
  title,
  showCount = true,
}: TokenGridProps) {
  if (isLoading) {
    return (
      <div>
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <TokenCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">No tokens found</p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          {showCount && (
            <span className="text-sm text-text-muted">
              {tokens.length} tokens
            </span>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tokens.map((token) => (
          <TokenCard
            key={token.id}
            token={token}
            onAnalyze={onAnalyze}
            onWatchlist={onWatchlist}
            onAlert={onAlert}
            isInWatchlist={watchlistIds.includes(`${token.exchange}-${token.symbol}`)}
          />
        ))}
      </div>
    </div>
  );
}
