"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { getSmartWishlist, SmartWishlistResult, getBuyAgainProducts } from "@/lib/api/customer-features";

export default function SmartWishlistPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<SmartWishlistResult | null>(null);
  const [buyAgain, setBuyAgain] = useState<Array<{ productId: string; title: string; currentPrice: number; lastPrice: number; inStock: boolean; daysSincePurchase: number }>>([]);
  const [activeTab, setActiveTab] = useState<"wishlist" | "buyagain">("wishlist");

  useEffect(() => {
    if (!isPending && !session?.user) router.push("/login");
    getSmartWishlist().then(setWishlist).catch(() => {});
    getBuyAgainProducts().then((data) => setBuyAgain(data.items)).catch(() => {});
  }, [session, isPending]);

  const links = [
    { label: "Smart Wishlist", href: "/customer/wishlist", icon: "❤️", description: "Track prices & alerts" },
    { label: "Buy Again", href: "/customer/buy-again", icon: "🔁", description: "Quick reorder" },
    { label: "Warranties", href: "/customer/warranties", icon: "🛠️", description: "Warranty manager" },
    { label: "Returns", href: "/customer/returns", icon: "🔄", description: "Return center" },
  ];

  return (
    <DashboardShell title="Smart Wishlist & Buy Again" subtitle="Track prices, get alerts, and reorder easily" role="Customer" links={links}>
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2">
          <button onClick={() => setActiveTab("wishlist")} className={`rounded-lg px-4 py-2 text-sm font-bold transition ${activeTab === "wishlist" ? "bg-primary text-white" : "bg-muted-bg text-text hover:bg-primary/10"}`}>
            Smart Wishlist {wishlist ? `(${wishlist.totalItems})` : ""}
          </button>
          <button onClick={() => setActiveTab("buyagain")} className={`rounded-lg px-4 py-2 text-sm font-bold transition ${activeTab === "buyagain" ? "bg-primary text-white" : "bg-muted-bg text-text hover:bg-primary/10"}`}>
            Buy Again {buyAgain ? `(${buyAgain.length})` : ""}
          </button>
        </div>

        {activeTab === "wishlist" && wishlist && (
          <>
            {wishlist.priceDrops.length > 0 && (
              <Panel title="Price Drops">
                <div className="grid gap-3 sm:grid-cols-2">
                  {wishlist.priceDrops.map((item) => (
                    <div key={item.id} className="rounded-xl border border-success/30 bg-success/5 p-4">
                      <h4 className="text-sm font-bold text-text">{item.title}</h4>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-lg font-black text-success">৳{item.currentPrice.toLocaleString()}</span>
                        <span className="text-xs text-muted line-through">৳{item.originalPrice.toLocaleString()}</span>
                        <span className="rounded-lg bg-success/10 px-2 py-0.5 text-xs font-bold text-success">↓ {item.priceDropPercent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            <Panel title="All Wishlist Items">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {wishlist.items.map((item) => (
                  <div key={item.id} className="rounded-xl border border-border bg-surface p-4">
                    <div className="mb-2 h-20 rounded-lg bg-muted-bg" />
                    <h4 className="text-sm font-bold text-text line-clamp-2">{item.title}</h4>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-bold text-primary">৳{item.currentPrice.toLocaleString()}</span>
                      {item.hasPriceDrop && <span className="text-xs text-success">↓ ৳{item.priceDrop}</span>}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                      <span>⭐ {item.ratingAvg.toFixed(1)}</span>
                      <span>{item.inStock ? "In Stock" : "Out of Stock"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </>
        )}

        {activeTab === "buyagain" && (
          <Panel title="Buy Again">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {buyAgain.map((item) => (
                <div key={item.productId} className="rounded-xl border border-border bg-surface p-4">
                  <div className="mb-2 h-20 rounded-lg bg-muted-bg" />
                  <h4 className="text-sm font-bold text-text line-clamp-2">{item.title}</h4>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-bold text-primary">৳{item.currentPrice.toLocaleString()}</span>
                    {item.lastPrice !== item.currentPrice && (
                      <span className={`text-xs ${item.currentPrice < item.lastPrice ? "text-success" : "text-error"}`}>
                        {item.currentPrice < item.lastPrice ? "↓" : "↑"} ৳{Math.abs(item.currentPrice - item.lastPrice)}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                    <span>{item.inStock ? "In Stock" : "Unavailable"}</span>
                    <span>•</span>
                    <span>Purchased {item.daysSincePurchase}d ago</span>
                  </div>
                  <button className="mt-3 w-full rounded-lg bg-primary/10 py-1.5 text-xs font-bold text-primary hover:bg-primary/20">
                    {item.inStock ? "Add to Cart" : "Find Similar"}
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>
    </DashboardShell>
  );
}
