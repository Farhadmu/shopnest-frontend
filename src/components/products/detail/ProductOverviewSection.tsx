import React from "react";
import { FiFileText, FiTag } from "react-icons/fi";
import type { Product } from "@/lib/api/products";

export interface ProductOverviewSectionProps {
  product: Product;
}

export function ProductOverviewSection({ product }: ProductOverviewSectionProps) {
  const hasTags = Boolean(product.tags && product.tags.length > 0);

  return (
    <div className="flex w-full flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all">
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center gap-2 border-b border-border pb-2.5">
          <FiFileText className="text-primary" size={20} />
          <h3 className="text-base font-black text-text sm:text-lg">Product Overview &amp; Experience</h3>
        </div>

        <p className="text-sm leading-relaxed text-muted whitespace-pre-line">
          {product.description || "No description has been provided for this product yet."}
        </p>
      </div>

      {hasTags && product.tags && product.tags.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border/60">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Key Tags &amp; Highlights</span>
          <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
            {product.tags.slice(0, 4).map((tag) => (
              <div key={tag} className="flex items-center gap-2 rounded-xl bg-muted-bg/60 px-3 py-2">
                <FiTag size={13} className="shrink-0 text-primary" />
                <span className="text-xs font-semibold text-text truncate">{tag}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}