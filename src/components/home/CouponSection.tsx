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
} from "react-icons/fi";
import { getHomepageCoupons } from "@/lib/api/coupons";
import type { Coupon, CouponDiscountType } from "@/types/coupon";

interface CouponTheme {
  cardBorder: string;
  cardBg: string;
  chipBg: string;
  categoryBg: string;
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

/** Decorative image + color theme per coupon type — no backend image field, this lives entirely in the frontend. */
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

function getCategoryInfo(coupon: Coupon): { labels: string[]; href: string } {
  if (coupon.scope === "specific-category") {
    const labels =
      coupon.categories && coupon.categories.length > 0
        ? coupon.categories
        : coupon.category
          ? [coupon.category]
          : [];
    if (labels.length > 0) {
      return {
        labels,
        href: `/products?category=${encodeURIComponent(labels.join(","))}`,
      };
    }
  }
  if (coupon.scope === "specific-products") {
    return { labels: ["Selected Products"], href: "/products" };
  }
  return { labels: ["All Products"], href: "/products" };
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
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isLoading = coupons === null;
  const isEmpty = coupons !== null && coupons.length === 0;

  return (
    <section className="w-full py-6 sm:py-8 lg:py-10">
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
          Copy promo codes from verified sellers and browse by category for direct discounts.
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
            const category = getCategoryInfo(coupon);
            const isRunning = coupon.homepageStatus === "running";
            const remaining = isRunning ? getRemaining(coupon.expiresAt, now) : null;

            return (
              <Card
                key={coupon.id}
                className={`relative overflow-hidden border ${theme.cardBorder} ${theme.cardBg} shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 rounded-md group ${!isRunning ? "opacity-80" : ""
                  }`}
              >
                <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full gap-3.5">
                  {/* Meta Top Header: Seller Name & Category Badge */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pb-1 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FiShoppingBag className="text-xs text-slate-500 dark:text-slate-400 shrink-0" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {coupon.storeName || "Verified Seller"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${theme.categoryBg}`}
                      >
                        <FiTag className="text-[9px]" />
                        {category.labels[0]}
                        {category.labels.length > 1 && ` +${category.labels.length - 1}`}
                      </span>
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

                  {/* Bottom Row: Code Box & Category Navigation Button */}
                  <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                    {/* Code Copy Pill */}
                    <div
                      className={`flex items-center ${theme.boxBg} rounded-md p-1 border shadow-xs shrink-0 ${!isRunning ? "opacity-60" : ""
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
                        className={`flex items-center gap-1.5 ${theme.btnBg} px-2 py-0.5 rounded-md text-xs font-bold font-mono tracking-wider transition-colors ${isRunning ? "cursor-pointer" : "cursor-not-allowed"
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

                    {/* Category Navigation Button */}
                    <Link
                      href={category.href}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold ${theme.actionBtn} shadow-xs hover:shadow transition-all active:scale-95 shrink-0`}
                    >
                      <span>
                        {category.labels[0]}
                        {category.labels.length > 1 && ` +${category.labels.length - 1}`}
                      </span>
                      <FiArrowRight className="text-[11px]" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}