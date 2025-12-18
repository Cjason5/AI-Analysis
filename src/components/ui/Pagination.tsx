'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
}: PaginationProps) {
  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near the start: 1 2 3 4 ... last
        pages.push(2, 3, 4);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end: 1 ... last-3 last-2 last-1 last
        pages.push('ellipsis');
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // Middle: 1 ... current-1 current current+1 ... last
        pages.push('ellipsis');
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((pageNum, index) => (
          pageNum === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-text-muted">
              ...
            </span>
          ) : (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[40px] h-10 rounded-lg font-medium transition-colors ${
                currentPage === pageNum
                  ? 'bg-accent-blue text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-card-hover'
              }`}
            >
              {pageNum}
            </button>
          )
        ))}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Info Row */}
      <div className="flex items-center gap-4 text-sm">
        {/* Showing X - Y out of Z */}
        <span className="text-text-muted">
          Showing {startItem} - {endItem} out of {totalItems.toLocaleString()}
        </span>

        {/* Show rows dropdown */}
        {onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-text-muted">Show rows</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="bg-bg-card border border-border-color rounded-lg px-3 py-1.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
