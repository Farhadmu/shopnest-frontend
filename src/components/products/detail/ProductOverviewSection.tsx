import React from "react";
import { FiFileText, FiTag } from "react-icons/fi";
import type { Product } from "@/lib/api/products";

export interface ProductOverviewSectionProps {
  product: Product;
}

export function ProductOverviewSection({ product }: ProductOverviewSectionProps) {
  // TODO(backend): fall back to generic bullet copy when a product has no
  // tags — a dedicated `product.bulletPoints` field would remove the need
  // for this placeholder entirely.
  const bullets =
    product.tags && product.tags.length > 0
      ? product.tags.slice(0, 4)
      : ["Quality checked before dispatch", "Genuine manufacturer packaging", "Fast, trackable delivery", "Backed by buyer protection"];

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <FiFileText className="text-primary" size={20} />
        <h3 className="text-lg font-black text-text">Product Overview &amp; Experience</h3>
      </div>

      <p className="text-sm leading-relaxed text-muted">
        {product.description || "No description has been provided for this product yet."}
      </p>

      <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-2">
        {bullets.map((bullet) => (
          <div key={bullet} className="flex items-start gap-2.5 rounded-xl bg-muted-bg p-3">
            <FiTag size={16} className="mt-0.5 shrink-0 text-primary" />
            <span className="text-sm font-semibold text-text">{bullet}</span>
          </div>
        ))}
      </div>
    </div>
  );
}