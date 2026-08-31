"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { smartDealFinder, DealResult } from "@/lib/api/customer-features";

export default function DealFinderPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [budget, setBudget] = useState(10000);
  const [category, setCategory] = useState("");
  const [purpose, setPurpose] = useState("general");
  const [result, setResult] = useState<DealResult | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isPending && !session?.user) router.push("/login");

  async function handleFindDeals(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await smartDealFinder({ budget, category, purpose });
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
    <DashboardShell title="Smart Deal Finder" subtitle="Find the best deals based on your budget and needs" role="Customer" links={links}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Panel title="Set Your Criteria">
            <form onSubmit={handleFindDeals} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-muted">Budget (৳)</label>
                <input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-muted">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text">
                  <option value="">Any Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home & Kitchen">Home & Kitchen</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-muted">Purpose</label>
                <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text">
                  <option value="general">General</option>
                  <option value="gaming">Gaming</option>
                  <option value="work_office">Work / Office</option>
                  <option value="photography">Photography</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover disabled:opacity-50">
                {loading ? "Finding Deals..." : "Find Best Deals"}
              </button>
            </form>
          </Panel>
        </div>

        <div className="lg:col-span-2">
          {result ? (
            <Panel title={`Top Deals (${result.totalFound} found)`}>
              <div className="grid gap-4 sm:grid-cols-2">
                {result.deals.map((deal, i) => (
                  <div key={deal.id} className="rounded-xl border border-border bg-surface p-4 transition hover:border-primary/40">
                    <div className="mb-2 flex items-start justify-between">
                      <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">#{i + 1}</span>
                      {deal.discountPercent > 0 && <span className="rounded-lg bg-success/10 px-2 py-0.5 text-xs font-bold text-success">-{deal.discountPercent}%</span>}
                    </div>
                    <h3 className="text-sm font-bold text-text line-clamp-2">{deal.title}</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-lg font-black text-primary">৳{deal.price.toLocaleString()}</span>
                      {deal.originalPrice > deal.price && <span className="text-xs text-muted line-through">৳{deal.originalPrice.toLocaleString()}</span>}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted">
                      <span>⭐ {deal.ratingAvg.toFixed(1)} ({deal.ratingCount})</span>
                      <span className="font-medium text-primary">Value: {deal.valueScore}/100</span>
                    </div>
                    <div className="mt-1 text-xs text-muted">{deal.seller} • Trust: {deal.trustScore}/100</div>
                  </div>
                ))}
              </div>
            </Panel>
          ) : (
            <Panel title="How It Works">
              <div className="space-y-3 text-sm text-muted">
                <p>1. Set your budget and preferences</p>
                <p>2. We analyze products based on price, rating, seller trust, and reviews</p>
                <p>3. Get ranked deals with the best value for your money</p>
                <div className="mt-4 rounded-lg bg-primary/10 p-3 text-primary">
                  <strong>Tip:</strong> Be specific with your purpose (gaming, work, student) for better recommendations!
                </div>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
