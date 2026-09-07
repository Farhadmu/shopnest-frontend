import React from "react";
import { getProductsPaged, PagedProducts } from "@/lib/api/products";
import { getCategories, Category } from "@/lib/api/categories";
import { ProductsHero } from "@/components/products/listing/ProductsHero";
import { CategoryChipsBar } from "@/components/products/listing/CategoryChipsBar";
import { ProductsFilterSidebar } from "@/components/products/listing/ProductsFilterSidebar";
import { ProductsResultsPanel } from "@/components/products/listing/ProductsResultsPanel";
import { ProductsPaginationBar } from "@/components/products/listing/ProductsPaginationBar";
import { TrustAssuranceRibbon } from "@/components/products/listing/TrustAssuranceRibbon";
import { AiAssistantFab } from "@/components/products/listing/AiAssistantFab";
import { ProductsQueryState } from "@/lib/utils/product-query";

export const metadata = {
  title: "All Products - ShopNest Marketplace",
  description: "Browse verified products from trusted multi-vendor sellers on ShopNest.",
};

export interface ProductsPageProps {
  searchParams: Promise<ProductsQueryState>;
}

const PAGE_SIZE = 24;

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  const search = params.search ?? "";
  const category = params.category ?? "";
  const minPrice = params.minPrice ?? "";
  const maxPrice = params.maxPrice ?? "";
  const sort = params.sort ?? "newest";
  const page = Math.max(1, Number(params.page ?? 1) || 1);

  // NOTE: `store`, `rating`, `inStock`, `freeDelivery`, `verified`, and
  // `aiPick` are rendered as real toggleable links (they update the URL and
  // survive navigation/sharing), but the current `/products` API does not
  // yet accept these as query filters.
  // TODO(backend): extend getProductsPaged()/`/products` to accept
  // store/rating/inStock/freeDelivery/verified/aiPick so these filters
  // actually narrow the result set server-side.

  let data: PagedProducts = { items: [], total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 };
  let categories: Category[] = [];
  let allCategoriesTotal = 0;
  let categoryCounts: Record<string, number> = {};

  const sharedFilters = {
    search: search.trim() || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sort,
  };

  try {
    const [mainData, categoriesResult, allTotalResult] = await Promise.all([
      getProductsPaged({
        page,
        limit: PAGE_SIZE,
        category: category || undefined,
        ...sharedFilters,
      }),
      getCategories().catch(() => []),
      // "All Categories" must always reflect the grand total (current
      // search/price/sort filters only) — never the count of whichever
      // single category happens to be selected right now.
      getProductsPaged({ page: 1, limit: 1, ...sharedFilters }).catch(() => null),
    ]);

    data = mainData;
    categories = categoriesResult;
    allCategoriesTotal = allTotalResult?.total ?? mainData.total;

    // Real per-category counts (one lightweight `limit: 1` request per
    // category, run in parallel, just to read the `total` from the
    // response headers) — replaces the earlier placeholder/dummy count.
    // TODO(backend): if the category list grows large, replace this with a
    // single `/categories?withCounts=true`-style endpoint instead of N
    // parallel requests.
    const countEntries = await Promise.all(
      categories.map(async (cat) => {
        try {
          const res = await getProductsPaged({ page: 1, limit: 1, category: cat.name, ...sharedFilters });
          return [cat.name, res.total] as const;
        } catch {
          return [cat.name, 0] as const;
        }
      })
    );
    categoryCounts = Object.fromEntries(countEntries);
  } catch (err) {
    console.error("Failed to load products catalog:", err);
  }

  const query: ProductsQueryState = { ...params, page: String(page) };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-20 pt-4 sm:px-6 lg:px-8">
      <ProductsHero defaultSearch={search} />

      <CategoryChipsBar
        categories={categories}
        categoryCounts={categoryCounts}
        totalProducts={allCategoriesTotal}
        activeCategory={category || undefined}
        query={query}
      />

      <div className="flex flex-col items-start gap-6 lg:flex-row">
        <ProductsFilterSidebar query={query} />

        <ProductsResultsPanel
          products={data.items}
          total={data.total}
          page={data.page}
          limit={data.limit}
          sort={sort}
        />
      </div>

      <ProductsPaginationBar page={data.page} totalPages={data.totalPages} total={data.total} query={query} />

      <TrustAssuranceRibbon />

      <AiAssistantFab />
    </div>
  );
}