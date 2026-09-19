"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { FiArrowRight, FiShoppingBag, FiLayers } from "react-icons/fi";

export function DeveloperCta() {
  return (
    <section className="py-16 sm:py-24 border-t border-border/60 bg-gradient-to-b from-card via-muted-bg/30 to-background text-center relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide">
          <FiLayers className="w-3.5 h-3.5" />
          <span>One Team • One Vision</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
          Built Together. <br className="hidden sm:inline" />
          Designed to Scale.
        </h2>

        <p className="text-sm sm:text-base text-muted max-w-xl mx-auto leading-relaxed">
          ShopNest is more than an e-commerce platform — it's a connected engineering ecosystem built by a passionate
          team blending diverse technical disciplines to reinvent multi-vendor commerce.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="px-6 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-lg shadow-primary/25 transition-all flex items-center gap-2 active:scale-95"
          >
            <span>Explore ShopNest</span>
            <FiArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/products"
            className="px-6 py-3 rounded-2xl bg-card hover:bg-muted-bg border border-border/80 text-foreground font-bold text-sm shadow-xs transition-all flex items-center gap-2 active:scale-95"
          >
            <FiShoppingBag className="w-4 h-4" />
            <span>Browse Catalog</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
