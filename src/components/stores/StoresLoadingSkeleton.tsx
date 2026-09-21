export function StoresHeroSkeleton() {
  return (
    <section className="relative overflow-hidden bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-white pt-6 pb-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 1. Breadcrumb & badge */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="shimmer h-6 w-72 rounded-full" />
          <div className="shimmer h-4 w-36 rounded-md" />
        </div>

        {/* 2. Title & Stats Grid */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="shimmer h-10 w-80 rounded-xl" />
            <div className="shimmer h-4 w-full max-w-lg rounded-md" />
            <div className="shimmer h-4 w-3/4 max-w-md rounded-md" />
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0 sm:w-auto w-full">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:px-4 shadow-xs"
              >
                <div className="shimmer h-10 w-10 shrink-0 rounded-xl" />
                <div className="space-y-1.5">
                  <div className="shimmer h-4 w-20 rounded" />
                  <div className="shimmer h-3 w-16 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Filter Card Skeleton */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-xs space-y-3">
          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="shimmer h-11 flex-1 rounded-xl" />
            <div className="shimmer h-11 w-44 rounded-xl" />
            <div className="shimmer hidden sm:block h-11 w-32 rounded-xl" />
            <div className="shimmer hidden sm:block h-11 w-20 rounded-xl" />
          </div>

          {/* Category Chips */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/70 flex items-center gap-2 overflow-x-auto pb-1">
            {Array.from({ length: 7 }).map((_, idx) => (
              <div key={idx} className="shimmer h-9 w-28 shrink-0 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function StoreCardSkeleton() {
  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
      <div>
        {/* Store Header */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="shimmer h-11 w-11 shrink-0 rounded-xl" />
            <div className="space-y-1.5">
              <div className="shimmer h-4 w-28 rounded" />
              <div className="shimmer h-3 w-20 rounded" />
            </div>
          </div>
          <div className="shimmer h-5 w-16 rounded-full shrink-0" />
        </div>

        {/* Tagline / Description */}
        <div className="mt-3 space-y-1.5">
          <div className="shimmer h-3 w-full rounded" />
          <div className="shimmer h-3 w-4/5 rounded" />
        </div>

        {/* 3 Featured Products */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <div className="shimmer h-2.5 w-28 rounded" />
            <div className="shimmer h-2.5 w-16 rounded" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 p-1.5 space-y-1.5"
              >
                <div className="shimmer aspect-square w-full rounded-lg" />
                <div className="shimmer h-2 w-full rounded" />
                <div className="shimmer h-2.5 w-10 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="shimmer h-3 w-24 rounded" />
          <div className="shimmer h-3 w-14 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="shimmer h-9 rounded-xl" />
          <div className="shimmer h-9 rounded-xl" />
        </div>
      </div>
    </article>
  );
}

export default function StoresLoadingSkeleton() {
  return (
    <main className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-16">
      {/* 1. Hero Skeleton */}
      <StoresHeroSkeleton />

      {/* 2. Store Grid Skeleton */}
      <section className="py-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <StoreCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. Pagination Skeleton */}
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="shimmer h-4 w-40 rounded" />
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="shimmer h-9 w-9 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
