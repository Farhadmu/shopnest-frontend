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
  FiLoader,
} from "react-icons/fi";
import {
  buildProductsHref,
  isInList,
  toggleInList,
  ProductsQueryState,
} from "@/lib/utils/product-query";
import { useProductFilter } from "./ProductFilterContext";

export interface StoreFilterOption {
  id: string;
  slug?: string;
  ownerId?: string;
  name: string;
  rating: number;
}

export interface ProductsFilterSidebarProps {
  query: ProductsQueryState;
  sellerOptions?: StoreFilterOption[];
}

export function ProductsFilterSidebar({
  query,
  sellerOptions = [],
}: ProductsFilterSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isFiltering, pendingTarget, navigateWithFilter } = useProductFilter();

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

  const handleLinkClick = (
    e: React.MouseEvent,
    href: string,
    targetId: string,
    callback?: () => void
  ) => {
    e.preventDefault();
    callback?.();
    navigateWithFilter(href, targetId);
  };

  const handlePriceSubmit = (e: React.FormEvent<HTMLFormElement>, callback?: () => void) => {
    e.preventDefault();
    callback?.();
    const formData = new FormData(e.currentTarget);
    const minPrice = formData.get("minPrice") as string;
    const maxPrice = formData.get("maxPrice") as string;
    const href = buildProductsHref(query, {
      minPrice: minPrice?.trim() || undefined,
      maxPrice: maxPrice?.trim() || undefined,
    });
    navigateWithFilter(href, "price-submit");
  };

  const activePills: { label: string; href: string; id: string }[] = [];
  if (query.category) {
    const cats = query.category.split(",").map((s) => s.trim()).filter(Boolean);
    if (cats.length <= 1) {
      activePills.push({
        label: `Category: ${query.category}`,
        href: buildProductsHref(query, { category: undefined }),
        id: "pill-category",
      });
    } else {
      cats.forEach((cat) => {
        const remaining = cats.filter((c) => c !== cat);
        activePills.push({
          label: `Category: ${cat}`,
          href: buildProductsHref(query, {
            category: remaining.length ? remaining.join(",") : undefined,
          }),
          id: `pill-category-${cat.replace(/\s+/g, "-")}`,
        });
      });
    }
  }
  if (query.isFeatured === "1" || query.isFeatured === "true")
    activePills.push({
      label: "Featured Only",
      href: buildProductsHref(query, { isFeatured: undefined }),
      id: "pill-featured",
    });
  if (query.inStock === "1")
    activePills.push({
      label: "In Stock Only",
      href: buildProductsHref(query, { inStock: undefined }),
      id: "pill-instock",
    });
  if (query.verified === "1")
    activePills.push({
      label: "Verified Merchants",
      href: buildProductsHref(query, { verified: undefined }),
      id: "pill-verified",
    });
  if (query.freeDelivery === "1")
    activePills.push({
      label: "Free Delivery",
      href: buildProductsHref(query, { freeDelivery: undefined }),
      id: "pill-freedelivery",
    });
  if (query.aiPick === "1")
    activePills.push({
      label: "AI Recommended",
      href: buildProductsHref(query, { aiPick: undefined }),
      id: "pill-aipick",
    });
  if (query.rating)
    activePills.push({
      label: `${query.rating}★ & Up`,
      href: buildProductsHref(query, { rating: undefined }),
      id: "pill-rating",
    });
  if (query.productRating)
    activePills.push({
      label: `${query.productRating}★ & Up`,
      href: buildProductsHref(query, { productRating: undefined }),
      id: "pill-productRating",
    });
  if (query.minPrice || query.maxPrice) {
    const priceLabel = `৳${query.minPrice || "0"} - ৳${query.maxPrice || "Max"}`;
    activePills.push({
      label: priceLabel,
      href: buildProductsHref(query, { minPrice: undefined, maxPrice: undefined }),
      id: "pill-price",
    });
  }
  if (query.ids) {
    const count = query.ids.split(",").filter(Boolean).length;
    activePills.push({
      label: `${count} Selected Product${count > 1 ? "s" : ""}`,
      href: buildProductsHref(query, { ids: undefined }),
      id: "pill-ids",
    });
  }
  if (query.seller) {
    for (const rawVal of query.seller.split(",").map((s) => s.trim()).filter(Boolean)) {
      const seller = sellerOptions.find(
        (s) =>
          s.id === rawVal ||
          (s.slug && s.slug.toLowerCase() === rawVal.toLowerCase()) ||
          (s.ownerId && s.ownerId === rawVal) ||
          s.name.toLowerCase() === rawVal.toLowerCase()
      );
      if (seller)
        activePills.push({
          label: seller.name,
          href: buildProductsHref(query, {
            seller: toggleInList(query.seller, seller.id),
          }),
          id: `pill-seller-${seller.id}`,
        });
    }
  }

  const activeCount = activePills.length;

  const renderFilterCard = (onItemClick?: () => void) => (
    <div className="flex flex-col gap-3 rounded-2xl bg-surface p-3.5 shadow-xs border border-border/60 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiSliders className="text-primary" size={16} />
          <h2 className="text-sm font-black text-text">Filters</h2>
          {isFiltering && (
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary animate-pulse">
              <FiLoader className="animate-spin" size={10} />
              Filtering
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <Link
            href="/products"
            onClick={(e) => handleLinkClick(e, "/products", "reset-all", onItemClick)}
            className="text-xs font-bold text-primary underline underline-offset-4 hover:text-primary-hover"
          >
            Reset All
          </Link>
        )}
      </div>

      {activePills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {activePills.map((pill) => {
            const isPillPending = pendingTarget === pill.id;
            return (
              <Link
                key={pill.label}
                href={pill.href}
                onClick={(e) => handleLinkClick(e, pill.href, pill.id, onItemClick)}
                className={`inline-flex items-center gap-1 rounded-full bg-muted-bg px-2 py-0.5 text-[10px] font-bold text-text hover:bg-border/60 transition-all active:scale-95 ${
                  isPillPending ? "ring-2 ring-primary/40 opacity-70" : ""
                }`}
              >
                <span>{pill.label}</span>
                {isPillPending ? (
                  <FiLoader size={10} className="animate-spin text-primary" />
                ) : (
                  <FiX size={10} className="text-muted hover:text-text" />
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Shop by Seller */}
      {sellerOptions.length > 0 && (
        <div className="flex flex-col gap-1.5 border-t border-border/60 pt-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-muted">
              Shop by Seller
            </span>
            <span className="text-[9px] font-bold text-muted">
              {sellerOptions.length} Sellers
            </span>
          </div>
          <div className="custom-scrollbar flex max-h-36 flex-col gap-0.5 overflow-y-auto pr-1">
            {sellerOptions.map((seller) => {
              const isChecked =
                isInList(query.seller, seller.id) ||
                (seller.slug ? isInList(query.seller, seller.slug) : false) ||
                (seller.ownerId ? isInList(query.seller, seller.ownerId) : false) ||
                (query.seller
                  ? query.seller.split(",").some((val) => {
                      const v = val.trim().toLowerCase();
                      return (
                        v === (seller.slug || "").toLowerCase() ||
                        v === seller.id.toLowerCase() ||
                        v === seller.name.toLowerCase()
                      );
                    })
                  : false);
              const checked = !!isChecked;
              const targetId = `seller-${seller.id}`;
              const isItemPending = pendingTarget === targetId;
              const targetHref = buildProductsHref(query, {
                seller: toggleInList(query.seller, seller.id),
              });

              return (
                <Link
                  key={seller.id}
                  href={targetHref}
                  onClick={(e) => handleLinkClick(e, targetHref, targetId, onItemClick)}
                  className={`flex items-center justify-between rounded-lg px-2 py-1 transition-colors hover:bg-muted-bg active:scale-[0.99] ${
                    isItemPending ? "bg-primary/5 ring-1 ring-primary/30" : ""
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0 pr-2">
                    <span
                      className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded border transition-colors ${
                        checked ? "border-primary bg-primary text-white" : "border-border"
                      }`}
                    >
                      {isItemPending ? (
                        <FiLoader
                          className={`animate-spin ${checked ? "text-white" : "text-primary"}`}
                          size={9}
                        />
                      ) : checked ? (
                        <span className="text-[8px]">✓</span>
                      ) : null}
                    </span>
                    <span className="text-xs font-semibold text-text truncate">
                      {seller.name}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-muted">
                    <FiStar size={11} className="fill-amber-400 text-amber-400" />
                    {seller.rating}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Product Rating */}
      <div className="flex flex-col gap-1 border-t border-border/60 pt-2.5">
        <span className="text-[9px] font-black uppercase tracking-wider text-muted">
          Product Rating
        </span>
        {["4.5", "4.0", "3.0"].map((r) => {
          const isSelected = query.productRating === r;
          const targetId = `rating-${r}`;
          const isItemPending = pendingTarget === targetId;
          const targetHref = buildProductsHref(query, {
            productRating: isSelected ? undefined : r,
          });

          return (
            <Link
              key={r}
              href={targetHref}
              onClick={(e) => handleLinkClick(e, targetHref, targetId, onItemClick)}
              className={`flex items-center justify-between rounded-lg px-2 py-1 text-xs font-semibold transition-all active:scale-[0.99] ${
                isSelected
                  ? "bg-primary/10 text-primary font-bold shadow-xs"
                  : "text-text hover:bg-muted-bg"
              } ${isItemPending ? "ring-1 ring-primary/40 opacity-80" : ""}`}
            >
              <span className="flex items-center gap-1.5">
                <FiStar size={12} className="fill-amber-400 text-amber-400" /> {r} &amp; Up
              </span>
              {isItemPending && <FiLoader size={11} className="animate-spin text-primary" />}
            </Link>
          );
        })}
      </div>

      {/* Price Range */}
      <form
        onSubmit={(e) => handlePriceSubmit(e, onItemClick)}
        className="flex flex-col gap-1.5 border-t border-border/60 pt-2.5"
      >
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-wider text-muted">
            Price Range (৳)
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <input
            type="number"
            name="minPrice"
            defaultValue={query.minPrice}
            placeholder="Min"
            className="w-full rounded-lg bg-muted-bg px-2.5 py-1.5 text-xs text-text outline-none focus:ring-1 focus:ring-primary/40 border border-transparent focus:border-primary/30"
          />
          <input
            type="number"
            name="maxPrice"
            defaultValue={query.maxPrice}
            placeholder="Max"
            className="w-full rounded-lg bg-muted-bg px-2.5 py-1.5 text-xs text-text outline-none focus:ring-1 focus:ring-primary/40 border border-transparent focus:border-primary/30"
          />
        </div>
        <button
          type="submit"
          disabled={pendingTarget === "price-submit"}
          className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-muted-bg py-1.5 text-xs font-bold text-text transition-colors hover:bg-border/60 cursor-pointer disabled:opacity-60"
        >
          {pendingTarget === "price-submit" ? (
            <>
              <FiLoader size={12} className="animate-spin text-primary" />
              <span>Filtering...</span>
            </>
          ) : (
            <span>Apply Price Filter</span>
          )}
        </button>
      </form>

      {/* Trust & Status toggles */}
      <div className="flex flex-col gap-1.5 border-t border-border/60 pt-2.5">
        <span className="text-[9px] font-black uppercase tracking-wider text-muted">
          Trust &amp; Status
        </span>
        {[
          { key: "isFeatured", icon: FiStar, label: "Featured Products" },
          { key: "verified", icon: FiShield, label: "Verified Merchant Only" },
          { key: "inStock", icon: FiPackage, label: "In Stock Only" },
          { key: "freeDelivery", icon: FiTruck, label: "Free Delivery" },
          { key: "aiPick", icon: FiZap, label: "AI Recommended Pick" },
        ].map(({ key, icon: Icon, label }) => {
          const checked =
            query[key as keyof ProductsQueryState] === "1" ||
            query[key as keyof ProductsQueryState] === "true";
          const targetId = `toggle-${key}`;
          const isItemPending = pendingTarget === targetId;
          const targetHref = buildProductsHref(query, {
            [key]: checked ? undefined : "1",
          } as ProductsQueryState);

          return (
            <Link
              key={key}
              href={targetHref}
              onClick={(e) => handleLinkClick(e, targetHref, targetId, onItemClick)}
              className={`flex items-center justify-between rounded-lg px-1.5 py-1 hover:bg-muted-bg transition-colors active:scale-[0.99] ${
                isItemPending ? "bg-primary/5 ring-1 ring-primary/30" : ""
              }`}
            >
              <span className="flex items-center gap-2 text-xs text-text">
                <Icon size={13} className="text-primary" /> {label}
              </span>
              <span
                className={`grid h-3.5 w-3.5 place-items-center rounded border transition-colors ${
                  checked ? "border-primary bg-primary text-white" : "border-border"
                }`}
              >
                {isItemPending ? (
                  <FiLoader
                    className={`animate-spin ${checked ? "text-white" : "text-primary"}`}
                    size={9}
                  />
                ) : checked ? (
                  <span className="text-[8px]">✓</span>
                ) : null}
              </span>
            </Link>
          );
        })}
      </div>

      {/* 🤖 ShopNest AI Assist Integrated Banner */}
      <div className="border-t border-border/60 pt-2.5">
        <Link
          href="/ai-advisor"
          onClick={onItemClick}
          className="group flex items-center justify-between rounded-xl bg-linear-to-r from-primary/15 via-violet-500/10 to-transparent p-2 border border-primary/20 transition-all hover:border-primary hover:bg-primary/20 shadow-2xs"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="grid h-6.5 w-6.5 shrink-0 place-items-center rounded-lg bg-primary text-white shadow-xs">
              <FiZap size={12} />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-black text-text group-hover:text-primary transition-colors">
                ShopNest AI Assist
              </span>
              <span className="text-[10px] text-muted truncate">
                Ask AI to compare &amp; guide
              </span>
            </div>
          </div>
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <FiMessageCircle size={12} />
          </span>
        </Link>
      </div>
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
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <FiSliders size={14} />
            <span>Filters</span>
            {activeCount > 0 && (
              <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white text-[10px] font-black text-primary">
                {activeCount}
              </span>
            )}
            {isFiltering && <FiLoader size={12} className="animate-spin text-white" />}
          </button>

          {activeCount > 0 ? (
            <Link
              href="/products"
              onClick={(e) => handleLinkClick(e, "/products", "reset-all")}
              className="text-xs font-bold text-primary underline underline-offset-4 hover:text-primary-hover"
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
            {activePills.map((pill) => {
              const isPillPending = pendingTarget === pill.id;
              return (
                <Link
                  key={pill.label}
                  href={pill.href}
                  onClick={(e) => handleLinkClick(e, pill.href, pill.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted-bg px-2.5 py-1 text-[11px] font-bold text-text border border-border/60 shadow-2xs hover:bg-border/60 transition-all active:scale-95 ${
                    isPillPending ? "ring-2 ring-primary/40 opacity-70" : ""
                  }`}
                >
                  <span>{pill.label}</span>
                  {isPillPending ? (
                    <FiLoader size={10} className="animate-spin text-primary" />
                  ) : (
                    <FiX size={11} className="text-muted hover:text-text" />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* 🟢 Desktop Sticky Sidebar (Hidden on mobile, visible on lg+ screens) */}
      <aside
        style={{ maxHeight: "calc(100vh - 5rem)" }}
        className="custom-scrollbar hidden lg:flex w-72 shrink-0 flex-col lg:sticky lg:top-18 lg:self-start lg:overflow-y-auto overscroll-contain pr-1 pb-4"
      >
        {renderFilterCard()}
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
                {isFiltering && (
                  <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary animate-pulse">
                    <FiLoader className="animate-spin" size={10} />
                    Filtering
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {activeCount > 0 && (
                  <Link
                    href="/products"
                    onClick={(e) =>
                      handleLinkClick(e, "/products", "reset-all", () =>
                        setIsMobileOpen(false)
                      )
                    }
                    className="text-xs font-bold text-primary underline underline-offset-4"
                  >
                    Reset All
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-muted-bg text-text hover:bg-border/60 transition-colors cursor-pointer"
                  aria-label="Close filters"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable Filter Content */}
            <div className="custom-scrollbar flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {renderFilterCard(() => setIsMobileOpen(false))}
            </div>

            {/* Footer Apply Button */}
            <div className="border-t border-border bg-surface p-4">
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="w-full rounded-xl bg-primary py-3 text-center text-sm font-bold text-white shadow-md transition-colors hover:bg-primary-hover active:scale-98 cursor-pointer"
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