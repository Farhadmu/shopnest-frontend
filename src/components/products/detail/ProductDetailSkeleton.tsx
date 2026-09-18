import React from "react";

/**
 * High-fidelity loading skeleton for the individual product details page (/products/[id]).
 * Accurately mirrors `ProductDetailPage`:
 * - 01. Breadcrumbs
 * - 02. Hero Grid (5 cols Gallery sticky left + 7 cols Buy Box & Seller Card right)
 * - 03. Full-Width AI Purchase Decision Engine Dashboard (Score, Verdict & 4 Dimension Cards)
 * - 04. Bento Feature Highlights (4 grid columns)
 * - 05. 2-Column Overview & Specs Grid + Package Contents (In The Box)
 * - 06. Customer Reviews Breakdown & Community Validation
 * - 07. Recommended Products Grid
 */
export function ProductDetailSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-col gap-8"
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

      {/* 02. Top Hero: Product Gallery + Buy Box & Seller Card */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left: Sticky Gallery */}
        <div className="lg:col-span-5">
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 shadow-sm lg:sticky lg:top-24">
            {/* Main image */}
            <div className="shimmer relative aspect-square w-full overflow-hidden rounded-xl" />

            {/* Thumbnail row */}
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="shimmer aspect-square rounded-lg" />
              ))}
            </div>

            {/* Gallery footer badges */}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <div className="shimmer h-3.5 w-20 rounded" />
              <div className="shimmer h-3.5 w-24 rounded" />
              <div className="shimmer h-3.5 w-20 rounded" />
            </div>
          </div>
        </div>

        {/* Right: Buy Box + Seller Card */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          {/* Main Buy Box */}
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
            {/* Deal badge & SKU */}
            <div className="flex items-center justify-between">
              <div className="shimmer h-5 w-20 rounded-full" />
              <div className="shimmer h-3.5 w-24 rounded" />
            </div>

            {/* Title */}
            <div className="flex flex-col gap-2">
              <div className="shimmer h-8 w-4/5 rounded-lg" />
              <div className="shimmer h-8 w-2/3 rounded-lg" />
            </div>

            {/* Rating, Sold & AI Score pill */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="shimmer h-6 w-16 rounded-lg" />
              <div className="shimmer h-4 w-28 rounded" />
              <div className="shimmer h-4 w-24 rounded" />
              <div className="shimmer h-6 w-36 rounded-full" />
            </div>

            {/* Price section */}
            <div className="flex flex-col gap-2 rounded-xl bg-muted-bg p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline gap-2.5">
                  <div className="shimmer h-9 w-32 rounded-md" />
                  <div className="shimmer h-5 w-20 rounded-md" />
                  <div className="shimmer h-5 w-16 rounded-full" />
                </div>
                <div className="shimmer h-3 w-40 rounded" />
              </div>
              <div className="shimmer h-12 w-48 rounded-lg" />
            </div>

            {/* Variants */}
            <div className="flex flex-col gap-2">
              <div className="shimmer h-3.5 w-24 rounded" />
              <div className="flex gap-2">
                <div className="shimmer h-9 w-20 rounded-lg" />
                <div className="shimmer h-9 w-24 rounded-lg" />
                <div className="shimmer h-9 w-20 rounded-lg" />
              </div>
            </div>

            {/* Quantity + Action buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="shimmer h-12 w-full rounded-xl sm:w-36 shrink-0" />
              <div className="flex flex-1 items-center gap-3 w-full">
                <div className="shimmer h-12 flex-1 w-full basis-0 rounded-xl" />
                <div className="shimmer h-12 flex-1 w-full basis-0 rounded-xl" />
              </div>
              <div className="shimmer h-12 w-12 shrink-0 rounded-xl" />
            </div>

            {/* Stock status */}
            <div className="shimmer h-4 w-36 rounded" />

            {/* Trust badges row */}
            <div className="grid grid-cols-3 gap-2 border-t border-border pt-4">
              <div className="shimmer h-8 rounded-lg" />
              <div className="shimmer h-8 rounded-lg" />
              <div className="shimmer h-8 rounded-lg" />
            </div>
          </div>

          {/* Seller Card */}
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex flex-col gap-2.5 border-b border-border/70 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <div className="shimmer h-10 w-10 shrink-0 rounded-xl" />
                <div className="flex flex-col gap-1.5">
                  <div className="shimmer h-4 w-36 rounded" />
                  <div className="shimmer h-3 w-28 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="shimmer h-8 w-28 rounded-lg" />
                <div className="shimmer h-8 w-24 rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted-bg/60 p-2">
              <div className="flex flex-col items-center gap-1">
                <div className="shimmer h-3.5 w-12 rounded" />
                <div className="shimmer h-2.5 w-16 rounded" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="shimmer h-3.5 w-12 rounded" />
                <div className="shimmer h-2.5 w-16 rounded" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="shimmer h-3.5 w-12 rounded" />
                <div className="shimmer h-2.5 w-16 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 03. AI Purchase Decision Engine Dashboard (Full Width) */}
      <div className="w-full rounded-3xl border border-primary/20 bg-gradient-to-br from-surface via-surface-muted/40 to-primary/5 p-5 sm:p-7 shadow-sm space-y-5">
        {/* Top Banner Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-border/60 pb-5">
          <div className="flex items-center gap-4">
            <div className="shimmer h-14 w-14 sm:h-16 sm:w-16 rounded-2xl shrink-0" />
            <div className="space-y-2">
              <div className="shimmer h-3.5 w-44 rounded" />
              <div className="shimmer h-6 w-60 sm:w-72 rounded-lg" />
            </div>
          </div>
          <div className="shimmer h-10 w-64 rounded-2xl" />
        </div>

        {/* 4 Multi-Dimensional Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-2xl border border-border/70 bg-surface/90 p-4 shadow-xs min-h-[110px]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="shimmer h-8 w-8 rounded-xl shrink-0" />
                    <div className="shimmer h-3.5 w-18 rounded" />
                  </div>
                  <div className="shimmer h-5 w-14 rounded-lg" />
                </div>
                <div className="shimmer h-1.5 w-full rounded-full my-2.5" />
              </div>
              <div className="shimmer h-3 w-4/5 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 04. Bento Feature Highlights */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-2.5 rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-sm"
          >
            <div className="shimmer mb-1 h-11 w-11 rounded-xl" />
            <div className="shimmer h-4 w-28 rounded" />
            <div className="shimmer h-3 w-full rounded" />
            <div className="shimmer h-3 w-3/4 rounded" />
          </div>
        ))}
      </div>

      {/* 05. Details & Specs Section (2-Column Grid + Package Contents) */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
          {/* Overview Section */}
          <div className="flex w-full flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-2.5">
              <div className="shimmer h-5 w-5 rounded-md" />
              <div className="shimmer h-6 w-52 rounded" />
            </div>
            <div className="flex flex-col gap-2 pt-3">
              <div className="shimmer h-4 w-full rounded" />
              <div className="shimmer h-4 w-11/12 rounded" />
              <div className="shimmer h-4 w-4/5 rounded" />
              <div className="shimmer h-4 w-3/4 rounded" />
            </div>
            <div className="mt-4 border-t border-border/60 pt-3">
              <div className="shimmer h-3 w-36 rounded mb-2" />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="shimmer h-9 rounded-xl" />
                ))}
              </div>
            </div>
          </div>

          {/* Tech Specs Table */}
          <div className="flex w-full flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="shimmer h-8 w-8 rounded-lg" />
                <div className="flex flex-col gap-1">
                  <div className="shimmer h-5 w-32 rounded" />
                  <div className="shimmer h-2.5 w-44 rounded" />
                </div>
              </div>
              <div className="shimmer h-5 w-18 rounded-full" />
            </div>
            <div className="flex flex-col divide-y divide-border/60">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5 px-1.5">
                  <div className="shimmer h-3.5 w-24 rounded" />
                  <div className="shimmer h-3.5 w-32 rounded" />
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border/60 pt-3">
              <div className="shimmer h-9 w-full rounded-xl" />
            </div>
          </div>
        </div>

        {/* Package Contents (In The Box) */}
        <div className="flex flex-col gap-3.5 rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-2.5">
            <div className="shimmer h-5 w-5 rounded-md" />
            <div className="shimmer h-5 w-48 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 rounded-xl bg-muted-bg p-3">
                <div className="shimmer h-6 w-6 rounded-lg" />
                <div className="shimmer h-3.5 w-24 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 06. Customer Reviews Breakdown */}
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <div className="shimmer h-3 w-32 rounded" />
              <div className="shimmer h-6 w-56 rounded" />
              <div className="shimmer h-3 w-44 rounded" />
            </div>
            <div className="shimmer h-10 w-36 rounded-xl self-start sm:self-auto" />
          </div>

          <div className="grid grid-cols-1 items-center gap-4 pt-4 lg:grid-cols-12">
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-muted-bg p-4 text-center lg:col-span-4">
              <div className="shimmer h-9 w-16 rounded" />
              <div className="shimmer h-4 w-24 rounded" />
              <div className="shimmer h-3 w-32 rounded" />
            </div>
            <div className="flex flex-col gap-2 lg:col-span-8">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="shimmer h-3 w-10 rounded" />
                  <div className="shimmer h-2.5 flex-1 rounded-full" />
                  <div className="shimmer h-3 w-8 rounded" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-border/70 pt-4 mt-4">
            <div className="shimmer h-8 w-24 rounded-lg" />
            <div className="shimmer h-8 w-28 rounded-lg" />
            <div className="shimmer h-8 w-32 rounded-lg" />
          </div>
        </div>

        {/* 2 Review Item Cards */}
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="shimmer h-10 w-10 rounded-full" />
                  <div className="flex flex-col gap-1">
                    <div className="shimmer h-4 w-32 rounded" />
                    <div className="shimmer h-3 w-20 rounded" />
                  </div>
                </div>
                <div className="shimmer h-4 w-24 rounded" />
              </div>
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="shimmer h-4 w-full rounded" />
                <div className="shimmer h-4 w-4/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 07. Recommended Products Grid */}
      <div className="relative flex flex-col gap-6 rounded-3xl border border-border/80 bg-surface/60 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="shimmer h-8 w-8 rounded-xl" />
            <div className="shimmer h-6 w-48 rounded-lg" />
            <div className="shimmer h-5 w-28 rounded-full" />
          </div>
          <div className="shimmer h-4 w-28 rounded self-start sm:self-auto" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm"
            >
              <div className="shimmer aspect-square w-full rounded-xl" />
              <div className="shimmer h-3 w-20 rounded" />
              <div className="flex flex-col gap-1.5">
                <div className="shimmer h-4 w-full rounded" />
                <div className="shimmer h-4 w-2/3 rounded" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="shimmer h-5 w-20 rounded" />
                <div className="shimmer h-4 w-14 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailSkeleton;

