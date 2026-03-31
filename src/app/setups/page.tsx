'use client';

import { useState } from 'react';
import { useSetups } from '@/hooks/useSetups';
import { SetupCard } from '@/components/setups/SetupCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Crosshair,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
} from 'lucide-react';

type StatusFilter = '' | 'ACTIVE' | 'PENDING';
type MarketFilter = '' | 'SPOT' | 'FUTURES';

export default function SetupsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [marketFilter, setMarketFilter] = useState<MarketFilter>('');

  const { setups, total, isLoading, error, refetch } = useSetups({
    status: statusFilter || undefined,
    market: marketFilter || undefined,
    refreshInterval: 30_000, // 30s refresh for live feel
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const activeCount = setups.filter((s) => s.status === 'ACTIVE').length;
  const pendingCount = setups.filter((s) => s.status === 'PENDING').length;
  const longCount = setups.filter((s) => s.direction === 'LONG').length;
  const shortCount = setups.filter((s) => s.direction === 'SHORT').length;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-text-primary mb-6">Setups</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
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
          <Button variant="secondary" className="mt-4" onClick={handleRefresh}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Setups</h1>
          <p className="text-text-secondary mt-1">
            Live signals from the top 30 tokens by market cap
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total Setups"
          value={total}
          icon={<Crosshair className="w-4 h-4" />}
        />
        <StatCard
          label="Trade Now"
          value={activeCount}
          icon={<Zap className="w-4 h-4 text-accent-green" />}
          accent="green"
        />
        <StatCard
          label="Limit Order"
          value={pendingCount}
          icon={<Clock className="w-4 h-4 text-accent-yellow" />}
        />
        <StatCard
          label="Long / Short"
          value={`${longCount} / ${shortCount}`}
          icon={
            <div className="flex gap-0.5">
              <TrendingUp className="w-3.5 h-3.5 text-accent-green" />
              <TrendingDown className="w-3.5 h-3.5 text-accent-red" />
            </div>
          }
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterGroup
          label="Status"
          options={[
            { value: '', label: 'All' },
            { value: 'ACTIVE', label: 'Trade Now' },
            { value: 'PENDING', label: 'Limit Order' },
          ]}
          selected={statusFilter}
          onChange={(v) => setStatusFilter(v as StatusFilter)}
        />
        <div className="w-px bg-border-color mx-2 hidden sm:block" />
        <FilterGroup
          label="Market"
          options={[
            { value: '', label: 'All' },
            { value: 'SPOT', label: 'Spot' },
            { value: 'FUTURES', label: 'Futures' },
          ]}
          selected={marketFilter}
          onChange={(v) => setMarketFilter(v as MarketFilter)}
        />
      </div>

      {/* Setups List */}
      {setups.length === 0 ? (
        <Card className="p-8 text-center">
          <Crosshair className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            No setups found
          </h2>
          <p className="text-text-secondary">
            {statusFilter || marketFilter
              ? 'No setups match your current filters. Try adjusting them.'
              : 'Waiting for the scanner to detect signals from top 30 tokens. Setups will appear here automatically.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {setups.map((setup) => (
            <SetupCard key={setup.id} setup={setup} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
        {icon}
        {label}
      </div>
      <div
        className={`text-xl font-bold ${
          accent === 'green' ? 'text-accent-green' : 'text-text-primary'
        }`}
      >
        {value}
      </div>
    </Card>
  );
}

function FilterGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-text-muted mr-1">{label}:</span>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            selected === opt.value
              ? 'bg-accent-blue text-white'
              : 'bg-bg-card text-text-secondary hover:text-text-primary hover:bg-bg-card-hover'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
