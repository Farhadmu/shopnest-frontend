import React from "react";
import { getProductsPaged, PagedProducts } from "@/lib/api/products";
import { ProductsClient } from "@/components/products/ProductsClient";

export interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;

  const search = resolvedParams?.search || "";
  const category = resolvedParams?.category || "";
  const minPrice = resolvedParams?.minPrice || "";
  const maxPrice = resolvedParams?.maxPrice || "";
  const sort = resolvedParams?.sort || "newest";
  const pageNumber = Number(resolvedParams?.page || 1);

  let initialData: PagedProducts = {
    items: [],
    total: 0,
    page: 1,
    limit: 24,
    totalPages: 1,
  };

  try {
    initialData = await getProductsPaged({
      page: pageNumber,
      limit: 24,
      search: search.trim() || undefined,
      category: category && category !== "All Categories" ? category : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort,
    });
  } catch (err) {
    console.error("Failed to pre-fetch products on server:", err);
  }

  return (
    <ProductsClient
      initialItems={initialData.items}
      initialTotal={initialData.total}
      initialTotalPages={initialData.totalPages}
      initialSearch={search}
      initialCategory={category}
      initialMinPrice={minPrice}
      initialMaxPrice={maxPrice}
      initialSort={sort}
      initialPage={pageNumber}
    />
  );
}