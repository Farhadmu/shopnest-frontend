"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/lib/api/products";
import { ProductCard } from "@/components/products/ProductCard";
import { EmptyState } from "@/components/common/EmptyState";

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
 * The only client leaf on the /products page. It owns two purely
 * presentational bits of state (sort + grid/list view) that don't need to
 * round-trip to the server: sort still updates the URL (so the server page
 * re-fetches in the right order), while the grid/list toggle is local-only
 * visual state.
 */
export function ProductsResultsPanel({ products, total, page, limit, sort }: ProductsResultsPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "newest") params.set("sort", value);
    else params.delete("sort");
    params.delete("page");
    router.push(params.toString() ? `/products?${params.toString()}` : "/products");
  };

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-1 flex-col gap-5 min-w-0">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl bg-surface p-3 px-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base font-black text-text">All Products</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
            {total} Results
          </span>
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
              className="rounded-lg bg-muted-bg py-1.5 pl-3 pr-8 text-xs font-bold text-text outline-none"
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

      {/* Grid */}
      {products.length === 0 ? (
        <EmptyState
          title="No products match your filters"
          description="Try widening your price range or clearing a filter."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}