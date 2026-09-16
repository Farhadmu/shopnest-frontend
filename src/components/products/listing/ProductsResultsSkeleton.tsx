import React from "react";

/**
 * Loading skeletons for the product results area. They mirror the exact
 * containers and card dimensions of `ProductsResultsPanel` /
 * `ProductsPaginationBar`, so swapping skeleton -> content never shifts the
 * layout. Animation comes from the shared `.shimmer` utility, which is pure
 * CSS and already honours `prefers-reduced-motion`.
 */
export function ProductsResultsSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-5 min-w-0" role="status" aria-label="Loading products">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl bg-surface p-3 px-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="shimmer h-5 w-28 rounded-md" />
          <div className="shimmer h-5 w-20 rounded-full" />
          <div className="shimmer hidden h-4 w-36 rounded-md md:block" />
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="shimmer h-8 w-40 rounded-lg" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-lg border border-border/70 bg-surface shadow-sm"
          >
            <div className="shimmer h-52 w-full sm:h-56" />
            <div className="flex flex-col gap-2 p-3">
              <div className="shimmer h-3 w-24 rounded-md" />
              <div className="shimmer h-4 w-full rounded-md" />
              <div className="shimmer h-4 w-3/5 rounded-md" />
              <div className="shimmer h-5 w-24 rounded-md" />
              <div className="shimmer h-3 w-20 rounded-md" />
              <div className="shimmer h-9 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductsPaginationSkeleton() {
  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-surface p-4 shadow-sm sm:flex-row">
      <div className="shimmer h-4 w-52 rounded-md" />
      <div className="flex items-center gap-1.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="shimmer h-9 w-9 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
