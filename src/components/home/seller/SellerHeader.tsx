"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, Pause, Play } from "lucide-react";
import { CATEGORY_TABS } from "./seller.data";

interface SellerHeaderProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isPaused: boolean;
  onTogglePause: () => void;
}

export default function SellerHeader({
  activeTab,
  onTabChange,
  isPaused,
  onTogglePause,
}: SellerHeaderProps) {
  return (
    <div>
      {/* Title & Actions Row */}
      <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end border-b border-border/60 pb-8">
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
            className="mt-3 text-3xl font-black tracking-tight text-text sm:text-4xl"
          >
            Meet Trusted{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-warm bg-clip-text text-transparent">
              Top Sellers
            </span>
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
          <button
            type="button"
            onClick={onTogglePause}
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-muted-bg/50 px-3.5 py-2.5 text-xs font-bold text-muted transition-all duration-200 hover:border-border hover:bg-muted-bg hover:text-text"
            title={isPaused ? "Resume infinite scroll" : "Pause infinite scroll"}
          >
            {isPaused ? <Play className="h-3.5 w-3.5 text-primary" /> : <Pause className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isPaused ? "Resume" : "Pause"}</span>
          </button>

          <Link
            href="/stores"
            className="group inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white hover:shadow-md hover:shadow-primary/20"
          >
            <span>Explore All Stores</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Category Tabs & Hover Note */}
      <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-2 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`group relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "text-primary bg-primary/10 border border-primary/30"
                    : "text-muted hover:bg-muted-bg/60 hover:text-text border border-transparent"
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

        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold text-muted">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span>Hover cards to pause & inspect</span>
        </div>
      </div>
    </div>
  );
}
