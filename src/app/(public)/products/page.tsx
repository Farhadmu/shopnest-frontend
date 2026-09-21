import { Suspense } from "react";
import {
  getProductsPaged,
  getCategoryCounts,
  PagedProducts,
  getSellerOptions,
  StoreOption,
} from "@/lib/api/products";
import { getCategories, Category } from "@/lib/api/categories";
import { ProductsHero } from "@/components/products/listing/ProductsHero";
import { CategoryChipsBar } from "@/components/products/listing/CategoryChipsBar";
import { ProductsFilterSidebar } from "@/components/products/listing/ProductsFilterSidebar";
import { ProductsResultsPanel } from "@/components/products/listing/ProductsResultsPanel";
import { ProductsPaginationBar } from "@/components/products/listing/ProductsPaginationBar";
import {
  ProductsResultsSkeleton,
  ProductsPaginationSkeleton,
} from "@/components/products/listing/ProductsResultsSkeleton";
import { TrustAssuranceRibbon } from "@/components/products/listing/TrustAssuranceRibbon";
import { AiAssistantFab } from "@/components/products/listing/AiAssistantFab";
import { ProductsQueryState } from "@/lib/utils/product-query";
import { ProductFilterProvider } from "@/components/products/listing/ProductFilterContext";

export const metadata = {
  title: "All Products - ShopNest Marketplace",
  description: "Browse verified products from trusted multi-vendor sellers on ShopNest.",
};

export interface ProductsPageProps {
  searchParams: Promise<ProductsQueryState>;
}

const PAGE_SIZE = 12;

const EMPTY_PAGE: PagedProducts = { items: [], total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1, hasMore: false };

/**
 * Renders the product grid by resolving the query the page already started.
 * Lives behind its own Suspense boundary so a filter change only refreshes the
 * results area — the filter sidebar and category chips stay on screen and usable.
 */
async function ProductsGrid({ products, sort }: { products: Promise<PagedProducts>; sort: string }) {
  const data = await products;
  return (
    <ProductsResultsPanel
      products={data.items}
      total={data.total}
      page={data.page}
      limit={data.limit}
      sort={sort}
    />
  );
}

/** Sibling boundary for the pagination bar, resolving the same product query. */
async function ProductsPagination({
  products,
  query,
}: {
  products: Promise<PagedProducts>;
  query: ProductsQueryState;
}) {
  const data = await products;
  return (
    <ProductsPaginationBar
      page={data.page}
      totalPages={data.totalPages}
      total={data.total}
      query={query}
    />
  );
}

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
  const inStock = params.inStock ?? "";
  const verified = params.verified ?? "";
  const freeDelivery = params.freeDelivery ?? "";
  const aiPick = params.aiPick ?? "";
  const isFeatured = params.isFeatured ?? "";
  const ids = params.ids ?? "";

  const sharedFilters = {
    search: search.trim() || undefined,
    store: store || undefined,
    seller: seller || undefined,
    ids: ids || undefined,
    productRating: productRating || undefined,
    inStock: inStock || undefined,
    verified: verified || undefined,
    freeDelivery: freeDelivery || undefined,
    aiPick: aiPick || undefined,
    isFeatured: isFeatured || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sort,
  };

  // Start the product query before awaiting anything else so it runs in
  // parallel with the filter metadata below, then hand the promise to the
  // Suspense boundaries instead of blocking the whole page on it.
  const productsPromise = getProductsPaged({
    page,
    limit: PAGE_SIZE,
    category: category || undefined,
    ...sharedFilters,
  }).catch((err) => {
    console.error("Failed to load products catalog:", err);
    return EMPTY_PAGE;
  });

  const [categories, counts, sellerOptions] = await Promise.all([
    getCategories().catch((err) => {
      console.error("Failed to load categories:", err);
      return [] as Category[];
    }),
    getCategoryCounts(sharedFilters).catch((err) => {
      console.error("Failed to load category counts:", err);
      return null;
    }),
    getSellerOptions().catch((err) => {
      console.error("Failed to load seller options:", err);
      return [] as StoreOption[];
    }),
  ]);

  const categoryCounts: Record<string, number> = counts?.counts ?? {};
  const allCategoriesTotal = counts?.total ?? 0;

  const query: ProductsQueryState = { ...params, page: String(page) };
  const queryKey = JSON.stringify(query);

  return (
    <ProductFilterProvider>
      <div className="mx-auto flex w-full container flex-col gap-6 px-4 pb-20 sm:px-6 lg:px-8">
        <ProductsHero defaultSearch={search} />

        <CategoryChipsBar
          categories={categories}
          categoryCounts={categoryCounts}
          totalProducts={allCategoriesTotal}
          activeCategory={category || undefined}
          query={query}
        />

        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-start">
          <ProductsFilterSidebar
            query={query}
            sellerOptions={sellerOptions}
          />

          <Suspense key={queryKey} fallback={<ProductsResultsSkeleton />}>
            <ProductsGrid products={productsPromise} sort={sort} />
          </Suspense>
        </div>

        <Suspense key={`pag-${queryKey}`} fallback={<ProductsPaginationSkeleton />}>
          <ProductsPagination products={productsPromise} query={query} />
        </Suspense>

        <TrustAssuranceRibbon />

        <AiAssistantFab />
      </div>
    </ProductFilterProvider>
  );
}
