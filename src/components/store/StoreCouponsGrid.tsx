"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaTicketAlt, FaCopy, FaCheck, FaShoppingBag, FaInfoCircle } from "react-icons/fa";
import { FiArrowRight, FiPercent, FiClock, FiTag } from "react-icons/fi";
import type { Coupon } from "@/types/coupon";
import { toast } from "@/context/ToastContext";

interface StoreCouponsGridProps {
  coupons: Coupon[];
  storeName: string;
  sellerId: string;
}

export default function StoreCouponsGrid({
  coupons,
  storeName,
  sellerId,
}: StoreCouponsGridProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = async (code: string) => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Voucher "${code}" copied!`, {
      description: "Paste it at checkout to claim your discount",
    });
    setTimeout(() => {
      setCopiedCode((prev) => (prev === code ? null : prev));
    }, 2000);
  };

  if (coupons.length === 0) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FaTicketAlt className="text-2xl" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
          No Active Vouchers Available
        </h3>
        <p className="mt-1.5 max-w-md text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {storeName} doesn&apos;t have any active discount vouchers right now. Check back soon for exclusive promotional deals and holiday discounts!
        </p>
        <Link
          href={`/products?seller=${encodeURIComponent(sellerId)}`}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold py-2.5 px-5 shadow-xs shadow-primary/25 transition-all"
        >
          <span>Browse Store Catalog</span>
          <FiArrowRight />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FaTicketAlt className="text-xs" />
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Exclusive Vouchers & Promotional Deals
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Copy discount codes below and apply at checkout on eligible products from {storeName}.
          </p>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary self-start sm:self-auto">
          <FiTag className="text-xs" />
          <span>{coupons.length} Active {coupons.length === 1 ? "Offer" : "Offers"}</span>
        </span>
      </div>

      {/* Coupons Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {coupons.map((coupon) => {
          const isCopied = copiedCode === coupon.code;
          const isPercent = coupon.type === "percentage";
          const discountDisplay = isPercent
            ? `${coupon.value}% OFF`
            : coupon.type === "free-shipping"
            ? "FREE DELIVERY"
            : `৳${coupon.value} OFF`;

          const scopeText =
            coupon.scope === "all-products"
              ? "All products in this store"
              : coupon.scope === "specific-category" && (coupon.category || coupon.categories?.length)
              ? `Category: ${coupon.categories?.join(", ") || coupon.category}`
              : coupon.scope === "specific-products" && coupon.productIds?.length
              ? `${coupon.productIds.length} Selected items`
              : "Store-wide items";

          const categoryFilter =
            coupon.scope === "specific-category" && (coupon.category || coupon.categories?.length)
              ? (coupon.categories && coupon.categories.length > 0 ? coupon.categories.join(",") : coupon.category)
              : undefined;

          const productFilter =
            coupon.scope === "specific-products" && coupon.productIds && coupon.productIds.length > 0
              ? coupon.productIds
              : undefined;

          let shopHref = `/products?seller=${encodeURIComponent(sellerId)}`;

          if (productFilter) {
            if (productFilter.length === 1) {
              shopHref = `/products/${encodeURIComponent(productFilter[0])}`;
            } else {
              shopHref = `/products?seller=${encodeURIComponent(sellerId)}&ids=${encodeURIComponent(productFilter.join(","))}`;
            }
          } else if (categoryFilter) {
            shopHref = `/products?seller=${encodeURIComponent(sellerId)}&category=${encodeURIComponent(categoryFilter)}`;
          }

          const expiryText = coupon.expiresAt
            ? `Valid till ${new Date(coupon.expiresAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}`
            : "No expiration date";

          return (
            <article
              key={coupon.id || coupon.code}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-primary/20 bg-white dark:bg-slate-900 p-5 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-md"
            >
              {/* Top Accent Ribbon */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-indigo-500 to-purple-500" />

              <div>
                {/* 1. Discount Header & Scope Badge */}
                <div className="flex items-start justify-between gap-3 pt-1">
                  <div>
                    <span className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
                      {discountDisplay}
                    </span>
                    {coupon.maxDiscount && isPercent && (
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                        Up to ৳{coupon.maxDiscount} max savings
                      </p>
                    )}
                  </div>

                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                    <FiTag className="text-[10px]" />
                    <span>{coupon.scope === "all-products" ? "Store-wide" : "Category Special"}</span>
                  </span>
                </div>

                {/* 2. Eligibility & Terms Breakdown */}
                <div className="mt-4 space-y-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-xs border border-slate-100 dark:border-slate-800">
                  <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <FaShoppingBag className="mt-0.5 text-primary shrink-0 text-xs" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">Applicable on: </span>
                      <span>{scopeText}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                    <span>
                      {coupon.minPurchase && coupon.minPurchase > 0
                        ? `Min. order: ৳${coupon.minPurchase}`
                        : "No min. order required"}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock className="text-slate-400" />
                      <span>{expiryText}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Action Row: Code Box + Shop Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {/* Code Box with Copy */}
                <div className="flex-1 flex items-center justify-between gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 dark:bg-primary/10 px-3 py-2">
                  <span className="font-mono text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-wider truncate">
                    {coupon.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(coupon.code)}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary hover:bg-primary/90 text-white text-[11px] font-bold py-1 px-2.5 transition shadow-2xs cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <FaCheck className="text-[10px]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <FaCopy className="text-[10px]" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Shop Eligible Items */}
                <Link
                  href={shopHref}
                  className="rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold py-2.5 px-3 text-center transition flex items-center justify-center gap-1.5 shadow-2xs hover:border-primary/40"
                >
                  <span>Shop Eligible</span>
                  <FiArrowRight className="text-xs" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
