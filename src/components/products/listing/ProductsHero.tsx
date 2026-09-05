import React from "react";
import { FiSearch, FiCheckCircle, FiZap, FiStar } from "react-icons/fi";

export interface ProductsHeroProps {
  defaultSearch?: string;
}

/**
 * Server component. The search box is a plain GET `<form>` so it works
 * without any client JS — submitting it navigates to `/products?search=...`,
 * which the page.tsx server component re-reads on the next render.
 */
export function ProductsHero({ defaultSearch = "" }: ProductsHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-linear-to-b from-surface via-surface to-background px-6 py-10 sm:px-10 lg:py-12">
      <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute top-10 right-10 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            <FiZap size={12} />
            ShopNest Marketplace Catalog
          </span>
          <span className="hidden items-center gap-1.5 text-xs font-semibold text-muted sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Live Multi-Vendor Feed
          </span>
        </div>

        <div className="max-w-3xl">
          <h1 className="text-3xl font-black tracking-tight text-text sm:text-4xl lg:text-[2.5rem]">
            Explore Marketplace{" "}
            <span className="bg-linear-to-r from-primary via-accent to-fuchsia-500 bg-clip-text text-transparent">
              Products
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Discover vetted, high-demand inventory across verified merchants. Backed by real-time
            AI decision scoring, express routing, and protected multi-vendor escrow.
          </p>
        </div>

        <form action="/products" method="GET" className="flex w-full max-w-3xl items-center gap-2 rounded-2xl bg-surface p-1.5 shadow-md">
          <div className="flex flex-1 items-center rounded-xl px-3">
            <FiSearch className="shrink-0 text-muted" size={18} />
            <input
              type="text"
              name="search"
              defaultValue={defaultSearch}
              placeholder="Search verified products, authentic vendors, or brands..."
              className="w-full bg-transparent px-3 py-3 text-sm text-text outline-none placeholder:text-muted"
            />
          </div>
          <button
            type="submit"
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-hover"
          >
            Search
            <FiSearch size={14} />
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-text shadow-sm">
            <FiCheckCircle size={13} className="text-primary" /> Verified Quality
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-text shadow-sm">
            <FiZap size={13} className="text-primary" /> Express Shipping
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-text shadow-sm">
            <FiStar size={13} className="text-primary" /> Top Sellers
          </span>
        </div>
      </div>
    </section>
  );
}