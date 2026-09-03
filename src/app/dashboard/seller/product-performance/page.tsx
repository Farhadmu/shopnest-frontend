"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { LoadingTable, ErrorState, EmptyState } from "@/components/dashboard/DashboardStates";
import { getProducts } from "@/lib/api/products";
import { getOrders } from "@/lib/api/orders";

interface ProductPerformance {
  id: string;
  title: string;
  image: string;
  price: number;
  stock: number;
  sold: number;
  revenue: number;
  orders: number;
  rating: number;
  reviews: number;
  status: string;
  category: string;
}

type SortKey = "sold" | "revenue" | "rating" | "stock" | "orders";

export default function ProductPerformancePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductPerformance[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("sold");
  const [filter, setFilter] = useState<"all" | "low_stock" | "out_of_stock">("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, ordersRes] = await Promise.allSettled([getProducts(), getOrders()]);
      const productList = productsRes.status === "fulfilled" ? (productsRes.value || []) : [];
      const orders = ordersRes.status === "fulfilled" ? (ordersRes.value || []) : [];

      const productStats: ProductPerformance[] = productList.map((p: any) => {
        const productOrders = orders.filter((o: any) => (o.items || []).some((i: any) => i.productId === p.id));
        const sold = productOrders.reduce((sum: number, o: any) => sum + ((o.items || []).filter((i: any) => i.productId === p.id).reduce((s: number, i: any) => s + (i.quantity || 0), 0)), 0);
        const revenue = productOrders.reduce((sum: number, o: any) => sum + ((o.items || []).filter((i: any) => i.productId === p.id).reduce((s: number, i: any) => s + (i.price || 0) * (i.quantity || 0), 0)), 0);

        return {
          id: p.id,
          title: p.title,
          image: p.images?.[0] || "",
          price: p.discountPrice || p.price,
          stock: p.stock,
          sold,
          revenue,
          orders: productOrders.length,
          rating: p.ratingAvg || 0,
          reviews: p.ratingCount || 0,
          status: p.status,
          category: p.category,
        };
      });

      setProducts(productStats);
    } catch {
      setError("Failed to load product performance data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const sortedProducts = [...products]
    .filter((p) => {
      if (filter === "low_stock") return p.stock > 0 && p.stock <= 10;
      if (filter === "out_of_stock") return p.stock <= 0;
      return true;
    })
    .sort((a, b) => {
      switch (sortKey) {
        case "sold": return b.sold - a.sold;
        case "revenue": return b.revenue - a.revenue;
        case "rating": return b.rating - a.rating;
        case "stock": return a.stock - b.stock;
        case "orders": return b.orders - a.orders;
        default: return 0;
      }
    });

  return (
    <DashboardShell role="Seller" title="Product Performance" subtitle="Track how your products are performing with real sales data">
      <div className="space-y-6">
        {error && <ErrorState message={error} onRetry={loadData} />}

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {(["all", "low_stock", "out_of_stock"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${filter === f ? "bg-primary text-white" : "bg-muted-bg text-text hover:bg-primary/10"}`}>
              {f === "all" ? "All Products" : f === "low_stock" ? "Low Stock" : "Out of Stock"}
            </button>
          ))}
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text">
            <option value="sold">Best Selling</option>
            <option value="revenue">Highest Revenue</option>
            <option value="rating">Highest Rated</option>
            <option value="stock">Lowest Stock</option>
            <option value="orders">Most Orders</option>
          </select>
        </div>

        {/* Products Table */}
        {loading ? (
          <LoadingTable rows={5} cols={6} />
        ) : sortedProducts.length === 0 ? (
          <EmptyState icon="📦" title="No products found" description="Add products to see performance data." />
        ) : (
          <Panel title={`Products (${sortedProducts.length})`}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-muted">
                    <th className="pb-3 pr-4">Product</th>
                    <th className="pb-3 pr-4">Price</th>
                    <th className="pb-3 pr-4">Stock</th>
                    <th className="pb-3 pr-4">Sold</th>
                    <th className="pb-3 pr-4">Revenue</th>
                    <th className="pb-3 pr-4">Rating</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProducts.map((p) => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-muted-bg/50">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted-bg overflow-hidden shrink-0">
                            {p.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}
                          </div>
                          <div>
                            <p className="font-bold text-text line-clamp-1">{p.title}</p>
                            <p className="text-muted">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-bold text-primary">৳{p.price.toLocaleString()}</td>
                      <td className="py-3 pr-4">
                        <span className={`font-bold ${p.stock <= 0 ? "text-red-500" : p.stock <= 10 ? "text-amber-500" : "text-emerald-500"}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-bold">{p.sold}</td>
                      <td className="py-3 pr-4 font-bold text-emerald-600">৳{p.revenue.toLocaleString()}</td>
                      <td className="py-3 pr-4">⭐ {p.rating.toFixed(1)}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${p.status === "approved" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}
      </div>
    </DashboardShell>
  );
}
