"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Chip } from "@heroui/react";
import {
  FaSearch,
  FaTimes,
  FaChevronDown,
  FaFire,
  FaCheck,
  FaSlidersH,
  FaBoxOpen,
  FaBolt,
  FaStar,
  FaRedo,
  FaLayerGroup,
} from "react-icons/fa";
import { getProductsPaged, Product } from "@/lib/api/products";
import { CategoryFilterPopup } from "@/components/products/CategoryFilterPopup";
import { ProductCard } from "@/components/products/ProductCard";
import { useOutsideClick } from "@/hooks/useOutsideClick";

export interface ProductsClientProps {
  initialItems: Product[];
  initialTotal: number;
  initialTotalPages: number;
  initialSearch?: string;
  initialCategory?: string;
  initialMinPrice?: string;
  initialMaxPrice?: string;
  initialSort?: string;
  initialPage?: number;
}

const SORT_OPTIONS = [
  { key: "newest", label: "Newest Arrivals" },
  { key: "price_asc", label: "Price: Low to High" },
  { key: "price_desc", label: "Price: High to Low" },
  { key: "rating", label: "Top Rated" },
  { key: "popular", label: "Best Selling" },
];

/** Floating Sort Dropdown Component */
function SortDropdown({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useOutsideClick(containerRef, () => setOpen(false));

  const currentOpt = SORT_OPTIONS.find((o) => o.key === selected) || SORT_OPTIONS[0];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-border/80 bg-background px-4 py-3 text-left text-xs font-bold text-text outline-none transition-all hover:border-primary/50 focus:border-primary shadow-sm"
      >
        <span>{currentOpt.label}</span>
        <FaChevronDown size={11} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-surface p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
          {SORT_OPTIONS.map((opt) => {
            const isSelected = selected === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  onSelect(opt.key);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-bold transition ${
                  isSelected ? "bg-primary/10 text-primary" : "text-text hover:bg-muted-bg"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <FaCheck size={10} className="text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ProductsClient({
  initialItems,
  initialTotal,
  initialTotalPages,
  initialSearch = "",
  initialCategory = "",
  initialMinPrice = "",
  initialMaxPrice = "",
  initialSort = "newest",
  initialPage = 1,
}: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read current filter values directly from searchParams
  const urlSearch = searchParams.get("search") ?? initialSearch;
  const urlCategory = searchParams.get("category") ?? initialCategory;
  const urlMinPrice = searchParams.get("minPrice") ?? initialMinPrice;
  const urlMaxPrice = searchParams.get("maxPrice") ?? initialMaxPrice;
  const urlSort = searchParams.get("sort") ?? initialSort;
  const urlPage = Number(searchParams.get("page") ?? initialPage);

  const [items, setItems] = useState<Product[]>(initialItems);
  const [total, setTotal] = useState<number>(initialTotal);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);

  // Controlled input states
  const [searchInput, setSearchInput] = useState<string>(urlSearch);
  const [minPriceInput, setMinPriceInput] = useState<string>(urlMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState<string>(urlMaxPrice);

  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const PAGE_SIZE = 24;

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Update browser URL query params
  const updateUrlFilters = useCallback(
    (newParams: {
      search?: string;
      category?: string;
      minPrice?: string;
      maxPrice?: string;
      sort?: string;
      page?: number;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      const nextSearch = newParams.search !== undefined ? newParams.search : urlSearch;
      const nextCategory = newParams.category !== undefined ? newParams.category : urlCategory;
      const nextMinPrice = newParams.minPrice !== undefined ? newParams.minPrice : urlMinPrice;
      const nextMaxPrice = newParams.maxPrice !== undefined ? newParams.maxPrice : urlMaxPrice;
      const nextSort = newParams.sort !== undefined ? newParams.sort : urlSort;
      const nextPage = newParams.page !== undefined ? newParams.page : 1;

      if (nextSearch.trim()) params.set("search", nextSearch.trim());
      else params.delete("search");

      if (nextCategory && nextCategory !== "All Categories") params.set("category", nextCategory);
      else params.delete("category");

      if (nextMinPrice) params.set("minPrice", nextMinPrice);
      else params.delete("minPrice");

      if (nextMaxPrice) params.set("maxPrice", nextMaxPrice);
      else params.delete("maxPrice");

      if (nextSort && nextSort !== "newest") params.set("sort", nextSort);
      else params.delete("sort");

      if (nextPage > 1) params.set("page", String(nextPage));
      else params.delete("page");

      const queryStr = params.toString();
      router.push(queryStr ? `/products?${queryStr}` : "/products");
    },
    [searchParams, urlSearch, urlCategory, urlMinPrice, urlMaxPrice, urlSort, router]
  );

  // Sync inputs when URL changes
  useEffect(() => {
    setSearchInput(urlSearch);
    setMinPriceInput(urlMinPrice);
    setMaxPriceInput(urlMaxPrice);
  }, [urlSearch, urlMinPrice, urlMaxPrice]);

  // Fetch items whenever URL parameters change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getProductsPaged({
      page: urlPage,
      limit: PAGE_SIZE,
      search: urlSearch.trim() || undefined,
      category: urlCategory && urlCategory !== "All Categories" ? urlCategory : undefined,
      minPrice: urlMinPrice ? Number(urlMinPrice) : undefined,
      maxPrice: urlMaxPrice ? Number(urlMaxPrice) : undefined,
      sort: urlSort || "newest",
    })
      .then(({ items: data, total: t, totalPages: tp }) => {
        if (!cancelled) {
          setItems(data);
          setTotal(t);
          setTotalPages(tp);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setTotal(0);
          setTotalPages(1);
          showToast("Failed to load products", "error");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [urlSearch, urlCategory, urlMinPrice, urlMaxPrice, urlSort, urlPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlFilters({ search: searchInput, page: 1 });
  };

  const handleCategorySelect = (categoryName: string) => {
    updateUrlFilters({ category: categoryName, page: 1 });
  };

  const handlePriceApply = () => {
    updateUrlFilters({ minPrice: minPriceInput, maxPrice: maxPriceInput, page: 1 });
  };

  const handleSortSelect = (sortKey: string) => {
    updateUrlFilters({ sort: sortKey, page: 1 });
  };

  const goToPage = (nextPage: number) => {
    const clamped = Math.min(Math.max(1, nextPage), totalPages);
    if (clamped === urlPage) return;
    updateUrlFilters({ page: clamped });
  };

  const resetFilters = () => {
    setSearchInput("");
    setMinPriceInput("");
    setMaxPriceInput("");
    router.push("/products");
  };

  return (
    <div className="relative mx-auto max-w-7xl px-4 pt-4 pb-20 sm:px-6 lg:px-8">
      {/* Background Glow Accents */}
      <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-20 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold text-white shadow-2xl backdrop-blur-xl ${
              toast.type === "error" ? "bg-red-500/95" : "bg-primary/95"
            }`}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/20">
              {toast.type === "success" ? <FaCheck size={11} /> : "!"}
            </span>
            <span>{toast.msg}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-1 opacity-70 transition hover:opacity-100"
            >
              <FaTimes size={10} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mb-7 overflow-hidden rounded-[2.5rem] border border-border/70 bg-surface shadow-xl shadow-primary/[0.04]"
      >
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500" />

        <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3.5 py-1.5 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                ShopNest Products
              </span>
              <FaFire size={10} className="text-orange-500" />
            </div>

            <h1 className="text-3xl font-black tracking-tight text-text sm:text-4xl lg:text-[2.3rem]">
              Explore Marketplace{" "}
              <span className="bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                Products
              </span>
            </h1>

            <p className="mt-2 max-w-xl text-xs leading-5 text-muted sm:text-sm">
              Discover top-rated products across Bangladesh with AI smart recommendations, fast delivery, and buyer protection.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <FaCheck size={9} /> Verified Quality
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                <FaBolt size={9} /> Express Shipping
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                <FaStar size={9} /> Top Sellers
              </span>
            </div>
          </div>

          {/* Search Input Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex w-full shrink-0 gap-2 sm:max-w-md lg:w-[400px]"
          >
            <div className="relative flex flex-1 items-center rounded-2xl border border-border/80 bg-background/80 px-4 py-3 shadow-inner backdrop-blur-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
              <FaSearch className="shrink-0 text-primary" size={14} />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products, brands or tags..."
                className="w-full bg-transparent px-3 text-xs text-text outline-none placeholder:text-muted/70 sm:text-sm"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    updateUrlFilters({ search: "", page: 1 });
                  }}
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-muted transition hover:bg-primary/10 hover:text-primary"
                >
                  <FaTimes size={10} />
                </button>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="rounded-2xl px-6 text-xs font-black text-white shadow-lg shadow-primary/25 hover:scale-[1.03]"
            >
              Search
            </Button>
          </form>
        </div>
      </motion.div>

      {/* Active Filter Pills Bar */}
      {(urlCategory || urlMinPrice || urlMaxPrice || urlSearch) && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-surface/70 p-3.5 shadow-sm backdrop-blur-md"
        >
          <span className="text-xs font-black text-text flex items-center gap-1.5 mr-1">
            <FaSlidersH size={11} className="text-primary" /> Active Filters:
          </span>

          {urlCategory && (
            <Chip
              variant="primary"
              size="sm"
              className="text-xs font-bold bg-primary/10 text-primary border border-primary/20"
            >
              Category: {urlCategory}
              <button
                type="button"
                onClick={() => handleCategorySelect("")}
                className="ml-1.5 hover:text-red-500 transition"
              >
                <FaTimes size={10} />
              </button>
            </Chip>
          )}

          {(urlMinPrice || urlMaxPrice) && (
            <Chip
              variant="secondary"
              size="sm"
              className="text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
            >
              Price: ৳{urlMinPrice || "0"} - ৳{urlMaxPrice || "∞"}
              <button
                type="button"
                onClick={() => {
                  setMinPriceInput("");
                  setMaxPriceInput("");
                  updateUrlFilters({ minPrice: "", maxPrice: "", page: 1 });
                }}
                className="ml-1.5 hover:text-red-500 transition"
              >
                <FaTimes size={10} />
              </button>
            </Chip>
          )}

          {urlSearch && (
            <Chip
              variant="tertiary"
              size="sm"
              className="text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
            >
              Search: "{urlSearch}"
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  updateUrlFilters({ search: "", page: 1 });
                }}
                className="ml-1.5 hover:text-red-500 transition"
              >
                <FaTimes size={10} />
              </button>
            </Chip>
          )}

          <button
            onClick={resetFilters}
            className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <FaRedo size={10} /> Clear All Filters
          </button>
        </motion.div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Left Sidebar Filters */}
        <div className="space-y-6 lg:col-span-1">
          {/* Searchable Category Filter Popup */}
          <div className="rounded-[1.8rem] border border-border/80 bg-surface p-5 shadow-sm">
            <h3 className="mb-3 flex items-center justify-between text-sm font-black text-text">
              <span className="flex items-center gap-2">
                <FaLayerGroup size={12} className="text-primary" /> Category
              </span>
            </h3>
            <CategoryFilterPopup
              selected={urlCategory}
              onSelect={handleCategorySelect}
            />
          </div>

          {/* Price Range Filter */}
          <div className="rounded-[1.8rem] border border-border/80 bg-surface p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-black text-text">Price Range (৳)</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min ৳"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="w-full rounded-xl border border-border/80 bg-background px-3 py-2.5 text-xs font-semibold text-text outline-none transition focus:border-primary"
              />
              <input
                type="number"
                placeholder="Max ৳"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="w-full rounded-xl border border-border/80 bg-background px-3 py-2.5 text-xs font-semibold text-text outline-none transition focus:border-primary"
              />
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={handlePriceApply}
              className="mt-3 w-full rounded-xl font-black text-white bg-primary hover:bg-primary-hover shadow-md shadow-primary/15"
            >
              Apply Price Filter
            </Button>
          </div>

          {/* Sort By Filter using Floating SortDropdown */}
          <div className="rounded-[1.8rem] border border-border/80 bg-surface p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-black text-text">Sort Products</h3>
            <SortDropdown
              selected={urlSort}
              onSelect={handleSortSelect}
            />
          </div>

          {/* Reset All Filters Button */}
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="w-full rounded-2xl text-xs font-bold text-muted hover:text-primary"
          >
            Reset All Filters
          </Button>
        </div>

        {/* Products Grid Area */}
        <div className="lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2.5 text-lg font-black text-text">
              <span>All Products</span>
              <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-black text-primary">
                {total}
              </span>
            </h2>

            <span className="text-xs font-bold text-muted">
              Showing {items.length > 0 ? (urlPage - 1) * PAGE_SIZE + 1 : 0} - {Math.min(urlPage * PAGE_SIZE, total)} of {total}
            </span>
          </div>

          {/* Grid Loading / Empty / Data Display */}
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-80 animate-pulse rounded-[1.8rem] border border-border/60 bg-surface/60"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-[2.5rem] border border-dashed border-border/80 bg-surface/50 p-16 text-center shadow-inner"
            >
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-primary/10 text-4xl shadow-inner text-primary">
                <FaBoxOpen />
              </div>
              <h3 className="mt-5 text-xl font-black text-text">No Products Found</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                {urlCategory
                  ? `No products match category "${urlCategory}". Try clearing your filters.`
                  : "We couldn't find anything matching your filter criteria. Try resetting filters."}
              </p>
              <Button
                variant="primary"
                onClick={resetFilters}
                className="mt-6 rounded-2xl text-xs font-black px-6 shadow-lg shadow-primary/20"
              >
                Reset Filters
              </Button>
            </motion.div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          )}

          {/* Server-Synced Pagination Controls */}
          {!loading && items.length > 0 && totalPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-surface p-4 shadow-sm">
              <p className="text-xs font-semibold text-muted">
                Page <span className="font-black text-text">{urlPage}</span> of{" "}
                <span className="font-black text-text">{totalPages}</span>
                <span className="hidden sm:inline"> · {total} items total</span>
              </p>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={urlPage <= 1}
                  onClick={() => goToPage(urlPage - 1)}
                  className="rounded-xl font-bold"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((n) => n === 1 || n === totalPages || Math.abs(n - urlPage) <= 1)
                    .map((n) => (
                      <Button
                        key={n}
                        size="sm"
                        variant={n === urlPage ? "primary" : "outline"}
                        onClick={() => goToPage(n)}
                        className={`min-w-8 h-8 rounded-xl text-xs font-black ${
                          n === urlPage ? "shadow-md shadow-primary/25" : ""
                        }`}
                      >
                        {n}
                      </Button>
                    ))}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={urlPage >= totalPages}
                  onClick={() => goToPage(urlPage + 1)}
                  className="rounded-xl font-bold"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
