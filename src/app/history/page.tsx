'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSignalHistory } from '@/hooks/useSignalHistory';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { History, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SignalHistoryItem } from '@/types';

export default function HistoryPage() {
  const { connected } = useWallet();
  const { signals, isLoading, error } = useSignalHistory();
  const [selectedSignal, setSelectedSignal] = useState<SignalHistoryItem | null>(null);

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-8 text-center">
          <History className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-text-secondary mb-4">
            Connect your wallet to view your signal history
          </p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-text-primary mb-6">Signal History</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
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

  const getSignalIcon = (analysis: string) => {
    const lowerAnalysis = analysis.toLowerCase();
    if (lowerAnalysis.includes('buy') || lowerAnalysis.includes('bullish') || lowerAnalysis.includes('long')) {
      return <TrendingUp className="w-5 h-5 text-accent-green" />;
    }
    if (lowerAnalysis.includes('sell') || lowerAnalysis.includes('bearish') || lowerAnalysis.includes('short')) {
      return <TrendingDown className="w-5 h-5 text-accent-red" />;
    }
    return <Minus className="w-5 h-5 text-text-muted" />;
  };

  const getSignalColor = (analysis: string): 'success' | 'danger' | 'secondary' => {
    const lowerAnalysis = analysis.toLowerCase();
    if (lowerAnalysis.includes('buy') || lowerAnalysis.includes('bullish') || lowerAnalysis.includes('long')) {
      return 'success';
    }
    if (lowerAnalysis.includes('sell') || lowerAnalysis.includes('bearish') || lowerAnalysis.includes('short')) {
      return 'danger';
    }
    return 'secondary';
  };

  const getSignalLabel = (analysis: string): string => {
    const lowerAnalysis = analysis.toLowerCase();
    if (lowerAnalysis.includes('buy') || lowerAnalysis.includes('bullish') || lowerAnalysis.includes('long')) {
      return 'BULLISH';
    }
    if (lowerAnalysis.includes('sell') || lowerAnalysis.includes('bearish') || lowerAnalysis.includes('short')) {
      return 'BEARISH';
    }
    return 'NEUTRAL';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Signal History</h1>
        <span className="text-text-secondary">
          {signals.length} signal{signals.length !== 1 ? 's' : ''}
        </span>
      </div>

      {signals.length === 0 ? (
        <Card className="p-8 text-center">
          <History className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            No signal history
          </h2>
          <p className="text-text-secondary">
            Your analysis history will appear here after you analyze tokens
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {signals.map((signal) => (
            <Card
              key={signal.id}
              className="p-4 hover:bg-bg-card-hover transition-colors cursor-pointer"
              onClick={() => setSelectedSignal(signal)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-bg-secondary rounded-full flex items-center justify-center">
                    {getSignalIcon(signal.analysis)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text-primary">
                        {signal.tokenSymbol}
                      </span>
                      <Badge variant="secondary">{signal.exchange}</Badge>
                      <Badge variant={getSignalColor(signal.analysis)}>
                        {getSignalLabel(signal.analysis)}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-muted">
                      {formatDistanceToNow(new Date(signal.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-text-muted" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Signal Detail Modal */}
      <Modal
        isOpen={!!selectedSignal}
        onClose={() => setSelectedSignal(null)}
        title={`${selectedSignal?.tokenSymbol} Analysis`}
      >
        {selectedSignal && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedSignal.exchange}</Badge>
              <Badge variant={getSignalColor(selectedSignal.analysis)}>
                {getSignalLabel(selectedSignal.analysis)}
              </Badge>
              <span className="text-sm text-text-muted ml-auto">
                {formatDistanceToNow(new Date(selectedSignal.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>

            <div className="bg-bg-secondary rounded-lg p-4">
              <h4 className="font-semibold text-text-primary mb-2">Analysis Summary</h4>
              <p className="text-text-secondary text-sm whitespace-pre-wrap">
                {selectedSignal.analysis}
              </p>
            </div>

            <div className="bg-bg-secondary rounded-lg p-4">
              <p className="text-text-muted text-sm">Price at Analysis</p>
              <p className="text-2xl font-bold text-text-primary">
                ${selectedSignal.priceAtAnalysis?.toLocaleString() ?? 'N/A'}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
