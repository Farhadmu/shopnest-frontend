import { FaSearch, FaStore } from "react-icons/fa";
import type { Store } from "@/types/store";
import StoreCard from "./StoreCard";

type StoreGridProps = {
  stores: Store[];
  sortOption: string;
  onSortChange: (value: string) => void;
  totalStoresCount: number;
};

export default function StoreGrid({
  stores,
  sortOption,
  onSortChange,
  totalStoresCount,
}: StoreGridProps) {
  return (
    <section className="py-4"> 
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header & Sort By */}
        <div className="mb-4 flex flex-col gap-4 pb-3 sm:flex-row sm:items-center sm:justify-between"> 
          
         
          <div>
            <div className="mb-1 flex items-center gap-2">
              <FaStore className="text-blue-600 dark:text-blue-400 text-xs" />
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                ShopNest Marketplace
              </span>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              All Verified Stores
            </h2>

            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Explore sellers with transparent ratings, sales history and trust signals.
            </p>
          </div>

    
          <div className="flex items-center gap-4 self-start sm:self-center">
          
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {totalStoresCount} Stores Found
            </span>

         
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Sort by:
              </span>
              <select
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-950 outline-none dark:bg-slate-900 dark:text-white cursor-pointer"
              >
                <option value="Highest Rated" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                  Highest Rating
                </option>
                <option value="Most Popular" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                  Most Popular
                </option>
                <option value="Newest" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                  Newest
                </option>
              </select>
            </div>
          </div>

        </div>

        {/* Store Results */}
        {stores.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {stores.map((store) => (
              <StoreCard
                key={store._id ?? store.id ?? store.name}
                store={store}
              />
            ))}
          </div>
        ) : (
          /* No Results */
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <FaSearch className="text-2xl text-slate-400" />
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
              No stores found
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              We couldn&apos;t find any stores matching your search or
              selected category. Try changing your filters or search terms.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}