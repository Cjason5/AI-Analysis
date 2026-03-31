'use client';

import { useState, useCallback, useEffect } from 'react';
import { Brain, Wallet, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { Token } from '@/types';
import { formatPrice, formatCurrency, getExchangeName } from '@/lib/utils';
import {
  createSplitPaymentTransaction,
  createSplitPaymentTransactionWithReferral,
  getUSDCBalance,
  PAYMENT_CONFIG,
} from '@/lib/solana-payment';
import { useReferral } from '@/hooks/useReferral';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: Token | null;
}

type AnalysisState =
  | 'idle'
  | 'signing'
  | 'processing_payment'
  | 'analyzing'
  | 'complete'
  | 'error';

export function AnalysisModal({
  isOpen,
  onClose,
  token,
}: AnalysisModalProps) {
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { getReferrer } = useReferral();
  const [state, setState] = useState<AnalysisState>('idle');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);

  // Check balance when modal opens or wallet changes
  useEffect(() => {
    if (isOpen && publicKey && connection) {
      checkUserBalance();
    }
  }, [isOpen, publicKey, connection]);

  const checkUserBalance = useCallback(async () => {
    if (!publicKey || !connection) return;

    try {
      const balance = await getUSDCBalance(connection, publicKey);
      setUsdcBalance(balance);
    } catch (err) {
      console.error('Error checking balance:', err);
    }
  }, [publicKey, connection]);

  const handleAnalysis = async () => {
    if (!token || !publicKey || !signTransaction) return;

    // Retry loop for expired blockhash
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;

      try {
        setState('signing');

        // Check if user has enough USDC
        if (usdcBalance !== null && usdcBalance < PAYMENT_CONFIG.totalAmount) {
          throw new Error(`Insufficient USDC balance. You need $${PAYMENT_CONFIG.totalAmount.toFixed(2)} USDC.`);
        }

        // Check if user has a referrer
        const referrerWallet = await getReferrer();

        // Create the payment transaction (fresh blockhash each attempt)
        // Use referral split if user was referred, otherwise use regular split
        const transaction = referrerWallet
          ? await createSplitPaymentTransactionWithReferral(connection, publicKey, referrerWallet)
          : await createSplitPaymentTransaction(connection, publicKey);

        // User signs the transaction
        // Handle rejection without triggering error overlay
        const signResult = await new Promise<{ signed: Awaited<ReturnType<typeof signTransaction>> | null; error: Error | null }>((resolve) => {
          signTransaction(transaction)
            .then((signed) => resolve({ signed, error: null }))
            .catch((err) => resolve({ signed: null, error: err as Error }));
        });

        // Check if user rejected
        if (signResult.error) {
          const isRejection =
            signResult.error.message.includes('User rejected') ||
            signResult.error.message.includes('rejected') ||
            signResult.error.name === 'WalletSignTransactionError';

          if (isRejection) {
            setState('idle');
            return;
          }
          // Throw other errors to be handled by outer catch
          throw signResult.error;
        }

        if (!signResult.signed) {
          setState('idle');
          return;
        }

        const signedTransaction = signResult.signed;

        setState('processing_payment');

        // Send the transaction
        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize(),
          {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
            maxRetries: 3,
          }
        );

        // Wait for confirmation
        await connection.confirmTransaction(
          {
            signature,
            blockhash: transaction.recentBlockhash!,
            lastValidBlockHeight: transaction.lastValidBlockHeight!,
          },
          'confirmed'
        );

        console.log('Payment confirmed:', signature);

        // Now call the API with the payment signature
        const response = await fetch('/api/analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokenSymbol: token.symbol,
            tokenName: token.name,
            tokenId: token.id,
            exchange: token.exchange,
            currentPrice: token.price,
            walletAddress: publicKey.toBase58(),
            paymentSignature: signature,
            referrerWallet, // Pass referrer for commission recording
          }),
        });

        setState('analyzing');

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Analysis request failed');
        }

        // Refresh balance after payment
        await checkUserBalance();

        // Show analyzing state for at least 1.5 seconds for better UX
        await new Promise(resolve => setTimeout(resolve, 1500));

        setAnalysis(data.analysis);
        setState('complete');
        return; // Success - exit the retry loop
      } catch (err) {
        // Check if user rejected the transaction - silently return to idle
        if (err instanceof Error &&
            (err.message.includes('User rejected') ||
             err.message.includes('rejected') ||
             err.name === 'WalletSignTransactionError')) {
          setState('idle');
          return;
        }

        // Check if blockhash expired - retry with fresh transaction
        const isBlockhashError = err instanceof Error && (
          err.message.includes('Blockhash not found') ||
          err.message.includes('block height exceeded') ||
          err.message.includes('blockhash') ||
          err.message.includes('BlockheightBasedTransactionConfirmationStrategy')
        );

        if (isBlockhashError && attempt < maxRetries) {
          console.log(`Blockhash expired, retrying (attempt ${attempt + 1}/${maxRetries})...`);
          continue; // Retry with fresh blockhash
        }

        // Log actual errors
        console.error('Error during analysis:', err);
        const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
        setError(errorMessage);
        setState('error');
        return; // Exit the loop on non-retryable error
      }
    }
  };

  const resetState = () => {
    setState('idle');
    setAnalysis(null);
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!token) return null;

  const wallet1 = process.env.NEXT_PUBLIC_PAYMENT_WALLET_1;
  const wallet2 = process.env.NEXT_PUBLIC_PAYMENT_WALLET_2;
  const walletsConfigured = wallet1 && wallet2 &&
    wallet1 !== 'your-first-solana-wallet-address' &&
    wallet2 !== 'your-second-solana-wallet-address';

  const hasEnoughBalance = usdcBalance !== null && usdcBalance >= PAYMENT_CONFIG.totalAmount;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Trading Analysis" size="xl">
      {/* Token Info */}
      <div className="bg-bg-secondary rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-text-primary font-semibold text-lg">
              {token.symbol}/USDT
            </h3>
            <p className="text-text-secondary text-sm">{token.name}</p>
          </div>
          <Badge variant="info">{getExchangeName(token.exchange)}</Badge>
        </div>
        <div className="flex gap-4 mt-3 text-sm">
          <span className="text-text-secondary">
            Price: <span className="text-text-primary font-medium">{formatPrice(token.price)}</span>
          </span>
          <span className="text-text-secondary">
            Volume: <span className="text-text-primary font-medium">{formatCurrency(token.volume24h)}</span>
          </span>
        </div>
      </div>

      {/* Wallet Connection Required */}
      {!connected && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <Wallet className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-yellow-500 font-medium">
                Wallet Connection Required
              </h4>
              <div className="mt-3">
                <ConnectButton />
              </div>
              <p className="text-text-muted text-xs mt-2">
                Tip: Use Phantom, Solflare, or other Solana wallets
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Wallets Not Configured Warning */}
      {connected && !walletsConfigured && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-orange-500 font-medium">
                Payment Wallets Not Configured
              </h4>
              <p className="text-text-secondary text-sm mt-1">
                Please configure payment wallet addresses in your .env file.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Insufficient Balance Warning */}
      {connected && walletsConfigured && !hasEnoughBalance && usdcBalance !== null && state === 'idle' && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-orange-500 font-medium">
                Insufficient USDC Balance
              </h4>
              <p className="text-text-secondary text-sm mt-1">
                You need at least ${PAYMENT_CONFIG.totalAmount.toFixed(2)} USDC to pay for analysis.
                Your current balance: ${usdcBalance.toFixed(2)} USDC
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Idle State - Ready to Analyze */}
      {connected && walletsConfigured && state === 'idle' && (
        <div className="text-center py-4">
          <Brain className="h-12 w-12 text-accent-blue mx-auto mb-3" />
          <p className="text-text-secondary mb-2">
            Get comprehensive trading analysis.
          </p>
          {usdcBalance !== null && (
            <p className="text-text-muted text-sm mb-4">
              Your USDC balance: ${usdcBalance.toFixed(2)}
            </p>
          )}
          <Button
            onClick={handleAnalysis}
            className="w-full sm:w-auto"
            disabled={!hasEnoughBalance}
          >
            <Brain className="h-4 w-4 mr-2" />
            Analyze
          </Button>
        </div>
      )}

      {/* Signing Transaction */}
      {state === 'signing' && (
        <div className="text-center py-8">
          <Loader2 className="h-10 w-10 text-accent-blue mx-auto mb-3 animate-spin" />
          <p className="text-text-primary font-medium">Sign Transaction</p>
          <p className="text-text-secondary text-sm">
            Please confirm the transaction on your wallet
          </p>
        </div>
      )}

      {/* Processing Payment */}
      {state === 'processing_payment' && (
        <div className="py-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Loader2 className="h-8 w-8 text-accent-blue animate-spin" />
            <span className="text-text-primary font-medium">Processing Transaction...</span>
          </div>
          <div className="space-y-3 max-w-xs mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-accent-green flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <span className="text-accent-green text-sm">Transaction signed</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-accent-blue flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              </div>
              <span className="text-text-primary text-sm">Confirming transaction</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-bg-secondary border border-border-color flex items-center justify-center">
                <span className="text-text-muted text-xs">3</span>
              </div>
              <span className="text-text-muted text-sm">Generating analysis</span>
            </div>
          </div>
        </div>
      )}

      {/* Analyzing */}
      {state === 'analyzing' && (
        <div className="py-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Brain className="h-8 w-8 text-accent-blue animate-pulse" />
            <span className="text-text-primary font-medium">Analyzing {token.symbol}...</span>
          </div>
          <div className="space-y-3 max-w-xs mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-accent-green flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <span className="text-accent-green text-sm">Transaction signed</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-accent-green flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <span className="text-accent-green text-sm">Transaction confirmed</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-accent-blue flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              </div>
              <span className="text-text-primary text-sm">Generating analysis</span>
            </div>
          </div>
        </div>
      )}

      {/* Complete */}
      {state === 'complete' && analysis && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-accent-green" />
            <span className="text-accent-green font-medium">Analysis Complete</span>
          </div>
          <div className="bg-bg-secondary rounded-lg p-4 prose prose-invert prose-sm max-w-none max-h-96 overflow-y-auto">
            <div className="whitespace-pre-wrap text-text-primary text-sm font-mono">
              {analysis}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Close
            </Button>
            <Button variant="primary" onClick={resetState} className="flex-1">
              Analyze Another
            </Button>
          </div>
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <div className="text-center py-8">
          <AlertCircle className="h-10 w-10 text-accent-red mx-auto mb-3" />
          <p className="text-text-primary font-medium">Analysis Failed</p>
          <p className="text-text-secondary text-sm mb-4">{error}</p>
          <Button onClick={resetState}>Try Again</Button>
        </div>
      )}
    </Modal>
  );
}
