"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaShoppingBag,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

interface HeroSlide {
  id: string;
  badge: string;
  title: ReactNode;
  subtitle: string;
  image: string;
  imageAlt: string;
  dealTag: string;
  ratingTag: string;
}

const Highlight = ({ children }: { children: ReactNode }) => (
  <span className="bg-gradient-to-r from-white via-violet-200 to-violet-400 bg-clip-text text-transparent dark:via-fuchsia-200 dark:to-fuchsia-400">
    {children}
  </span>
);

const slidesData: HeroSlide[] = [
  {
    id: "ai-picks",
    badge: "✨ AI-Curated Picks",
    title: (
      <>
        Smart Shopping,
        <br />
        <Highlight>Curated by AI</Highlight>
      </>
    ),
    subtitle:
      "Tell our AI what you love and get a feed that feels hand-picked. Fewer tabs, better finds.",
    image: "/hero-slide1.jpg",
    imageAlt:
      "Shopper discovering AI-curated product recommendations on ShopNest",
    dealTag: "Up to 40% off today",
    ratingTag: "★ 4.9 · Loved by 12k+ shoppers",
  },
  {
    id: "multi-vendor",
    badge: "🔥 Trending Multi-Vendor Deals",
    title: (
      <>
        Thousands of Stores,
        <br />
        <Highlight>One Trusted Market</Highlight>
      </>
    ),
    subtitle:
      "Shop unique products from verified independent sellers — all protected by the ShopNest buyer guarantee.",
    image: "/hero-slide2.jpg",
    imageAlt:
      "Collage of trending products from ShopNest multi-vendor marketplace",
    dealTag: "New deals every hour",
    ratingTag: "5,000+ verified sellers",
  },
  {
    id: "spring-tech",
    badge: "🚀 Spring Tech Exclusive",
    title: (
      <>
        New Season Tech,
        <br />
        <Highlight>Before Anyone Else</Highlight>
      </>
    ),
    subtitle:
      "Early access to spring drops across audio, wearables and smart home — limited stock, member pricing.",
    image: "/hero-slide3.jpg",
    imageAlt: "Latest spring tech gadgets exclusive to ShopNest",
    dealTag: "Members save an extra 15%",
    ratingTag: "Free next-day delivery",
  },
];

const slideFallbacks = [
  "bg-[radial-gradient(circle_at_30%_20%,#a78bfa_0%,#6366f1_45%,#312e81_100%)]",
  "bg-[radial-gradient(circle_at_70%_30%,#f0abfc_0%,#a855f7_50%,#4c1d95_100%)]",
  "bg-[radial-gradient(circle_at_40%_70%,#67e8f9_0%,#818cf8_50%,#1e1b4b_100%)]",
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slidesData.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slidesData.length) % slidesData.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const slide = slidesData[currentSlide];

  return (
    <section
      aria-label="ShopNest featured collections"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="group relative w-full overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 transition-colors duration-700 dark:from-[#0a0618] dark:via-[#1d1040] dark:to-[#3b1177]"
    >
      {/* Decorative glows + texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:22px_22px] opacity-60 dark:bg-[radial-gradient(rgba(167,139,250,0.14)_1px,transparent_1px)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[6%] h-96 w-96 animate-float rounded-full bg-fuchsia-300/40 blur-3xl dark:bg-fuchsia-500/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-[28%] h-96 w-96 animate-float-delayed rounded-full bg-cyan-300/30 blur-3xl dark:bg-violet-500/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-white/25 blur-3xl dark:bg-indigo-400/10"
      />

      <div className="relative mx-auto max-w-7xl">
        <AnimatePresence mode="wait">
          <motion.article
            key={slide.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative min-h-[500px] md:min-h-[520px]"
          >
            <div className="relative z-10 grid items-center gap-12 px-6 py-14 pb-24 sm:px-10 md:grid-cols-2 md:pb-14 lg:gap-16 lg:px-14 lg:py-16">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-white shadow-sm backdrop-blur-md transition-colors duration-700 dark:border-violet-300/25 dark:bg-violet-400/10">
                  {slide.badge}
                </span>

                <h2 className="mt-5 text-3xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-sm sm:text-4xl lg:text-5xl xl:text-[3.4rem]">
                  {slide.title}
                </h2>

                <p className="mt-4 line-clamp-2 max-w-md text-sm leading-relaxed text-indigo-100/90 transition-colors duration-700 sm:text-base dark:text-slate-300/85">
                  {slide.subtitle}
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Link
                    href="/products"
                    className="group/btn inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-indigo-700 shadow-xl shadow-indigo-950/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-50 hover:shadow-2xl active:translate-y-0 dark:text-indigo-900 dark:shadow-black/40"
                  >
                    Shop Collection
                    <FaArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </Link>
                  <Link
                    href="/ai-advisor"
                    className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-white/60 hover:bg-white/20 dark:border-violet-300/30 dark:bg-violet-400/10 dark:hover:border-violet-300/50 dark:hover:bg-violet-400/20"
                  >
                    <HiSparkles className="h-4 w-4 text-violet-200 dark:text-fuchsia-300" />
                    Ask AI Advisor
                  </Link>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl shadow-indigo-950/40 ring-1 ring-white/40 transition-shadow duration-700 dark:shadow-black/50 dark:ring-white/15 md:rounded-[2rem]">
                  <div
                    aria-hidden
                    className={`absolute inset-0 ${slideFallbacks[currentSlide % slideFallbacks.length]} transition-colors duration-700`}
                  />
                  <Image
                    src={slide.image}
                    alt={slide.imageAlt}
                    fill
                    priority={currentSlide === 0}
                    sizes="(max-width: 768px) 92vw, (max-width: 1200px) 45vw, 560px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-950/50 via-transparent to-transparent" />
                </div>

                <div className="absolute -left-3 top-6 inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs font-medium text-white ring-1 ring-white/30 backdrop-blur-md transition-colors duration-700 sm:-left-6 dark:bg-violet-400/10 dark:ring-violet-300/25">
                  <FaShoppingBag className="h-4 w-4 text-indigo-100 dark:text-violet-200" />
                  {slide.dealTag}
                </div>

                <div className="absolute -bottom-4 right-4 inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs font-medium text-white ring-1 ring-white/30 backdrop-blur-md transition-colors duration-700 sm:-right-4 dark:bg-violet-400/10 dark:ring-violet-300/25">
                  <HiSparkles className="h-4 w-4 text-violet-100 dark:text-fuchsia-300" />
                  {slide.ratingTag}
                </div>
              </div>
            </div>
          </motion.article>
        </AnimatePresence>

        {/* Pagination Dots */}
        <div className="absolute bottom-5 left-0 right-0 z-20 flex items-center justify-center gap-2">
          {slidesData.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlide
                  ? "w-8 bg-white shadow-md shadow-white/50"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>

      <button
        onClick={prevSlide}
        type="button"
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-white/15 text-white shadow-lg shadow-indigo-950/30 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-white/50 hover:bg-white/30 active:scale-95 focus-visible:bg-white/30 focus-visible:outline-none md:inline-flex lg:left-6 dark:border-violet-300/25 dark:bg-violet-400/10 dark:hover:border-violet-300/50 dark:hover:bg-violet-400/20 2xl:left-[calc(50%-44.5rem)]"
      >
        <FaChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={nextSlide}
        type="button"
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-white/15 text-white shadow-lg shadow-indigo-950/30 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-white/50 hover:bg-white/30 active:scale-95 focus-visible:bg-white/30 focus-visible:outline-none md:inline-flex lg:right-6 dark:border-violet-300/25 dark:bg-violet-400/10 dark:hover:border-violet-300/50 dark:hover:bg-violet-400/20 2xl:right-[calc(50%-44.5rem)]"
      >
        <FaChevronRight className="h-5 w-5" />
      </button>
    </section>
  );
};

export default Hero;
