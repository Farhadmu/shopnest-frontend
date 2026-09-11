"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import { getInventoryIntelligence, InventoryIntelligenceData } from "@/lib/api/seller-intelligence";
import { GaugeMeter } from "@/components/analytics/GaugeMeter";
import { FaBoxes, FaExclamationTriangle, FaPlus, FaCheckCircle, FaLightbulb } from "react-icons/fa";

export default function SellerInventoryPage() {
  const [data, setData] = useState<(InventoryIntelligenceData & { dynamicTip?: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getInventoryIntelligence()
      .then((res: any) => setData(res))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const healthScore = data?.inventoryHealthScore ?? 100;
  const statusLabel =
    healthScore >= 80 ? "Low Stockout Risk" : healthScore >= 50 ? "Moderate Stockout Risk" : "Critical Restock Needed";
  const statusColor =
    healthScore >= 80
      ? "text-emerald-600 dark:text-emerald-400"
      : healthScore >= 50
      ? "text-amber-500"
      : "text-rose-500";

  return (
    <DashboardShell
      role="Seller"
      title="Smart Inventory & Stock Intelligence"
      subtitle="Proactive stock-out risk calculations, replenishment priority queues, velocity tracking, and automated catalog health ratings."
      links={sellerDashboardLinks}
    >
      <div className="grid gap-6">
        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon="📦"
            label="Total Catalog Items"
            value={data?.summary?.totalItems || 0}
            note="Active monitored SKUs"
          />
          <StatCard
            icon="✅"
            label="Healthy Stock Buffer"
            value={data?.summary?.healthyStockCount || 0}
            note="Adequate stock runway"
            trend="Live"
          />
          <StatCard
            icon="⚠️"
            label="Low Stock Warnings"
            value={data?.summary?.lowStockCount || 0}
            note="Restock recommended (<=10)"
            trend="Action"
          />
          <StatCard
            icon="🚨"
            label="Stockouts / Zero Stock"
            value={data?.summary?.outOfStockCount || 0}
            note="Out of stock SKUs"
          />
        </div>

        {/* Health Score & Alerts */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Inventory Health Index">
            <div className="flex flex-col items-center justify-center p-4">
              <GaugeMeter score={healthScore} title="Health Score" maxScore={100} size={180} />
              <p className="mt-4 text-center text-xs font-bold text-text">
                Status: <span className={statusColor}>{statusLabel}</span>
              </p>
              <p className="mt-1 text-center text-[11px] text-muted">
                Based on stock turnover speed, replenishment latency, and availability rates.
              </p>
            </div>
          </Panel>

          <div className="lg:col-span-2">
            <Panel title="Automated Inventory Alerts & Advice">
              <div className="space-y-3">
                {(data?.alerts || []).map((alert, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-bold text-amber-700 dark:text-amber-300"
                  >
                    <FaExclamationTriangle className="mt-0.5 shrink-0 text-amber-500" size={14} />
                    <span>{alert}</span>
                  </div>
                ))}
                <div className="rounded-2xl border border-border bg-muted-bg/50 p-4 text-xs">
                  <div className="flex items-center gap-2 font-black text-text">
                    <FaLightbulb className="text-amber-500" size={13} /> Contextual Inventory Tip:
                  </div>
                  <p className="mt-1 text-muted leading-relaxed">
                    {data?.dynamicTip ||
                      "Keep stock buffers refreshed to ensure 100% catalog availability during peak shopping hours."}
                  </p>
                </div>
              </div>
            </Panel>
          </div>
        </div>

        {/* Live Inventory Telemetry Table */}
        <Panel
          title="Monitored Inventory Items & Velocity"
          action={
            <Link
              href="/dashboard/seller/products/add"
              className="flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white transition hover:bg-primary-hover shadow-sm"
            >
              <FaPlus size={10} /> Add Product
            </Link>
          }
        >
          {loading ? (
            <div className="p-8 text-center text-xs text-muted">Loading inventory telemetry...</div>
          ) : (data?.items || []).length === 0 ? (
            <div className="p-8 text-center text-xs text-muted">
              No products found in catalog. Add your first product to monitor stock velocity.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="pb-3 font-bold">Product</th>
                    <th className="pb-3 font-bold">Category</th>
                    <th className="pb-3 font-bold">Stock</th>
                    <th className="pb-3 font-bold">Demand</th>
                    <th className="pb-3 font-bold">Stockout Risk</th>
                    <th className="pb-3 font-bold">Velocity</th>
                    <th className="pb-3 font-bold">Restock Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {(data?.items || []).map((item) => (
                    <tr key={item.id} className="transition hover:bg-muted-bg/50">
                      <td className="py-3 font-bold text-text max-w-[200px] truncate">{item.title}</td>
                      <td className="py-3 text-muted">{item.category}</td>
                      <td className="py-3 font-black text-text">
                        <span
                          className={
                            item.currentStock === 0
                              ? "text-error"
                              : item.currentStock <= 10
                              ? "text-amber-500"
                              : "text-emerald-600 dark:text-emerald-400"
                          }
                        >
                          {item.currentStock} units
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="rounded-md bg-muted-bg px-2 py-0.5 font-bold text-text">
                          {item.demandTrend}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-md px-2 py-0.5 font-bold ${
                            item.stockOutRisk === "Critical"
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                              : item.stockOutRisk === "High"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {item.stockOutRisk}
                        </span>
                      </td>
                      <td className="py-3 text-muted">{item.velocity}</td>
                      <td className="py-3 font-bold text-primary">{item.restockPriority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </DashboardShell>
  );
}

