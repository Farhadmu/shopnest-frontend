"use client";

import Image from "next/image";

interface HomePageLoaderProps {
  /** 0–100 progress value coordinated with actual data-fetching. */
  progress: number;
  /** When false the loader is visible; when true it fades out. */
  visible: boolean;
}

/**
 * HomePageLoader
 *
 * Full-screen overlay shown while critical homepage data is loading.
 * Fades out smoothly once `visible` becomes false (i.e. isHomeReady === true).
 *
 * Design tokens from globals.css are used so dark/light mode is automatic.
 */
export default function HomePageLoader({ progress, visible }: HomePageLoaderProps) {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div
      role="status"
      aria-label="Loading ShopNest homepage"
      aria-live="polite"
      aria-busy={visible}
      className={[
        "fixed inset-0 z-[9999] flex min-h-screen flex-col items-center justify-center",
        "bg-background",
        // Fade-out transition when the page is ready.
        "transition-opacity duration-500",
        visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      ].join(" ")}
    >
      {/* ── Logo ── */}
      <div className="relative mb-8 h-14 w-40 sm:h-16 sm:w-48">
        <Image
          src="/shopnest-logo.png"
          alt="ShopNest"
          fill
          className="object-contain"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* ── Progress bar + label ── */}
      <div className="flex w-56 flex-col items-center gap-3 sm:w-64">
        {/* Track */}
        <div
          className="relative h-1.5 w-full overflow-hidden rounded-full bg-border"
          aria-hidden="true"
        >
          {/* Fill */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${clampedProgress}%` }}
          />
          {/* Shimmer overlay */}
          <div
            className={[
              "absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite]",
              "bg-gradient-to-r from-transparent via-white/30 to-transparent",
            ].join(" ")}
            aria-hidden="true"
          />
        </div>

        {/* Percentage + text */}
        <div className="flex w-full items-center justify-between">
          <p className="text-xs font-medium tracking-widest text-muted uppercase">
            Loading…
          </p>
          <p
            className="tabular-nums text-xs font-semibold text-primary"
            aria-label={`${clampedProgress} percent loaded`}
          >
            {clampedProgress}%
          </p>
        </div>
      </div>
    </div>
  );
}