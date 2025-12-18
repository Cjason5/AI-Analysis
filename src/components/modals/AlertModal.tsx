'use client';

import { useState } from 'react';
import { Bell, AlertCircle, CheckCircle } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { Token } from '@/types';
import { formatPrice, getExchangeName } from '@/lib/utils';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: Token | null;
}

export function AlertModal({ isOpen, onClose, token }: AlertModalProps) {
  const { publicKey, connected } = useWallet();
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !publicKey) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          tokenSymbol: token.symbol,
          tokenName: token.name,
          exchange: token.exchange,
          condition,
          targetPrice: parseFloat(targetPrice),
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show specific error message from server
        if (response.status === 503) {
          throw new Error('Database not available. Please try again later.');
        }
        throw new Error(data.error || 'Failed to create alert');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError(null);
    setTargetPrice('');
    onClose();
  };

  if (!token) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Price Alert" size="md">
      {/* Token Info */}
      <div className="bg-bg-secondary rounded-lg p-4 mb-4">
        <h3 className="text-text-primary font-medium">
          {token.symbol} - {token.name}
        </h3>
        <div className="flex gap-4 mt-2 text-sm">
          <span className="text-text-secondary">
            Current Price: <span className="text-accent-blue font-medium">{formatPrice(token.price)}</span>
          </span>
          <span className="text-text-muted">
            {getExchangeName(token.exchange)}
          </span>
        </div>
      </div>

      {!connected ? (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-yellow-500 font-medium">
                Wallet Connection Required
              </h4>
              <p className="text-text-secondary text-sm mt-1">
                Connect your wallet to create price alerts.
              </p>
              <div className="mt-3">
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>
      ) : success ? (
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-accent-green mx-auto mb-3" />
          <p className="text-text-primary font-medium mb-1">Alert Created!</p>
          <p className="text-text-secondary text-sm mb-4">
            You&apos;ll be notified when {token.symbol} goes {condition} ${targetPrice}
          </p>
          <Button onClick={handleClose}>Done</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Condition Selection */}
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Alert When Price Goes
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCondition('above')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                  condition === 'above'
                    ? 'border-accent-green bg-accent-green/20 text-accent-green'
                    : 'border-border-color bg-bg-secondary text-text-secondary'
                }`}
              >
                Above
              </button>
              <button
                type="button"
                onClick={() => setCondition('below')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                  condition === 'below'
                    ? 'border-accent-red bg-accent-red/20 text-accent-red'
                    : 'border-border-color bg-bg-secondary text-text-secondary'
                }`}
              >
                Below
              </button>
            </div>
          </div>

          {/* Target Price */}
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Target Price (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                $
              </span>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder={token.price.toString()}
                step="any"
                required
                className="w-full pl-8 pr-4 py-3 bg-bg-secondary border border-border-color rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
            </div>
            <p className="text-text-muted text-xs mt-1">
              Current price: {formatPrice(token.price)}
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Email for Notifications (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-bg-secondary border border-border-color rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
          </div>

          {error && (
            <div className="bg-accent-red/10 text-accent-red text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full"
          >
            <Bell className="h-4 w-4 mr-2" />
            Create Alert
          </Button>
        </form>
      )}
    </Modal>
  );
}
