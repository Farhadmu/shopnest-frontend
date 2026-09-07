import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/api/products";
import { getProductReviews } from "@/lib/api/reviews";
import { ProductBreadcrumbs } from "@/components/products/detail/ProductBreadcrumbs";
import { ProductGallery } from "@/components/products/detail/ProductGallery";
import { ProductBuyBox } from "@/components/products/detail/ProductBuyBox";
import { ProductAiScoreBanner } from "@/components/products/detail/ProductAiScoreBanner";
import { ProductSellerCard } from "@/components/products/detail/ProductSellerCard";
import { ProductOverviewSection } from "@/components/products/detail/ProductOverviewSection";
import { ProductPackageContents } from "@/components/products/detail/ProductPackageContents";
import { ProductSpecsTable } from "@/components/products/detail/ProductSpecsTable";
import { ProductReviewsSection } from "@/components/products/detail/ProductReviewsSection";
import { ProductFeaturesBent } from "@/components/products/detail/ProductFeaturesBento";

export interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
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

  const product = await getProductById(id).catch(() => null);
  if (!product) {
    notFound();
  }

  const reviews = await getProductReviews(id).catch(() => []);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <ProductBreadcrumbs category={product.category} title={product.title} />

      {/* Gallery + Buy box */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-5">
          <ProductGallery images={product.images ?? []} title={product.title} />
        </div>
        <div className="flex flex-col gap-6 lg:col-span-7">
          <ProductBuyBox product={product} />
          <ProductAiScoreBanner product={product} />
          <ProductSellerCard product={product} />
        </div>
      </div>

      <ProductFeaturesBent product={product} />

      {/* Overview + Specs */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        <div className="flex flex-col gap-6 lg:col-span-7">
          <ProductOverviewSection product={product} />
          <ProductPackageContents product={product} />
        </div>
        <div className="lg:col-span-5">
          <ProductSpecsTable product={product} />
        </div>
      </div>

      <ProductReviewsSection productId={product.id} initialReviews={reviews} />
    </div>
  );
}