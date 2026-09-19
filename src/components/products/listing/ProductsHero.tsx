"use client";

import React from "react";
import { FiSearch, FiCheckCircle, FiZap, FiStar, FiLoader } from "react-icons/fi";
import { useSearchParams } from "next/navigation";
import { useProductFilter } from "./ProductFilterContext";

export interface ProductsHeroProps {
  defaultSearch?: string;
}

export function ProductsHero({ defaultSearch = "" }: ProductsHeroProps) {
  const searchParams = useSearchParams();
  const { isFiltering, pendingTarget, navigateWithFilter } = useProductFilter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchVal = formData.get("search") as string;
    const params = new URLSearchParams(searchParams.toString());
    if (searchVal?.trim()) {
      params.set("search", searchVal.trim());
    } else {
      params.delete("search");
    }
    params.delete("page");
    const href = params.toString() ? `/products?${params.toString()}` : "/products";
    navigateWithFilter(href, "search-submit");
  };

  const isSearchPending = pendingTarget === "search-submit";

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-surface px-4 py-3 sm:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="shrink-0 text-xl font-bold tracking-tight text-text">
          Explore{" "}
          <span className="bg-linear-to-r from-primary via-accent to-fuchsia-500 bg-clip-text text-transparent">
            Products
          </span>
        </h1>

        <form
          onSubmit={handleSearch}
          className="flex w-full max-w-xl items-center gap-2 rounded-xl border border-border/60 bg-background/50 p-1 shadow-xs"
        >
          <div className="flex flex-1 items-center px-2">
            <FiSearch className="shrink-0 text-muted" size={16} />
            <input
              type="text"
              name="search"
              defaultValue={defaultSearch}
              placeholder="Search products, vendors, or brands..."
              className="w-full bg-transparent px-2 py-1.5 text-sm text-text outline-none placeholder:text-muted"
            />
          </div>
          <button
            type="submit"
            disabled={isSearchPending}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-hover cursor-pointer disabled:opacity-70"
          >
            {isSearchPending ? (
              <>
                <FiLoader size={12} className="animate-spin text-white" />
                <span>Searching</span>
              </>
            ) : (
              <>
                <span>Search</span>
                <FiSearch size={12} />
              </>
            )}
          </button>
        </form>

        <div className="hidden items-center gap-2 text-xs text-muted xl:flex">
          <span className="inline-flex items-center gap-1">
            <FiCheckCircle size={12} className="text-primary" /> Verified
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <FiZap size={12} className="text-primary" /> Express
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <FiStar size={12} className="text-primary" /> Top Sellers
          </span>
        </div>
      </div>
    </section>
  );
}