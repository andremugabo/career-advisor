import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage = 10, 
  onPageChange 
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  // Generate a smart window of page numbers
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5; // Show at most 5 page buttons

    if (totalPages <= maxVisible + 2) {
      // Show all pages if small enough
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);

      // Calculate window around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust window to show at least 3 middle pages
      if (currentPage <= 3) {
        end = Math.min(maxVisible, totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - maxVisible + 1);
      }

      if (start > 2) pages.push('ellipsis');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('ellipsis');

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-3">
      {/* Results info */}
      <p className="text-xs text-slate-500 order-2 sm:order-1">
        Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
        <span className="font-semibold text-slate-700">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
        <span className="font-semibold text-slate-700">{totalItems}</span> results
      </p>

      {/* Navigation */}
      <nav className="inline-flex items-center gap-1 order-1 sm:order-2" aria-label="Pagination">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        {pageNumbers.map((page, idx) => {
          if (page === 'ellipsis') {
            return (
              <span key={`ellipsis-${idx}`} className="w-8 h-8 inline-flex items-center justify-center text-xs text-slate-400">
                …
              </span>
            );
          }

          const isCurrent = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              aria-current={isCurrent ? 'page' : undefined}
              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                isCurrent
                  ? 'bg-[#146C94] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
};
