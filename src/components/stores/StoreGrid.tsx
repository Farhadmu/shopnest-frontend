import { FaSearch } from "react-icons/fa";
import type { Store } from "@/types/store";
import StoreCard from "./StoreCard";

type StoreGridProps = {
  stores: Store[];
  viewMode?: "grid" | "list";
};

export default function StoreGrid({
  stores,
  viewMode = "grid",
}: StoreGridProps) {
  return (
    <section className="py-2"> 
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Store Results */}
        {stores.length > 0 ? (
          <div className={viewMode === "list" ? "flex flex-col gap-4" : "grid gap-6 md:grid-cols-2 xl:grid-cols-3"}>
            {stores.map((store) => (
              <StoreCard
                key={store._id ?? store.id ?? store.name}
                store={store}
                viewMode={viewMode}
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