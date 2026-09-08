import { FaCartPlus, FaStar } from "react-icons/fa";


import { Product } from "@/types/store";

interface TopSellerProductsProps {
  products: Product[];
  productsCount: string;
}

const TopSellerProducts = ({
  products,
  productsCount,
}: TopSellerProductsProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Top Seller Products
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Popular products from this store
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {productsCount} Products
        </span>
      </div>

      {/* Products */}
      <div className="space-y-3">
        {products.map((product, index) => (
          <div
            key={`${product.name}-${index}`}
            className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
          >
            {/* Product Image */}
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {product.name}
              </h3>

              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {product.price}
                </span>

                {product.rating && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <FaStar className="text-yellow-400" />
                    {product.rating}
                  </span>
                )}
              </div>

              {product.sold && (
                <p className="mt-1 text-xs text-slate-400">
                  {product.sold}
                </p>
              )}
            </div>

            {/* Cart Button */}
            <button
              type="button"
              aria-label={`Add ${product.name} to cart`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
            >
              <FaCartPlus className="text-sm" />
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <button
        type="button"
        className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        View All Products
      </button>
    </div>
  );
};

export default TopSellerProducts;