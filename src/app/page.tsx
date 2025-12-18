'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ExchangeFilter } from '@/components/tokens/ExchangeFilter';
import { SearchBar } from '@/components/tokens/SearchBar';
import { SortDropdown, SortOption, SortDirection } from '@/components/tokens/SortDropdown';
import { TokenGrid } from '@/components/tokens/TokenGrid';
import { StatsBar } from '@/components/tokens/StatsBar';
import { Pagination } from '@/components/ui/Pagination';
import { AnalysisModal } from '@/components/modals/AnalysisModal';
import { AlertModal } from '@/components/modals/AlertModal';
import { useTokens } from '@/hooks/useTokens';
import { useWatchlist } from '@/hooks/useWatchlist';
import { ExchangeId, Token } from '@/types';

export default function HomePage() {
  const { connected } = useWallet();
  const [selectedExchange, setSelectedExchange] = useState<ExchangeId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('marketCap');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showWalletWarning, setShowWalletWarning] = useState(false);

  // Modal state
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);

  const { tokens, isLoading, total, page, setPage, limit, setLimit, totalPages } = useTokens({
    exchange: selectedExchange,
    search: searchQuery,
    sortBy,
    direction: sortDirection,
  });

  const { watchlistIds, toggleWatchlist } = useWatchlist();

  const handleAnalyze = (token: Token) => {
    setSelectedToken(token);
    setShowAnalysisModal(true);
  };

  const handleAlert = (token: Token) => {
    setSelectedToken(token);
    setShowAlertModal(true);
  };

  const handleWatchlist = async (token: Token) => {
    if (!connected) {
      setShowWalletWarning(true);
      setTimeout(() => setShowWalletWarning(false), 3000);
      return;
    }
    await toggleWatchlist(token);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Wallet Warning Toast */}
      {showWalletWarning && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-500/90 text-black px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
          <p className="font-medium">Please connect your wallet to use the watchlist</p>
        </div>
      )}

      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Crypto Trading Signals
        </h1>
        <p className="text-text-secondary">
          Get instant analysis and trading recommendations for tokens across top exchanges
        </p>
      </div>

      {/* Stats Bar */}
      <StatsBar />

      {/* Exchange Filter */}
      <div className="mb-6">
        <ExchangeFilter
          selectedExchange={selectedExchange}
          onExchangeChange={setSelectedExchange}
        />
      </div>

      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        <SortDropdown
          sortBy={sortBy}
          direction={sortDirection}
          onSort={(newSortBy, newDirection) => {
            setSortBy(newSortBy);
            setSortDirection(newDirection);
          }}
        />
      </div>

      {/* Token Grid */}
      <TokenGrid
        tokens={tokens}
        isLoading={isLoading}
        onAnalyze={handleAnalyze}
        onWatchlist={handleWatchlist}
        onAlert={handleAlert}
        watchlistIds={watchlistIds}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={total}
          itemsPerPage={limit}
          onItemsPerPageChange={setLimit}
        />
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
