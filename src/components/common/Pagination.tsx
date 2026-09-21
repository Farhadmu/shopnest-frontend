"use client";

import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  itemName?: string;
  onPageChange: (page: number) => void;
  className?: string;
}

function getPageList(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: (number | "...")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("...");
    result.push(p);
    prev = p;
  }
  return result;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 12,
  itemName = "items",
  onPageChange,
  className = "",
}) => {
  if (totalPages <= 1 && (!totalItems || totalItems <= itemsPerPage)) {
    return null;
  }

  const pages = getPageList(currentPage, totalPages);

  const startItem = totalItems ? Math.min((currentPage - 1) * itemsPerPage + 1, totalItems) : 1;
  const endItem = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : itemsPerPage;

  const handlePageClick = (pageNumber: number) => {
    if (pageNumber === currentPage || pageNumber < 1 || pageNumber > totalPages) return;
    onPageChange(pageNumber);
  };

  return (
    <div
      className={`flex flex-col items-center justify-between gap-4 rounded-2xl bg-white dark:bg-slate-900/90 p-4 shadow-sm sm:flex-row border border-slate-200 dark:border-slate-800 ${className}`}
    >
      {/* Summary Text */}
      <div className="text-xs text-slate-500 dark:text-slate-400">
        {totalItems !== undefined ? (
          <span>
            Showing <span className="font-bold text-slate-900 dark:text-white">{startItem}–{endItem}</span> of{" "}
            <span className="font-bold text-slate-900 dark:text-white">{totalItems}</span> {itemName} &middot; Page{" "}
            <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of{" "}
            <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
          </span>
        ) : (
          <span>
            Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of{" "}
            <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
          </span>
        )}
      </div>

      {/* Navigation Buttons Cluster */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className={`grid h-9 w-9 place-items-center rounded-xl transition-all ${
            currentPage <= 1
              ? "pointer-events-none bg-slate-100 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary/10 hover:text-primary hover:border hover:border-primary/20 cursor-pointer active:scale-95"
          }`}
        >
          <FiChevronLeft size={16} />
        </button>

        {/* Page Numbers */}
        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`ellipsis-${idx}`} className="px-1 text-xs font-bold text-slate-400 dark:text-slate-500">
                ...
              </span>
            );
          }

          const isCurrent = p === currentPage;

          return (
            <button
              key={p}
              type="button"
              onClick={() => handlePageClick(p)}
              className={`grid h-9 min-w-[36px] place-items-center rounded-xl px-2.5 text-xs font-bold transition-all ${
                isCurrent
                  ? "bg-primary text-white shadow-sm shadow-primary/30 ring-2 ring-primary/20 cursor-default"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary/10 hover:text-primary hover:border hover:border-primary/20 cursor-pointer active:scale-95"
              }`}
            >
              {p}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className={`grid h-9 w-9 place-items-center rounded-xl transition-all ${
            currentPage >= totalPages
              ? "pointer-events-none bg-slate-100 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary/10 hover:text-primary hover:border hover:border-primary/20 cursor-pointer active:scale-95"
          }`}
        >
          <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
