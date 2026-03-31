'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PriceAlert } from '@/types';

export function useAlerts() {
  const { publicKey } = useWallet();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walletAddress = publicKey?.toBase58();

  const fetchAlerts = useCallback(async () => {
    if (!walletAddress) {
      setAlerts([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/alerts?walletAddress=${walletAddress}`);

      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }

      const data = await response.json();
      setAlerts(data.alerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const toggleAlert = useCallback(
    async (alertId: string, isActive: boolean) => {
      if (!walletAddress) return;

      try {
        const response = await fetch('/api/alerts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alertId, walletAddress, isActive }),
        });

        if (!response.ok) {
          throw new Error('Failed to update alert');
        }

        await fetchAlerts();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        throw err;
      }
    },
    [walletAddress, fetchAlerts]
  );

  const deleteAlert = useCallback(
    async (alertId: string) => {
      if (!walletAddress) return;

      try {
        const response = await fetch(
          `/api/alerts?alertId=${alertId}&walletAddress=${walletAddress}`,
          { method: 'DELETE' }
        );

        if (!response.ok) {
          throw new Error('Failed to delete alert');
        }

        await fetchAlerts();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        throw err;
      }
    },
    [walletAddress, fetchAlerts]
  );

  return {
    alerts,
    isLoading,
    error,
    toggleAlert,
    deleteAlert,
    refresh: fetchAlerts,
  };
}
