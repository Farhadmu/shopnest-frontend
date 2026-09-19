"use client";

import React, { useState, useEffect } from "react";
import { FiX, FiSearch, FiCheck, FiPlus, FiShoppingBag, FiStar } from "react-icons/fi";
import { getProducts, Product } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";
import { CategoryItem } from "@/types/category";
import { flattenWithDepth } from "@/lib/utils/category-tree";
import { formatCurrency } from "@/lib/utils";

interface CompareAddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (productId: string) => void;
  selectedProductIds: string[];
  maxLimit: number;
}

export function CompareAddProductModal({
  isOpen,
  onClose,
  onSelectProduct,
  selectedProductIds,
  maxLimit,
}: CompareAddProductModalProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<{ category: CategoryItem; depth: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load all categories dynamically from the backend
  useEffect(() => {
    if (!isOpen || categoriesList.length > 0) return;

    let isMounted = true;
    getCategories()
      .then((cats) => {
        if (!isMounted) return;
        setCategoriesList(flattenWithDepth(cats));
      })
      .catch(() => {
        if (isMounted) setCategoriesList([]);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, categoriesList.length]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    const params: Record<string, string | number> = { limit: 20 };
    if (query.trim()) params.search = query.trim();
    if (category) params.category = category;

    const timer = setTimeout(() => {
      getProducts(params)
        .then((res) => {
          if (!isMounted) return;
          const items = Array.isArray(res) ? res : (res as any)?.items || [];
          setProducts(items);
        })
        .catch(() => {
          if (isMounted) setProducts([]);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, query, category]);

  if (!isOpen) return null;

  const isAtLimit = selectedProductIds.length >= maxLimit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card border border-border rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted-bg/40">
          <div>
            <h3 className="font-extrabold text-base text-foreground">
              Add Product to Compare
            </h3>
            <p className="text-xs text-muted">
              Select products to compare specifications, ratings, and AI trade-offs ({selectedProductIds.length} / {maxLimit})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted hover:text-foreground hover:bg-muted-bg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Limit Alert if max limit reached */}
        {isAtLimit && (
          <div className="px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-between">
            <span>Maximum comparison limit of {maxLimit} products reached.</span>
            <span>Remove a product to add another.</span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-border bg-card flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products by title, model, or brand..."
              className="w-full bg-muted-bg/50 border border-border rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-muted-bg/50 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary max-w-[210px] truncate"
          >
            <option value="">All Categories</option>
            {categoriesList.map(({ category: cat, depth }) => (
              <option key={cat.id || cat.slug || cat.name} value={cat.name}>
                {depth > 0 ? `${"\u00A0\u00A0".repeat(depth)}↳ ` : ""}{cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Products Grid / List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-border/40">
          {isLoading ? (
            <div className="py-12 text-center text-muted text-xs">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Searching catalog...
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-muted text-xs space-y-1">
              <FiShoppingBag className="w-8 h-8 opacity-40 mx-auto mb-2" />
              <p className="font-bold text-foreground">No matching products found</p>
              <p>Try refining your search keyword or clearing category filters.</p>
            </div>
          ) : (
            products.map((p) => {
              const isSelected = selectedProductIds.includes(p.id);
              const price = p.discountPrice || p.price;

              return (
                <div
                  key={p.id}
                  className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 hover:bg-muted-bg/40 p-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-muted-bg border border-border/60 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {p.images && p.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <FiShoppingBag className="w-5 h-5 text-muted opacity-50" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{p.title}</p>
                      <div className="flex items-center gap-2 text-[11px] text-muted mt-0.5">
                        <span className="text-primary font-black">{formatCurrency(price)}</span>
                        <span>•</span>
                        <span>{p.category}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                          <FiStar className="w-3 h-3 fill-amber-500" /> {p.ratingAvg || "4.5"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isSelected ? (
                    <span className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center gap-1 flex-shrink-0">
                      <FiCheck className="w-3.5 h-3.5" /> Added
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        onSelectProduct(p.id);
                        onClose();
                      }}
                      disabled={isAtLimit}
                      className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-40 text-white font-bold text-xs transition-all flex items-center gap-1 shadow-sm active:scale-95 flex-shrink-0"
                    >
                      <FiPlus className="w-3.5 h-3.5" /> Add
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-border bg-muted-bg/30 flex items-center justify-between text-xs text-muted">
          <span>Compare up to {maxLimit} products side-by-side</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-border hover:bg-muted-bg font-bold text-foreground"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
