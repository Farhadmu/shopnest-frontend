import React from "react";
import { FiPackage } from "react-icons/fi";
import type { Product } from "@/lib/api/products";

export interface ProductPackageContentsProps {
  product: Product;
}

export function ProductPackageContents({ product }: ProductPackageContentsProps) {
  if (!product.packageContents || product.packageContents.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border pb-2.5">
        <FiPackage className="text-primary" size={20} />
        <h3 className="text-base font-black text-text">Package Contents (In The Box)</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
        {product.packageContents.map((item, idx) => (
          <div key={`${item}-${idx}`} className="flex flex-col items-center gap-2 rounded-xl bg-muted-bg p-3">
            <FiPackage size={24} className="text-primary" />
            <span className="text-xs font-bold text-text">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}