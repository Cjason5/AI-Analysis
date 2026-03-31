'use client';

import { cn } from '@/lib/utils';
import { EXCHANGES } from '@/lib/exchanges';
import { ExchangeId } from '@/types';

interface ExchangeFilterProps {
  selectedExchange: ExchangeId | 'all';
  onExchangeChange: (exchange: ExchangeId | 'all') => void;
}

export function ExchangeFilter({
  selectedExchange,
  onExchangeChange,
}: ExchangeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onExchangeChange('all')}
        className={cn(
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          selectedExchange === 'all'
            ? 'bg-accent-blue text-white'
            : 'bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-card'
        )}
      >
        All Exchanges
      </button>
      {EXCHANGES.map((exchange) => (
        <button
          key={exchange.id}
          onClick={() => onExchangeChange(exchange.id)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            selectedExchange === exchange.id
              ? 'bg-accent-blue text-white'
              : 'bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-card'
          )}
        >
          {exchange.name}
        </button>
      ))}
    </div>
  );
}
