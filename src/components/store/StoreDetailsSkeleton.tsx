export default function StoreDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-slate-100 pb-16 font-sans text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* 1. Store Banner Skeleton */}
      <div className="shimmer h-44 sm:h-56 md:h-64 lg:h-72 w-full" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 2. Store Profile Header Skeleton */}
        <div className="-mt-12 relative z-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            {/* Left: Logo & Info */}
            <div className="flex items-start gap-4">
              <div className="shimmer h-20 w-20 shrink-0 rounded-2xl border-4 border-white dark:border-slate-900 shadow-md" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="shimmer h-6 w-48 rounded-lg" />
                  <div className="shimmer h-5 w-5 rounded-full" />
                </div>
                <div className="shimmer h-3.5 w-64 rounded" />
                <div className="flex items-center gap-3 pt-1">
                  <div className="shimmer h-4 w-16 rounded" />
                  <div className="shimmer h-4 w-24 rounded" />
                  <div className="shimmer h-4 w-20 rounded" />
                </div>
              </div>
            </div>

            {/* Right: Follow & Message Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="shimmer h-10 w-28 rounded-xl" />
              <div className="shimmer h-10 w-32 rounded-xl" />
            </div>
          </div>
        </div>

        {/* 3. Store Tabs Skeleton */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shimmer h-10 w-36 shrink-0 rounded-xl" />
          ))}
        </div>

        {/* 4. 2-Column Content Grid Skeleton */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Trust Standards & Reviews */}
          <div className="space-y-5 lg:col-span-8">
            {/* Trust Standard Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="shimmer h-5 w-44 rounded-lg" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-100 p-3 dark:border-slate-800 space-y-2"
                  >
                    <div className="shimmer h-4 w-24 rounded" />
                    <div className="shimmer h-6 w-16 rounded-lg" />
                    <div className="shimmer h-2 w-full rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Review Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="shimmer h-8 w-24 shrink-0 rounded-full" />
              ))}
            </div>

            {/* Review Cards */}
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="shimmer h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <div className="shimmer h-4 w-32 rounded" />
                        <div className="shimmer h-3 w-20 rounded" />
                      </div>
                    </div>
                    <div className="shimmer h-4 w-24 rounded" />
                  </div>
                  <div className="shimmer h-3.5 w-full rounded" />
                  <div className="shimmer h-3.5 w-4/5 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Top Seller Products & Voucher */}
          <div className="space-y-5 lg:col-span-4">
            {/* Top Seller Products Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex items-center justify-between">
                <div className="shimmer h-5 w-36 rounded-lg" />
                <div className="shimmer h-5 w-20 rounded-full" />
              </div>

              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800"
                >
                  <div className="shimmer h-16 w-16 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="shimmer h-4 w-3/4 rounded" />
                    <div className="shimmer h-4 w-16 rounded" />
                    <div className="shimmer h-3 w-12 rounded" />
                  </div>
                  <div className="shimmer h-9 w-9 shrink-0 rounded-lg" />
                </div>
              ))}

              <div className="shimmer h-10 w-full rounded-xl" />
            </div>

            {/* Store Voucher Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="shimmer h-5 w-28 rounded-lg" />
              <div className="shimmer h-16 w-full rounded-xl" />
              <div className="shimmer h-9 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
