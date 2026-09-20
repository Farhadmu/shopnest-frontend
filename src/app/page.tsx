"use client";

import BannerSection from "@/components/home/Banner";
import ShopByCategory from "@/components/home/ShopByCategory";
import TrustFeatures from "@/components/home/TrustFeatures";
import SellersSection from "@/components/home/SellersSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import ProofSection from "@/components/home/ProofSection";
import DevelopersBanner from "@/components/home/DevelopersBanner";
import AiIntelligenceSection from "@/components/home/AiIntelligenceSection";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection";
import TrendingSection from "@/components/home/Trending/TrendingSection";
import CouponSection from "@/components/home/CouponSection";
import JustForYouSection from "@/components/home/JustForYouSection";
import { HomeDataProvider, useHomeData } from "@/context/HomeDataContext";

// ---------------------------------------------------------------------------
// Inner page content — reads from HomeDataContext
// ---------------------------------------------------------------------------

function HomePageContent() {
  const { categories, trendingProducts, justForYouProducts } = useHomeData();

  return (
    <div className="flex flex-col gap-10 sm:gap-14 lg:gap-16 overflow-hidden">
      {/* 01 — Hero */}
      <BannerSection initialCategories={categories} />

      {/* 02 — Trust */}
      <TrustFeatures />

      {/* 03 — Categories */}
      <ShopByCategory initialCategories={categories} />

      {/* 04 — Featured Products */}
      <FeaturedProductsSection />

      {/* 05 — Trending */}
      <TrendingSection initialProducts={trendingProducts} />

      {/* 06 — Just For You */}
      <JustForYouSection initialProducts={justForYouProducts} />

      {/* 07 — Coupon (non-critical: self-fetches with own skeleton) */}
      <CouponSection />

      {/* 08 — Sellers (non-critical: self-fetches) */}
      <SellersSection />

      {/* 09 — How it works (static) */}
      <HowItWorksSection />

      {/* 10 — AI (static/scripted UI) */}
      <AiIntelligenceSection />

      {/* 11 — Reviews (static) */}
      <ProofSection />

      {/* 12 — Engineering Spotlight */}
      <DevelopersBanner />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Default export — wraps content in the data provider
// ---------------------------------------------------------------------------

export default function HomePage() {
  return (
    <HomeDataProvider>
      <HomePageContent />
    </HomeDataProvider>
  );
}
