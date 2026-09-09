"use client";

import BannerSection from "@/components/home/Banner";
import ShopByCategory from "@/components/home/ShopByCategory";
import TrustFeatures from "@/components/home/TrustFeatures";
import VisualSearchSection from "@/components/home/VisualSearchSection";
import SellersSection from "@/components/home/SellersSection";
import RecommendationsSection from "@/components/home/RecommendationsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import ProofSection from "@/components/home/ProofSection";
import FinalCtaSection from "@/components/home/FinalCtaSection";
import { defaultBannerData } from "@/lib/banner/BannerData";
import AiIntelligenceSection from "@/components/home/AiIntelligenceSection";
import TrendingSection from "@/components/home/Trending/TrendingSection";
import CouponSection from "@/components/home/CouponSection";
import JustForYouSection from "@/components/home/JustForYouSection";

export default function HomePage() {


  return (
    <div className="space-y-10 overflow-hidden">
      {/* 01 — Hero */}
      <BannerSection data={defaultBannerData} />



      {/* 02 — Trust */}
      <TrustFeatures />

      {/* 03 — Categories */}
      <ShopByCategory />

      {/* 04 — Trending */}
      <TrendingSection />

      {/* 05 — AI */}
      <AiIntelligenceSection />

      {/* 06 — Just For You */}
      <JustForYouSection />

      {/* 07 — Coupon */}
      <CouponSection />

      {/* 09 — Sellers */}
      <SellersSection />

      {/* 10 — Visual search */}
      <VisualSearchSection />

      {/* 11 — Recommendations */}
      <RecommendationsSection />

      {/* 10 — How it works */}
      <HowItWorksSection />

      {/* 13 — Proof */}
      <ProofSection />

      {/* 14 — Final CTA */}
      <FinalCtaSection />
    </div>
  );
}
