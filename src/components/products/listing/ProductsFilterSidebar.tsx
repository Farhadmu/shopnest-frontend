import React from "react";
import Link from "next/link";
import { FiSliders, FiX, FiShield, FiPackage, FiTruck, FiZap, FiStar, FiMessageCircle } from "react-icons/fi";
import { buildProductsHref, isInList, toggleInList, ProductsQueryState } from "@/lib/utils/product-query";

export interface StoreFilterOption {
  id: string;
  name: string;
  rating: number;
}

/**
 * TODO(backend): there is no "stores with product counts" endpoint yet.
 * Using representative store names until `/sellers/stores?withCounts=true`
 * (or similar) exists — swap this list for real data once it does.
 */
export const DUMMY_STORE_OPTIONS: StoreFilterOption[] = [
  { id: "nova-tech", name: "Nova Tech", rating: 4.9 },
  { id: "urban-loom", name: "Urban Loom", rating: 4.8 },
  { id: "homeaura", name: "HomeAura", rating: 4.7 },
  { id: "aura-skin", name: "Aura Skin", rating: 4.9 },
  { id: "booknest", name: "BookNest", rating: 4.9 },
];

export interface ProductsFilterSidebarProps {
  query: ProductsQueryState;
}

function HiddenFields({ query, omit }: { query: ProductsQueryState; omit: (keyof ProductsQueryState)[] }) {
  return (
    <>
      {Object.entries(query)
        .filter(([key, value]) => value && !omit.includes(key as keyof ProductsQueryState))
        .map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value as string} />
        ))}
    </>
  );
}

export function ProductsFilterSidebar({ query }: ProductsFilterSidebarProps) {
  const activePills: { label: string; href: string }[] = [];
  if (query.inStock === "1") activePills.push({ label: "In Stock Only", href: buildProductsHref(query, { inStock: undefined }) });
  if (query.verified === "1") activePills.push({ label: "Verified Merchants", href: buildProductsHref(query, { verified: undefined }) });
  if (query.freeDelivery === "1") activePills.push({ label: "Free Delivery", href: buildProductsHref(query, { freeDelivery: undefined }) });
  if (query.aiPick === "1") activePills.push({ label: "AI Recommended", href: buildProductsHref(query, { aiPick: undefined }) });
  if (query.rating) activePills.push({ label: `${query.rating}★ & Up`, href: buildProductsHref(query, { rating: undefined }) });
  if (query.store) {
    for (const id of query.store.split(",").filter(Boolean)) {
      const store = DUMMY_STORE_OPTIONS.find((s) => s.id === id);
      if (store) activePills.push({ label: store.name, href: buildProductsHref(query, { store: toggleInList(query.store, id) }) });
    }
  }

  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 lg:sticky lg:top-24 lg:w-72">
      {/* Filter header + active pills + store list + rating */}
      <div className="flex flex-col gap-4 rounded-2xl bg-surface p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiSliders className="text-primary" size={18} />
            <h2 className="text-base font-black text-text">Filters</h2>
          </div>
          <Link href="/products" className="text-xs font-bold text-primary underline underline-offset-4">
            Reset All
          </Link>
        </div>

        {activePills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activePills.map((pill) => (
              <Link
                key={pill.label}
                href={pill.href}
                className="inline-flex items-center gap-1 rounded-full bg-muted-bg px-2.5 py-1 text-[10px] font-bold text-text"
              >
                {pill.label}
                <FiX size={11} className="text-muted" />
              </Link>
            ))}
          </div>
        )}

        {/* Shop by Store */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted">Shop by Store</span>
            <span className="text-[10px] font-bold text-muted">{DUMMY_STORE_OPTIONS.length} Stores</span>
          </div>
          <div className="flex flex-col gap-1">
            {DUMMY_STORE_OPTIONS.map((store) => {
              const checked = isInList(query.store, store.id);
              return (
                <Link
                  key={store.id}
                  href={buildProductsHref(query, { store: toggleInList(query.store, store.id) })}
                  className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted-bg"
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${
                        checked ? "border-primary bg-primary text-white" : "border-border"
                      }`}
                    >
                      {checked && <span className="text-[9px]">✓</span>}
                    </span>
                    <span className="text-sm font-semibold text-text">{store.name}</span>
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-muted">
                    <FiStar size={12} className="fill-amber-400 text-amber-400" />
                    {store.rating}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Price Range */}
        <form action="/products" method="GET" className="flex flex-col gap-2 border-t border-border pt-3">
          <HiddenFields query={query} omit={["minPrice", "maxPrice", "page"]} />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted">Price Range (৳)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              name="minPrice"
              defaultValue={query.minPrice}
              placeholder="Min"
              className="w-full rounded-lg bg-muted-bg px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
            />
            <input
              type="number"
              name="maxPrice"
              defaultValue={query.maxPrice}
              placeholder="Max"
              className="w-full rounded-lg bg-muted-bg px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-muted-bg py-2 text-xs font-bold text-text transition-colors hover:bg-border/60"
          >
            Apply Price Filter
          </button>
        </form>

        {/* Trust & Status toggles */}
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted">Trust &amp; Status</span>
          {[
            { key: "verified", icon: FiShield, label: "Verified Merchant Only" },
            { key: "inStock", icon: FiPackage, label: "In Stock Only" },
            { key: "freeDelivery", icon: FiTruck, label: "Free Delivery" },
            { key: "aiPick", icon: FiZap, label: "AI Recommended Pick" },
          ].map(({ key, icon: Icon, label }) => {
            const checked = query[key as keyof ProductsQueryState] === "1";
            return (
              <Link
                key={key}
                href={buildProductsHref(query, { [key]: checked ? undefined : "1" } as ProductsQueryState)}
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5 text-sm text-text">
                  <Icon size={15} className="text-primary" /> {label}
                </span>
                <span
                  className={`grid h-4 w-4 place-items-center rounded border ${
                    checked ? "border-primary bg-primary text-white" : "border-border"
                  }`}
                >
                  {checked && <span className="text-[9px]">✓</span>}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Merchant Rating */}
        <div className="flex flex-col gap-1.5 border-t border-border pt-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted">Merchant Rating</span>
          {["4.5", "4.0"].map((r) => (
            <Link
              key={r}
              href={buildProductsHref(query, { rating: query.rating === r ? undefined : r })}
              className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors ${
                query.rating === r ? "bg-primary/10 text-primary" : "text-text hover:bg-muted-bg"
              }`}
            >
              <span className="flex items-center gap-1">
                <FiStar size={14} className="fill-amber-400 text-amber-400" /> {r} &amp; Up
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* AI Advisor mini card */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-accent/5 to-surface p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-lg bg-primary p-1.5 text-white">
            <FiZap size={16} />
          </span>
          <h4 className="text-sm font-black text-text">ShopNest AI Assist</h4>
        </div>
        <p className="mb-3 text-xs leading-relaxed text-muted">
          Not sure which seller offers the best warranty? Ask the ShopNest Assistant to compare
          batch quality scores.
        </p>
        <Link
          href="/ai-advisor"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-hover"
        >
          <FiMessageCircle size={14} />
          Ask Shopping Assistant
        </Link>
      </div>
    </aside>
  );
}