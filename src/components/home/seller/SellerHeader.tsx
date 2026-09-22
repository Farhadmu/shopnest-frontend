"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, Search, X } from "lucide-react";
import { CATEGORY_TABS } from "./seller.data";

interface SellerHeaderProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultCount?: number;
}

export default function SellerHeader({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  resultCount,
}: SellerHeaderProps) {
  return (
    <div>
      {/* Title & Actions Row */}
      <div className="relative z-10 flex flex-col justify-between gap-3 md:flex-row md:items-end border-b border-border/60 pb-4">
        <div>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-primary" />
            <span>Verified Marketplace</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-3xl font-black tracking-tight text-text sm:text-4xl"
          >
            Meet Trusted Top Sellers
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mt-2 max-w-xl text-sm font-medium text-muted"
          >
            Discover certified independent stores with proven track records, fast dispatch, and verified 5-star customer reviews.
          </motion.p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Link
            href="/stores"
            className="group inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white hover:shadow-md hover:shadow-primary/20"
          >
            <span>Explore All Stores</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Category Tabs & Search Bar Row */}
      <div className="relative z-10 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`group relative flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "text-primary bg-primary/10 border border-primary/30 shadow-2xs"
                    : "text-muted hover:bg-muted-bg/70 hover:text-text border border-transparent"
                }`}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-primary" : "text-muted group-hover:text-text"}`} />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center min-w-[240px] sm:max-w-xs w-full sm:w-auto">
          <div className="pointer-events-none absolute left-3 flex items-center text-muted">
            <Search className="h-3.5 w-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search stores or products..."
            className="h-9 w-full rounded-xl border border-border bg-surface pl-8.5 pr-8 text-xs text-text placeholder:text-muted/70 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-2.5 flex h-4 w-4 items-center justify-center rounded-full text-muted hover:bg-muted-bg hover:text-text transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
