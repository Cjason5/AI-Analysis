'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { AnalysisModal } from '@/components/modals/AnalysisModal';
import { AlertModal } from '@/components/modals/AlertModal';
import { Star, Bell, TrendingUp, Trash2 } from 'lucide-react';
import { Token, ExchangeId } from '@/types';
import { formatPrice, formatPercentage } from '@/lib/utils';

// Type for enriched watchlist item with price data
interface EnrichedWatchlistItem {
  tokenSymbol: string;
  tokenName: string;
  exchange: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

export default function WatchlistPage() {
  const { connected } = useWallet();
  const { watchlist, isLoading, error, removeFromWatchlist } = useWatchlist();
  const [enrichedWatchlist, setEnrichedWatchlist] = useState<EnrichedWatchlistItem[]>([]);
  const [pricesLoading, setPricesLoading] = useState(false);

  // Fetch live prices for watchlist items
  const fetchPrices = useCallback(async () => {
    if (watchlist.length === 0) {
      setEnrichedWatchlist([]);
      return;
    }

    setPricesLoading(true);
    try {
      // Fetch all tokens to get current prices
      const response = await fetch('/api/tokens?limit=5000');
      if (!response.ok) throw new Error('Failed to fetch prices');

      const data = await response.json();
      const allTokens: Token[] = data.tokens;

      // Match watchlist items with current prices
      const enriched = watchlist.map((item) => {
        const matchingToken = allTokens.find(
          (t) => t.symbol === item.tokenSymbol && t.exchange === item.exchange
        );

        return {
          tokenSymbol: item.tokenSymbol,
          tokenName: item.tokenName,
          exchange: item.exchange,
          price: matchingToken?.price || 0,
          change24h: matchingToken?.change24h || 0,
          volume24h: matchingToken?.volume24h || 0,
          marketCap: matchingToken?.marketCap || 0,
        };
      });

      setEnrichedWatchlist(enriched);
    } catch (err) {
      console.error('Error fetching prices:', err);
      // Fall back to watchlist without prices
      setEnrichedWatchlist(
        watchlist.map((item) => ({
          tokenSymbol: item.tokenSymbol,
          tokenName: item.tokenName,
          exchange: item.exchange,
          price: 0,
          change24h: 0,
          volume24h: 0,
          marketCap: 0,
        }))
      );
    } finally {
      setPricesLoading(false);
    }
  }, [watchlist]);

  useEffect(() => {
    if (watchlist.length > 0) {
      fetchPrices();
    }
  }, [watchlist, fetchPrices]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-8 text-center">
          <Star className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-text-secondary mb-4">
            Connect your wallet to view and manage your watchlist
          </p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-text-primary mb-6">My Watchlist</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-8 text-center">
          <p className="text-accent-red">{error}</p>
        </Card>
      </div>
    );
  }

  const handleAnalyze = (item: EnrichedWatchlistItem) => {
    const token: Token = {
      id: `${item.exchange}-${item.tokenSymbol}`,
      symbol: item.tokenSymbol,
      name: item.tokenName,
      exchange: item.exchange as ExchangeId,
      price: item.price,
      change24h: item.change24h,
      volume24h: item.volume24h,
      marketCap: item.marketCap,
    };
    setSelectedToken(token);
    setShowAnalysisModal(true);
  };

  const handleSetAlert = (item: EnrichedWatchlistItem) => {
    const token: Token = {
      id: `${item.exchange}-${item.tokenSymbol}`,
      symbol: item.tokenSymbol,
      name: item.tokenName,
      exchange: item.exchange as ExchangeId,
      price: item.price,
      change24h: item.change24h,
      volume24h: item.volume24h,
      marketCap: item.marketCap,
    };
    setSelectedToken(token);
    setShowAlertModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-text-primary">My Watchlist</h1>
        <span className="text-text-secondary">
          {watchlist.length} token{watchlist.length !== 1 ? 's' : ''}
        </span>
      </div>

      {watchlist.length === 0 ? (
        <Card className="p-8 text-center">
          <Star className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Your watchlist is empty
          </h2>
          <p className="text-text-secondary">
            Add tokens to your watchlist by clicking the star icon on token cards
          </p>
        </Card>
      ) : pricesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(watchlist.length)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrichedWatchlist.map((item) => (
            <Card
              key={`${item.exchange}-${item.tokenSymbol}`}
              className="p-4 hover:bg-bg-card-hover transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-bg-secondary rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-text-primary">
                      {item.tokenSymbol.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      {item.tokenSymbol}
                    </h3>
                    <p className="text-sm text-text-secondary">{item.tokenName}</p>
                  </div>
                </div>
                <span className="text-xs text-text-muted bg-bg-secondary px-2 py-1 rounded">
                  {item.exchange}
                </span>
              </div>

              {/* Price and Change */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold text-text-primary">
                  {formatPrice(item.price)}
                </span>
                <span
                  className={`text-sm font-medium px-2 py-1 rounded ${
                    item.change24h >= 0
                      ? 'bg-accent-green/20 text-accent-green'
                      : 'bg-accent-red/20 text-accent-red'
                  }`}
                >
                  {formatPercentage(item.change24h)}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAnalyze(item)}
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Analyze
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSetAlert(item)}
                >
                  <Bell className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => removeFromWatchlist(item.tokenSymbol, item.exchange)}
                >
                  <Trash2 className="w-4 h-4 text-accent-red" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Analysis Modal */}
      {selectedToken && (
        <AnalysisModal
          isOpen={showAnalysisModal}
          onClose={() => {
            setShowAnalysisModal(false);
            setSelectedToken(null);
          }}
          token={selectedToken}
        />
      )}

      {/* Alert Modal */}
      {selectedToken && (
        <AlertModal
          isOpen={showAlertModal}
          onClose={() => {
            setShowAlertModal(false);
            setSelectedToken(null);
          }}
          token={selectedToken}
        />
      )}
    </div>
  );
}
