'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SetupSignal } from '@/components/setups/SetupCard';

interface UseSetupsOptions {
  status?: string;
  market?: string;
  limit?: number;
  refreshInterval?: number; // ms — auto-refresh interval
}

export function useSetups(options: UseSetupsOptions = {}) {
  const {
    status,
    market,
    limit = 50,
    refreshInterval = 60_000, // 1 minute default
  } = options;

  const [setups, setSetups] = useState<SetupSignal[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSetups = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (market) params.set('market', market);
      params.set('limit', String(limit));

      const res = await fetch(`/api/setups?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch setups');

      const data = await res.json();
      setSetups(data.setups || []);
      setTotal(data.total || 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [status, market, limit]);

  useEffect(() => {
    fetchSetups();
    const interval = setInterval(fetchSetups, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchSetups, refreshInterval]);

  return { setups, total, isLoading, error, refetch: fetchSetups };
}
