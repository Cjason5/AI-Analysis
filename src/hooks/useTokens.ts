'use client';

import { useState, useEffect, useCallback } from 'react';
import { Token, ExchangeId } from '@/types';
import { SortOption, SortDirection } from '@/components/tokens/SortDropdown';

interface UseTokensOptions {
  exchange: ExchangeId | 'all';
  search: string;
  sortBy: SortOption;
  direction: SortDirection;
  initialLimit?: number;
}

export function useTokens({
  exchange,
  search,
  sortBy,
  direction,
  initialLimit = 20,
}: UseTokensOptions) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);

  const fetchTokens = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        exchange,
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
        search,
        sortBy,
        direction,
      });

      const response = await fetch(`/api/tokens?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }

      const data = await response.json();
      setTokens(data.tokens);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [exchange, search, sortBy, direction, limit, page]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [exchange, search, sortBy, direction]);

  // Reset page when limit changes
  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  return {
    tokens,
    isLoading,
    error,
    total,
    page,
    setPage,
    limit,
    setLimit: handleLimitChange,
    totalPages: Math.ceil(total / limit),
    refresh: fetchTokens,
  };
}
