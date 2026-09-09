"use client";

import BannerSection from "@/components/home/Banner";
import ShopByCategory from "@/components/home/ShopByCategory";
import TrustFeatures from "@/components/home/TrustFeatures";
import VisualSearchSection from "@/components/home/VisualSearchSection";
import SellersSection from "@/components/home/SellersSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import ProofSection from "@/components/home/ProofSection";
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

      {/* 05 — Just For You */}
      <JustForYouSection />


      {/* 06 — Coupon */}
      <CouponSection />

      {/* 0 — Sellers */}
      <SellersSection />

      {/* 08 — Visual search */}
      {/* <VisualSearchSection /> */}


      {/* 9 — How it works */}
      <HowItWorksSection />

      {/* 10 — AI */}
      <AiIntelligenceSection />
      
      {/* 11 — review */}
      <ProofSection />

    </div>
  );
}
