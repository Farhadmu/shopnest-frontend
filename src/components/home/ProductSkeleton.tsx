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
          className="overflow-hidden rounded-[2rem] border border-border bg-surface"
        >
          <div className="h-60 animate-pulse bg-muted-bg" />
          <div className="space-y-4 p-5">
            <div className="h-3 w-20 animate-pulse rounded-full bg-muted-bg" />
            <div className="h-5 w-4/5 animate-pulse rounded-full bg-muted-bg" />
            <div className="h-7 w-1/2 animate-pulse rounded-full bg-muted-bg" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-muted-bg" />
          </div>
        </div>
      ))}
    </div>
  );
}
