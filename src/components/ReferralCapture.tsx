'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';

const REFERRER_STORAGE_KEY = 'trio_referrer';

/**
 * Inner component that captures the referral parameter.
 * Separated to work with Suspense boundary for useSearchParams.
 */
function ReferralCaptureInner() {
  const searchParams = useSearchParams();
  const { publicKey, connected } = useWallet();
  const walletAddress = publicKey?.toBase58();
  const hasRegistered = useRef(false);

  // Capture referral param from URL and store in localStorage
  useEffect(() => {
    const refParam = searchParams.get('ref');

    // Basic validation for Solana address (44 characters base58)
    if (refParam && refParam.length > 30) {
      // Don't store if it's the user's own wallet
      if (!walletAddress || refParam !== walletAddress) {
        // Only store if we don't already have a referrer stored
        const existingReferrer = localStorage.getItem(REFERRER_STORAGE_KEY);
        if (!existingReferrer) {
          localStorage.setItem(REFERRER_STORAGE_KEY, refParam);
          console.log('Referral captured:', refParam);
        }
      }
    }
  }, [searchParams, walletAddress]);

  // Register referral when wallet connects
  useEffect(() => {
    if (!connected || !walletAddress || hasRegistered.current) return;

    const storedReferrer = localStorage.getItem(REFERRER_STORAGE_KEY);

    // Don't register if no referrer or if referrer is the same as user
    if (!storedReferrer || storedReferrer === walletAddress) {
      if (storedReferrer === walletAddress) {
        localStorage.removeItem(REFERRER_STORAGE_KEY);
      }
      return;
    }

    // Register the referral
    hasRegistered.current = true;

    fetch('/api/referral/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress,
        referrerWalletAddress: storedReferrer,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.hasReferrer) {
          // User already has a referrer, clear localStorage
          localStorage.removeItem(REFERRER_STORAGE_KEY);
        }
        console.log('Referral registration result:', data);
      })
      .catch((err) => {
        console.error('Error registering referral:', err);
        hasRegistered.current = false; // Allow retry on error
      });
  }, [connected, walletAddress]);

  return null;
}

/**
 * This component captures the referral parameter from the URL on initial page load
 * and stores it in localStorage. It must be included at the app layout level to ensure
 * the referral is captured regardless of which page the user lands on.
 *
 * Wrapped in Suspense as required by Next.js for useSearchParams.
 */
export function ReferralCapture() {
  return (
    <Suspense fallback={null}>
      <ReferralCaptureInner />
    </Suspense>
  );
}
