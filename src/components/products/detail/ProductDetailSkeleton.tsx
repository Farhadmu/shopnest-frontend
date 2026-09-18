import React from "react";

/**
 * Loading skeleton for the individual product details page (/products/[id]).
 * Mirrors the exact layout of `ProductDetailPage`:
 * - Breadcrumbs bar
 * - Gallery (sticky left) & Buy Box + AI Score + Seller Card (right)
 * - Bento feature highlights
 * - Overview + Package Contents + Tech Specs Table
 * - Customer Reviews breakdown
 *
 * Replaces the product listing card grid skeleton that was erroneously
 * displaying during product detail page loads.
 */
export function ProductDetailSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8"
      role="status"
      aria-label="Loading product details"
    >
      {/* 01. Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <div className="shimmer h-4 w-12 rounded" />
        <span className="text-muted/40">/</span>
        <div className="shimmer h-4 w-20 rounded" />
        <span className="text-muted/40">/</span>
        <div className="shimmer h-4 w-40 rounded" />
      </div>

      {/* 02. Gallery + Buy Box Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left: Gallery Skeleton */}
        <div className="lg:col-span-5">
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 shadow-sm lg:sticky lg:top-24">
            <div className="shimmer relative aspect-square w-full overflow-hidden rounded-xl" />

            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="shimmer aspect-square rounded-lg" />
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <div className="shimmer h-3.5 w-20 rounded" />
              <div className="shimmer h-3.5 w-24 rounded" />
              <div className="shimmer h-3.5 w-20 rounded" />
            </div>
          </div>
        </div>

        {/* Right: Buy Box + AI Score + Seller Card */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          {/* Main Buy Box */}
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="shimmer h-4 w-20 rounded-full" />
              <div className="shimmer h-3 w-28 rounded" />
            </div>

            {/* Title */}
            <div className="flex flex-col gap-2">
              <div className="shimmer h-8 w-4/5 rounded-lg" />
              <div className="shimmer h-8 w-2/3 rounded-lg" />
            </div>

            {/* Rating & Sold badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="shimmer h-6 w-16 rounded-lg" />
              <div className="shimmer h-4 w-28 rounded" />
              <div className="shimmer h-4 w-24 rounded" />
            </div>

            {/* Price section */}
            <div className="flex flex-col gap-2 rounded-xl bg-muted-bg p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-2">
                  <div className="shimmer h-9 w-32 rounded-md" />
                  <div className="shimmer h-6 w-20 rounded-md" />
                  <div className="shimmer h-4 w-16 rounded-full" />
                </div>
                <div className="shimmer h-3 w-48 rounded" />
              </div>
              <div className="shimmer h-12 w-44 rounded-lg" />
            </div>

            {/* Variants */}
            <div className="flex flex-col gap-2">
              <div className="shimmer h-3 w-20 rounded" />
              <div className="flex gap-2">
                <div className="shimmer h-8 w-20 rounded-lg" />
                <div className="shimmer h-8 w-24 rounded-lg" />
                <div className="shimmer h-8 w-20 rounded-lg" />
              </div>
            </div>

            {/* Quantity + CTA buttons */}
            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              <div className="shimmer h-12 w-full rounded-lg sm:w-36" />
              <div className="shimmer h-12 flex-1 rounded-lg" />
              <div className="shimmer h-12 flex-1 rounded-lg" />
              <div className="shimmer h-12 w-12 shrink-0 rounded-lg" />
            </div>

            {/* Stock status */}
            <div className="shimmer h-4 w-36 rounded" />
          </div>

          {/* AI Score Banner */}
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <div className="shimmer h-12 w-12 shrink-0 rounded-xl" />
              <div className="flex flex-col gap-1.5">
                <div className="shimmer h-3 w-36 rounded" />
                <div className="shimmer h-4 w-48 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="shimmer h-4 w-24 rounded" />
              <div className="shimmer h-4 w-28 rounded" />
            </div>
          </div>

          {/* Seller Card */}
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="shimmer h-14 w-14 shrink-0 rounded-full" />
                <div className="flex flex-col gap-1.5">
                  <div className="shimmer h-4 w-36 rounded" />
                  <div className="shimmer h-3 w-28 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="shimmer h-9 w-28 rounded-lg" />
                <div className="shimmer h-9 w-24 rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-xl bg-muted-bg p-3">
              <div className="flex flex-col items-center gap-1">
                <div className="shimmer h-4 w-16 rounded" />
                <div className="shimmer h-3 w-20 rounded" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="shimmer h-4 w-16 rounded" />
                <div className="shimmer h-3 w-20 rounded" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="shimmer h-4 w-16 rounded" />
                <div className="shimmer h-3 w-20 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 03. Features Bento */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="shimmer mb-1 h-11 w-11 rounded-xl" />
            <div className="shimmer h-4 w-28 rounded" />
            <div className="shimmer h-3 w-full rounded" />
            <div className="shimmer h-3 w-3/4 rounded" />
          </div>
        ))}
      </div>

      {/* 04. Overview + Specs */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        <div className="flex flex-col gap-6 lg:col-span-7">
          {/* Overview Section */}
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <div className="border-b border-border pb-3">
              <div className="shimmer h-6 w-52 rounded" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="shimmer h-4 w-full rounded" />
              <div className="shimmer h-4 w-11/12 rounded" />
              <div className="shimmer h-4 w-4/5 rounded" />
            </div>
            <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="shimmer h-11 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Package Contents */}
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <div className="border-b border-border pb-3">
              <div className="shimmer h-5 w-48 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="shimmer h-20 rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Specs Table */}
        <div className="lg:col-span-5">
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <div className="border-b border-border pb-3">
              <div className="shimmer h-6 w-36 rounded" />
            </div>
            <div className="flex flex-col divide-y divide-border">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5">
                  <div className="shimmer h-4 w-28 rounded" />
                  <div className="shimmer h-4 w-32 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 05. Reviews Section */}
      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="shimmer h-6 w-44 rounded" />
          <div className="shimmer h-9 w-32 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="flex flex-col items-center justify-center gap-2 md:col-span-4">
            <div className="shimmer h-14 w-24 rounded-xl" />
            <div className="shimmer h-4 w-32 rounded" />
          </div>
          <div className="flex flex-col gap-2.5 md:col-span-8">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="shimmer h-3 w-12 rounded" />
                <div className="shimmer h-3 flex-1 rounded-full" />
                <div className="shimmer h-3 w-8 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailSkeleton;
