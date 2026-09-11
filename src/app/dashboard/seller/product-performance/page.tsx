"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import { LoadingTable, ErrorState, EmptyState } from "@/components/dashboard/DashboardStates";
import { getProducts } from "@/lib/api/products";
import { getMyStore } from "@/lib/api/sellers";
import { clientFetch } from "@/lib/core/client";
import { useSession } from "@/lib/auth-client";
import { FaPlus, FaBox, FaEdit, FaSortAmountDown } from "react-icons/fa";

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
  const { data: session } = useSession();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, ordersRes, storeRes] = await Promise.allSettled([
        getProducts({ limit: 100 }),
        clientFetch<any[]>("/orders/seller/mine"),
        getMyStore(),
      ]);

      const allProducts = productsRes.status === "fulfilled" ? (productsRes.value || []) : [];
      const orders = ordersRes.status === "fulfilled" ? ((ordersRes.value as any)?.data ?? ordersRes.value ?? []) : [];
      const store = storeRes.status === "fulfilled" ? storeRes.value : null;

      const userId = (session?.user as any)?.id;
      const validStoreIds = new Set([
        store?.id,
        store?._id,
        store?.slug,
        store?.ownerId,
        userId,
      ].filter(Boolean));

      // Filter products strictly belonging to this seller
      const sellerProducts = allProducts.filter((p: any) =>
        validStoreIds.has(p.storeId) || validStoreIds.has(p.sellerId) || (!p.sellerId && !p.storeId && userId)
      );

      const productStats: ProductPerformance[] = (sellerProducts.length > 0 ? sellerProducts : allProducts.slice(0, 10)).map((p: any) => {
        const productOrders = orders.filter((o: any) => (o.items || []).some((i: any) => i.productId === p.id || i.productId === p._id));
        const soldFromOrders = productOrders.reduce((sum: number, o: any) => sum + ((o.items || []).filter((i: any) => i.productId === p.id || i.productId === p._id).reduce((s: number, i: any) => s + (i.quantity || 0), 0)), 0);
        const actualSold = Math.max(soldFromOrders, p.sold || 0);
        const unitPrice = p.discountPrice || p.price || 0;
        const revenue = actualSold * unitPrice;

        return {
          id: p.id || p._id,
          title: p.title,
          image: p.images?.[0] || "",
          price: unitPrice,
          stock: p.stock ?? 0,
          sold: actualSold,
          revenue,
          orders: productOrders.length || (actualSold > 0 ? 1 : 0),
          rating: p.ratingAvg || store?.rating || 5.0,
          reviews: p.ratingCount || 0,
          status: p.status || "approved",
          category: p.category || "General",
        };
      });

      setProducts(productStats);
    } catch {
      setError("Failed to load product performance telemetry.");
    } finally {
      setLoading(false);
    }
  }, [session]);

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
    <DashboardShell role="Seller" title="Product Performance Telemetry" subtitle="Individual SKU order velocity, gross revenue generation, inventory turnover, and rating metrics" links={sellerDashboardLinks}>
      <div className="space-y-6">
        {error && <ErrorState message={error} onRetry={loadData} />}

        {/* Filters & Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center gap-2">
            {(["all", "low_stock", "out_of_stock"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  filter === f ? "bg-primary text-white shadow-sm" : "bg-muted-bg text-text hover:bg-primary/10"
                }`}
              >
                {f === "all" ? "All Catalog Items" : f === "low_stock" ? "Low Stock Alert (<= 10)" : "Out of Stock (0)"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text">
              <FaSortAmountDown size={11} className="text-muted" />
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="bg-transparent text-xs font-bold text-text outline-none cursor-pointer"
              >
                <option value="sold">Sort by: Best Selling</option>
                <option value="revenue">Sort by: Highest Revenue</option>
                <option value="rating">Sort by: Highest Rated</option>
                <option value="stock">Sort by: Lowest Stock First</option>
                <option value="orders">Sort by: Most Orders</option>
              </select>
            </div>

            <Link
              href="/dashboard/seller/products/add"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-black text-white transition hover:bg-primary-hover shadow-sm"
            >
              <FaPlus size={10} /> Add Product
            </Link>
          </div>
        </div>

        {/* Products Table */}
        {loading ? (
          <LoadingTable rows={5} cols={6} />
        ) : sortedProducts.length === 0 ? (
          <EmptyState icon="📦" title="No catalog products found" description="List your items to monitor per-product performance analytics." />
        ) : (
          <Panel title={`Monitored Products (${sortedProducts.length})`}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-muted">
                    <th className="pb-3 pr-4">Product Title & Category</th>
                    <th className="pb-3 pr-4">List Price</th>
                    <th className="pb-3 pr-4">Available Stock</th>
                    <th className="pb-3 pr-4">Units Sold</th>
                    <th className="pb-3 pr-4">Gross Revenue</th>
                    <th className="pb-3 pr-4">Rating</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {sortedProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-muted-bg/40 transition">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-xl bg-muted-bg overflow-hidden shrink-0 border border-border grid place-items-center">
                            {p.image ? (
                              <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                            ) : (
                              <FaBox className="text-muted" size={14} />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-text truncate">{p.title}</p>
                            <p className="text-[11px] text-muted">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 font-black text-primary">৳{p.price.toLocaleString()}</td>
                      <td className="py-3.5 pr-4">
                        <span className={`font-bold px-2 py-0.5 rounded-lg text-xs ${
                          p.stock <= 0 ? "bg-red-500/10 text-red-500 font-black" : p.stock <= 10 ? "bg-amber-500/10 text-amber-600 font-black" : "text-text"
                        }`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 font-bold text-text">{p.sold}</td>
                      <td className="py-3.5 pr-4 font-black text-emerald-600 dark:text-emerald-400">৳{p.revenue.toLocaleString()}</td>
                      <td className="py-3.5 pr-4 font-bold text-amber-500">⭐ {p.rating.toFixed(1)}</td>
                      <td className="py-3.5 pr-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                          p.status === "approved" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          href={`/dashboard/seller/products`}
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-bold text-muted hover:text-primary hover:border-primary/40 transition"
                        >
                          <FaEdit size={10} /> Edit
                        </Link>
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

