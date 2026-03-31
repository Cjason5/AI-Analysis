'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  TrendingUp,
  TrendingDown,
  Target,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import { formatPrice, formatTimeAgo } from '@/lib/utils';

export interface SetupSignal {
  id: string;
  symbol: string;
  name: string | null;
  exchange: string;
  market: string;
  action: string;
  direction: string;
  status: string;
  confluenceScore: number;
  confidence: number;
  entryMid: number | null;
  stopLoss: number | null;
  tp1: number | null;
  tp2: number | null;
  riskReward: number | null;
  currentPrice: number | null;
  distancePct: number | null;
  marketCap: number | null;
  modules: string[];
  tradeHorizon: string | null;
  htfTrend: string | null;
  zoneGrade: string | null;
  analysisTier: string | null;
  positionSize: number | null;
  riskUsd: number | null;
  logoUrl: string | null;
  scanSource: string | null;
  createdAt: string;
  expiresAt: string | null;
}

export function SetupCard({ setup }: { setup: SetupSignal }) {
  const isLong = setup.direction === 'LONG';
  const isActive = setup.status === 'ACTIVE';

  return (
    <Card
      className={`p-4 transition-all ${
        isActive
          ? 'border-accent-green/50 bg-accent-green/5'
          : 'border-border-color'
      }`}
    >
      {/* Header: Symbol + Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {setup.logoUrl && (
            <img
              src={setup.logoUrl}
              alt={setup.symbol}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-text-primary">
                {setup.symbol}
              </span>
              {setup.name && (
                <span className="text-sm text-text-muted">{setup.name}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant="secondary">{setup.exchange.toUpperCase()}</Badge>
              <Badge variant={setup.market === 'SPOT' ? 'info' : 'outline'}>
                {setup.market}
              </Badge>
              {setup.analysisTier && (
                <Badge variant="secondary">{setup.analysisTier}</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <Badge variant={isActive ? 'success' : 'warning'}>
            {isActive ? 'BUY NOW' : 'LIMIT BUY'}
          </Badge>
          <div
            className={`flex items-center gap-1 text-sm font-semibold ${
              isLong ? 'text-accent-green' : 'text-accent-red'
            }`}
          >
            {isLong ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {setup.action}
          </div>
        </div>
      </div>

      {/* Price Levels Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        <PriceField
          label="Current"
          value={setup.currentPrice}
          icon={<Target className="w-3.5 h-3.5" />}
        />
        <PriceField
          label="Entry"
          value={setup.entryMid}
          icon={<Target className="w-3.5 h-3.5" />}
          highlight
        />
        <PriceField
          label="Stop Loss"
          value={setup.stopLoss}
          icon={<ShieldAlert className="w-3.5 h-3.5" />}
          variant="danger"
        />
        <PriceField
          label="TP1"
          value={setup.tp1}
          icon={<Target className="w-3.5 h-3.5" />}
          variant="success"
        />
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-color">
        <span className="ml-auto flex items-center gap-1 text-xs text-text-muted">
          <Clock className="w-3 h-3" />
          {formatTimeAgo(setup.createdAt)}
        </span>
      </div>
    </Card>
  );
}

function PriceField({
  label,
  value,
  icon,
  variant,
  highlight,
}: {
  label: string;
  value: number | null;
  icon?: React.ReactNode;
  variant?: 'danger' | 'success';
  highlight?: boolean;
}) {
  const colorClass =
    variant === 'danger'
      ? 'text-accent-red'
      : variant === 'success'
        ? 'text-accent-green'
        : highlight
          ? 'text-accent-blue'
          : 'text-text-primary';

  return (
    <div className="bg-bg-secondary rounded-lg p-2">
      <div className="flex items-center gap-1 text-xs text-text-muted mb-0.5">
        {icon}
        {label}
      </div>
      <div className={`text-sm font-semibold ${colorClass}`}>
        {value != null ? formatPrice(value) : '—'}
      </div>
    </div>
  );
}
