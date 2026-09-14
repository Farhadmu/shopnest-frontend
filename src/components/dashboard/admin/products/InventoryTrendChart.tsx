"use client";

import { useId } from "react";

export function InventoryTrendChart({ seed = 1 }: { seed?: number }) {
  const chartUniqueId = useId().replace(/:/g, "");
  const curves = [
    "M 4 20 C 18 20, 28 32, 44 32 C 60 32, 68 12, 92 8 L 100 6",
    "M 4 16 C 18 24, 34 30, 50 16 C 66 4, 82 14, 100 10",
    "M 4 22 C 20 10, 36 8, 52 24 C 68 34, 84 12, 100 8",
    "M 4 12 C 18 28, 34 32, 54 14 C 72 4, 88 18, 100 6",
  ];

  return (
    <div className="relative flex h-5 w-16 shrink-0 items-center justify-center">
      <svg className="h-full w-full overflow-visible" viewBox="0 0 104 38" fill="none">
        <defs>
          <linearGradient id={chartUniqueId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
        <path
          d={curves[Math.abs(seed) % curves.length]}
          stroke={`url(#${chartUniqueId})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="100" cy="7" r="2.5" fill="#A855F7" />
      </svg>
    </div>
  );
}
