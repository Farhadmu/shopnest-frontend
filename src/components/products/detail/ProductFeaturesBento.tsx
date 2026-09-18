import React from "react";
import { FiCheckCircle } from "react-icons/fi";
import type { Product } from "@/lib/api/products";

export interface ProductFeaturesBentProps {
  product: Product;
}

export function ProductFeaturesBent({ product }: ProductFeaturesBentProps) {
  if (!product.highlights || product.highlights.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {product.highlights.map((item, idx) => {
        const title = typeof item === "string" ? item : item.title;
        const description = typeof item === "string" ? "" : item.description;

        return (
          <div
            key={`${title}-${idx}`}
            className="flex flex-col gap-2.5 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
          >
            <div className="mb-1 grid h-11 w-11 place-items-center rounded-xl bg-muted-bg text-primary">
              <FiCheckCircle size={20} />
            </div>
            <h4 className="text-sm font-black text-text">{title}</h4>
            {description && <p className="text-xs leading-relaxed text-muted">{description}</p>}
          </div>
        );
      })}
    </div>
  );
}