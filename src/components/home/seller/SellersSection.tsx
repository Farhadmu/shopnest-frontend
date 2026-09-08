"use client";

import React, { useState } from "react";
import { SELLERS } from "./seller.data";
import SellerHeader from "./SellerHeader";
import SellerMarquee from "./SellerMarquee";
import SellerTrustPillars from "./SellerTrustPillars";

export default function SellersSection() {
  const [activeTab, setActiveTab] = useState("all");
  const [isPaused, setIsPaused] = useState(false);
  const [followedStores, setFollowedStores] = useState<Record<string, boolean>>({});

  const displaySellers =
    activeTab === "all"
      ? SELLERS
      : SELLERS.filter((seller) => seller.categorySlug === activeTab);

  const handleToggleFollow = (id: string) => {
    setFollowedStores((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-border bg-surface p-6 sm:p-10 shadow-sm transition-all duration-300">
      {/* Background Ambient Glows */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full blur-3xl opacity-40 dark:opacity-20"
        style={{ background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full blur-3xl opacity-30 dark:opacity-15"
        style={{ background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)" }}
      />

      {/* 1. Header with Badge & Category Tabs */}
      <SellerHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused((prev) => !prev)}
      />

      {/* 2. Single Row Infinite Marquee */}
      <SellerMarquee
        sellers={displaySellers}
        isPaused={isPaused}
        followedStores={followedStores}
        onToggleFollow={handleToggleFollow}
      />

      {/* 3. Bottom Marketplace Trust Pillars */}
      <SellerTrustPillars />
    </section>
  );
}
