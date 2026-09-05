import React from "react";
import { FiSliders } from "react-icons/fi";
import type { Product } from "@/lib/api/products";

export interface ProductSpecsTableProps {
  product: Product;
}

// TODO(backend): shown only when `product.specifications` is empty — remove
// once every product is guaranteed to carry real specification data.
const DUMMY_SPECS: Record<string, string> = {
  Category: "General Merchandise",
  Condition: "Brand New",
  "Country of Origin": "Imported",
  "Warranty Period": "1 Year Official",
};

export function ProductSpecsTable({ product }: ProductSpecsTableProps) {
  const specs =
    product.specifications && Object.keys(product.specifications).length > 0
      ? product.specifications
      : DUMMY_SPECS;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <FiSliders className="text-primary" size={20} />
        <h3 className="text-lg font-black text-text">Technical Specs</h3>
      </div>
      <div className="flex flex-col divide-y divide-border text-sm">
        {Object.entries(specs).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between py-2.5">
            <span className="text-muted">{key}</span>
            <span className="font-bold text-text">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}