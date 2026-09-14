"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button, Chip } from "@heroui/react";
import {
  Home,
  ShoppingBag,
  ArrowLeft,
  Compass,
  ChevronRight,
  ShoppingCart,
  Check,
} from "lucide-react";
import { useCartDrawer } from "@/context/CartDrawerContext";
import { getProducts, type Product } from "@/lib/api/products";
import { formatCurrency } from "@/lib/utils";

interface CuratedItem {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  price: string;
  numericPrice: number;
  image: string;
  href: string;
}

// Fallback curated products matching the user's reference image
const FALLBACK_CURATIONS: CuratedItem[] = [
  {
    id: "rec-aura-handbag",
    badge: "Boutique Pick",
    badgeColor: "text-purple-600 border-purple-200/60 dark:text-purple-400 dark:border-purple-500/30",
    title: "Aura Minimalist Handbag",
    description: "Full-grain calfskin leather, hand-stitched",
    price: "$420",
    numericPrice: 420,
    image:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=800&auto=format&fit=crop",
    href: "/products",
  },
  {
    id: "rec-veloce-audio",
    badge: "Featured",
    badgeColor: "text-indigo-600 border-indigo-200/60 dark:text-indigo-400 dark:border-indigo-500/30",
    title: "Veloce Pro Wireless Audio",
    description: "Adaptive acoustic profile with 48h playback",
    price: "$349",
    numericPrice: 349,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
    href: "/products",
  },
  {
    id: "rec-terra-candle",
    badge: "Staff Choice",
    badgeColor: "text-purple-600 border-purple-200/60 dark:text-purple-400 dark:border-purple-500/30",
    title: "Terra Sculptural Candle",
    description: "Santal & warm tonka bean essence",
    price: "$85",
    numericPrice: 85,
    image:
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800&auto=format&fit=crop",
    href: "/products",
  },
];

const BADGE_CONFIGS = [
  {
    label: "Boutique Pick",
    color: "text-purple-600 border-purple-200/60 dark:text-purple-400 dark:border-purple-500/30",
  },
  {
    label: "Featured",
    color: "text-indigo-600 border-indigo-200/60 dark:text-indigo-400 dark:border-indigo-500/30",
  },
  {
    label: "Staff Choice",
    color: "text-purple-600 border-purple-200/60 dark:text-purple-400 dark:border-purple-500/30",
  },
];

export default function NotFound() {
  const router = useRouter();
  const { addItem } = useCartDrawer();
  const [curations, setCurations] = useState<CuratedItem[]>(FALLBACK_CURATIONS);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);

  // Dynamically load top products from the database
  useEffect(() => {
    let isMounted = true;

    async function loadDynamicCurations() {
      try {
        const response = await getProducts({ limit: 3, sort: "popular" });

        let list: Product[] = [];
        if (Array.isArray(response)) {
          list = response;
        } else if (response && typeof response === "object") {
          const resObj = response as Record<string, unknown>;
          if (Array.isArray(resObj.items)) list = resObj.items as Product[];
          else if (Array.isArray(resObj.products)) list = resObj.products as Product[];
          else if (Array.isArray(resObj.data)) list = resObj.data as Product[];
        }

        if (isMounted && list.length > 0) {
          const dynamicItems: CuratedItem[] = list.slice(0, 3).map((prod, idx) => {
            const badgeMeta = BADGE_CONFIGS[idx % BADGE_CONFIGS.length];
            const fallbackItem = FALLBACK_CURATIONS[idx % FALLBACK_CURATIONS.length];
            const displayImage =
              prod.images?.[0] || prod.images?.[1] || fallbackItem.image;
            const priceVal = prod.discountPrice ?? prod.price;

            return {
              id: prod.id || String(idx),
              badge: badgeMeta.label,
              badgeColor: badgeMeta.color,
              title: prod.title,
              description: prod.description || fallbackItem.description,
              price: formatCurrency(priceVal),
              numericPrice: Number(priceVal) || 0,
              image: displayImage,
              href: `/products/${prod.id}`,
            };
          });

          setCurations(dynamicItems);
        }
      } catch {
        // Fallback curations stay active
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDynamicCurations();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = (item: CuratedItem) => {
    addItem({
      productId: item.id,
      price: item.numericPrice,
      title: item.title,
      image: item.image,
    });
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1600);
  };

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-8 transition-colors duration-300 dark:bg-[#090614] sm:px-6 sm:py-12 lg:px-8 flex flex-col items-center justify-center">
      {/* Background ambient lighting and glow effects */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-full -translate-x-1/2 max-w-4xl bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 blur-3xl dark:from-indigo-600/20 dark:via-purple-600/20 dark:to-pink-600/20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-1/2 -z-10 h-96 w-full -translate-x-1/2 max-w-4xl bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-transparent blur-3xl dark:from-violet-900/25 dark:via-indigo-950/30"
      />

      {/* Floating ambient particles */}
      {[
        { top: "10%", left: "12%", delay: 0, duration: 5 },
        { top: "18%", right: "14%", delay: 1, duration: 6 },
        { top: "50%", left: "8%", delay: 2, duration: 7 },
        { top: "60%", right: "10%", delay: 1.5, duration: 5.5 },
      ].map((particle, idx) => (
        <motion.div
          key={idx}
          aria-hidden="true"
          className="pointer-events-none absolute h-2 w-2 rounded-full bg-indigo-400/40 dark:bg-purple-400/30"
          style={{ top: particle.top, left: particle.left, right: particle.right }}
          animate={{
            y: [-12, 12, -12],
            opacity: [0.2, 0.8, 0.2],
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay,
          }}
        />
      ))}

      {/* Hero 404 Section */}
      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        {/* Animated Floating E-commerce Theme Illustration & 404 Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mb-3 flex flex-col items-center justify-center sm:mb-4"
        >
          {/* Floating Courier Box & Zero-G Cart Illustration */}
          <motion.div
            animate={{
              y: [-7, 7, -7],
              rotate: [-1.5, 1.5, -1.5],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative mb-2 flex items-center justify-center sm:mb-3"
          >
            {/* Pulsing Aura */}
            <motion.div
              animate={{
                scale: [1, 1.12, 1],
                opacity: [0.45, 0.75, 0.45],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -inset-6 rounded-full bg-gradient-to-r from-indigo-500/25 via-purple-500/25 to-pink-500/25 blur-2xl dark:from-indigo-500/35 dark:via-purple-500/30 dark:to-pink-500/35"
            />

            {/* Stylized Floating Lost Courier Parcel / Cart SVG */}
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-white/60 bg-white/70 p-3 shadow-xl backdrop-blur-md dark:border-purple-500/20 dark:bg-slate-900/70 sm:h-28 sm:w-28">
              <svg
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-full"
              >
                {/* Orbital Ring */}
                <ellipse
                  cx="60"
                  cy="75"
                  rx="48"
                  ry="18"
                  stroke="url(#ringGradient)"
                  strokeWidth="2.5"
                  strokeDasharray="4 6"
                  className="opacity-70 dark:opacity-80"
                />

                {/* Floating Courier Parcel Box */}
                <g className="filter drop-shadow-md">
                  {/* Box Top */}
                  <polygon
                    points="60,25 90,40 60,55 30,40"
                    fill="url(#boxTopGradient)"
                  />
                  {/* Box Left Side */}
                  <polygon
                    points="30,40 60,55 60,88 30,73"
                    fill="url(#boxLeftGradient)"
                  />
                  {/* Box Right Side */}
                  <polygon
                    points="60,55 90,40 90,73 60,88"
                    fill="url(#boxRightGradient)"
                  />
                  {/* Packaging Tape Stripes */}
                  <path
                    d="M45 47.5L60 55L75 47.5"
                    stroke="#FFFFFF"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeOpacity="0.85"
                  />
                  <line
                    x1="60"
                    y1="55"
                    x2="60"
                    y2="88"
                    stroke="#FFFFFF"
                    strokeWidth="3.5"
                    strokeOpacity="0.85"
                  />
                </g>

                {/* Floating Radar Star */}
                <circle cx="88" cy="30" r="3.5" fill="#EC4899" className="animate-ping" />
                <circle cx="88" cy="30" r="3" fill="#F43F5E" />

                {/* Satellite Mini Icon */}
                <circle cx="28" cy="78" r="4" fill="#6366F1" />

                {/* Gradients */}
                <defs>
                  <linearGradient id="ringGradient" x1="12" y1="75" x2="108" y2="75" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366F1" stopOpacity="0.2" />
                    <stop offset="0.5" stopColor="#A855F7" />
                    <stop offset="1" stopColor="#EC4899" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="boxTopGradient" x1="30" y1="25" x2="90" y2="55" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#818CF8" />
                    <stop offset="1" stopColor="#6366F1" />
                  </linearGradient>
                  <linearGradient id="boxLeftGradient" x1="30" y1="40" x2="60" y2="88" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4F46E5" />
                    <stop offset="1" stopColor="#4338CA" />
                  </linearGradient>
                  <linearGradient id="boxRightGradient" x1="60" y1="40" x2="90" y2="88" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#7C3AED" />
                    <stop offset="1" stopColor="#6D28D9" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </motion.div>

          {/* Large Stylized 404 Headline */}
          <div className="relative select-none">
            <motion.h1
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="font-black tracking-tight text-7xl sm:text-8xl md:text-9xl leading-none"
            >
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
                404
              </span>
            </motion.h1>

            {/* Glowing Aura directly behind 404 */}
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-500/25 via-purple-500/30 to-pink-500/25 blur-3xl"
            />
          </div>
        </motion.div>

        {/* Error Messaging */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mb-5 flex flex-col items-center"
        >
          {/* Badge */}
          <Chip
            variant="soft"
            className="mb-2 border border-indigo-200/60 bg-indigo-50/80 px-3 py-1 font-semibold text-xs text-indigo-700 shadow-xs dark:border-indigo-500/30 dark:bg-indigo-950/50 dark:text-indigo-300"
          >
            <span className="flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "12s" }} />
              Page Not Found • Error 404
            </span>
          </Chip>

          {/* Headline */}
          <h2 className="mb-2 font-extrabold text-xl tracking-tight text-[#0F172A] dark:text-[#F8FAFC] sm:text-2xl lg:text-3xl">
            Looks Like You&apos;ve Wandered Off The Aisle!
          </h2>

          {/* Subtitle */}
          <p className="max-w-md text-sm text-slate-600 leading-relaxed dark:text-slate-400 sm:text-base">
            The item or page you are looking for might have been moved, renamed, or is temporarily out of stock.
          </p>
        </motion.div>

        {/* 3 Buttons in ONE Single Row / Line */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mb-10 sm:mb-14 flex flex-wrap sm:flex-nowrap items-center justify-center gap-3 sm:gap-4"
        >
          {/* Button 1: Primary Back to Home */}
          <Link href="/" className="shrink-0">
            <Button
              size="md"
              className="flex items-center gap-2 rounded-xl sm:rounded-2xl bg-indigo-600 px-5 py-2.5 font-semibold text-sm text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
            >
              <Home className="h-4 w-4 shrink-0" />
              <span>Back to Home</span>
            </Button>
          </Link>

          {/* Button 2: Secondary Explore Trending Products */}
          <Link href="/products" className="shrink-0">
            <Button
              variant="outline"
              size="md"
              className="flex items-center gap-2 rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white px-5 py-2.5 font-semibold text-sm text-slate-800 shadow-xs backdrop-blur-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
            >
              <ShoppingBag className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
              <span>Explore Trending Products</span>
            </Button>
          </Link>

          {/* Button 3: Return to Previous Page */}
          <button
            type="button"
            onClick={() => router.back()}
            className="group inline-flex shrink-0 items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
            <span>Return to Previous Page</span>
          </button>
        </motion.div>
      </div>

      {/* Recommended Curations Section */}
      <motion.section
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.6 }}
        className="w-full max-w-5xl px-2 sm:px-4"
      >
        {/* Section Header */}
        <div className="mb-6 flex items-end justify-between px-1">
          <div>
            <h3 className="font-bold text-xl tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Recommended Curations
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              Handpicked items you might love while you are here
            </p>
          </div>
          <Link
            href="/products"
            className="group inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 sm:text-sm"
          >
            <span>View All</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Dynamic / Curated Product Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            // Skeleton shimmer cards during load
            [1, 2, 3].map((i) => (
              <div
                key={`skel-${i}`}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900/90 animate-pulse"
              >
                <div className="aspect-4/3 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="mt-3.5 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="mt-4 flex items-center justify-between pt-1">
                  <div className="h-6 w-16 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            ))
          ) : (
            curations.map((item) => {
              const isAdded = addedId === item.id;

              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/90"
                >
                  {/* Image Container with Badge */}
                  <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    {/* Tag Badge on top-left */}
                    <div
                      className={`absolute top-3 left-3 z-10 rounded-md border bg-white/95 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md shadow-xs dark:bg-slate-900/95 ${item.badgeColor}`}
                    >
                      {item.badge}
                    </div>

                    {/* Product Image */}
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Details */}
                  <div className="mt-3.5 flex flex-col">
                    <Link href={item.href}>
                      <h4 className="line-clamp-1 font-bold text-base text-slate-900 transition-colors hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400">
                        {item.title}
                      </h4>
                    </Link>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>

                  {/* Price & Add to Cart Button */}
                  <div className="mt-4 flex items-center justify-between pt-1">
                    <span className="font-extrabold text-2xl text-slate-900 dark:text-white">
                      {item.price}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      title="Add to Cart"
                      aria-label={`Add ${item.title} to cart`}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-xs transition-all cursor-pointer ${
                        isAdded
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-600 dark:hover:text-white"
                      }`}
                    >
                      {isAdded ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <ShoppingCart className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.section>
    </main>
  );
}
