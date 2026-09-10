/* eslint-disable @typescript-eslint/no-unused-vars */

import { getProductsPaged, PagedProducts, getStoreOptions, StoreOption, getSellerOptions } from "@/lib/api/products";
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

const PAGE_SIZE = 12;

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  const search = params.search ?? "";
  const category = params.category ?? "";
  const minPrice = params.minPrice ?? "";
  const maxPrice = params.maxPrice ?? "";
  const sort = params.sort ?? "newest";
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const store = params.store ?? "";
  const seller = params.seller ?? "";
  const productRating = params.productRating ?? "";

  let data: PagedProducts = { items: [], total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 };
  let categories: Category[] = [];
  let allCategoriesTotal = 0;
  let categoryCounts: Record<string, number> = {};
  let storeOptions: StoreOption[] = [];
  let sellerOptions: StoreOption[] = [];

  const sharedFilters = {
    search: search.trim() || undefined,
    store: store || undefined,
    seller: seller || undefined,
    productRating: productRating || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sort,
  };

  try {
    const [mainData, categoriesResult, allTotalResult, storesResult, sellersResult] = await Promise.all([
      getProductsPaged({
        page,
        limit: PAGE_SIZE,
        category: category || undefined,
        ...sharedFilters,
      }),
      getCategories().catch(() => []),
      getProductsPaged({ page: 1, limit: 1, ...sharedFilters }).catch(() => null),
      getStoreOptions().catch(() => []),
      getSellerOptions().catch(() => []),
    ]);

    data = mainData;
    categories = categoriesResult;
    allCategoriesTotal = allTotalResult?.total ?? mainData.total;
    storeOptions = storesResult;
    sellerOptions = sellersResult;

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
    <div className="mx-auto flex w-full container flex-col gap-6 px-4 pb-20 sm:px-6 lg:px-8">
      <ProductsHero defaultSearch={search} />

      <CategoryChipsBar
        categories={categories}
        categoryCounts={categoryCounts}
        totalProducts={allCategoriesTotal}
        activeCategory={category || undefined}
        query={query}
      />

      <div className="flex flex-col items-start gap-6 lg:flex-row">
        <ProductsFilterSidebar query={query} sellerOptions={sellerOptions} />

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