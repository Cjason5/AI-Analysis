'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SortOption = 'marketCap' | 'volume' | 'price' | 'change24h';
export type SortDirection = 'asc' | 'desc';

interface SortDropdownProps {
  sortBy: SortOption;
  direction: SortDirection;
  onSort: (sortBy: SortOption, direction: SortDirection) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'marketCap', label: 'Market Cap' },
  { value: 'volume', label: '24h Volume' },
  { value: 'price', label: 'Price' },
  { value: 'change24h', label: '24h Change' },
];

export function SortDropdown({ sortBy, direction, onSort }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel =
    sortOptions.find((opt) => opt.value === sortBy)?.label || 'Sort';

  const handleSelect = (option: SortOption) => {
    if (option === sortBy) {
      onSort(option, direction === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(option, 'desc');
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-bg-secondary border border-border-color rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowUpDown className="h-4 w-4" />
        <span>{selectedLabel}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-bg-card border border-border-color rounded-lg shadow-lg z-10">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                'w-full px-4 py-2 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg',
                sortBy === option.value
                  ? 'bg-accent-blue/20 text-accent-blue'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-card-hover'
              )}
            >
              {option.label}
              {sortBy === option.value && (
                <span className="ml-2">{direction === 'desc' ? '↓' : '↑'}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
