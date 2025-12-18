'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WatchlistItem, Token } from '@/types';

export function useWatchlist() {
  const { publicKey } = useWallet();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walletAddress = publicKey?.toBase58();

  const fetchWatchlist = useCallback(async () => {
    if (!walletAddress) {
      setWatchlist([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/watchlist?walletAddress=${walletAddress}`);

      if (!response.ok) {
        throw new Error('Failed to fetch watchlist');
      }

      const data = await response.json();
      setWatchlist(data.watchlist);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const addToWatchlist = useCallback(
    async (token: Token) => {
      if (!walletAddress) return;

      try {
        const response = await fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress,
            tokenSymbol: token.symbol,
            tokenName: token.name,
            exchange: token.exchange,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to add to watchlist');
        }

        await fetchWatchlist();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        throw err;
      }
    },
    [walletAddress, fetchWatchlist]
  );

  const removeFromWatchlist = useCallback(
    async (tokenSymbol: string, exchange: string) => {
      if (!walletAddress) return;

      try {
        const response = await fetch(
          `/api/watchlist?walletAddress=${walletAddress}&tokenSymbol=${tokenSymbol}&exchange=${exchange}`,
          { method: 'DELETE' }
        );

        if (!response.ok) {
          throw new Error('Failed to remove from watchlist');
        }

        await fetchWatchlist();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        throw err;
      }
    },
    [walletAddress, fetchWatchlist]
  );

  const isInWatchlist = useCallback(
    (tokenSymbol: string, exchange: string) => {
      return watchlist.some(
        (item) => item.tokenSymbol === tokenSymbol && item.exchange === exchange
      );
    },
    [watchlist]
  );

  const toggleWatchlist = useCallback(
    async (token: Token) => {
      if (isInWatchlist(token.symbol, token.exchange)) {
        await removeFromWatchlist(token.symbol, token.exchange);
      } else {
        await addToWatchlist(token);
      }
    },
    [isInWatchlist, removeFromWatchlist, addToWatchlist]
  );

  return {
    watchlist,
    isLoading,
    error,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist,
    watchlistIds: watchlist.map((item) => `${item.exchange}-${item.tokenSymbol}`),
    refresh: fetchWatchlist,
  };
}
