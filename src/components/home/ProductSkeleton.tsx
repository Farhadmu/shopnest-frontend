import React from "react";

interface ProductSkeletonProps {
  count?: number;
}

export default function ProductSkeleton({ count = 8 }: ProductSkeletonProps) {
  return (
    <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-border bg-surface shadow-xs"
        >
          <div className="aspect-4/3 animate-pulse bg-muted-bg" />
          <div className="space-y-2.5 p-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 animate-pulse rounded-full bg-muted-bg" />
              <div className="h-3 w-14 animate-pulse rounded-full bg-muted-bg" />
            </div>
            <div className="h-4 w-4/5 animate-pulse rounded-md bg-muted-bg" />
            <div className="flex items-center justify-between pt-1 border-t border-border/40">
              <div className="h-5 w-16 animate-pulse rounded-md bg-muted-bg" />
              <div className="h-8 w-20 animate-pulse rounded-lg bg-muted-bg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
