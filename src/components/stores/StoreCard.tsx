import Link from "next/link";
import { FaCheckCircle, FaClock, FaShieldAlt, FaStar, FaStore } from "react-icons/fa";
import type { Store } from "@/types/store";

type StoreCardProps = {
  store: Store;
};

export default function StoreCard({ store }: StoreCardProps) {
 
  const storeSlug = store._id || store.id || store.name.toLowerCase().replace(/\s+/g, "-");

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      
      {/* Store Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Link href={`/stores/${storeSlug}`} className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
            <img
              src={store.logo}
              alt={`${store.name} logo`}
              className="h-full w-full object-cover"
            />
          </Link>

          <div className="min-w-0">
            <Link href={`/stores/${storeSlug}`}>
              <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 transition">
                {store.name}
              </h3>
            </Link>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {store.category}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <FaStar className="text-[11px] text-amber-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {store.rating}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-slate-500 dark:text-slate-400">
                {store.sales} sales
              </span>
            </div>
          </div>
        </div>

        {/* Verified Badge */}
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          <FaCheckCircle className="text-[9px]" />
          Verified
        </span>
      </div>

      {/* Description */}
      <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">
        {store.desc}
      </p>

      {/* Stats Row */}
      <div className="mt-4 grid grid-cols-2 gap-2 border-y border-slate-100 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <FaStore className="text-xs text-slate-400" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Sales</p>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{store.sales}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FaClock className="text-xs text-slate-400" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Response</p>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{store.response}</p>
          </div>
        </div>
      </div>

      {/* Popular Products Header */}
      <div className="mt-4 flex items-center justify-between text-[11px]">
        <span className="font-bold uppercase tracking-wider text-slate-400">Popular Products</span>
        <span className="text-slate-400">{store.products?.length || 3} items</span>
      </div>

      {/* Products Thumbnail Grid */}
      <div className="mt-2 grid grid-cols-3 gap-2">
        {store.products?.slice(0, 3).map((product, idx) => (
          <div key={idx} className="group/prod rounded-xl border border-slate-100 bg-slate-50 p-1.5 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover transition duration-300 group-hover/prod:scale-105"
              />
            </div>
            <p className="mt-1 truncate text-[10px] font-medium text-slate-800 dark:text-slate-200">
              {product.name}
            </p>
            <p className="text-[10px] font-bold text-slate-900 dark:text-white">
              {product.price}
            </p>
          </div>
        ))}
      </div>

      {/* Card Footer */}
      <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <FaShieldAlt className="text-xs text-emerald-500" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Trusted Seller</span>
        </div>
        
        {/* Visit Store Button with Link */}
        <Link
          href={`/stores/${storeSlug}`}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Visit Store →
        </Link>
      </div>

    </article>
  );
}