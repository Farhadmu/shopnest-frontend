import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById, getRecommendedProducts } from "@/lib/api/products";
import { getProductReviews } from "@/lib/api/reviews";
import { ProductBreadcrumbs } from "@/components/products/detail/ProductBreadcrumbs";
import { ProductGallery } from "@/components/products/detail/ProductGallery";
import { ProductBuyBox } from "@/components/products/detail/ProductBuyBox";
import { ProductAiScoreBanner } from "@/components/products/detail/ProductAiScoreBanner";
import { ProductSellerCard } from "@/components/products/detail/ProductSellerCard";
import { ProductDetailsSection } from "@/components/products/detail/ProductDetailsSection";
import { ProductReviewsSection } from "@/components/products/detail/ProductReviewsSection";
import { ProductRecommendationsSection } from "@/components/products/detail/ProductRecommendationsSection";
import { ProductFeaturesBent } from "@/components/products/detail/ProductFeaturesBento";

export interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  if (!id || id === "undefined" || id === "null" || id.trim() === "") {
    return { title: "Product - ShopNest" };
  }
  try {
    const product = await getProductById(id);
    return {
      title: `${product.title} - ShopNest`,
      description: product.description?.slice(0, 155) || `Buy ${product.title} on ShopNest.`,
    };
  } catch {
    return { title: "Product - ShopNest" };
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  if (!id || id === "undefined" || id === "null" || id.trim() === "") {
    notFound();
  }

  const product = await getProductById(id).catch(() => null);
  if (!product) {
    notFound();
  }

  const currentId = product.id || (product as { _id?: string })._id || id;
  const [reviews, recommendations] = await Promise.all([
    getProductReviews(id).catch(() => []),
    getRecommendedProducts(currentId).catch(() => null),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <ProductBreadcrumbs category={product.category} title={product.title} />

      {/* Gallery (Left, Sticky) + Buy Box & Seller Card (Right) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-5">
          <ProductGallery images={product.images ?? []} title={product.title} />
        </div>
        <div className="flex flex-col gap-4 lg:col-span-7">
          <ProductBuyBox product={product} />
          <ProductSellerCard product={product} />
        </div>
      </div>

      {/* AI Purchase Decision Engine Dashboard (Full Width) */}
      <ProductAiScoreBanner product={product} />

      <ProductFeaturesBent product={product} />

      {/* Details & Specs Section (Dynamic height synchronization with collapsible toggle) */}
      <ProductDetailsSection product={product} />

      {/* Customer Reviews Section */}
      <ProductReviewsSection
        productId={currentId}
        initialReviews={reviews}
      />

      {/* Recommended Products Section */}
      <ProductRecommendationsSection
        productId={currentId}
        currentCategory={product.category}
        recommendations={recommendations}
      />
    </div>
  );
}