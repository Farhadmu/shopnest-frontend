"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import { getInventoryIntelligence, InventoryIntelligenceData } from "@/lib/api/seller-intelligence";
import { GaugeMeter } from "@/components/analytics/GaugeMeter";
import { EmptyState, ErrorState, LoadingGrid } from "@/components/dashboard/DashboardStates";

export default function SellerInventoryPage() {
  const [data, setData] = useState<InventoryIntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getInventoryIntelligence()
      .then(setData)
      .catch(() => setError("Failed to load inventory data"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardShell
      role="Seller"
      title="Smart Inventory"
      subtitle="Stock levels, restock alerts, and inventory health for your products."
      links={sellerDashboardLinks}
    >
      <div className="grid gap-6">
        {error && <ErrorState message={error} />}

        {/* KPI Cards */}
        <section>
          {loading ? (
            <LoadingGrid count={4} />
          ) : data?.hasEnoughData ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon="📦" label="Total Items" value={String(data.summary.totalItems)} note="Active products" />
              <StatCard icon="✅" label="Healthy Stock" value={String(data.summary.healthyStockCount)} note="Adequate stock" color="success" />
              <StatCard icon="⚠️" label="Low Stock" value={String(data.summary.lowStockCount)} note="Needs restock" color="warning" />
              <StatCard icon="🚫" label="Out of Stock" value={String(data.summary.outOfStockCount)} note="Unavailable" color="error" />
            </div>
          ) : (
            <EmptyState icon="📦" title="No inventory data" description={data?.message || "Add products to see inventory insights."} />
          )}
        </section>

        {/* Health Score */}
        {data?.hasEnoughData && data.inventoryHealthScore !== null && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Panel title="Inventory Health">
              <div className="flex flex-col items-center justify-center p-4">
                <GaugeMeter score={data.inventoryHealthScore} title="Health Score" maxScore={100} size={180} />
                <p className="mt-4 text-center text-xs text-muted">
                  Based on stock levels and product availability.
                </p>
              </div>
            </Panel>

            <div className="lg:col-span-2">
              <Panel title="Inventory Items">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted">
                        <th className="pb-3 font-bold">Product</th>
                        <th className="pb-3 font-bold">Stock</th>
                        <th className="pb-3 font-bold">Sold</th>
                        <th className="pb-3 font-bold">Risk</th>
                        <th className="pb-3 font-bold">Priority</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {data.items.map((item) => (
                        <tr key={item.id} className="transition hover:bg-muted-bg/50">
                          <td className="py-3 font-bold text-text max-w-[200px] truncate">{item.title}</td>
                          <td className="py-3 font-black text-text">
                            <span className={item.currentStock === 0 ? "text-error" : item.currentStock <= 10 ? "text-amber-500" : "text-emerald-600"}>
                              {item.currentStock}
                            </span>
                          </td>
                          <td className="py-3 text-muted">{item.sold}</td>
                          <td className="py-3">
                            <span className={`rounded-md px-2 py-0.5 font-bold ${
                              item.stockOutRisk === "Critical" ? "bg-rose-500/15 text-rose-600" :
                              item.stockOutRisk === "High" ? "bg-amber-500/15 text-amber-600" :
                              "bg-emerald-500/15 text-emerald-600"
                            }`}>
                              {item.stockOutRisk}
                            </span>
                          </td>
                          <td className="py-3 font-bold text-primary">{item.restockPriority}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
