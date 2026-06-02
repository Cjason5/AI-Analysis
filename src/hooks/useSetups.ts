'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { SetupSignal } from '@/components/setups/SetupCard';

interface UseSetupsOptions {
  status?: string;
  market?: string;
  pageSize?: number; // rows fetched per page (infinite scroll)
  refreshInterval?: number; // ms — auto-refresh of the freshest page
}

const sortByFreshness = (a: SetupSignal, b: SetupSignal) => {
  const t = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  if (t !== 0) return t;
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
};

export function useSetups(options: UseSetupsOptions = {}) {
  const {
    status,
    market,
    pageSize = 30,
    refreshInterval = 30_000,
  } = options;

  const [setups, setSetups] = useState<SetupSignal[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // initial load only
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Accumulated rows keyed by id, deduped — survives across pages and refreshes.
  // The feed is sorted by updatedAt (which churns every forwarder cycle), so
  // offset windows can overlap between requests; dedup-by-id keeps the visible
  // list clean and we re-sort client-side so the order always matches intent.
  const byId = useRef<Map<string, SetupSignal>>(new Map());
  const loadedPages = useRef(0);
  const totalRef = useRef(0);
  const inFlight = useRef(false);

  const buildQuery = useCallback(
    (offset: number, limit: number) => {
      const p = new URLSearchParams();
      if (status) p.set('status', status);
      if (market) p.set('market', market);
      p.set('limit', String(limit));
      p.set('offset', String(offset));
      return p.toString();
    },
    [status, market],
  );

  const commit = useCallback(() => {
    setSetups(Array.from(byId.current.values()).sort(sortByFreshness));
  }, []);

  // Fetch one page at `offset`, merge into the deduped map, return rows received.
  const fetchPage = useCallback(
    async (offset: number, limit: number): Promise<number> => {
      const res = await fetch(`/api/setups?${buildQuery(offset, limit)}`);
      if (!res.ok) throw new Error('Failed to fetch setups');
      const data = await res.json();
      const rows: SetupSignal[] = data.setups || [];
      for (const r of rows) byId.current.set(r.id, r);
      totalRef.current = data.total || 0;
      setTotal(totalRef.current);
      commit();
      return rows.length;
    },
    [buildQuery, commit],
  );

  // Initial load / hard reset (filter change or manual refresh): clear and reload page 0.
  const reset = useCallback(async () => {
    byId.current = new Map();
    loadedPages.current = 0;
    setIsLoading(true);
    try {
      const n = await fetchPage(0, pageSize);
      loadedPages.current = 1;
      setHasMore(n === pageSize && byId.current.size < totalRef.current);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage, pageSize]);

  // Infinite scroll: pull the next page and append.
  const loadMore = useCallback(async () => {
    if (inFlight.current || isLoading) return;
    if (byId.current.size >= totalRef.current && totalRef.current > 0) {
      setHasMore(false);
      return;
    }
    inFlight.current = true;
    setIsLoadingMore(true);
    try {
      const offset = loadedPages.current * pageSize;
      const n = await fetchPage(offset, pageSize);
      loadedPages.current += 1;
      setHasMore(
        n === pageSize &&
          offset + pageSize < totalRef.current &&
          byId.current.size < totalRef.current,
      );
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      inFlight.current = false;
      setIsLoadingMore(false);
    }
  }, [fetchPage, pageSize, isLoading]);

  // Periodic refresh of the freshest page — surfaces brand-new signals (always
  // the freshest, so they land in page 0) and updates "last confirmed" times,
  // without disturbing already-loaded deeper pages or the scroll position.
  const refreshHead = useCallback(async () => {
    if (inFlight.current) return;
    try {
      await fetchPage(0, pageSize);
      setError(null);
    } catch {
      /* keep showing the current list on a transient refresh error */
    }
  }, [fetchPage, pageSize]);

  // Reset whenever the filter set changes (reset identity tracks status/market/pageSize).
  useEffect(() => {
    reset();
  }, [reset]);

  // Auto-refresh the head on an interval.
  useEffect(() => {
    if (!refreshInterval) return;
    const id = setInterval(refreshHead, refreshInterval);
    return () => clearInterval(id);
  }, [refreshHead, refreshInterval]);

  return {
    setups,
    total,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refetch: reset,
  };
}
