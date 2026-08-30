"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { giftFinder, GiftFinderResult } from "@/lib/api/customer-features";

export default function GiftFinderPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [params, setParams] = useState({ occasion: "", relationship: "", ageRange: "", budget: 3000, interests: "", gender: "" });
  const [result, setResult] = useState<GiftFinderResult | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isPending && !session?.user) router.push("/login");

  async function handleFindGifts(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await giftFinder(params);
      setResult(data);
    } catch { /* ignore */ }
    setLoading(false);
  }

  const links = [
    { label: "AI Search", href: "/customer/search", icon: "🔍", description: "Intelligent product search" },
    { label: "Shopping Agent", href: "/customer/shopping-agent", icon: "🤖", description: "AI shopping assistant" },
    { label: "Deal Finder", href: "/customer/deal-finder", icon: "🏷️", description: "Find best deals" },
    { label: "Gift Finder", href: "/customer/gift-finder", icon: "🎁", description: "AI gift recommendations" },
  ];

  return (
    <DashboardShell title="AI Gift Finder" subtitle="Find the perfect gift for any occasion" role="Customer" links={links}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Panel title="Gift Preferences">
            <form onSubmit={handleFindGifts} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-muted">Occasion</label>
                <select value={params.occasion} onChange={(e) => setParams({ ...params, occasion: e.target.value })} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text">
                  <option value="">Select Occasion</option>
                  <option value="birthday">Birthday</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="wedding">Wedding</option>
                  <option value="graduation">Graduation</option>
                  <option value="Eid">Eid</option>
                  <option value="Puja">Puja</option>
                  <option value="new year">New Year</option>
                  <option value="just because">Just Because</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-muted">Relationship</label>
                <select value={params.relationship} onChange={(e) => setParams({ ...params, relationship: e.target.value })} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text">
                  <option value="">Select Relationship</option>
                  <option value="friend">Friend</option>
                  <option value="partner">Partner</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="colleague">Colleague</option>
                  <option value="child">Child</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-muted">Age Range</label>
                <select value={params.ageRange} onChange={(e) => setParams({ ...params, ageRange: e.target.value })} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text">
                  <option value="">Any Age</option>
                  <option value="0-12">Child (0-12)</option>
                  <option value="13-17">Teen (13-17)</option>
                  <option value="18-25">Young Adult (18-25)</option>
                  <option value="26-40">Adult (26-40)</option>
                  <option value="40+">Senior (40+)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-muted">Budget (৳)</label>
                <input type="number" value={params.budget} onChange={(e) => setParams({ ...params, budget: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-muted">Interests (optional)</label>
                <input type="text" value={params.interests} onChange={(e) => setParams({ ...params, interests: e.target.value })} placeholder="e.g., gaming, reading, cooking" className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-muted focus:border-primary focus:outline-none" />
              </div>
              <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover disabled:opacity-50">
                {loading ? "Finding Gifts..." : "Find Gifts"}
              </button>
            </form>
          </Panel>
        </div>

        <div className="lg:col-span-2">
          {result ? (
            <>
              {result.aiSuggestion && (
                <div className="mb-4 rounded-xl bg-primary/10 p-4 text-sm text-primary">
                  <strong>AI Suggestion:</strong> {result.aiSuggestion}
                </div>
              )}
              <Panel title={`Gift Recommendations (${result.recommendations.length} found)`}>
                <div className="grid gap-4 sm:grid-cols-2">
                  {result.recommendations.map((gift) => (
                    <div key={gift.id} className="rounded-xl border border-border bg-surface p-4 transition hover:border-primary/40">
                      <div className="mb-2 h-24 rounded-lg bg-muted-bg" />
                      <h3 className="text-sm font-bold text-text line-clamp-2">{gift.title}</h3>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-lg font-black text-primary">৳{gift.price.toLocaleString()}</span>
                        {gift.originalPrice > gift.price && <span className="text-xs text-muted line-through">৳{gift.originalPrice.toLocaleString()}</span>}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted">
                        <span>⭐ {gift.ratingAvg.toFixed(1)}</span>
                        <span>•</span>
                        <span>{gift.category}</span>
                      </div>
                      <div className="mt-2 rounded-lg bg-muted-bg px-2 py-1 text-xs text-muted">{gift.reason}</div>
                    </div>
                  ))}
                </div>
              </Panel>
            </>
          ) : (
            <Panel title="How Gift Finder Works">
              <div className="space-y-3 text-sm text-muted">
                <p>1. Tell us about the occasion and recipient</p>
                <p>2. Set your budget and any specific interests</p>
                <p>3. Our AI finds the perfect gift options from real products</p>
                <p>4. Each recommendation includes a reason why it's a great choice</p>
                <div className="mt-4 rounded-lg bg-primary/10 p-3 text-primary">
                  <strong>Popular:</strong> Birthday gifts under ৳3,000 are our most searched category!
                </div>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
