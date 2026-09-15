// src/app/loading.tsx
// Route-level loading skeleton (used by Next.js on navigations between pages).
"use client";

import Image from "next/image";

export default function Loading() {
  return (
    <main
      className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-background"
      role="status"
      aria-label="Loading ShopNest..."
    >
      <div className="flex flex-col items-center gap-6">
        {/* Brand Logo */}
        <div className="relative h-14 w-40 sm:h-16 sm:w-48">
          <Image
            src="/logo.png"
            alt="ShopNest"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Indeterminate progress bar (pure Tailwind) */}
        <div className="w-56 space-y-3 sm:w-64">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div className="absolute inset-y-0 left-0 w-1/3 animate-[indeterminate_1.4s_ease-in-out_infinite] rounded-full bg-primary" />
          </div>
          <p className="text-center text-xs font-medium uppercase tracking-widest text-muted animate-pulse">
            Loading ShopNest…
          </p>
        </div>
      </div>
    </main>
  );
}