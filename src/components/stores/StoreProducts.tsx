import type { Product } from "@/types/store";

type StoreProductsProps = {
  products: Product[];
};

export default function StoreProducts({
  products,
}: StoreProductsProps) {
  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
          Popular Products
        </h4>

        <span className="text-xs text-slate-500 dark:text-slate-400">
          {products.length} items
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {products.slice(0, 3).map((product, index) => (
          <div
            key={product._id ?? `${product.name}-${index}`}
            className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/60"
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Product Info */}
            <div className="p-2">
              <p
                className="truncate text-xs font-medium text-slate-700 dark:text-slate-200"
                title={product.name}
              >
                {product.name}
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                $
                {typeof product.price === "number"
                  ? product.price.toFixed(2)
                  : product.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}