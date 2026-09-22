import React from "react";

export interface Seller {
  id: string;
  name: string;
  logo?: string;
  banner?: string;
  category: string;
  categorySlug: string;
  tagline: string;
  rating: number;
  reviewsCount: string;
  sales: string;
  positiveRate: string;
  responseTime: string;
  initials: string;
  badge: string;
  badgeColor: string;
  accentColor: string;
  gradient: string;
  glowColor: string;
  featuredTags: string[];
  featuredProducts?: Array<{ image: string; title: string }>;
  isTopRated?: boolean;
  storeSlug?: string;
  categorySlugs?: string[];
}

export interface SellerCategoryTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface TrustMetric {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  color: string;
}
