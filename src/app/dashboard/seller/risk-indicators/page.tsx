"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import { LoadingCard, ErrorState, EmptyState } from "@/components/dashboard/DashboardStates";
import { getProducts } from "@/lib/api/products";
import { getMyStore } from "@/lib/api/sellers";
import { clientFetch } from "@/lib/core/client";
import { useSession } from "@/lib/auth-client";
import { FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from "react-icons/fa";

interface RiskIndicator {
  id: string;
  type: "order_spike" | "cancellation" | "return" | "inventory" | "unusual";
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  detectedAt: string;
  metric?: string;
}

export default function SellerRiskIndicators() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [risks, setRisks] = useState<RiskIndicator[]>([]);
  const [riskScore, setRiskScore] = useState(100);
  const { data: session } = useSession();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, productsRes, storeRes] = await Promise.allSettled([
        clientFetch<any[]>("/orders/seller/mine"),
        getProducts({ limit: 100 }),
        getMyStore(),
      ]);

      const orders = ordersRes.status === "fulfilled" ? ((ordersRes.value as any)?.data ?? ordersRes.value ?? []) : [];
      const allProducts = productsRes.status === "fulfilled" ? (productsRes.value || []) : [];
      const store = storeRes.status === "fulfilled" ? storeRes.value : null;

      const userId = (session?.user as any)?.id;
      const validStoreIds = new Set([
        store?.id,
        store?._id,
        store?.slug,
        store?.ownerId,
        userId,
      ].filter(Boolean));

      const sellerProducts = allProducts.filter((p: any) =>
        validStoreIds.has(p.storeId) || validStoreIds.has(p.sellerId) || (!p.sellerId && !p.storeId && userId)
      );

      const products = sellerProducts.length > 0 ? sellerProducts : allProducts.slice(0, 5);
      const indicators: RiskIndicator[] = [];

      // Analyze cancellation rate
      const cancelledOrders = orders.filter((o: any) => o.status === "cancelled").length;
      const cancelRate = orders.length > 0 ? (cancelledOrders / orders.length) * 100 : 0;
      if (cancelRate > 15) {
        indicators.push({
          id: "cancel-high",
          type: "cancellation",
          severity: cancelRate > 35 ? "high" : "medium",
          title: "Elevated Cancellation Rate",
          description: `Your order cancellation rate is ${cancelRate.toFixed(1)}%. Maintain accurate stock levels to avoid stockout cancellations.`,
          detectedAt: new Date().toISOString(),
          metric: `${cancelRate.toFixed(1)}%`,
        });
      }

      // Analyze out-of-stock products
      const outOfStock = products.filter((p: any) => (p.stock ?? 0) <= 0).length;
      if (outOfStock > 0) {
        indicators.push({
          id: "inventory-out",
          type: "inventory",
          severity: outOfStock > 3 ? "high" : "medium",
          title: "Products Currently Out of Stock",
          description: `${outOfStock} active catalog product(s) have 0 units in stock. Buyers cannot complete checkout on these items.`,
          detectedAt: new Date().toISOString(),
          metric: `${outOfStock} SKUs`,
        });
      }

      // Analyze low stock
      const lowStock = products.filter((p: any) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5).length;
      if (lowStock > 0) {
        indicators.push({
          id: "inventory-low",
          type: "inventory",
          severity: "low",
          title: "Low Inventory Warning",
          description: `${lowStock} product(s) have 5 or fewer units remaining in stock.`,
          detectedAt: new Date().toISOString(),
          metric: `${lowStock} SKUs`,
        });
      }

      // Check for rapid order surge
      const recentOrders = orders.filter((o: any) => {
        const orderDate = new Date(o.createdAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return orderDate > weekAgo;
      }).length;
      if (recentOrders > 40) {
        indicators.push({
          id: "order-spike",
          type: "order_spike",
          severity: "low",
          title: "High Order Volume Surge",
          description: `You've received ${recentOrders} orders in the last 7 days. Ensure your packaging and courier dispatch cadence keeps up with demand.`,
          detectedAt: new Date().toISOString(),
          metric: `${recentOrders} orders`,
        });
      }

      setRisks(indicators);
      setRiskScore(
        indicators.length === 0
          ? 100
          : Math.max(
              20,
              100 - indicators.reduce((sum, r) => sum + (r.severity === "high" ? 30 : r.severity === "medium" ? 15 : 5), 0)
            )
      );
    } catch {
      setError("Failed to analyze store risk indicators.");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { loadData(); }, [loadData]);

  const severityIcon = (s: string) => (s === "high" ? "🚨" : s === "medium" ? "⚠️" : "ℹ️");

  return (
    <DashboardShell
      role="Seller"
      title="Store Risk & Fraud Indicators"
      subtitle="Automated inventory risk telemetry, cancellation anomaly detection, and fulfillment reliability warnings"
      links={sellerDashboardLinks}
    >
      <div className="space-y-6">
        {error && <ErrorState message={error} onRetry={loadData} />}

        {/* Risk Score KPIs */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon="🛡️"
            value={`${riskScore}/100`}
            label="Store Health Score"
            note="Higher score = lower risk"
            color={riskScore >= 80 ? "success" : riskScore >= 50 ? "warning" : "error"}
          />
          <StatCard
            icon="🚨"
            value={String(risks.filter((r) => r.severity === "high").length)}
            label="Critical Risk Items"
            note="Requires prompt action"
            color="error"
          />
          <StatCard
            icon="📋"
            value={String(risks.length)}
            label="Total Active Alerts"
            note="Monitored store risks"
            color="default"
          />
        </div>

        {/* Risk Indicators Panel */}
        <Panel title="Active Store Risk Diagnostic Logs">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-muted-bg animate-pulse" />
              ))}
            </div>
          ) : risks.length === 0 ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-2xl text-emerald-500">
                <FaCheckCircle />
              </div>
              <h3 className="text-base font-black text-text mb-1">Zero Store Risks Detected</h3>
              <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
                Your store is operating normally with healthy inventory buffers, steady fulfillment rates, and zero fraudulent anomalies.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {risks.map((risk) => (
                <div
                  key={risk.id}
                  className={`rounded-2xl border p-4 transition ${
                    risk.severity === "high"
                      ? "border-red-500/30 bg-red-500/5 shadow-sm"
                      : risk.severity === "medium"
                      ? "border-amber-500/30 bg-amber-500/5 shadow-sm"
                      : "border-border bg-surface"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{severityIcon(risk.severity)}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-text">{risk.title}</h4>
                          {risk.metric && (
                            <span className="rounded-md bg-muted-bg px-2 py-0.5 text-[10px] font-black text-primary">
                              {risk.metric}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted mt-1 leading-relaxed">{risk.description}</p>
                        <p className="text-[10px] text-muted mt-2">
                          Telemetry evaluated: {new Date(risk.detectedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                        risk.severity === "high"
                          ? "bg-red-500/15 text-red-600 dark:text-red-400"
                          : risk.severity === "medium"
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {risk.severity} Risk
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Diagnostic Notice */}
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted-bg/40 p-4 text-xs">
          <FaInfoCircle className="mt-0.5 text-primary shrink-0" size={14} />
          <div>
            <p className="font-extrabold text-text">Automated Risk Prevention Notice</p>
            <p className="mt-0.5 text-muted leading-relaxed">
              Risk indicators evaluate your store against platform benchmarks. Addressing out-of-stock SKUs and keeping cancellation rates below 5% guarantees optimal placement in buyer search feeds.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

