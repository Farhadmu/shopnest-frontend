"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, Chip } from "@heroui/react";
import { FiArrowRight, FiCopy, FiCheck, FiClock, FiShoppingBag, FiTag } from "react-icons/fi";

export default function CouponSection() {
  // Track copied code state per coupon
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Countdown timer state for the limited-time coupon
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 24,
    seconds: 36,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatUnit = (value: number) => String(value).padStart(2, "0");

  const coupons = [
    {
      id: "first-order",
      code: "FIRST15",
      badge: "New User",
      sellerName: "Nova Tech Official",
      category: "Electronics",
      categoryHref: "/products?category=Electronics",
      title: "15% OFF",
      subtitle: "On first order above ৳1,000",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAi0daYqQNGO9UmKXh28rf0s0ewWKXlPYeNzRQe8jk9Jo8ykSUNkT3AKTBDerB5MB80P5diyqFumTrbBomGphK_eF167Zcqh2ImQ3Doo8DDfT3yp9QYg9eeFIz9FY0_JfTSPIne2VEtrks_VlG1CLqWU1ToQNemSuouLxbQUJkSfVQ3brq1HqQbnPhMa4WECclxXB7gkfu1gOEPzI0RYgURmEaBbzYCwO7ODReEqz7cg3BuERi43fsxgA",
      alt: "3D Gift Box",
      theme: {
        cardBorder: "border-purple-200/70 dark:border-purple-900/40",
        cardBg:
          "bg-gradient-to-br from-purple-50/90 via-purple-100/35 to-indigo-50/45 dark:from-[#170F2E] dark:via-[#130E26] dark:to-[#0D081D]",
        chipBg: "bg-purple-200/60 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300",
        categoryBg: "bg-purple-100/80 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/40",
        divider: "border-purple-200/80 dark:border-purple-800/50",
        boxBg: "bg-white dark:bg-[#1C1635] border-purple-200 dark:border-purple-800/40",
        btnBg: "bg-purple-50 dark:bg-[#251D44] hover:bg-purple-100 dark:hover:bg-[#2F2555] text-purple-700 dark:text-purple-300",
        actionBtn: "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20",
      },
    },
    {
      id: "flash-deal",
      code: "FLASH500",
      badge: "Deal Of The Day",
      sellerName: "Urban Loom Studio",
      category: "Fashion",
      categoryHref: "/products?category=Fashion",
      isTimer: true,
      title: "৳500 FLAT OFF",
      subtitle: "Min spend ৳3,000 on trending clothing",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBssWeS6DzWNyj_rVBmsWSNyGsoYy4a_sxFtPyFDmodsh1Ov7aymBrWMabKgDhzFDZ5FCRF2tv_ev2Co1FDLdU5TDGSK8h4V_gp_KCHxioXdZ2fIyhzJ2hUBZqqi78Sa1I-Kl9ahLNSovWgckWUKTWvJQcrrcl5ged1zKtgnNOS0BCOY_bH6nViaZ27bC6ztU4TQVQI00bbog2PFvA8apUbSLTn6vQIYBSAiEyAPY8mtV6NMe_Vu-SKBQ",
      alt: "3D Alarm Clock",
      theme: {
        cardBorder: "border-rose-200/70 dark:border-rose-950/40",
        cardBg:
          "bg-gradient-to-br from-rose-50/90 via-pink-50/35 to-orange-50/45 dark:from-[#26101B] dark:via-[#1D0C15] dark:to-[#0D081D]",
        chipBg: "bg-rose-200/60 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300",
        categoryBg: "bg-rose-100/80 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/40",
        divider: "border-rose-200/80 dark:border-rose-900/50",
        boxBg: "bg-white dark:bg-[#2B1320] border-rose-200 dark:border-rose-800/40",
        btnBg: "bg-rose-50 dark:bg-[#3B192C] hover:bg-rose-100 dark:hover:bg-[#4B2038] text-rose-700 dark:text-rose-300",
        actionBtn: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20",
      },
    },
    {
      id: "free-delivery",
      code: "FREESHIP",
      badge: "Free Delivery",
      sellerName: "HomeAura Living",
      category: "Home & Living",
      categoryHref: "/products?category=Home%20%26%20Living",
      title: "FREE SHIPPING",
      subtitle: "Zero delivery fee on decor & furniture over ৳1,500",
      image: "/assets/free-shipping-3d.jpg",
      alt: "3D Express Delivery",
      theme: {
        cardBorder: "border-emerald-200/70 dark:border-emerald-950/40",
        cardBg:
          "bg-gradient-to-br from-emerald-50/90 via-teal-50/35 to-cyan-50/45 dark:from-[#0B1E19] dark:via-[#081814] dark:to-[#050F0D]",
        chipBg: "bg-emerald-200/60 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300",
        categoryBg: "bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/40",
        divider: "border-emerald-200/80 dark:border-emerald-900/50",
        boxBg: "bg-white dark:bg-[#102720] border-emerald-200 dark:border-emerald-800/40",
        btnBg: "bg-emerald-50 dark:bg-[#16382E] hover:bg-emerald-100 dark:hover:bg-[#1E483B] text-emerald-700 dark:text-emerald-300",
        actionBtn: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20",
      },
    },
  ];

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

      {/* 3 Coupons Grid - Rectangular Cards with Seller & Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {coupons.map((coupon) => (
          <Card
            key={coupon.id}
            className={`relative overflow-hidden border ${coupon.theme.cardBorder} ${coupon.theme.cardBg} shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 rounded-md group`}
          >
            <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full gap-3.5">
              {/* Meta Top Header: Seller Name & Category Badge */}
              <div className="flex items-center justify-between gap-2 flex-wrap pb-1 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FiShoppingBag className="text-xs text-slate-500 dark:text-slate-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {coupon.sellerName}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${coupon.theme.categoryBg}`}
                  >
                    <FiTag className="text-[9px]" /> {coupon.category}
                  </span>
                </div>
              </div>

              {/* Main Row: Discount Details on Left, 3D Image on Right */}
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1 flex-1 min-w-0">
                  {/* Badge & Timer (if flash deal) */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Chip
                      size="sm"
                      variant="soft"
                      className={`${coupon.theme.chipBg} font-semibold px-2 text-[10px] h-5 rounded-md`}
                    >
                      {coupon.badge}
                    </Chip>

                    {coupon.isTimer && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-100/70 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/40 text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400">
                        <FiClock className="text-[10px]" />
                        <span>
                          {formatUnit(timeLeft.hours)}:{formatUnit(timeLeft.minutes)}:
                          {formatUnit(timeLeft.seconds)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Discount Title */}
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    {coupon.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                    {coupon.subtitle}
                  </p>
                </div>

                {/* Big 3D Visual Box */}
                <div className="w-22 h-22 sm:w-26 sm:h-26 relative drop-shadow-md shrink-0 rounded-md overflow-hidden">
                  <Image
                    src={coupon.image}
                    alt={coupon.alt}
                    fill
                    sizes="(max-width: 768px) 88px, 104px"
                    className="object-contain rounded-md group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Perforated Ticket Divider */}
              <div className="relative my-0.5">
                <div className={`border-t border-dashed ${coupon.theme.divider}`} />
                <div className="absolute -left-6 -top-1.5 w-3 h-3 rounded-full bg-background" />
                <div className="absolute -right-6 -top-1.5 w-3 h-3 rounded-full bg-background" />
              </div>

              {/* Bottom Row: Code Box & Category Navigation Button */}
              <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                {/* Code Copy Pill */}
                <div
                  className={`flex items-center ${coupon.theme.boxBg} rounded-md p-1 border shadow-xs shrink-0`}
                >
                  <span className="text-[10px] font-semibold text-slate-400 pl-1.5 pr-1 uppercase tracking-wider">
                    CODE:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(coupon.code)}
                    className={`flex items-center gap-1.5 ${coupon.theme.btnBg} px-2 py-0.5 rounded-md text-xs font-bold font-mono tracking-wider transition-colors cursor-pointer`}
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
                  href={coupon.categoryHref}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold ${coupon.theme.actionBtn} shadow-xs hover:shadow transition-all active:scale-95 shrink-0`}
                >
                  <span>{coupon.category}</span>
                  <FiArrowRight className="text-[11px]" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}