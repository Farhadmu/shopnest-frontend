"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { advancedSearch, getSearchSuggestions, getSearchHistory, clearSearchHistory, SearchResult } from "@/lib/api/customer-features";
import { clientFetch } from "@/lib/core/client";

export default function AdvancedSearchPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState({ category: "", minPrice: "", maxPrice: "", sort: "relevance" });

  useEffect(() => {
    if (!isPending && !session?.user) router.push("/login");
    loadRecentSearches();
  }, [session, isPending]);

  async function loadRecentSearches() {
    try {
      const history = await getSearchHistory();
      setRecentSearches(history.map((h) => h.query));
    } catch { /* ignore */ }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await advancedSearch({ q: query, ...filters, minPrice: filters.minPrice ? Number(filters.minPrice) : undefined, maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined });
      setResults(data);
      loadRecentSearches();
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function handleInputChange(value: string) {
    setQuery(value);
    if (value.length >= 2) {
      try {
        const data = await getSearchSuggestions(value);
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      } catch { /* ignore */ }
    } else {
      setShowSuggestions(false);
    }
  }

  const links = [
    { label: "AI Search", href: "/customer/search", icon: "🔍", description: "Intelligent product search" },
    { label: "Shopping Agent", href: "/customer/shopping-agent", icon: "🤖", description: "AI shopping assistant" },
    { label: "Deal Finder", href: "/customer/deal-finder", icon: "🏷️", description: "Find best deals" },
    { label: "Gift Finder", href: "/customer/gift-finder", icon: "🎁", description: "AI gift recommendations" },
  ];

  return (
    <DashboardShell title="Advanced AI Search" subtitle="Search with natural language, Bengali, and smart filters" role="Customer" links={links}>
      <div className="space-y-6">
        {/* Search Form */}
        <Panel title="🔍 Smart Search">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Try: '৫ হাজার টাকার মধ্যে gaming headphone' or 'laptop for programming under 80000'"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text placeholder:text-muted focus:border-primary focus:outline-none"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full z-10 mt-1 w-full rounded-xl border border-border bg-surface p-2 shadow-lg">
                  {suggestions.map((s, i) => (
                    <button key={i} type="button" onClick={() => { setQuery(s); setShowSuggestions(false); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-muted-bg">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text">
                <option value="">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Beauty">Beauty</option>
                <option value="Sports">Sports</option>
                <option value="Books">Books</option>
              </select>
              <input type="number" placeholder="Min ৳" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text" />
              <input type="number" placeholder="Max ৳" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text" />
              <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text">
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover disabled:opacity-50">
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </Panel>

        {/* Recent Searches */}
        {recentSearches.length > 0 && !results && (
          <Panel title="Recent Searches">
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((s, i) => (
                <button key={i} onClick={() => { setQuery(s); }} className="rounded-lg border border-border bg-muted-bg px-3 py-1.5 text-xs font-medium text-text hover:border-primary/40">
                  {s}
                </button>
              ))}
              <button onClick={() => { clearSearchHistory(); setRecentSearches([]); }} className="rounded-lg px-3 py-1.5 text-xs font-medium text-error hover:bg-error/10">
                Clear All
              </button>
            </div>
          </Panel>
        )}

        {/* Results */}
        {results && (
          <Panel title={`Results (${results.pagination.total} products)`}>
            {results.intent.category && (
              <div className="mb-4 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
                Detected: <strong>{results.intent.category}</strong>
                {results.intent.budgetMax ? ` • Budget: ৳${results.intent.budgetMax.toLocaleString()}` : ""}
                {results.intent.useCase ? ` • Use: ${results.intent.useCase}` : ""}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.products.map((product) => (
                <div key={product.id} className="rounded-xl border border-border bg-surface p-4 transition hover:border-primary/40 hover:shadow-md">
                  <div className="mb-2 h-32 rounded-lg bg-muted-bg" />
                  <h3 className="text-sm font-bold text-text line-clamp-2">{product.title}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-black text-primary">৳{(product.discountPrice || product.price).toLocaleString()}</span>
                    {product.discountPrice && <span className="text-xs text-muted line-through">৳{product.price.toLocaleString()}</span>}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted">
                    <span>⭐ {product.ratingAvg.toFixed(1)}</span>
                    <span>•</span>
                    <span>{product.stock > 0 ? "In Stock" : "Out of Stock"}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>
    </DashboardShell>
  );
}
