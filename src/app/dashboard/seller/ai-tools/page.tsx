"use client";

import { useState } from "react";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import { clientMutation } from "@/lib/core/client";

export default function SellerAITools() {
  const [name, setName] = useState("");
  const [features, setFeatures] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const [priceProduct, setPriceProduct] = useState("");
  const [priceResult, setPriceResult] = useState("");
  const [priceLoading, setPriceLoading] = useState(false);

  const generate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const r: any = await clientMutation("/ai/product-description", "POST", {
        productName: name,
        category: "General",
        features: features
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      });
      setResult(r?.data?.description || r?.description || JSON.stringify(r, null, 2));
    } catch (e) {
      setResult(e instanceof Error ? e.message : "AI request failed");
    } finally {
      setLoading(false);
    }
  };

  const getPriceSuggestion = async () => {
    if (!priceProduct.trim()) return;
    setPriceLoading(true);
    setPriceResult("");
    try {
      const r: any = await clientMutation("/ai/pricing-suggestion", "POST", {
        productName: priceProduct,
      });
      setPriceResult(r?.data?.suggestion || r?.suggestion || JSON.stringify(r, null, 2));
    } catch (e) {
      setPriceResult(e instanceof Error ? e.message : "Pricing suggestion failed");
    } finally {
      setPriceLoading(false);
    }
  };

  return (
    <DashboardShell role="Seller" title="AI Seller Tools" subtitle="AI-powered product content generation, pricing assistance, and listing optimization" links={sellerDashboardLinks}>
      <div className="space-y-6">
        {/* AI Tools Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="AI Product Description Generator" action={<span className="text-xs text-muted bg-primary/10 px-2 py-1 rounded-lg">AI Powered</span>}>
            <p className="text-xs text-muted mb-4">Generate compelling product descriptions optimized for conversions.</p>
            <div className="space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product name"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <textarea
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="Main features (comma-separated): material, size, color, benefits..."
                rows={4}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={generate}
                disabled={loading}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50 transition"
              >
                {loading ? "Generating…" : "Generate Description"}
              </button>
              {result && (
                <div className="rounded-xl bg-muted-bg p-4 text-xs text-text whitespace-pre-wrap max-h-48 overflow-auto">
                  {result}
                </div>
              )}
            </div>
          </Panel>

          <Panel title="AI Pricing Assistant" action={<span className="text-xs text-muted bg-emerald-500/10 px-2 py-1 rounded-lg text-emerald-600">Smart Pricing</span>}>
            <p className="text-xs text-muted mb-4">Get data-driven pricing suggestions based on market analysis.</p>
            <div className="space-y-3">
              <input
                value={priceProduct}
                onChange={(e) => setPriceProduct(e.target.value)}
                placeholder="Product name or category"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={getPriceSuggestion}
                disabled={priceLoading}
                className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {priceLoading ? "Analyzing…" : "Get Price Suggestion"}
              </button>
              {priceResult && (
                <div className="rounded-xl bg-muted-bg p-4 text-xs text-text whitespace-pre-wrap max-h-48 overflow-auto">
                  {priceResult}
                </div>
              )}
            </div>
          </Panel>
        </div>

        {/* Additional AI Tools */}
        <Panel title="AI Listing Optimization Tools">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-4 hover:border-primary/40 transition">
              <div className="text-2xl mb-2">📝</div>
              <h3 className="text-sm font-bold text-text">SEO Title Optimizer</h3>
              <p className="text-xs text-muted mt-1">Generate search-optimized product titles that rank higher.</p>
              <button className="mt-3 text-xs font-bold text-primary hover:underline">Use Tool →</button>
            </div>
            <div className="rounded-xl border border-border p-4 hover:border-primary/40 transition">
              <div className="text-2xl mb-2">🏷️</div>
              <h3 className="text-sm font-bold text-text">Smart Tag Generator</h3>
              <p className="text-xs text-muted mt-1">Auto-generate relevant tags and categories for better discovery.</p>
              <button className="mt-3 text-xs font-bold text-primary hover:underline">Use Tool →</button>
            </div>
            <div className="rounded-xl border border-border p-4 hover:border-primary/40 transition">
              <div className="text-2xl mb-2">📸</div>
              <h3 className="text-sm font-bold text-text">Image Alt-Text Generator</h3>
              <p className="text-xs text-muted mt-1">Create accessibility-friendly alt text for product images.</p>
              <button className="mt-3 text-xs font-bold text-primary hover:underline">Use Tool →</button>
            </div>
          </div>
        </Panel>

        {/* AI Tips */}
        <Panel title="AI Best Practices">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex gap-3 rounded-xl bg-muted-bg/50 p-4">
              <span className="text-lg">💡</span>
              <div>
                <h4 className="text-sm font-bold text-text">Be Specific</h4>
                <p className="text-xs text-muted">Include material, dimensions, and target audience for better results.</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl bg-muted-bg/50 p-4">
              <span className="text-lg">🔄</span>
              <div>
                <h4 className="text-sm font-bold text-text">Iterate</h4>
                <p className="text-xs text-muted">Generate multiple variations and pick the best one for your listing.</p>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
