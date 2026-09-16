import {
  ProductsResultsSkeleton,
  ProductsPaginationSkeleton,
} from "@/components/products/listing/ProductsResultsSkeleton";

/**
 * Route-level loading skeleton for /products.
 *
 * Without this, navigations to the products route fall back to the root
 * `app/loading.tsx`, which is a fixed full-screen overlay — every filter click
 * blanked the whole page. This mirrors the page's own containers so the
 * transition keeps the layout stable instead.
 */
export default function Loading() {
  return (
    <div className="mx-auto flex w-full container flex-col gap-6 px-4 pb-20 sm:px-6 lg:px-8">
      {/* Hero bar */}
      <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-surface px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="shimmer h-6 w-40 rounded-md" />
          <div className="shimmer h-11 w-full max-w-xl rounded-xl" />
          <div className="shimmer hidden h-4 w-56 rounded-md xl:block" />
        </div>
      </section>

      {/* Category chips */}
      <div className="relative w-full overflow-hidden">
        <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 pr-10">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="shimmer h-8 w-28 shrink-0 rounded-full" />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-start gap-6 lg:flex-row">
        {/* Filter sidebar */}
        <aside className="flex w-full shrink-0 flex-col gap-4 lg:sticky lg:top-24 lg:w-72">
          <div className="flex flex-col gap-4 rounded-2xl bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="shimmer h-5 w-24 rounded-md" />
              <div className="shimmer h-4 w-16 rounded-md" />
            </div>
            <div className="shimmer h-4 w-28 rounded-md" />
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="shimmer h-7 w-full rounded-lg" />
            ))}
            <div className="shimmer h-4 w-32 rounded-md" />
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="shimmer h-7 w-full rounded-lg" />
            ))}
          </div>
          <div className="shimmer h-40 w-full rounded-2xl" />
        </aside>

        <ProductsResultsSkeleton />
      </div>

      <ProductsPaginationSkeleton />
    </div>
  );
}
