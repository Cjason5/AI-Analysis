'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { SignalHistoryItem } from '@/types';

export function useSignalHistory() {
  const { publicKey } = useWallet();
  const [signals, setSignals] = useState<SignalHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walletAddress = publicKey?.toBase58();

  const fetchHistory = useCallback(async () => {
    if (!walletAddress) {
      setSignals([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/history?walletAddress=${walletAddress}`);

      if (!response.ok) {
        throw new Error('Failed to fetch signal history');
      }

      const data = await response.json();
      setSignals(data.signals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    signals,
    isLoading,
    error,
    refresh: fetchHistory,
  };
}
