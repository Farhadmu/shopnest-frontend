import React from "react";
import { FiZap, FiBatteryCharging, FiActivity, FiShield } from "react-icons/fi";
import type { Product } from "@/lib/api/products";

export interface ProductAiScoreBannerProps {
  product: Product;
}

/**
 * TODO(backend): this banner currently derives a placeholder score from
 * `ratingAvg`/`sold` client-side. Replace with a real call to
 * `getPurchaseDecisionScore(product.id)` (see
 * `@/lib/api/customer-intelligence`) once that endpoint is stable enough to
 * render for every product without a loading flash.
 */
function getDummyScore(product: Product): number {
  const base = Math.round((product.ratingAvg ?? 4.5) * 18);
  return Math.min(99, Math.max(60, base));
}

export function ProductAiScoreBanner({ product }: ProductAiScoreBannerProps) {
  const score = getDummyScore(product);

  return (
    <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-linear-to-r from-surface via-muted-bg to-surface p-5 shadow-sm md:flex-row md:items-center">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-lg font-black text-primary">
          {score}
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-primary">
            ShopNest AI Decision Score <FiZap size={13} />
          </div>
          <p className="text-sm font-bold text-text">
            {score >= 90 ? "Exceptional Buy" : score >= 75 ? "Strong Buy" : "Solid Option"} &middot; Top in Class (
            {product.category || "Category"})
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-muted">
        <span className="flex items-center gap-1">
          <FiBatteryCharging size={15} className="text-primary" /> Long-lasting
        </span>
        <span className="flex items-center gap-1">
          <FiActivity size={15} className="text-primary" /> Consistent Demand
        </span>
        <span className="flex items-center gap-1">
          <FiShield size={15} className="text-primary" /> Low Return Rate
        </span>
      </div>
    </div>
  );
}