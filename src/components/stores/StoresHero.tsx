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
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border-b border-slate-800/80">
      {/* PREMIUM GLOWING BACKGROUND EFFECTS */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[-20px] h-[220px] w-[220px] rounded-full bg-blue-600/15 blur-[90px]" />
        <div className="absolute right-[10%] bottom-[-20px] h-[220px] w-[220px] rounded-full bg-indigo-600/15 blur-[90px]" />
      </div>

      {/* MAIN CONTAINER */}
      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        
        {/* TOP ROW: Title & Stats Side by Side */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Left: Badge, Title & Description */}
          <div className="max-w-2xl">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-0.5 text-[11px] font-semibold tracking-wide text-blue-400 backdrop-blur-md shadow-inner">
              <FaShieldAlt className="text-xs shrink-0 text-blue-400" />
              <span>SHOP WITH CONFIDENCE</span>
              <span className="text-blue-500/50">•</span>
              <span className="text-slate-300 font-normal">100% Vetted Merchants</span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Trusted ShopNest Stores
            </h1>

            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Explore verified independent sellers with transparent ratings, audit logs, escrow purchase protection, and guaranteed fulfillment SLA standards.
            </p>
          </div>

          {/* Right: Modern Compact Stats Box with Hover Effects */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 shrink-0">
            <div className="flex items-center gap-2.5 rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 backdrop-blur-md transition hover:border-blue-500/40 hover:bg-slate-800/50">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <FaUsers className="text-xs" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{stores.length}+ Verified</p>
                <p className="text-[9px] text-slate-400">Merchants</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 backdrop-blur-md transition hover:border-purple-500/40 hover:bg-slate-800/50">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                <FaLock className="text-xs" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">৳45M+</p>
                <p className="text-[9px] text-slate-400">Escrow Protected</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 backdrop-blur-md transition hover:border-emerald-500/40 hover:bg-slate-800/50">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <FaCheckCircle className="text-xs" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">99.2%</p>
                <p className="text-[9px] text-slate-400">Satisfaction</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 backdrop-blur-md transition hover:border-rose-500/40 hover:bg-slate-800/50">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
                <FaClock className="text-xs" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">&lt; 18h</p>
                <p className="text-[9px] text-slate-400">Dispatch Time</p>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM ROW: Search Bar & Categories */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-grow max-w-xl">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search store name, specialty, keywords..."
              className="w-full h-10 rounded-xl bg-slate-950/80 border border-slate-800 pl-10 pr-9 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={onClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
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
                  : "bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800"
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
                      : "bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  {category}
                </button>
              );
            })}

            <button
              className="rounded-lg px-3.5 py-1.5 text-xs font-medium whitespace-nowrap bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800"
            >
              ★ Top Rated
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}