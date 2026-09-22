"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getPublicSellerStoreBySlug, getPublicSellerStores, PublicSellerStore } from "@/lib/api/sellers";
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

function getStoreCategorySlugs(store: PublicSellerStore): string[] {
  const slugs = new Set<string>(["all"]);
  const texts: string[] = [];

  if (typeof store.businessInfo?.categoryId === "object" && store.businessInfo.categoryId !== null) {
    texts.push((store.businessInfo.categoryId as { name?: string }).name || "");
  } else if (typeof store.businessInfo?.categoryId === "string") {
    texts.push(store.businessInfo.categoryId);
  }

  if (store.products) {
    for (const p of store.products) {
      if (p.category) texts.push(p.category);
      if (p.title) texts.push(p.title);
      if (p.tags) texts.push(...p.tags);
    }
  }
  if (store.storeName) texts.push(store.storeName);
  if (store.description) texts.push(store.description);

  const combined = texts.join(" ").toLowerCase();

  if (
    combined.includes("elect") ||
    combined.includes("gadget") ||
    combined.includes("tech") ||
    combined.includes("phone") ||
    combined.includes("laptop") ||
    combined.includes("pc") ||
    combined.includes("camera") ||
    combined.includes("drone") ||
    combined.includes("audio") ||
    combined.includes("headphone") ||
    combined.includes("sound") ||
    combined.includes("mobile") ||
    combined.includes("gaming") ||
    combined.includes("keyboard") ||
    combined.includes("device") ||
    combined.includes("cable") ||
    combined.includes("charger")
  ) {
    slugs.add("electronics");
  }

  if (
    combined.includes("fashion") ||
    combined.includes("cloth") ||
    combined.includes("wear") ||
    combined.includes("panjabi") ||
    combined.includes("dress") ||
    combined.includes("shirt") ||
    combined.includes("pant") ||
    combined.includes("shoe") ||
    combined.includes("footwear") ||
    combined.includes("beauty") ||
    combined.includes("skin") ||
    combined.includes("cosmetic") ||
    combined.includes("makeup") ||
    combined.includes("lip") ||
    combined.includes("eyewear") ||
    combined.includes("frame") ||
    combined.includes("glass") ||
    combined.includes("watch") ||
    combined.includes("jewel") ||
    combined.includes("lifestyle") ||
    combined.includes("care")
  ) {
    slugs.add("fashion");
  }

  if (
    combined.includes("home") ||
    combined.includes("living") ||
    combined.includes("decor") ||
    combined.includes("kitchen") ||
    combined.includes("lamp") ||
    combined.includes("light") ||
    combined.includes("oil") ||
    combined.includes("grocer") ||
    combined.includes("food") ||
    combined.includes("fitness") ||
    combined.includes("gym") ||
    combined.includes("bike") ||
    combined.includes("sport") ||
    combined.includes("furniture") ||
    combined.includes("book") ||
    combined.includes("fiction") ||
    combined.includes("station")
  ) {
    slugs.add("home");
  }

  return Array.from(slugs);
}

function toSeller(store: PublicSellerStore, index: number): Seller {
  const rawCat = store.businessInfo?.categoryId;
  const category =
    (typeof rawCat === "object" && rawCat !== null
      ? (rawCat as { name?: string }).name
      : typeof rawCat === "string"
      ? rawCat
      : store.products?.[0]?.category) || "Marketplace Store";

  const categorySlugs = getStoreCategorySlugs(store);
  const primarySlug = categorySlugs.find((s) => s !== "all") || "all";
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
    categorySlug: primarySlug,
    categorySlugs,
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

function SellerSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 py-2 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-muted-bg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted-bg" />
              <div className="h-3 w-1/2 animate-pulse rounded-md bg-muted-bg" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full animate-pulse rounded-md bg-muted-bg" />
            <div className="h-3 w-4/5 animate-pulse rounded-md bg-muted-bg" />
          </div>
          <div className="mt-4 flex gap-2">
            <div className="h-14 flex-1 animate-pulse rounded-lg bg-muted-bg" />
            <div className="h-14 flex-1 animate-pulse rounded-lg bg-muted-bg" />
            <div className="h-14 flex-1 animate-pulse rounded-lg bg-muted-bg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SellersSection() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [followedStores, setFollowedStores] = useState<Record<string, boolean>>({});
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getPublicSellerStores()
      .then(async (stores) => {
        const list = Array.isArray(stores) ? stores : [];
        const enrichedStores = await Promise.all(
          list.map(async (store) => {
            if (store.banner || store.bannerUrl || store.bannerImage) return store;
            try {
              const detail = await getPublicSellerStoreBySlug(store.slug);
              return { ...store, banner: detail.banner || detail.bannerUrl || detail.bannerImage };
            } catch {
              return store;
            }
          })
        );

        // Sort by highest rating, highest review count, highest sales volume, then trustScore
        enrichedStores.sort((a, b) => {
          const ratingA = Number(a.rating || 0);
          const ratingB = Number(b.rating || 0);
          const countA = Number(a.ratingCount || 0);
          const countB = Number(b.ratingCount || 0);
          const salesA = Number(a.salesNumber || 0);
          const salesB = Number(b.salesNumber || 0);
          const trustA = Number(a.trustScore || 0);
          const trustB = Number(b.trustScore || 0);

          if (ratingB !== ratingA) return ratingB - ratingA;
          if (countB !== countA) return countB - countA;
          if (salesB !== salesA) return salesB - salesA;
          return trustB - trustA;
        });

        if (active) {
          setSellers(enrichedStores.map(toSeller));
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error("Failed to load public seller stores:", error);
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const displaySellers = useMemo(() => {
    const cleanSearch = searchQuery.trim().toLowerCase();

    return sellers.filter((seller) => {
      // 1. Category Tab Filter
      const matchesCategory =
        activeTab === "all" || (seller.categorySlugs && seller.categorySlugs.includes(activeTab));

      if (!matchesCategory) return false;

      // 2. Search Query Filter
      if (!cleanSearch) return true;

      const searchableText = [
        seller.name,
        seller.tagline,
        seller.category,
        ...(seller.featuredTags || []),
        ...(seller.featuredProducts?.map((p) => p.title) || []),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(cleanSearch);
    });
  }, [sellers, activeTab, searchQuery]);

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

  const handleResetFilters = () => {
    setActiveTab("all");
    setSearchQuery("");
  };

  return (
    <section className="relative w-full transition-all duration-300">
      {/* 1. Header with Badge, Category Tabs & Search Bar */}
      <SellerHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        resultCount={displaySellers.length}
      />

      {/* 2. Loading Skeleton or Seller Marquee */}
      {isLoading ? (
        <SellerSkeleton />
      ) : (
        <SellerMarquee
          sellers={displaySellers}
          followedStores={followedStores}
          onToggleFollow={handleToggleFollow}
          onResetFilters={handleResetFilters}
          hasActiveFilters={activeTab !== "all" || searchQuery.trim().length > 0}
        />
      )}

      {/* 3. Bottom Marketplace Trust Pillars */}
      <SellerTrustPillars />
    </section>
  );
}
