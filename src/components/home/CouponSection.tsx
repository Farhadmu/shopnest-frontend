"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, Chip } from "@heroui/react";
import {
  FiArrowRight,
  FiCopy,
  FiCheck,
  FiClock,
  FiShoppingBag,
  FiTag,
  FiXCircle,
  FiCalendar,
  FiInfo,
  FiX,
  FiLayers,
  FiExternalLink,
  FiShield,
} from "react-icons/fi";
import { getHomepageCoupons } from "@/lib/api/coupons";
import { getProductById, type Product } from "@/lib/api/products";
import { formatCurrency } from "@/lib/utils";
import type { Coupon, CouponDiscountType } from "@/types/coupon";
import { toast } from "@/context/ToastContext";

interface CouponTheme {
  cardBorder: string;
  cardBg: string;
  chipBg: string;
  categoryBg: string;
  categoryHoverBg: string;
  divider: string;
  boxBg: string;
  btnBg: string;
  actionBtn: string;
}

interface TypeVisuals {
  image: string;
  alt: string;
  badge: string;
  theme: CouponTheme;
}

/** Decorative image + color theme per coupon type */
const TYPE_VISUALS: Record<CouponDiscountType, TypeVisuals> = {
  percentage: {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAi0daYqQNGO9UmKXh28rf0s0ewWKXlPYeNzRQe8jk9Jo8ykSUNkT3AKTBDerB5MB80P5diyqFumTrbBomGphK_eF167Zcqh2ImQ3Doo8DDfT3yp9QYg9eeFIz9FY0_JfTSPIne2VEtrks_VlG1CLqWU1ToQNemSuouLxbQUJkSfVQ3brq1HqQbnPhMa4WECclxXB7gkfu1gOEPzI0RYgURmEaBbzYCwO7ODReEqz7cg3BuERi43fsxgA",
    alt: "3D Gift Box",
    badge: "Limited Offer",
    theme: {
      cardBorder: "border-purple-200/70 dark:border-purple-900/40",
      cardBg:
        "bg-gradient-to-br from-purple-50/90 via-purple-100/35 to-indigo-50/45 dark:from-[#170F2E] dark:via-[#130E26] dark:to-[#0D081D]",
      chipBg: "bg-purple-200/60 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300",
      categoryBg:
        "bg-purple-100/80 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/40",
      categoryHoverBg: "hover:bg-purple-200/90 dark:hover:bg-purple-900/60",
      divider: "border-purple-200/80 dark:border-purple-800/50",
      boxBg: "bg-white dark:bg-[#1C1635] border-purple-200 dark:border-purple-800/40",
      btnBg: "bg-purple-50 dark:bg-[#251D44] hover:bg-purple-100 dark:hover:bg-[#2F2555] text-purple-700 dark:text-purple-300",
      actionBtn: "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20",
    },
  },
  fixed: {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBssWeS6DzWNyj_rVBmsWSNyGsoYy4a_sxFtPyFDmodsh1Ov7aymBrWMabKgDhzFDZ5FCRF2tv_ev2Co1FDLdU5TDGSK8h4V_gp_KCHxioXdZ2fIyhzJ2hUBZqqi78Sa1I-Kl9ahLNSovWgckWUKTWvJQcrrcl5ged1zKtgnNOS0BCOY_bH6nViaZ27bC6ztU4TQVQI00bbog2PFvA8apUbSLTn6vQIYBSAiEyAPY8mtV6NMe_Vu-SKBQ",
    alt: "3D Alarm Clock",
    badge: "Deal Of The Day",
    theme: {
      cardBorder: "border-rose-200/70 dark:border-rose-950/40",
      cardBg:
        "bg-gradient-to-br from-rose-50/90 via-pink-50/35 to-orange-50/45 dark:from-[#26101B] dark:via-[#1D0C15] dark:to-[#0D081D]",
      chipBg: "bg-rose-200/60 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300",
      categoryBg:
        "bg-rose-100/80 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/40",
      categoryHoverBg: "hover:bg-rose-200/90 dark:hover:bg-rose-900/60",
      divider: "border-rose-200/80 dark:border-rose-900/50",
      boxBg: "bg-white dark:bg-[#2B1320] border-rose-200 dark:border-rose-800/40",
      btnBg: "bg-rose-50 dark:bg-[#3B192C] hover:bg-rose-100 dark:hover:bg-[#4B2038] text-rose-700 dark:text-rose-300",
      actionBtn: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20",
    },
  },
  "free-shipping": {
    image: "/assets/free-shipping-3d.jpg",
    alt: "3D Express Delivery",
    badge: "Free Delivery",
    theme: {
      cardBorder: "border-emerald-200/70 dark:border-emerald-950/40",
      cardBg:
        "bg-gradient-to-br from-emerald-50/90 via-teal-50/35 to-cyan-50/45 dark:from-[#0B1E19] dark:via-[#081814] dark:to-[#050F0D]",
      chipBg: "bg-emerald-200/60 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300",
      categoryBg:
        "bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/40",
      categoryHoverBg: "hover:bg-emerald-200/90 dark:hover:bg-emerald-900/60",
      divider: "border-emerald-200/80 dark:border-emerald-900/50",
      boxBg: "bg-white dark:bg-[#102720] border-emerald-200 dark:border-emerald-800/40",
      btnBg: "bg-emerald-50 dark:bg-[#16382E] hover:bg-emerald-100 dark:hover:bg-[#1E483B] text-emerald-700 dark:text-emerald-300",
      actionBtn: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20",
    },
  },
};

function getTitle(coupon: Coupon): string {
  if (coupon.type === "percentage") return `${coupon.value}% OFF`;
  if (coupon.type === "fixed") return `৳${coupon.value} FLAT OFF`;
  return "FREE SHIPPING";
}

function getSubtitle(coupon: Coupon): string {
  const minText = coupon.minPurchase > 0 ? `Min spend ৳${coupon.minPurchase}` : "No minimum spend";
  if (coupon.type === "free-shipping") return `Delivery fee waived • ${minText}`;
  if (coupon.type === "percentage") {
    return coupon.maxDiscount
      ? `${minText} • Capped at ৳${coupon.maxDiscount}`
      : `${minText} on qualifying items`;
  }
  return `${minText} on your order`;
}

interface TargetDetails {
  badgeLabel: string;
  badgeSub?: string;
  buttonText: string;
  href: string;
  allLabels: string[];
  productIds: string[];
  scopeType: "multi-category" | "single-category" | "multi-product" | "single-product" | "all";
  tooltipText: string;
}

/**
 * Modern Helper: Intelligently formats labels, multi-item badges,
 * and high-converting CTA button copy based on coupon scope.
 */
function getCouponTargetDetails(coupon: Coupon): TargetDetails {
  const sellerQuery =
    coupon.storeSlug ||
    coupon.storeId ||
    coupon.sellerId;

  const sellerParam = sellerQuery ? `seller=${encodeURIComponent(sellerQuery)}` : "";

  if (coupon.scope === "specific-category") {
    const list =
      coupon.categories && coupon.categories.length > 0
        ? coupon.categories
        : coupon.category
          ? [coupon.category]
          : [];

    if (list.length === 1) {
      return {
        badgeLabel: list[0],
        buttonText: `Shop ${list[0]}`,
        href: `/products?${[sellerParam, `category=${encodeURIComponent(list[0])}`].filter(Boolean).join("&")}`,
        allLabels: list,
        productIds: [],
        scopeType: "single-category",
        tooltipText: `Applicable to category: ${list[0]}`,
      };
    }

    if (list.length > 1) {
      return {
        badgeLabel: list[0],
        badgeSub: `+${list.length - 1}`,
        buttonText: `Explore Deals (${list.length})`,
        href: `/products?${[sellerParam, `category=${encodeURIComponent(list.join(","))}`].filter(Boolean).join("&")}`,
        allLabels: list,
        productIds: [],
        scopeType: "multi-category",
        tooltipText: `Applicable to ${list.length} categories: ${list.join(", ")}`,
      };
    }
  }

  if (coupon.scope === "specific-products") {
    const validProductIds = (coupon.productIds ?? []).filter(
      (id) => id && id !== "undefined" && id !== "null" && id.trim() !== ""
    );

    if (validProductIds.length === 1) {
      return {
        badgeLabel: "1 Item",
        buttonText: "View Product",
        href: `/products/${encodeURIComponent(validProductIds[0])}`,
        allLabels: ["1 Specific Item"],
        productIds: validProductIds,
        scopeType: "single-product",
        tooltipText: "Valid on 1 specific selected item",
      };
    }

    if (validProductIds.length > 1) {
      return {
        badgeLabel: `${validProductIds.length} Items`,
        buttonText: `Shop ${validProductIds.length} Items`,
        href: `/products?${[sellerParam, `ids=${encodeURIComponent(validProductIds.join(","))}`].filter(Boolean).join("&")}`,
        allLabels: [`${validProductIds.length} Selected Products`],
        productIds: validProductIds,
        scopeType: "multi-product",
        tooltipText: `Valid on ${validProductIds.length} specific promotional products`,
      };
    }

    return {
      badgeLabel: "Selected Items",
      buttonText: "Explore Items",
      href: sellerParam ? `/products?${sellerParam}` : "/products",
      allLabels: ["Selected Products"],
      productIds: [],
      scopeType: "multi-product",
      tooltipText: "Valid on selected products",
    };
  }

  return {
    badgeLabel: "Storewide",
    buttonText: "Shop All Deals",
    href: sellerParam ? `/products?${sellerParam}` : "/products",
    allLabels: ["All Products in Store"],
    productIds: [],
    scopeType: "all",
    tooltipText: "Applies to all products across the entire store",
  };
}

function formatUnit(value: number): string {
  return String(Math.max(value, 0)).padStart(2, "0");
}

/** Derives {days,hours,minutes,seconds} remaining until `expiresAt`, or null once it has passed. */
function getRemaining(expiresAt: string | undefined, now: number) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - now;
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  };
}

/**
 * Modern Quick-View Eligibility Modal:
 * Lets users inspect all categories or specific products under a coupon with one click.
 */
function CouponQuickModal({
  coupon,
  onClose,
  onCopy,
  isCopied,
}: {
  coupon: Coupon | null;
  onClose: () => void;
  onCopy: (coupon: Coupon) => void;
  isCopied: boolean;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (!coupon) return;
    const validIds = (coupon.productIds ?? []).filter(
      (id) => id && id !== "undefined" && id !== "null" && id.trim() !== ""
    );

    if (coupon.scope === "specific-products" && validIds.length > 0) {
      setLoadingProducts(true);
      Promise.allSettled(validIds.map((id) => getProductById(id)))
        .then((res) => {
          const items = res
            .filter((r): r is PromiseFulfilledResult<Product> => r.status === "fulfilled")
            .map((r) => r.value);
          setProducts(items);
        })
        .finally(() => setLoadingProducts(false));
    } else {
      setProducts([]);
    }
  }, [coupon]);

  if (!coupon) return null;

  const target = getCouponTargetDetails(coupon);
  const visuals = TYPE_VISUALS[coupon.type];
  const sellerQuery = coupon.storeSlug || coupon.storeId || coupon.sellerId;
  const sellerParam = sellerQuery ? `seller=${encodeURIComponent(sellerQuery)}` : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative my-auto flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-muted-bg/30">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FiTag className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Coupon Eligibility & Scope
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {coupon.storeName || "Verified Seller Store"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 space-y-4 max-h-[60vh] custom-scrollbar">
          {/* Coupon Code Banner */}
          <div className={`p-4 rounded-xl border ${visuals.theme.cardBorder} ${visuals.theme.cardBg} flex items-center justify-between gap-3`}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                PROMO CODE
              </span>
              <div className="font-mono text-lg font-black tracking-wider text-slate-900 dark:text-white">
                {coupon.code}
              </div>
              <p className="text-xs font-semibold text-primary mt-0.5">
                {getTitle(coupon)} • {getSubtitle(coupon)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onCopy(coupon)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-border shadow-xs text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              {isCopied ? (
                <>
                  <FiCheck className="text-emerald-500 text-sm" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <FiCopy className="text-sm opacity-70" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Scope Categories */}
          {target.scopeType === "multi-category" || target.scopeType === "single-category" ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <FiLayers className="text-primary text-xs" />
                <span>Eligible Categories ({target.allLabels.length})</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This coupon applies to any product belonging to the following categories:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {target.allLabels.map((cat) => (
                  <Link
                    key={cat}
                    href={`/products?${[sellerParam, `category=${encodeURIComponent(cat)}`].filter(Boolean).join("&")}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors"
                  >
                    <FiTag className="text-[11px]" />
                    <span>{cat}</span>
                    <FiArrowRight className="text-[10px] opacity-70" />
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {/* Scope Products */}
          {target.scopeType === "multi-product" || target.scopeType === "single-product" ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <FiShoppingBag className="text-primary text-xs" />
                <span>Eligible Products ({target.productIds.length})</span>
              </div>
              {loadingProducts ? (
                <div className="flex items-center gap-2 py-4 justify-center text-xs text-slate-500">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Loading eligible items…
                </div>
              ) : products.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {products.map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/products/${encodeURIComponent(prod.id)}`}
                      onClick={onClose}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-background/60 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                    >
                      {prod.images?.[0] ? (
                        <Image
                          src={prod.images[0]}
                          alt={prod.title}
                          width={44}
                          height={44}
                          className="h-11 w-11 rounded-lg object-cover border border-border shrink-0"
                        />
                      ) : (
                        <div className="h-11 w-11 rounded-lg bg-muted-bg flex items-center justify-center text-slate-400 shrink-0">
                          <FiShoppingBag />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary transition-colors">
                          {prod.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {formatCurrency(prod.discountPrice ?? prod.price)}
                          {prod.category && ` • ${prod.category}`}
                        </p>
                      </div>
                      <FiExternalLink className="text-xs text-slate-400 group-hover:text-primary shrink-0" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Valid exclusively on selected promotional items.
                </p>
              )}
            </div>
          ) : null}

          {/* Storewide message */}
          {target.scopeType === "all" && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs">
              <FiShield className="text-sm shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Storewide Voucher</p>
                <p className="text-[11px] opacity-90">
                  This promo coupon applies to all eligible active products from this seller.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3.5 bg-muted-bg/20">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>

          <Link
            href={target.href}
            onClick={onClose}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold ${visuals.theme.actionBtn} shadow-xs hover:shadow transition-all`}
          >
            <span>{target.buttonText}</span>
            <FiArrowRight className="text-xs" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function CouponSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-md border border-border bg-surface p-4 sm:p-5"
        >
          <div className="mb-3 h-4 w-2/5 animate-pulse rounded-full bg-muted-bg" />
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-5 w-1/3 animate-pulse rounded-full bg-muted-bg" />
              <div className="h-8 w-2/3 animate-pulse rounded-full bg-muted-bg" />
              <div className="h-3 w-1/2 animate-pulse rounded-full bg-muted-bg" />
            </div>
            <div className="h-22 w-22 shrink-0 animate-pulse rounded-md bg-muted-bg sm:h-26 sm:w-26" />
          </div>
          <div className="mt-4 h-10 w-full animate-pulse rounded-md bg-muted-bg" />
        </div>
      ))}
    </div>
  );
}

export default function CouponSection() {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeModalCoupon, setActiveModalCoupon] = useState<Coupon | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    getHomepageCoupons()
      .then((data) => {
        if (!cancelled) setCoupons(data);
      })
      .catch(() => {
        if (!cancelled) setCoupons([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = (coupon: Coupon) => {
    if (coupon.homepageStatus !== "running") return;
    navigator.clipboard.writeText(coupon.code);
    setCopiedCode(coupon.code);
    toast.success(`Coupon "${coupon.code}" copied!`, {
      description: "Paste it at checkout to claim your discount",
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isLoading = coupons === null;
  const isEmpty = coupons !== null && coupons.length === 0;

  return (
    <section className="w-full">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-primary uppercase mb-1">
            <span className="inline-block w-2 h-2 rounded-md bg-primary animate-pulse" />
            Special Offers & Vouchers
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Claim Your Exclusive Coupons
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          Copy promo codes from verified sellers and browse by category or items for direct discounts.
        </p>
      </div>

      {isLoading && <CouponSkeleton />}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
          <FiTag className="text-2xl text-slate-400" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            No coupons live right now
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Check back soon for new offers from our verified sellers.
          </p>
        </div>
      )}

      {!isLoading && !isEmpty && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coupons!.map((coupon) => {
            const visuals = TYPE_VISUALS[coupon.type];
            const { theme } = visuals;
            const target = getCouponTargetDetails(coupon);
            const isRunning = coupon.homepageStatus === "running";
            const remaining = isRunning ? getRemaining(coupon.expiresAt, now) : null;
            const hasMultipleItems =
              target.scopeType === "multi-category" || target.scopeType === "multi-product";

            return (
              <Card
                key={coupon.id}
                className={`relative overflow-hidden border ${theme.cardBorder} ${theme.cardBg} shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 rounded-md group ${
                  !isRunning ? "opacity-80" : ""
                }`}
              >
                <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full gap-3.5">
                  {/* Meta Top Header: Seller Name & Interactive Category Badge */}
                  <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <FiShoppingBag className="text-xs text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {coupon.storeName || "Verified Seller"}
                      </span>
                    </div>

                    <div className="flex items-center shrink-0">
                      {/* Interactive Target Badge */}
                      <button
                        type="button"
                        onClick={() => setActiveModalCoupon(coupon)}
                        title={target.tooltipText}
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${theme.categoryBg} ${theme.categoryHoverBg} transition-all cursor-pointer group/badge leading-tight shrink-0`}
                      >
                        <FiTag className="text-[10px] shrink-0 opacity-80" />
                        <span className="truncate max-w-[120px]">{target.badgeLabel}</span>
                        {target.badgeSub && (
                          <span className="font-bold px-1 py-0.2 bg-primary/15 text-primary rounded text-[9px] leading-none">
                            {target.badgeSub}
                          </span>
                        )}
                        {hasMultipleItems && (
                          <FiInfo className="text-[10px] opacity-70 group-hover/badge:opacity-100 shrink-0 ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Main Row: Discount Details on Left, 3D Image on Right */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      {/* Badge & Timer / Expired state */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {isRunning ? (
                          <Chip
                            size="sm"
                            variant="soft"
                            className={`${theme.chipBg} font-semibold px-2 text-[10px] h-5 rounded-md`}
                          >
                            {visuals.badge}
                          </Chip>
                        ) : (
                          <Chip
                            size="sm"
                            variant="soft"
                            className="bg-slate-200/70 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 font-semibold px-2 text-[10px] h-5 rounded-md"
                          >
                            <FiXCircle className="mr-1 inline text-[10px]" />
                            Expired
                          </Chip>
                        )}

                        {isRunning && remaining && remaining.days >= 1 && (
                          <div
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${theme.chipBg}`}
                          >
                            <FiCalendar className="text-[10px]" />
                            <span>
                              {remaining.days} Day{remaining.days > 1 ? "s" : ""} Left
                            </span>
                          </div>
                        )}

                        {isRunning && remaining && remaining.days < 1 && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-100/70 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/40 text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 animate-pulse">
                            <FiClock className="text-[10px]" />
                            <span>
                              {formatUnit(remaining.hours)}:{formatUnit(remaining.minutes)}:
                              {formatUnit(remaining.seconds)}
                            </span>
                          </div>
                        )}

                        {!isRunning && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            Offer ended
                          </div>
                        )}
                      </div>

                      {/* Discount Title */}
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        {getTitle(coupon)}
                      </h3>

                      {/* Subtitle */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                        {getSubtitle(coupon)}
                      </p>
                    </div>

                    {/* Big 3D Visual Box */}
                    <div className="w-22 h-22 sm:w-26 sm:h-26 relative drop-shadow-md shrink-0 rounded-md overflow-hidden">
                      <Image
                        src={visuals.image}
                        alt={visuals.alt}
                        fill
                        sizes="(max-width: 768px) 88px, 104px"
                        className="object-contain rounded-md group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  {/* Perforated Ticket Divider */}
                  <div className="relative my-0.5">
                    <div className={`border-t border-dashed ${theme.divider}`} />
                    <div className="absolute -left-6 -top-1.5 w-3 h-3 rounded-full bg-background" />
                    <div className="absolute -right-6 -top-1.5 w-3 h-3 rounded-full bg-background" />
                  </div>

                  {/* Bottom Row: Code Box & Action-Driven Navigation Button */}
                  <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                    {/* Code Copy Pill */}
                    <div
                      className={`flex items-center ${theme.boxBg} rounded-md p-1 border shadow-xs shrink-0 ${
                        !isRunning ? "opacity-60" : ""
                      }`}
                    >
                      <span className="text-[10px] font-semibold text-slate-400 pl-1.5 pr-1 uppercase tracking-wider">
                        CODE:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(coupon)}
                        disabled={!isRunning}
                        aria-disabled={!isRunning}
                        className={`flex items-center gap-1.5 ${theme.btnBg} px-2 py-0.5 rounded-md text-xs font-bold font-mono tracking-wider transition-colors ${
                          isRunning ? "cursor-pointer" : "cursor-not-allowed"
                        }`}
                      >
                        <span>{coupon.code}</span>
                        {copiedCode === coupon.code ? (
                          <span className="flex items-center text-emerald-500 gap-0.5 font-sans text-[10px]">
                            <FiCheck /> Copied
                          </span>
                        ) : (
                          <FiCopy className="text-[11px] opacity-70" />
                        )}
                      </button>
                    </div>

                    {/* Action-Oriented CTA Button */}
                    <Link
                      href={target.href}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold ${theme.actionBtn} shadow-xs hover:shadow transition-all active:scale-95 shrink-0`}
                    >
                      <span>{target.buttonText}</span>
                      <FiArrowRight className="text-[11px]" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick View Eligibility Modal */}
      {activeModalCoupon && (
        <CouponQuickModal
          coupon={activeModalCoupon}
          onClose={() => setActiveModalCoupon(null)}
          onCopy={handleCopy}
          isCopied={copiedCode === activeModalCoupon.code}
        />
      )}
    </section>
  );
}