"use client";

import React, { useEffect, useState } from "react";
import { getPublicSellerStoreBySlug, getPublicSellerStores } from "@/lib/api/sellers";
import { followStore, unfollowStore } from "@/lib/api/messages";
import SellerHeader from "./SellerHeader";
import SellerMarquee from "./SellerMarquee";
import SellerTrustPillars from "./SellerTrustPillars";
import { Seller } from "./seller.types";

const CARD_STYLES = [
  { gradient: "from-indigo-500 via-blue-600 to-purple-600", accentColor: "var(--color-primary)", glowColor: "rgba(99, 102, 241, 0.25)", badgeColor: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" },
  { gradient: "from-purple-500 via-pink-500 to-rose-500", accentColor: "var(--color-accent)", glowColor: "rgba(168, 85, 247, 0.25)", badgeColor: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20" },
  { gradient: "from-amber-500 via-orange-500 to-rose-500", accentColor: "var(--color-warm)", glowColor: "rgba(249, 115, 22, 0.25)", badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  { gradient: "from-emerald-500 via-teal-500 to-cyan-500", accentColor: "var(--color-success)", glowColor: "rgba(16, 185, 129, 0.25)", badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
];

function formatCount(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k+`;
  return String(value);
}

function normalizeMediaUrl(value?: string) {
  if (!value) return undefined;
  const cleanValue = value.trim();
  if (!cleanValue || cleanValue.startsWith("data:") || cleanValue.startsWith("http") || cleanValue.startsWith("/")) return cleanValue;
  return `/uploads/${cleanValue}`;
}

function toSeller(store: Awaited<ReturnType<typeof getPublicSellerStores>>[number], index: number): Seller {
  const category = store.businessInfo?.categoryId || store.products?.[0]?.category || "Marketplace Store";
  const categorySlug = category.toLowerCase().includes("elect") ? "electronics" : category.toLowerCase().includes("fashion") || category.toLowerCase().includes("beaut") ? "fashion" : category.toLowerCase().includes("home") || category.toLowerCase().includes("decor") ? "home" : "all";
  const style = CARD_STYLES[index % CARD_STYLES.length];
  const initials = store.storeName.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
  const tags = Array.from(new Set((store.products || []).flatMap((product) => product.tags || [product.category]).filter(Boolean))).slice(0, 3) as string[];
  const featuredProducts = (store.products || [])
    .flatMap((product) => (product.images || []).slice(0, 1).map((image) => ({ image, title: product.title || product.category || "Featured product" })))
    .slice(0, 3);

  return {
    id: store.id || store._id || store.slug,
    storeSlug: store.slug,
    name: store.storeName,
    logo: store.logo || store.products?.find((product) => product.images?.[0])?.images?.[0],
    banner: normalizeMediaUrl(store.banner || store.bannerUrl || store.bannerImage || store.products?.find((product) => product.images?.[0])?.images?.[0]),
    category,
    categorySlug,
    tagline: store.description || "Verified products from a trusted ShopNest store.",
    rating: Number(Number(store.rating || 0).toFixed(1)),
    reviewsCount: formatCount(store.ratingCount || 0),
    sales: formatCount(store.salesNumber || 0),
    positiveRate: store.trustScore ? `${Math.round(store.trustScore)}% trust` : "Verified store",
    responseTime: "—",
    initials: initials || "SN",
    badge: store.trustScore >= 90 ? "Top Rated" : "Verified Store",
    badgeColor: style.badgeColor,
    accentColor: style.accentColor,
    gradient: style.gradient,
    glowColor: style.glowColor,
    featuredTags: tags.length ? tags : [category],
    featuredProducts,
    isTopRated: store.rating >= 4.5,
  };
}

export default function SellersSection() {
  const [activeTab, setActiveTab] = useState("all");
  const [followedStores, setFollowedStores] = useState<Record<string, boolean>>({});
  const [sellers, setSellers] = useState<Seller[]>([]);

  useEffect(() => {
    let active = true;
    getPublicSellerStores()
      .then(async (stores) => {
        const enrichedStores = await Promise.all(stores.map(async (store) => {
          if (store.banner || store.bannerUrl || store.bannerImage) return store;
          try {
            const detail = await getPublicSellerStoreBySlug(store.slug);
            return { ...store, banner: detail.banner || detail.bannerUrl || detail.bannerImage };
          } catch {
            return store;
          }
        }));
        if (active) setSellers(enrichedStores.map(toSeller));
      })
      .catch((error) => console.error("Failed to load public seller stores:", error));
    return () => { active = false; };
  }, []);

  const displaySellers =
    activeTab === "all"
      ? sellers
      : sellers.filter((seller) => seller.categorySlug === activeTab);

  const handleToggleFollow = async (id: string) => {
    const seller = sellers.find((item) => item.id === id);
    if (!seller) return;
    const nextFollowed = !followedStores[id];
    setFollowedStores((prev) => ({ ...prev, [id]: nextFollowed }));
    try {
      if (nextFollowed) await followStore(seller.storeSlug || id);
      else await unfollowStore(seller.storeSlug || id);
    } catch (error) {
      setFollowedStores((prev) => ({ ...prev, [id]: !nextFollowed }));
      console.error("Failed to update store follow status:", error);
    }
  };

  return (
    <section className="relative w-full overflow-hidden py-8 sm:py-12 transition-all duration-300">
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
      />

      {/* 2. Single Row Infinite Marquee */}
      <SellerMarquee
        sellers={displaySellers}
        followedStores={followedStores}
        onToggleFollow={handleToggleFollow}
      />

      {/* 3. Bottom Marketplace Trust Pillars */}
      <SellerTrustPillars />
    </section>
  );
}
