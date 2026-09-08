"use client";

import React, { useEffect, useState } from "react";
import { getProducts, Product } from "@/lib/api/products";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import {
  FiZap,
  FiClock,
  FiShoppingBag,
  FiStar,
  FiArrowRight,
  FiPercent,
  FiTruck,
} from "react-icons/fi";

export default function FlashSalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Live Flash Sale Countdown (e.g. 18 hours, 42 mins, 35 secs)
  const [timeLeft, setTimeLeft] = useState({
    hours: 18,
    minutes: 42,
    seconds: 35,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getProducts({ limit: 50 })
      .then((res) => {
        const items = Array.isArray(res) ? res : (res as any)?.items || [];
        setProducts(items);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Flash Sale Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-primary p-8 sm:p-12 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-black/30 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider text-amber-300">
              <FiZap /> Limited Time Mega Promotion
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              ShopNest Flash Sale ⚡
            </h1>
            <p className="text-sm sm:text-base text-white/90 max-w-xl">
              Grab exclusive deals up to 40% OFF across certified electronics, gadgets, and apparel.
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="bg-black/30 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-center gap-3 shrink-0">
            <div className="text-center">
              <span className="text-2xl sm:text-3xl font-black block">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[10px] uppercase font-bold text-white/70">Hours</span>
            </div>
            <span className="text-2xl font-black">:</span>
            <div className="text-center">
              <span className="text-2xl sm:text-3xl font-black block">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[10px] uppercase font-bold text-white/70">Mins</span>
            </div>
            <span className="text-2xl font-black">:</span>
            <div className="text-center">
              <span className="text-2xl sm:text-3xl font-black block text-amber-300">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[10px] uppercase font-bold text-white/70">Secs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Deals Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <FiPercent className="text-primary" /> Active Flash Deals ({products.length})
          </h2>
          <span className="text-xs font-semibold text-muted flex items-center gap-1">
            <FiTruck className="text-emerald-500" /> Fast Courier Delivery Available
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted text-sm animate-pulse">
            Loading live flash sale deals...
          </div>
        ) : products.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted text-sm">
            No active flash deals at this moment. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((p) => {
              const currentPrice = p.discountPrice || p.price;
              const originalPrice = p.price;
              const hasDiscount = p.discountPrice && p.discountPrice < p.price;
              const discountPercent = hasDiscount && originalPrice > 0
                ? Math.round(((originalPrice - (p.discountPrice || 0)) / originalPrice) * 100)
                : 15; // default promo tag

              return (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="bg-card border border-border rounded-2xl p-3.5 hover:border-primary/50 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-full aspect-square rounded-xl bg-muted-bg overflow-hidden mb-3 relative">
                      {p.images && p.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted">
                          <FiShoppingBag className="text-2xl" />
                        </div>
                      )}

                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                        -{discountPercent}% OFF
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {p.title}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between">
                    <div>
                      <span className="font-black text-sm text-primary block">
                        {formatCurrency(currentPrice)}
                      </span>
                      {hasDiscount && (
                        <span className="text-[10px] text-muted line-through block">
                          {formatCurrency(originalPrice)}
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-500">
                      <FiStar className="fill-amber-500 text-[10px]" /> {p.ratingAvg || "5.0"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
