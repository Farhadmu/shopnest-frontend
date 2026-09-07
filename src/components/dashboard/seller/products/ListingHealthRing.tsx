// src/components/dashboard/seller/products/ListingHealthRing.tsx
"use client";

import { ProgressCircle } from "@heroui/react";

interface ListingHealthRingProps {
  score: number;
}

export function ListingHealthRing({ score }: ListingHealthRingProps) {
  const label =
    score >= 80 ? "High placement boost" : score >= 50 ? "Good, add more detail" : "Fill in more fields";
  const color = score >= 80 ? "success" : score >= 50 ? "accent" : "warning";

  return (
    <div className="flex w-full items-center gap-3 rounded-xl bg-muted-bg/60 px-4 py-2.5 sm:w-auto">
      <div className="relative flex h-11 w-11 items-center justify-center">
        <ProgressCircle
          aria-label="Listing strength"
          value={score}
          color={color as "success" | "accent" | "warning"}
          size="md"
          className="h-11 w-11"
        >
          <ProgressCircle.Track>
            <ProgressCircle.TrackCircle />
            <ProgressCircle.FillCircle />
          </ProgressCircle.Track>
        </ProgressCircle>
        <span className="absolute text-[11px] font-black text-text">{score}</span>
      </div>
      <div>
        <p className="text-xs font-bold text-text">Listing Strength</p>
        <p className="text-[11px] text-muted">{label}</p>
      </div>
    </div>
  );
}