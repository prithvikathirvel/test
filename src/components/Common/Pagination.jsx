"use client";

import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

/**
 * Reusable SaaS Pagination Component
 * 
 * @param {number} currentPage - Active page number (1-based)
 * @param {number} totalItems - Total count of items
 * @param {number} pageSize - Number of items displayed per page
 * @param {function} onPageChange - Callback when a new page is selected (pageNumber) => void
 * @param {function} onPageSizeChange - Optional callback to change items per page (newSize) => void
 * @param {number[]} pageSizeOptions - Optional list of page size choices (default: [6, 12, 24, 48])
 * @param {boolean} showPageSize - Whether to render items-per-page dropdown
 * @param {boolean} showSummary - Whether to render "Showing X to Y of Z" text
 * @param {string} className - Additional wrapper styling classes
 */
export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 6,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [6, 12, 24, 48],
  showPageSize = true,
  showSummary = true,
  className = "",
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Compute pagination range with smart ellipsis
  const paginationRange = useMemo(() => {
    const delta = 1; // Number of siblings around active page
    const range = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift("...");
    }
    if (currentPage + delta < totalPages - 1) {
      range.push("...");
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  }, [currentPage, totalPages]);

  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handlePageClick = (page) => {
    if (typeof page === "number" && page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange?.(page);
    }
  };

  return (
    <div
      className={`w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200/80 text-xs text-slate-500 ${className}`}
    >
      {/* Left: Summary & Page Size */}
      <div className="flex items-center gap-3">
        {showSummary && (
          <span className="text-slate-500 font-medium">
            Showing <span className="font-semibold text-slate-800">{startItem}</span> to{" "}
            <span className="font-semibold text-slate-800">{endItem}</span> of{" "}
            <span className="font-semibold text-slate-800">{totalItems}</span> flows
          </span>
        )}

        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <span className="text-slate-400">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Buttons */}
      <div className="flex items-center gap-1 select-none">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 px-2 rounded-lg flex items-center justify-center text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-2xs"
          aria-label="Previous page"
        >
          <ChevronLeft size={14} className="mr-0.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Numbered Page Buttons */}
        {paginationRange.map((page, idx) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="h-8 w-8 flex items-center justify-center text-slate-400 text-xs"
              >
                ...
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={`page-${page}`}
              type="button"
              onClick={() => handlePageClick(page)}
              className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs"
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 px-2 rounded-lg flex items-center justify-center text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-2xs"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={14} className="ml-0.5" />
        </button>
      </div>
    </div>
  );
}
