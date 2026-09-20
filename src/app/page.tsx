"use client";

import BannerSection from "@/components/home/Banner";
import ShopByCategory from "@/components/home/ShopByCategory";
import TrustFeatures from "@/components/home/TrustFeatures";
import SellersSection from "@/components/home/SellersSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import ProofSection from "@/components/home/ProofSection";
import DevelopersBanner from "@/components/home/DevelopersBanner";
import { defaultBannerData } from "@/lib/banner/BannerData";
import AiIntelligenceSection from "@/components/home/AiIntelligenceSection";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection";
import TrendingSection from "@/components/home/Trending/TrendingSection";
import CouponSection from "@/components/home/CouponSection";
import JustForYouSection from "@/components/home/JustForYouSection";
import HomePageLoader from "@/components/common/HomePageLoader";
import { HomeDataProvider, useHomeData } from "@/context/HomeDataContext";

// ---------------------------------------------------------------------------
// Inner page content — reads from HomeDataContext
// ---------------------------------------------------------------------------

function HomePageContent() {
  const { categories, trendingProducts, justForYouProducts, loadingProgress, isHomeReady } =
    useHomeData();

  return (
    <>
      {/* Full-screen loader: visible while isHomeReady is false */}
      <HomePageLoader progress={loadingProgress} visible={!isHomeReady} />

      {/* Homepage content: fades in once isHomeReady */}
      <div
        className={[
          "flex flex-col gap-10 sm:gap-14 lg:gap-16 overflow-hidden",
          "transition-opacity duration-500",
          isHomeReady ? "opacity-100" : "opacity-0",
        ].join(" ")}
        aria-hidden={!isHomeReady}
      >
        {/* 01 — Hero */}
        <BannerSection data={defaultBannerData} initialCategories={categories} />

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

        {/* 06 — Coupon (non-critical: self-fetches with own skeleton) */}
        <CouponSection />

        {/* 07 — Sellers (non-critical: self-fetches) */}
        <SellersSection />

        {/* 08 — How it works (static) */}
        <HowItWorksSection />

        {/* 09 — AI (static/scripted UI) */}
        <AiIntelligenceSection />

        {/* 10 — Reviews (static) */}
        <ProofSection />

        {/* 11 — Engineering Spotlight */}
        <DevelopersBanner />
      </div>
    </>
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
