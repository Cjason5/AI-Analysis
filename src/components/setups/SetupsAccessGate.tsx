'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Crosshair, Wallet, Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import {
  createSplitPaymentTransaction,
  createSplitPaymentTransactionWithReferral,
  getUSDCBalance,
  PAYMENT_CONFIG,
} from '@/lib/solana-payment';
import { useReferral } from '@/hooks/useReferral';
import { useSetupsAccess } from '@/hooks/useSetupsAccess';

type PayState = 'idle' | 'signing' | 'processing' | 'granting' | 'error';

function formatRemaining(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 'Expired';
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function SetupsAccessGate({ children }: { children: React.ReactNode }) {
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { getReferrer } = useReferral();
  const { hasAccess, expiresAt, priceUsdc, isLoading, refresh } = useSetupsAccess();

  const [state, setState] = useState<PayState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  const [remainingLabel, setRemainingLabel] = useState<string>('');

  const checkBalance = useCallback(async () => {
    if (!publicKey || !connection) return;
    try {
      const balance = await getUSDCBalance(connection, publicKey);
      setUsdcBalance(balance);
    } catch (err) {
      console.error('Error checking USDC balance:', err);
    }
  }, [publicKey, connection]);

  useEffect(() => {
    if (connected && publicKey) checkBalance();
  }, [connected, publicKey, checkBalance]);

  // Tick the remaining-time label once a minute when access is active
  useEffect(() => {
    if (!hasAccess || !expiresAt) {
      setRemainingLabel('');
      return;
    }
    setRemainingLabel(formatRemaining(expiresAt));
    const id = setInterval(() => setRemainingLabel(formatRemaining(expiresAt)), 60_000);
    return () => clearInterval(id);
  }, [hasAccess, expiresAt]);

  const handlePay = async () => {
    if (!publicKey || !signTransaction) return;

    const price = priceUsdc || PAYMENT_CONFIG.setupsAccessAmount;
    if (usdcBalance !== null && usdcBalance < price) {
      setError(`Insufficient USDC balance. You need $${price.toFixed(2)} USDC.`);
      setState('error');
      return;
    }

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      try {
        setState('signing');
        setError(null);

        const referrerWallet = await getReferrer();

        const transaction = referrerWallet
          ? await createSplitPaymentTransactionWithReferral(connection, publicKey, referrerWallet, price)
          : await createSplitPaymentTransaction(connection, publicKey, price);

        const signResult = await new Promise<{
          signed: Awaited<ReturnType<typeof signTransaction>> | null;
          error: Error | null;
        }>((resolve) => {
          signTransaction(transaction)
            .then((signed) => resolve({ signed, error: null }))
            .catch((err) => resolve({ signed: null, error: err as Error }));
        });

        if (signResult.error) {
          const isRejection =
            signResult.error.message.includes('User rejected') ||
            signResult.error.message.includes('rejected') ||
            signResult.error.name === 'WalletSignTransactionError';
          if (isRejection) {
            setState('idle');
            return;
          }
          throw signResult.error;
        }

        if (!signResult.signed) {
          setState('idle');
          return;
        }

        setState('processing');
        const signature = await connection.sendRawTransaction(signResult.signed.serialize(), {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
          maxRetries: 3,
        });

        await connection.confirmTransaction(
          {
            signature,
            blockhash: transaction.recentBlockhash!,
            lastValidBlockHeight: transaction.lastValidBlockHeight!,
          },
          'confirmed'
        );

        setState('granting');
        const res = await fetch('/api/setups/access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: publicKey.toBase58(),
            paymentSignature: signature,
            referrerWallet,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to grant access');

        await checkBalance();
        await refresh();
        setState('idle');
        return;
      } catch (err) {
        if (
          err instanceof Error &&
          (err.message.includes('User rejected') ||
            err.message.includes('rejected') ||
            err.name === 'WalletSignTransactionError')
        ) {
          setState('idle');
          return;
        }

        const isBlockhashError =
          err instanceof Error &&
          (err.message.includes('Blockhash not found') ||
            err.message.includes('block height exceeded') ||
            err.message.includes('blockhash'));

        if (isBlockhashError && attempt < maxRetries) {
          continue;
        }

        console.error('Error during setups access payment:', err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setState('error');
        return;
      }
    }
  };

  // Loading: show nothing initially to avoid a flash before the access check resolves
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-accent-blue animate-spin" />
        </div>
      </div>
    );
  }

  // Access granted — render the page with a small "time remaining" badge
  if (hasAccess) {
    return (
      <>
        {expiresAt && (
          <div className="container mx-auto px-4 pt-4">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Setups access active — {remainingLabel || formatRemaining(expiresAt)} remaining
              </span>
            </div>
          </div>
        )}
        {children}
      </>
    );
  }

  // Wallet not connected
  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-lg mx-auto p-8 text-center">
          <Crosshair className="w-12 h-12 text-accent-blue mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">Setups Access</h1>
          <p className="text-text-secondary mb-6">
            Connect your Solana wallet to pay $
            {priceUsdc.toFixed(2)} USDC for 24 hours of access to live setups.
          </p>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3 text-left">
              <Wallet className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-yellow-500 font-medium">Wallet Connection Required</h4>
                <div className="mt-3">
                  <ConnectButton />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Connected but no active access — show payment CTA
  const hasEnoughBalance = usdcBalance === null || usdcBalance >= priceUsdc;
  const isBusy = state === 'signing' || state === 'processing' || state === 'granting';

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-lg mx-auto p-8 text-center">
        <Crosshair className="w-12 h-12 text-accent-blue mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text-primary mb-2">Unlock Setups</h1>
        <p className="text-text-secondary mb-2">
          Pay <span className="text-text-primary font-semibold">${priceUsdc.toFixed(2)} USDC</span>{' '}
          for 24 hours of access to live trading setups.
        </p>
        {usdcBalance !== null && (
          <p className="text-text-muted text-sm mb-6">Your USDC balance: ${usdcBalance.toFixed(2)}</p>
        )}

        {!hasEnoughBalance && state === 'idle' && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4 text-left">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-orange-500 font-medium">Insufficient USDC Balance</h4>
                <p className="text-text-secondary text-sm mt-1">
                  You need at least ${priceUsdc.toFixed(2)} USDC.
                </p>
              </div>
            </div>
          </div>
        )}

        {state === 'idle' && (
          <Button onClick={handlePay} disabled={!hasEnoughBalance} className="w-full sm:w-auto">
            <Crosshair className="w-4 h-4 mr-2" />
            Pay ${priceUsdc.toFixed(2)} for 24h access
          </Button>
        )}

        {state === 'signing' && (
          <div className="py-4">
            <Loader2 className="h-8 w-8 text-accent-blue mx-auto mb-2 animate-spin" />
            <p className="text-text-primary font-medium">Sign Transaction</p>
            <p className="text-text-secondary text-sm">Please confirm in your wallet</p>
          </div>
        )}

        {state === 'processing' && (
          <div className="py-4">
            <Loader2 className="h-8 w-8 text-accent-blue mx-auto mb-2 animate-spin" />
            <p className="text-text-primary font-medium">Confirming Payment...</p>
          </div>
        )}

        {state === 'granting' && (
          <div className="py-4">
            <CheckCircle className="h-8 w-8 text-accent-green mx-auto mb-2" />
            <p className="text-text-primary font-medium">Granting access...</p>
          </div>
        )}

        {state === 'error' && (
          <div className="py-4">
            <AlertCircle className="h-8 w-8 text-accent-red mx-auto mb-2" />
            <p className="text-text-primary font-medium">Payment Failed</p>
            {error && <p className="text-text-secondary text-sm mb-3">{error}</p>}
            <Button onClick={() => setState('idle')}>Try Again</Button>
          </div>
        )}

        {isBusy && (
          <p className="text-text-muted text-xs mt-4">Do not close this page.</p>
        )}
      </Card>
    </div>
  );
}
