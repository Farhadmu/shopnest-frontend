"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  FaCheckCircle,
  FaStar,
} from "react-icons/fa";
import {
  FiSearch,
  FiShield,
  FiZap,
  FiLock,
  FiGrid,
  FiList,
  FiSliders,
  FiX,
} from "react-icons/fi";
import { CategoryFilterChips } from "@/components/common/CategoryFilterChips";
import type { Store } from "@/types/store";

type StoresHeroProps = {
  stores: Store[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortOption?: string;
  onSortChange?: (value: string) => void;
  totalStoresCount?: number;
  globalCategoryCounts?: Record<string, number>;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
};

export default function StoresHero({
  stores,
  searchTerm,
  onSearchChange,
  onClearSearch,
  categories,
  selectedCategory,
  onCategoryChange,
  sortOption = "Highest Rated",
  onSortChange,
  totalStoresCount,
  globalCategoryCounts,
  viewMode = "grid",
  onViewModeChange,
}: StoresHeroProps) {
  const verifiedCount = totalStoresCount ?? stores.length;
  
  const validRatings = stores
    .map((s) => Number(s.rating || 0))
    .filter((r) => r > 0);
  const avgRating = validRatings.length
    ? (validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length).toFixed(2)
    : "4.92";

  // Category counts: use global directory counts so filtering does not shrink counts
  const categoryCounts = useMemo(() => {
    if (globalCategoryCounts && Object.keys(globalCategoryCounts).length > 0) {
      return globalCategoryCounts;
    }
    const counts: Record<string, number> = {};
    for (const store of stores) {
      const cat = store.filterCategory || "General";
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [globalCategoryCounts, stores]);

  return (
    <section className="relative overflow-hidden bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-white pt-6 pb-4 transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* 1. TOP BREADCRUMB & BADGE ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/90 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 shadow-2xs">
              <FaCheckCircle className="text-[11px]" />
              <span>SHOP WITH CONFIDENCE • 100% Vetted Merchants</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Instant Escrow Protection Guarantee
            </span>
          </div>

          <nav className="text-xs font-medium text-slate-400 dark:text-slate-500">
            <Link href="/" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
              Home
            </Link>
            <span className="mx-1.5">/</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Store Directory
            </span>
          </nav>
        </div>

        {/* 2. HERO TITLE & 2x2 STATS BOX */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left: Heading & Description */}
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Trusted <span className="text-primary">ShopNest</span> Stores
            </h1>
            <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Explore verified independent sellers with transparent ratings, audit logs, verified inventory, escrow purchase protection, and guaranteed on-time fulfillment SLAs.
            </p>
          </div>

          {/* Right: 2x2 Stats Box */}
          <div className="grid grid-cols-2 gap-3 shrink-0 sm:w-auto w-full">
            {/* Stat 1: Verified Merchants */}
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:px-4 shadow-xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <FiShield size={18} />
              </div>
              <div>
                <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {verifiedCount} Verified
                </p>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                  Licensed Merchants
                </p>
              </div>
            </div>

            {/* Stat 2: Avg Satisfaction */}
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:px-4 shadow-xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-950/60 dark:text-amber-400">
                <FaStar size={16} />
              </div>
              <div>
                <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {avgRating} / 5.0
                </p>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                  Avg Satisfaction
                </p>
              </div>
            </div>

            {/* Stat 3: SLA On-Time Dispatch */}
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:px-4 shadow-xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <FiZap size={18} />
              </div>
              <div>
                <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  99.4% SLA
                </p>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                  On-Time Dispatch
                </p>
              </div>
            </div>

            {/* Stat 4: Purchase Protected */}
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:px-4 shadow-xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <FiLock size={18} />
              </div>
              <div>
                <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  100% Escrow
                </p>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                  Purchase Protected
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. UNIFIED FILTER CARD (SEARCH, SORT, STATUS & CATEGORY CHIPS) */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-xs space-y-3">
          
          {/* Top Controls Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input Box with Shortcut */}
            <div className="relative flex-1 flex items-center rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 px-3.5 py-2.5 transition-focus focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
              <FiSearch className="text-slate-400 text-sm shrink-0 mr-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search store name, specialty, brand, warranty policy..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none"
              />
              {searchTerm ? (
                <button
                  type="button"
                  onClick={onClearSearch}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors ml-1.5 cursor-pointer"
                  aria-label="Clear search"
                >
                  <FiX size={15} />
                </button>
              ) : (
                <span className="hidden sm:inline-block rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 shadow-2xs">
                  ⌘K
                </span>
              )}
            </div>

            {/* Sort Select Pill (Larger & Increased Font Size) */}
            {onSortChange && (
              <div className="flex items-center rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800/90 px-4 py-2.5 shadow-2xs hover:border-primary/40 transition-colors">
                <span className="text-slate-500 dark:text-slate-400 mr-2 font-medium text-sm whitespace-nowrap">
                  Sort:
                </span>
                <select
                  value={sortOption}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="bg-transparent text-sm font-bold text-slate-900 dark:text-white outline-none cursor-pointer pr-1"
                >
                  <option value="Highest Rated" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                    Highest Rated
                  </option>
                  <option value="Most Popular" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                    Most Popular
                  </option>
                  <option value="Newest" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                    Newest
                  </option>
                </select>
              </div>
            )}

            {/* Active Now Status Pill */}
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800/90 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active Now</span>
            </div>

            {/* Layout Switcher Pill (Interactive Grid / List) */}
            {onViewModeChange && (
              <div className="hidden sm:flex items-center rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => onViewModeChange("grid")}
                  className={`rounded-lg p-2 transition-all cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  }`}
                  title="Grid View"
                  aria-label="Grid View"
                >
                  <FiGrid size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => onViewModeChange("list")}
                  className={`rounded-lg p-2 transition-all cursor-pointer ${
                    viewMode === "list"
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  }`}
                  title="List View"
                  aria-label="List View"
                >
                  <FiList size={15} />
                </button>
              </div>
            )}
          </div>

          {/* Bottom Row: Category Filter Chips */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/70">
            <CategoryFilterChips
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={onCategoryChange}
              categoryCounts={categoryCounts}
              totalCount={verifiedCount}
              allLabel="All Stores"
            />
          </div>

        </div>

      </div>
    </section>
  );
}