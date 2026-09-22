"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Store, RotateCcw } from "lucide-react";
import { Seller } from "./seller.types";
import SellerCard from "./SellerCard";

interface SellerMarqueeProps {
  sellers: Seller[];
  followedStores: Record<string, boolean>;
  onToggleFollow: (id: string) => void;
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
}

export default function SellerMarquee({
  sellers,
  followedStores,
  onToggleFollow,
  onResetFilters,
  hasActiveFilters = false,
}: SellerMarqueeProps) {
  const [page, setPage] = useState(0);
  const pageSize = 4;
  const pageCount = Math.max(1, Math.ceil(sellers.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleSellers = sellers.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  // Reset page when sellers list changes (e.g. search / category tab change)
  useEffect(() => {
    setPage(0);
  }, [sellers.length]);

  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < pageCount - 1;

  const showNextPage = () => {
    if (canGoNext) setPage((prev) => prev + 1);
  };

  const showPreviousPage = () => {
    if (canGoPrevious) setPage((prev) => prev - 1);
  };

  if (sellers.length === 0) {
    return (
      <div className="relative z-10 mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/60 py-12 px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted-bg text-muted mb-3">
          <Store className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-text">No verified stores found</h3>
        <p className="mt-1 max-w-sm text-xs text-muted">
          {hasActiveFilters
            ? "No top sellers match your selected category or search keyword."
            : "No approved sellers available in this section currently."}
        </p>
        {hasActiveFilters && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary/10 border border-primary/25 px-4 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all cursor-pointer shadow-2xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative z-10 mt-6 overflow-hidden py-3">
      {pageCount > 1 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 py-2">
            <button
              type="button"
              onClick={showPreviousPage}
              disabled={!canGoPrevious}
              aria-label="Show previous sellers"
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition backdrop-blur shadow-xs ${
                canGoPrevious
                  ? "border-primary/30 bg-surface/95 text-primary hover:bg-primary hover:text-white cursor-pointer hover:shadow-md"
                  : "border-border/50 bg-muted-bg/50 text-muted opacity-30 cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="grid min-w-0 flex-1 grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visibleSellers.map((seller) => (
                <div key={seller.id} className="min-w-0">
                  <SellerCard
                    seller={seller}
                    isFollowed={!!followedStores[seller.id]}
                    onToggleFollow={onToggleFollow}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={showNextPage}
              disabled={!canGoNext}
              aria-label="Show more sellers"
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition backdrop-blur shadow-xs ${
                canGoNext
                  ? "border-primary/30 bg-surface/95 text-primary hover:bg-primary hover:text-white cursor-pointer hover:shadow-md"
                  : "border-border/50 bg-muted-bg/50 text-muted opacity-30 cursor-not-allowed"
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {Array.from({ length: pageCount }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPage(idx)}
                aria-label={`Go to page ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentPage === idx
                    ? "w-6 bg-primary shadow-xs shadow-primary/30"
                    : "w-2 bg-border hover:bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-4 py-2 sm:grid-cols-2 lg:grid-cols-4">
          {visibleSellers.map((seller) => (
            <div key={seller.id} className="min-w-0">
              <SellerCard
                seller={seller}
                isFollowed={!!followedStores[seller.id]}
                onToggleFollow={onToggleFollow}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
