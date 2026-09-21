import Link from "next/link";
import { FaCheckCircle, FaStar } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";
import type { Store } from "@/types/store";

type StoreCardProps = {
  store: Store;
  viewMode?: "grid" | "list";
};

export default function StoreCard({ store, viewMode = "grid" }: StoreCardProps) {
  const storeSlug = (store._id || store.id || store.name).toLowerCase().replace(/\s+/g, "-");
  const storeUrl = `/stores/${storeSlug}`;
  const sellerId = store._id || store.id;
  const catalogUrl = `/products?seller=${encodeURIComponent(sellerId)}`;
  
  const products = store.products || [];
  const displayProducts = products.slice(0, 3);
  const totalStockCount = products.length > 0 ? `${products.length} in stock` : "0 in stock";

  // Real database rating and review count (NO dummy generated numbers)
  const numericRating = Number(store.rating || 0);
  const ratingCount = store.ratingCount || 0;
  const ratingVal = numericRating > 0 ? numericRating.toFixed(1) : "0.0";
  const reviewsDisplay = ratingCount >= 1000 ? `${(ratingCount / 1000).toFixed(1)}k` : `${ratingCount}`;

  if (viewMode === "list") {
    return (
      <article className="group flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-md">
        {/* Left: Store Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start gap-3.5">
            <Link
              href={storeUrl}
              className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-2xs group-hover:border-primary/30 transition-colors"
            >
              <img
                src={store.logo || "/assets/electronics/Wireless Charging Pad.png"}
                alt={`${store.name} logo`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={storeUrl} className="min-w-0">
                  <h3 className="truncate text-base font-bold text-slate-900 dark:text-white hover:text-primary transition-colors tracking-tight">
                    {store.name}
                  </h3>
                </Link>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 shadow-2xs">
                  <FaCheckCircle className="text-[10px] text-blue-500" />
                  <span>Verified</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs truncate">
                  {store.category}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <div className="flex items-center gap-1">
                  <FaStar className="text-xs text-amber-400 shrink-0" />
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    {ratingVal}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    ({reviewsDisplay})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2 max-w-xl">
            {store.desc || "Verified merchant on ShopNest marketplace."}
          </p>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400 pt-1">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Storefront Active
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {store.salesNumber ? `${store.sales} sold` : "0 sold"}
            </span>
            <span className="text-primary font-bold">
              {totalStockCount}
            </span>
          </div>
        </div>

        {/* Middle: Featured Products (Compact row) */}
        {displayProducts.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 shrink-0 lg:px-4 lg:border-l lg:border-r lg:border-slate-100 dark:lg:border-slate-800">
            {displayProducts.map((product, idx) => {
              const productId = product.id || product._id;
              const productUrl = productId ? `/products/${productId}` : storeUrl;
              return (
                <Link
                  key={productId || idx}
                  href={productUrl}
                  className="group/prod flex flex-col items-center w-20 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 p-1.5 transition-all hover:border-primary/30"
                >
                  <div className="h-12 w-12 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-300 group-hover/prod:scale-105"
                    />
                  </div>
                  <p className="mt-1 w-full truncate text-[10px] font-semibold text-slate-800 dark:text-slate-200 text-center">
                    {product.name}
                  </p>
                  <p className="text-[10px] font-bold text-primary">
                    {product.price}
                  </p>
                </Link>
              );
            })}
          </div>
        )}

        {/* Right: Action buttons */}
        <div className="flex lg:flex-col items-stretch gap-2 shrink-0 lg:w-36">
          <Link
            href={catalogUrl}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold py-2 px-3 text-center transition shadow-2xs hover:border-primary/40"
          >
            View Catalog
          </Link>
          <Link
            href={storeUrl}
            className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold py-2 px-3 text-center transition flex items-center justify-center gap-1 shadow-xs shadow-primary/25"
          >
            <span>Visit Store</span>
            <FiChevronRight className="text-xs" />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-md">
      
      {/* Upper Content */}
      <div>
        {/* 1. Store Header */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={storeUrl}
              className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-2xs group-hover:border-primary/30 transition-colors"
            >
              <img
                src={store.logo || "/assets/electronics/Wireless Charging Pad.png"}
                alt={`${store.name} logo`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            <div className="min-w-0">
              <Link href={storeUrl}>
                <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white hover:text-primary transition-colors tracking-tight">
                  {store.name}
                </h3>
              </Link>
              
              {/* Category & Rating Row */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="font-medium text-slate-600 dark:text-slate-400 text-[11px] truncate">
                  {store.category}
                </span>
                <span className="text-slate-300 dark:text-slate-700 text-[10px]">•</span>
                <div className="flex items-center gap-1">
                  <FaStar className="text-[11px] text-amber-400 shrink-0" />
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                    {ratingVal}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    ({reviewsDisplay})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Verified Badge */}
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 shadow-2xs">
            <FaCheckCircle className="text-[9px] text-blue-500" />
            <span>Verified</span>
          </span>
        </div>

        {/* 2. Store Tagline / Description (2 lines clamp) */}
        <p className="mt-2.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px]">
          {store.desc || "Verified merchant on ShopNest marketplace."}
        </p>

        {/* 3. Top Featured Products Section */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] mb-1.5">
            <span className="font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              TOP FEATURED PRODUCTS
            </span>
            <span className="font-semibold text-primary">
              {totalStockCount}
            </span>
          </div>

          {displayProducts.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {displayProducts.map((product, idx) => {
                const productId = product.id || product._id;
                const productUrl = productId ? `/products/${productId}` : storeUrl;
                return (
                  <Link
                    key={productId || idx}
                    href={productUrl}
                    className="group/prod block rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 p-1.5 transition-all hover:border-primary/30"
                  >
                    <div className="aspect-square w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 group-hover/prod:scale-105"
                      />
                    </div>
                    <p className="mt-1 truncate text-[10px] font-semibold text-slate-800 dark:text-slate-200">
                      {product.name}
                    </p>
                    <p className="text-[10px] font-bold text-primary">
                      {product.price}
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex h-[116px] w-full items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800/70 bg-slate-50/40 dark:bg-slate-800/20 p-4 text-center">
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                No products listed yet
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Lower Content */}
      <div className="mt-3.5">
        {/* 4. Highlights Ribbon */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5 text-[10px] sm:text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Storefront Active
          </span>
          <span className="font-semibold text-slate-600 dark:text-slate-400">
            {store.salesNumber ? `${store.sales} sold` : "0 sold"}
          </span>
        </div>

        {/* 5. Dual Action Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mt-3">
          <Link
            href={catalogUrl}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold py-2 px-3 text-center transition shadow-2xs hover:border-primary/40"
          >
            View Catalog
          </Link>
          <Link
            href={storeUrl}
            className="rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold py-2 px-3 text-center transition flex items-center justify-center gap-1 shadow-xs shadow-primary/25"
          >
            <span>Visit Store</span>
            <FiChevronRight className="text-xs" />
          </Link>
        </div>
      </div>

    </article>
  );
}