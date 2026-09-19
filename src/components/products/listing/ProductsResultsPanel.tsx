"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { FiLoader } from "react-icons/fi";
import type { Product } from "@/lib/api/products";
import { ProductCard } from "@/components/products/ProductCard";
import { EmptyState } from "@/components/common/EmptyState";
import { useProductFilter } from "./ProductFilterContext";

const SORT_OPTIONS = [
  { key: "newest", label: "Newest Arrivals" },
  { key: "featured", label: "Featured & Recommended" },
  { key: "price_asc", label: "Price: Low to High" },
  { key: "price_desc", label: "Price: High to Low" },
  { key: "rating", label: "Customer Rating" },
];

export interface ProductsResultsPanelProps {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  sort: string;
}

/**
  The client leaf on the /products page. It owns presentation state (sort + grid view)
  and integrates with useProductFilter for optimistic instant loading feedback.
 */
export function ProductsResultsPanel({ products, total, page, limit, sort }: ProductsResultsPanelProps) {
  const searchParams = useSearchParams();
  const { isFiltering, navigateWithFilter } = useProductFilter();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "newest") params.set("sort", value);
    else params.delete("sort");
    params.delete("page");
    const href = params.toString() ? `/products?${params.toString()}` : "/products";
    navigateWithFilter(href, "sort");
  };

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-1 flex-col gap-5 min-w-0 relative">
      {/* Toolbar */}
      <div className="relative overflow-hidden flex flex-col gap-3 rounded-2xl bg-surface p-3 px-4 shadow-sm sm:flex-row sm:items-center sm:justify-between border border-border/60">
        {/* Top Progress Bar */}
        {isFiltering && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 overflow-hidden">
            <div className="h-full w-full bg-linear-to-r from-primary via-accent to-fuchsia-500 animate-progress-bar" />
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-base font-black text-text">All Products</span>
          {isFiltering ? (
            <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary animate-pulse">
              <FiLoader className="animate-spin" size={12} />
              Updating...
            </span>
          ) : (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
              {total} Results
            </span>
          )}
          <span className="hidden text-xs text-muted md:inline">
            Showing {start} - {end} of {total} items
          </span>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-semibold text-muted sm:inline">Sort:</span>
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="rounded-lg bg-muted-bg py-1.5 pl-3 pr-8 text-xs font-bold text-text outline-none cursor-pointer border border-transparent focus:border-primary/40 transition-colors"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid Container with Loading State */}
      <div className="relative min-h-[300px]">
        {/* Floating Loading Badge Overlay */}
        {isFiltering && (
          <div className="absolute inset-0 z-20 flex items-start justify-center pt-20 pointer-events-none">
            <div className="flex items-center gap-2.5 rounded-full bg-surface/95 border border-primary/30 px-5 py-2.5 shadow-xl backdrop-blur-md text-xs font-black text-primary animate-in fade-in zoom-in-95 duration-200">
              <FiLoader className="animate-spin text-primary" size={16} />
              <span>Applying filters &amp; loading products...</span>
            </div>
          </div>
        )}

        <div
          className={`transition-all duration-200 ${
            isFiltering ? "opacity-35 scale-[0.995] pointer-events-none filter blur-[0.4px]" : "opacity-100"
          }`}
        >
          {products.length === 0 ? (
            <EmptyState
              title="No products match your filters"
              description="Try widening your price range or clearing some filters."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}