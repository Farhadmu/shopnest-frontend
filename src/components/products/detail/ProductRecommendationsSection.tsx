"use client";

import React from "react";
import Link from "next/link";
import { FiArrowRight, FiLayers } from "react-icons/fi";
import { Sparkles } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import type { Product, RecommendedProductsResponse } from "@/lib/api/products";

export interface ProductRecommendationsSectionProps {
  productId: string;
  currentCategory?: string;
  recommendations: RecommendedProductsResponse | null;
}

export function ProductRecommendationsSection({
  currentCategory,
  recommendations,
}: ProductRecommendationsSectionProps) {
  const products: Product[] = recommendations?.products ?? [];
  const source = recommendations?.source ?? "none";
  const parentCategory = recommendations?.parentCategory;
  const category = recommendations?.category || currentCategory || "Products";

  if (!products || products.length === 0) {
    return null;
  }

  // Determine subtitle & destination based on recommendation origin
  let badgeLabel = `More from ${category}`;
  let exploreCategory = category;

  if (source === "parent_category" && parentCategory) {
    badgeLabel = `Related in ${parentCategory}`;
    exploreCategory = parentCategory;
  } else if (source === "fallback") {
    badgeLabel = "Trending & Popular";
  }

  return (
    <section className="relative mt-4 flex flex-col gap-6 rounded-3xl border border-border/80 bg-gradient-to-b from-card/80 to-card/40 p-6 shadow-sm backdrop-blur-sm sm:p-8">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-12 left-1/4 -z-10 h-44 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 right-1/4 -z-10 h-44 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-inner">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              Recommended Products
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <FiLayers className="h-3 w-3" />
              {badgeLabel}
            </span>
          </div>
          <p className="text-xs font-medium text-muted sm:text-sm">
            {source === "parent_category" && parentCategory
              ? `Showing top products from ${parentCategory} (parent category)`
              : `Handpicked related products from the ${category} collection`}
          </p>
        </div>

        {exploreCategory && (
          <Link
            href={`/products?category=${encodeURIComponent(exploreCategory)}`}
            className="group inline-flex items-center gap-1.5 self-start text-xs font-bold text-primary transition-colors hover:text-primary-focus sm:self-center sm:text-sm"
          >
            Explore {exploreCategory}
            <FiArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product, idx) => (
          <ProductCard
            key={product.id || (product as { _id?: string })._id || idx}
            product={product}
            index={idx}
          />
        ))}
      </div>
    </section>
  );
}

export default ProductRecommendationsSection;
