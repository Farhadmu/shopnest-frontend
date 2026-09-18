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

  const reviews = await getProductReviews(id).catch(() => []);
  const currentId = product.id || (product as { _id?: string })._id || id;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <ProductBreadcrumbs category={product.category} title={product.title} />

      {/* Gallery (Left, Sticky) + Buy Box, AI Score & Seller Card (Right) */}
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

      {/* Details & Specs (balanced 2-column grid when specs or variants exist, full-width otherwise) */}
      {(product.specifications && Object.keys(product.specifications).length > 0) ||
      (product.variants && product.variants.length > 0) ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
          <div className="space-y-8 lg:col-span-2">
            <ProductOverviewSection product={product} />
            <ProductPackageContents product={product} />
          </div>
          <div className="lg:col-span-1">
            <ProductSpecsTable product={product} />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <ProductOverviewSection product={product} />
          <ProductPackageContents product={product} />
        </div>
      )}

      {/* Customer Reviews Section */}
      <ProductReviewsSection
        productId={currentId}
        initialReviews={reviews}
      />
    </div>
  );
}