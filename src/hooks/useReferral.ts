'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSearchParams } from 'next/navigation';

const REFERRER_STORAGE_KEY = 'trio_referrer';

interface ReferralStats {
  referralLink: string;
  downlineCount: number;
  totalEarnings: number;
  recentEarnings: Array<{
    id: string;
    downlineWallet: string;
    commissionAmount: number;
    totalFee: number;
    txSignature: string;
    createdAt: string;
  }>;
  downlines: Array<{
    walletAddress: string;
    joinedAt: string;
    analysisCount: number;
  }>;
  referredBy: string | null;
}

export function useReferral() {
  const { publicKey, connected } = useWallet();
  const searchParams = useSearchParams();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [referrerWallet, setReferrerWallet] = useState<string | null>(null);

  const walletAddress = publicKey?.toBase58();

  // Check for referral param in URL and store in localStorage
  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam && refParam.length > 30) { // Basic validation for Solana address
      // Don't store if it's the user's own wallet
      if (!walletAddress || refParam !== walletAddress) {
        localStorage.setItem(REFERRER_STORAGE_KEY, refParam);
        setReferrerWallet(refParam);
      }
    } else {
      // Check localStorage for existing referrer
      const storedReferrer = localStorage.getItem(REFERRER_STORAGE_KEY);
      if (storedReferrer) {
        setReferrerWallet(storedReferrer);
      }
    }
  }, [searchParams, walletAddress]);

  // Register referral when wallet connects
  const registerReferral = useCallback(async () => {
    if (!walletAddress) return;

    const storedReferrer = localStorage.getItem(REFERRER_STORAGE_KEY);

    // Don't register if referrer is the same as user
    if (storedReferrer === walletAddress) {
      localStorage.removeItem(REFERRER_STORAGE_KEY);
      return;
    }

    try {
      const response = await fetch('/api/referral/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          referrerWalletAddress: storedReferrer,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // If user already has a referrer, clear localStorage
        if (data.hasReferrer) {
          localStorage.removeItem(REFERRER_STORAGE_KEY);
        }
      }
    } catch (err) {
      console.error('Error registering referral:', err);
    }
  }, [walletAddress]);

  // Fetch referral stats
  const fetchStats = useCallback(async () => {
    if (!walletAddress) {
      setStats(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/referral/stats?walletAddress=${walletAddress}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);

        // If user has a referrer in database, update local state
        if (data.referredBy) {
          setReferrerWallet(data.referredBy);
        }
      }
    } catch (err) {
      console.error('Error fetching referral stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Register referral and fetch stats when wallet connects
  useEffect(() => {
    if (connected && walletAddress) {
      registerReferral();
      fetchStats();
    }
  }, [connected, walletAddress, registerReferral, fetchStats]);

  // Get the current user's referrer (from API or localStorage)
  const getReferrer = useCallback(async (): Promise<string | null> => {
    if (!walletAddress) return null;

    // First check if we have stats loaded with referrer info
    if (stats?.referredBy) {
      return stats.referredBy;
    }

    // Check localStorage
    const storedReferrer = localStorage.getItem(REFERRER_STORAGE_KEY);
    if (storedReferrer && storedReferrer !== walletAddress) {
      return storedReferrer;
    }

    // Fetch from API
    try {
      const response = await fetch(`/api/referral/stats?walletAddress=${walletAddress}`);
      if (response.ok) {
        const data = await response.json();
        return data.referredBy || null;
      }
    } catch (err) {
      console.error('Error getting referrer:', err);
    }

    return null;
  }, [walletAddress, stats]);

  // Copy referral link to clipboard
  const copyReferralLink = useCallback(async () => {
    if (stats?.referralLink) {
      await navigator.clipboard.writeText(stats.referralLink);
      return true;
    }
    return false;
  }, [stats]);

  return {
    stats,
    isLoading,
    referrerWallet,
    getReferrer,
    fetchStats,
    copyReferralLink,
  };
}
