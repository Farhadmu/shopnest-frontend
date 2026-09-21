"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { FaCartPlus, FaStar, FaChevronUp } from "react-icons/fa";
import { FiPlus, FiArrowRight } from "react-icons/fi";
import { Product } from "@/types/store";

interface TopSellerProductsProps {
  products: Product[];
  productsCount: string;
  onAddToCart?: (product: Product) => void;
  catalogUrl?: string;
}

const INITIAL_VISIBLE_COUNT = 4;
const LOAD_MORE_STEP = 4;

const TopSellerProducts = ({
  products,
  productsCount,
  onAddToCart,
  catalogUrl = "/products",
}: TopSellerProductsProps) => {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayedProducts = products.slice(0, visibleCount);
  const remainingCount = products.length - visibleCount;
  const hasMore = remainingCount > 0;
  const isExpanded = visibleCount > INITIAL_VISIBLE_COUNT;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_STEP, products.length));
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.scrollBy({ top: 320, behavior: "smooth" });
      }, 50);
    }
  };

  const handleShowLess = () => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    if (typeof window !== "undefined" && containerRef.current) {
      const yOffset = -90;
      const y = containerRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    }
  };

  return (
    <div ref={containerRef} className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 scroll-mt-24">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Top Seller Products
          </h2>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Popular products from this store
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {productsCount} Products
        </span>
      </div>

      {/* Products List */}
      <div className="space-y-2.5">
        {displayedProducts.map((product, index) => {
          const productId = product.id || product._id;
          const productUrl = productId ? `/products/${productId}` : "#";

          return (
            <div
              key={`${product.name}-${index}`}
              className="group flex items-center gap-3 rounded-xl border border-slate-100 p-2.5 transition-all hover:border-primary/40 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 shadow-2xs"
            >
              {/* Product Image */}
              <Link
                href={productUrl}
                className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 block border border-slate-100 dark:border-slate-800"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </Link>

              {/* Product Info */}
              <div className="min-w-0 flex-1">
                <Link href={productUrl}>
                  <h3 className="truncate text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>

                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-primary">
                    {product.price}
                  </span>

                  {product.rating && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <FaStar className="text-amber-400 text-[10px]" />
                      {product.rating}
                    </span>
                  )}
                </div>

                {product.sold && (
                  <p className="text-[10px] text-slate-400">
                    {product.sold}
                  </p>
                )}
              </div>

              {/* Cart Button */}
              <button
                type="button"
                onClick={() => onAddToCart?.(product)}
                aria-label={`Add ${product.name} to cart`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-primary/50 hover:bg-primary/10 hover:text-primary dark:border-slate-700 dark:text-slate-300 dark:hover:bg-primary/20 dark:hover:text-primary cursor-pointer shadow-2xs"
              >
                <FaCartPlus className="text-xs" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Action Controls: Cohesive Dual Action Bar (Identical Dimensions) */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
        {hasMore ? (
          <button
            type="button"
            onClick={handleLoadMore}
            className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-xl border border-primary/25 bg-primary/10 hover:bg-primary/15 text-primary dark:bg-primary/20 dark:hover:bg-primary/25 px-2.5 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            <FiPlus className="text-xs shrink-0" />
            <span>Load More (+{Math.min(LOAD_MORE_STEP, remainingCount)})</span>
          </button>
        ) : isExpanded ? (
          <button
            type="button"
            onClick={handleShowLess}
            className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 px-2.5 text-xs font-semibold transition-all cursor-pointer active:scale-[0.98]"
          >
            <FaChevronUp className="text-[10px] shrink-0" />
            <span>Show Less</span>
          </button>
        ) : null}

        <Link
          href={catalogUrl}
          className={`${hasMore || isExpanded ? "flex-1" : "w-full"
            } h-9 flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white px-2.5 text-xs font-bold transition-all shadow-xs shadow-primary/25 cursor-pointer text-center active:scale-[0.98]`}
        >
          <span>View Catalog</span>
          <FiArrowRight className="text-xs shrink-0" />
        </Link>
      </div>
    </div>
  );
};

export default TopSellerProducts;