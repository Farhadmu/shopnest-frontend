import React from "react";
import { FiPackage, FiFileText } from "react-icons/fi";
import type { Product } from "@/lib/api/products";

export interface ProductPackageContentsProps {
  product: Product;
}

/**
 * TODO(backend): `Product` has no "package contents" field yet. Rendering a
 * sensible generic default (the item itself + its documentation) until the
 * schema exposes a real `product.packageContents: string[]`.
 */
export function ProductPackageContents({ product }: ProductPackageContentsProps) {
  const contents = [
    { icon: FiPackage, label: `1x ${product.title}`, sub: "Main Item" },
    { icon: FiFileText, label: "User Manual", sub: "Setup & Care Guide" },
    { icon: FiFileText, label: "Warranty Card", sub: "1-Year Official Card" },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <FiPackage className="text-primary" size={20} />
        <h3 className="text-base font-black text-text">Package Contents (In The Box)</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
        {contents.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex flex-col items-center gap-2 rounded-xl bg-muted-bg p-3">
            <Icon size={24} className="text-primary" />
            <span className="text-xs font-bold text-text">{label}</span>
            <span className="text-[10px] text-muted">{sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}