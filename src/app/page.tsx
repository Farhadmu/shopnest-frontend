"use client";

import BannerSection from "@/components/home/Banner";
import ShopByCategory from "@/components/home/ShopByCategory";
import TrustFeatures from "@/components/home/TrustFeatures";
import VisualSearchSection from "@/components/home/VisualSearchSection";

import DealsSection from "@/components/home/DealsSection";
import SellersSection from "@/components/home/SellersSection";
import RecommendationsSection from "@/components/home/RecommendationsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import ProofSection from "@/components/home/ProofSection";
import FinalCtaSection from "@/components/home/FinalCtaSection";
import { defaultBannerData } from "@/lib/constants/banner";
import AiIntelligenceSection from "@/components/home/AiIntelligenceSection";
import TrendingSection from "@/components/home/Trending/TrendingSection";
import Hero from "@/components/home/HeroBanner";

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

      {/* 06 — Deals */}
      <DealsSection />

      {/* 07 — Sellers */}
      <SellersSection />

      {/* 08 — Visual search */}
      <VisualSearchSection />

      {/* 09 — Recommendations */}
      <RecommendationsSection />

      {/* 10 — How it works */}
      <HowItWorksSection />

      {/* 11 — Proof */}
      <ProofSection />

      {/* 12 — Final CTA */}
      <FinalCtaSection />
    </div>
  );
}
