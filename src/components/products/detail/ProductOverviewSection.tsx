import React from "react";
import { FiFileText, FiTag } from "react-icons/fi";
import type { Product } from "@/lib/api/products";

export interface ProductOverviewSectionProps {
  product: Product;
}

export function ProductOverviewSection({ product }: ProductOverviewSectionProps) {
  const hasTags = Boolean(product.tags && product.tags.length > 0);

  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border pb-2.5">
        <FiFileText className="text-primary" size={20} />
        <h3 className="text-lg font-black text-text">Product Overview &amp; Experience</h3>
      </div>

      <p className="text-sm leading-relaxed text-muted">
        {product.description || "No description has been provided for this product yet."}
      </p>

      {hasTags && product.tags && product.tags.length > 0 && (
        <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-2">
          {product.tags.slice(0, 4).map((tag) => (
            <div key={tag} className="flex items-start gap-2.5 rounded-xl bg-muted-bg p-3">
              <FiTag size={16} className="mt-0.5 shrink-0 text-primary" />
              <span className="text-sm font-semibold text-text">{tag}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}