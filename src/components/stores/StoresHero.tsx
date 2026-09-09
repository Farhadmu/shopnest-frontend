import {
  FaCheckCircle,
  FaClock,
  FaLock,
  FaSearch,
  FaShieldAlt,
  FaTimes,
  FaUsers,
} from "react-icons/fa";

import type { Store } from "@/types/store";

type StoresHeroProps = {
  stores: Store[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
};

export default function StoresHero({
  stores,
  searchTerm,
  onSearchChange,
  onClearSearch,
  categories,
  selectedCategory,
  onCategoryChange,
}: StoresHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-100/70 via-indigo-100/50 to-purple-100/40 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 text-slate-900 dark:text-white border-b border-blue-200/60 dark:border-slate-800/80 shadow-sm transition-all">
      {/* PREMIUM GLOWING BACKGROUND EFFECTS */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[-20px] h-[220px] w-[220px] rounded-full bg-blue-400/25 dark:bg-blue-600/15 blur-[90px]" />
        <div className="absolute right-[10%] bottom-[-20px] h-[220px] w-[220px] rounded-full bg-purple-400/25 dark:bg-indigo-600/15 blur-[90px]" />
      </div>

      {/* MAIN CONTAINER */}
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        
        {/* TOP ROW: Title & Stats Side by Side */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Left: Badge, Title & Description */}
          <div className="max-w-2xl">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-50/80 dark:border-blue-400/30 dark:bg-blue-500/15 px-3 py-0.5 text-[11px] font-semibold tracking-wide text-blue-700 dark:text-blue-400 backdrop-blur-md shadow-inner">
              <FaShieldAlt className="text-xs shrink-0 text-blue-600 dark:text-blue-400" />
              <span>SHOP WITH CONFIDENCE</span>
              <span className="text-blue-400/50">•</span>
              <span className="text-slate-700 dark:text-slate-300 font-normal">100% Vetted Merchants</span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Trusted ShopNest Stores
            </h1>

            <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-400">
              Explore verified independent sellers with transparent ratings, audit logs, escrow purchase protection, and guaranteed fulfillment SLA standards.
            </p>
          </div>

          {/* Right: Modern Compact Stats Box with Hover Effects */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 shrink-0">
            <div className="flex items-center gap-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 px-3 py-2 backdrop-blur-md transition hover:border-blue-400/40 hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <FaUsers className="text-xs" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{stores.length}+ Verified</p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400">Merchants</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 px-3 py-2 backdrop-blur-md transition hover:border-purple-400/40 hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                <FaLock className="text-xs" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">৳45M+</p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400">Escrow Protected</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 px-3 py-2 backdrop-blur-md transition hover:border-emerald-400/40 hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <FaCheckCircle className="text-xs" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">99.2%</p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400">Satisfaction</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 px-3 py-2 backdrop-blur-md transition hover:border-rose-400/40 hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
                <FaClock className="text-xs" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">&lt; 18h</p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400">Dispatch Time</p>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM ROW: Search Bar & Categories */}
        <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-grow max-w-xl">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search store name, specialty, keywords..."
              className="w-full h-10 rounded-xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 pl-10 pr-9 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={onClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
                aria-label="Clear search"
              >
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            <button
              onClick={() => onCategoryChange("All Stores")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === "All Stores"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold"
                  : "bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm"
              }`}
            >
              All ({stores.length})
            </button>
            
            {categories.filter(cat => cat !== "All Stores").map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition ${
                    active
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold"
                      : "bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm"
                  }`}
                >
                  {category}
                </button>
              );
            })}

            <button
              className="rounded-lg px-3.5 py-1.5 text-xs font-medium whitespace-nowrap bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              ★ Top Rated
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}