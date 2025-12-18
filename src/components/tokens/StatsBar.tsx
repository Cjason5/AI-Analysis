'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

interface Stats {
  totalVolume: number;
  totalMarketCap: number;
  tokenCount: number;
}

export function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/tokens?limit=1');
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalVolume: data.totalVolume || 0,
            totalMarketCap: data.totalMarketCap || 0,
            tokenCount: data.total || 0,
          });
        } else {
          setStats(null);
        }
      } catch {
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-bg-card border border-border-color rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-blue/20 rounded-lg">
            <BarChart3 className="h-5 w-5 text-accent-blue" />
          </div>
          <div>
            <p className="text-sm text-text-muted">Total Tokens</p>
            <p className="text-lg font-semibold text-text-primary">
              {stats.tokenCount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-bg-card border border-border-color rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-green/20 rounded-lg">
            <TrendingUp className="h-5 w-5 text-accent-green" />
          </div>
          <div>
            <p className="text-sm text-text-muted">24h Volume</p>
            <p className="text-lg font-semibold text-text-primary">
              {formatCurrency(stats.totalVolume)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-bg-card border border-border-color rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <DollarSign className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-text-muted">Total Market Cap</p>
            <p className="text-lg font-semibold text-text-primary">
              {formatCurrency(stats.totalMarketCap)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
