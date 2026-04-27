'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface SetupsAccessState {
  hasAccess: boolean;
  expiresAt: string | null;
  priceUsdc: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useSetupsAccess(): SetupsAccessState {
  const { publicKey, connected } = useWallet();
  const walletAddress = publicKey?.toBase58();

  const [hasAccess, setHasAccess] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [priceUsdc, setPriceUsdc] = useState(0.30);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!walletAddress) {
      setHasAccess(false);
      setExpiresAt(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/setups/access?walletAddress=${walletAddress}`);
      if (res.ok) {
        const data = await res.json();
        setHasAccess(!!data.hasAccess);
        setExpiresAt(data.expiresAt ?? null);
        if (typeof data.priceUsdc === 'number') setPriceUsdc(data.priceUsdc);
      }
    } catch (err) {
      console.error('Error fetching setups access:', err);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (connected && walletAddress) {
      refresh();
    } else {
      setHasAccess(false);
      setExpiresAt(null);
      setIsLoading(false);
    }
  }, [connected, walletAddress, refresh]);

  // Auto-flip to expired when the expiry passes without re-fetching
  useEffect(() => {
    if (!expiresAt) return;
    const remaining = new Date(expiresAt).getTime() - Date.now();
    if (remaining <= 0) {
      setHasAccess(false);
      return;
    }
    const timer = setTimeout(() => setHasAccess(false), remaining);
    return () => clearTimeout(timer);
  }, [expiresAt]);

  return { hasAccess, expiresAt, priceUsdc, isLoading, refresh };
}
