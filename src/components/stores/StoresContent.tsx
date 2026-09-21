"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Store } from "@/types/store";
import StoresHero from "./StoresHero";
import StoreGrid from "./StoreGrid";
import TrustStandard from "./TrustStandard";
import SellerCTA from "./SellerCTA";
import { Pagination } from "@/components/common/Pagination";

const PAGE_SIZE = 12;

type StoresContentProps = {
  initialStores: Store[];
  categories: string[];
  initialCategoryCounts?: Record<string, number>;
  totalApprovedStores?: number;
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
  initialCategory?: string;
  initialSearch?: string;
  initialSort?: string;
};

export default function StoresContent({
  initialStores,
  categories,
  initialCategoryCounts = {},
  totalApprovedStores,
  initialTotal,
  initialPage,
  initialTotalPages,
  initialCategory = "All Stores",
  initialSearch = "",
  initialSort = "Highest Rated",
}: StoresContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortOption, setSortOption] = useState(initialSort);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const updateQuery = (params: { page?: number; category?: string; search?: string; sort?: string }) => {
    const current = new URLSearchParams(Array.from(searchParams?.entries() || []));

    if (params.page !== undefined) {
      if (params.page <= 1) current.delete("page");
      else current.set("page", String(params.page));
    }

    if (params.category !== undefined) {
      if (!params.category || params.category === "All Stores" || params.category === "All") {
        current.delete("category");
      } else {
        current.set("category", params.category);
      }
    }

    if (params.search !== undefined) {
      if (!params.search.trim()) current.delete("search");
      else current.set("search", params.search.trim());
    }

    if (params.sort !== undefined) {
      if (params.sort === "Highest Rated" || !params.sort) current.delete("sort");
      else current.set("sort", params.sort);
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";

    startTransition(() => {
      router.push(`${pathname}${query}`, { scroll: false });
    });
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    updateQuery({ category: cat, page: 1 });
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    updateQuery({ search: val, page: 1 });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    updateQuery({ search: "", page: 1 });
  };

  const handleSortChange = (sort: string) => {
    setSortOption(sort);
    updateQuery({ sort, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 320, behavior: "smooth" });
    }
    updateQuery({ page: newPage });
  };

  return (
    <main className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* 1. Hero Section (Banner & Category Chips) */}
      <StoresHero
        stores={initialStores}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        sortOption={sortOption}
        onSortChange={handleSortChange}
        totalStoresCount={totalApprovedStores ?? initialTotal}
        globalCategoryCounts={initialCategoryCounts}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 2. Store Grid Section with Server-Rendered Stores */}
      <div className={isPending ? "opacity-70 transition-opacity duration-150" : "transition-opacity duration-150"}>
        <StoreGrid stores={initialStores} viewMode={viewMode} />
      </div>

      {/* 3. Server-Side Reusable Pagination Bar */}
      {initialTotal > 0 && (
        <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <Pagination
            currentPage={initialPage}
            totalPages={initialTotalPages}
            totalItems={initialTotal}
            itemsPerPage={PAGE_SIZE}
            itemName="verified stores"
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* 4. Trust & CTA Sections */}
      <TrustStandard />
      <SellerCTA />
    </main>
  );
}