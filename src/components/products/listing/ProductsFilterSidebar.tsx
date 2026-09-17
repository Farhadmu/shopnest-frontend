"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiSliders,
  FiX,
  FiShield,
  FiPackage,
  FiTruck,
  FiZap,
  FiStar,
  FiMessageCircle,
} from "react-icons/fi";
import {
  buildProductsHref,
  isInList,
  toggleInList,
  ProductsQueryState,
} from "@/lib/utils/product-query";

export interface StoreFilterOption {
  id: string;
  name: string;
  rating: number;
}

export interface ProductsFilterSidebarProps {
  query: ProductsQueryState;
  sellerOptions?: StoreFilterOption[];
}

function HiddenFields({
  query,
  omit,
}: {
  query: ProductsQueryState;
  omit: (keyof ProductsQueryState)[];
}) {
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

export function ProductsFilterSidebar({ query, sellerOptions = [] }: ProductsFilterSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  // Handle Escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activePills: { label: string; href: string }[] = [];
  if (query.inStock === "1")
    activePills.push({ label: "In Stock Only", href: buildProductsHref(query, { inStock: undefined }) });
  if (query.verified === "1")
    activePills.push({ label: "Verified Merchants", href: buildProductsHref(query, { verified: undefined }) });
  if (query.freeDelivery === "1")
    activePills.push({ label: "Free Delivery", href: buildProductsHref(query, { freeDelivery: undefined }) });
  if (query.aiPick === "1")
    activePills.push({ label: "AI Recommended", href: buildProductsHref(query, { aiPick: undefined }) });
  if (query.rating)
    activePills.push({ label: `${query.rating}★ & Up`, href: buildProductsHref(query, { rating: undefined }) });
  if (query.productRating)
    activePills.push({
      label: `${query.productRating}★ & Up`,
      href: buildProductsHref(query, { productRating: undefined }),
    });
  if (query.minPrice || query.maxPrice) {
    const priceLabel = `৳${query.minPrice || "0"} - ৳${query.maxPrice || "Max"}`;
    activePills.push({
      label: priceLabel,
      href: buildProductsHref(query, { minPrice: undefined, maxPrice: undefined }),
    });
  }
  if (query.seller) {
    for (const id of query.seller.split(",").filter(Boolean)) {
      const seller = sellerOptions.find((s) => s.id === id);
      if (seller)
        activePills.push({
          label: seller.name,
          href: buildProductsHref(query, { seller: toggleInList(query.seller, id) }),
        });
    }
  }

  const activeCount = activePills.length;

  const renderFilterCard = (onItemClick?: () => void) => (
    <div className="flex flex-col gap-4 rounded-2xl bg-surface p-4 shadow-sm border border-border/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiSliders className="text-primary" size={18} />
          <h2 className="text-base font-black text-text">Filters</h2>
        </div>
        {activeCount > 0 && (
          <Link
            href="/products"
            onClick={onItemClick}
            className="text-xs font-bold text-primary underline underline-offset-4"
          >
            Reset All
          </Link>
        )}
      </div>

      {activePills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activePills.map((pill) => (
            <Link
              key={pill.label}
              href={pill.href}
              onClick={onItemClick}
              className="inline-flex items-center gap-1 rounded-full bg-muted-bg px-2.5 py-1 text-[10px] font-bold text-text hover:bg-border/60 transition-colors"
            >
              {pill.label}
              <FiX size={11} className="text-muted" />
            </Link>
          ))}
        </div>
      )}

      {/* Shop by Seller */}
      {sellerOptions.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted">Shop by Seller</span>
            <span className="text-[10px] font-bold text-muted">{sellerOptions.length} Sellers</span>
          </div>
          <div className="custom-scrollbar flex max-h-55 flex-col gap-1 overflow-y-auto pr-1">
            {sellerOptions.map((seller) => {
              const checked = isInList(query.seller, seller.id);
              return (
                <Link
                  key={seller.id}
                  href={buildProductsHref(query, { seller: toggleInList(query.seller, seller.id) })}
                  onClick={onItemClick}
                  className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted-bg"
                >
                  <span className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span
                      className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${
                        checked ? "border-primary bg-primary text-white" : "border-border"
                      }`}
                    >
                      {checked && <span className="text-[9px]">✓</span>}
                    </span>
                    <span className="text-sm font-semibold text-text truncate">{seller.name}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-muted">
                    <FiStar size={12} className="fill-amber-400 text-amber-400" />
                    {seller.rating}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Product Rating */}
      <div className="flex flex-col gap-1.5 border-t border-border pt-3">
        <span className="text-[10px] font-black uppercase tracking-wider text-muted">Product Rating</span>
        {["4.5", "4.0", "3.0"].map((r) => (
          <Link
            key={r}
            href={buildProductsHref(query, { productRating: query.productRating === r ? undefined : r })}
            onClick={onItemClick}
            className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors ${
              query.productRating === r ? "bg-primary/10 text-primary font-bold" : "text-text hover:bg-muted-bg"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <FiStar size={14} className="fill-amber-400 text-amber-400" /> {r} &amp; Up
            </span>
          </Link>
        ))}
      </div>

      {/* Price Range */}
      <form
        action="/products"
        method="GET"
        onSubmit={onItemClick}
        className="flex flex-col gap-2 border-t border-border pt-3"
      >
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
      <div className="flex flex-col gap-2.5 border-t border-border pt-3">
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
              onClick={onItemClick}
              className="flex items-center justify-between rounded-lg p-1.5 hover:bg-muted-bg transition-colors"
            >
              <span className="flex items-center gap-2 text-sm text-text">
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
    </div>
  );

  const renderAiCard = () => (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-accent/5 to-surface p-4 shadow-sm border border-border/60">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-lg bg-primary p-1.5 text-white">
          <FiZap size={16} />
        </span>
        <h4 className="text-sm font-black text-text">ShopNest AI Assist</h4>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-muted">
        Not sure which seller offers the best warranty? Ask the ShopNest Assistant to compare batch
        quality scores.
      </p>
      <Link
        href="/ai-advisor"
        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-hover"
      >
        <FiMessageCircle size={14} />
        Ask Shopping Assistant
      </Link>
    </div>
  );

  return (
    <>
      {/* 🟢 Mobile Filter Button & Active Filter Chips Bar (Hidden on lg+ screens) */}
      <div className="flex w-full flex-col gap-2.5 lg:hidden">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface p-2.5 px-3.5 shadow-xs border border-border/60">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm transition-transform active:scale-95"
          >
            <FiSliders size={14} />
            <span>Filters</span>
            {activeCount > 0 && (
              <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white text-[10px] font-black text-primary">
                {activeCount}
              </span>
            )}
          </button>

          {activeCount > 0 ? (
            <Link
              href="/products"
              className="text-xs font-bold text-primary underline underline-offset-4"
            >
              Reset All ({activeCount})
            </Link>
          ) : (
            <span className="text-xs text-muted font-medium">Tap to filter results</span>
          )}
        </div>

        {/* Scrollable Active Filter Pills on mobile */}
        {activePills.length > 0 && (
          <div className="flex w-full items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {activePills.map((pill) => (
              <Link
                key={pill.label}
                href={pill.href}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted-bg px-2.5 py-1 text-[11px] font-bold text-text border border-border/60 shadow-2xs hover:bg-border/60 transition-colors"
              >
                <span>{pill.label}</span>
                <FiX size={11} className="text-muted" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 🟢 Desktop Sticky Sidebar (Hidden on mobile, visible on lg+ screens) */}
      <aside className="custom-scrollbar hidden lg:flex w-72 shrink-0 flex-col gap-4 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto pr-0.5">
        {renderFilterCard()}
        {renderAiCard()}
      </aside>

      {/* 🟢 Mobile Slide-over Drawer Modal */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div className="relative ml-auto flex h-full w-full max-w-sm flex-col bg-background text-text shadow-2xl z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-surface p-4">
              <div className="flex items-center gap-2">
                <FiSliders className="text-primary" size={18} />
                <h3 className="text-base font-black text-text">Filters</h3>
                {activeCount > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    {activeCount} active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {activeCount > 0 && (
                  <Link
                    href="/products"
                    onClick={() => setIsMobileOpen(false)}
                    className="text-xs font-bold text-primary underline underline-offset-4"
                  >
                    Reset All
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-muted-bg text-text hover:bg-border/60 transition-colors"
                  aria-label="Close filters"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable Filter Content */}
            <div className="custom-scrollbar flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {renderFilterCard()}
              {renderAiCard()}
            </div>

            {/* Footer Apply Button */}
            <div className="border-t border-border bg-surface p-4">
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="w-full rounded-xl bg-primary py-3 text-center text-sm font-bold text-white shadow-md transition-colors hover:bg-primary-hover active:scale-98"
              >
                View Products
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}