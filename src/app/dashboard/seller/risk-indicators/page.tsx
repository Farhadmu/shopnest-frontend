"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { LoadingCard, ErrorState, EmptyState } from "@/components/dashboard/DashboardStates";
import { getOrders } from "@/lib/api/orders";
import { getProducts } from "@/lib/api/products";
import { getChurnPredictor } from "@/lib/api/seller-intelligence";

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
  const [riskScore, setRiskScore] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, productsRes, churnRes] = await Promise.allSettled([getOrders(), getProducts(), getChurnPredictor()]);
      const orders = ordersRes.status === "fulfilled" ? (ordersRes.value || []) : [];
      const products = productsRes.status === "fulfilled" ? (productsRes.value || []) : [];

      const indicators: RiskIndicator[] = [];

      // Analyze cancellation rate
      const cancelledOrders = orders.filter((o: any) => o.status === "cancelled").length;
      const cancelRate = orders.length > 0 ? (cancelledOrders / orders.length) * 100 : 0;
      if (cancelRate > 20) {
        indicators.push({
          id: "cancel-high",
          type: "cancellation",
          severity: cancelRate > 40 ? "high" : "medium",
          title: "High Cancellation Rate",
          description: `Your order cancellation rate is ${cancelRate.toFixed(1)}%. This is above the recommended threshold of 20%.`,
          detectedAt: new Date().toISOString(),
          metric: `${cancelRate.toFixed(1)}%`,
        });
      }

      // Analyze out-of-stock products
      const outOfStock = products.filter((p: any) => p.stock <= 0).length;
      if (outOfStock > 0) {
        indicators.push({
          id: "inventory-out",
          type: "inventory",
          severity: outOfStock > 5 ? "high" : "medium",
          title: "Products Out of Stock",
          description: `${outOfStock} product(s) are currently out of stock. This may lead to lost sales.`,
          detectedAt: new Date().toISOString(),
          metric: String(outOfStock),
        });
      }

      // Analyze low stock
      const lowStock = products.filter((p: any) => p.stock > 0 && p.stock <= 5).length;
      if (lowStock > 0) {
        indicators.push({
          id: "inventory-low",
          type: "inventory",
          severity: "low",
          title: "Low Stock Warning",
          description: `${lowStock} product(s) have 5 or fewer units remaining. Consider restocking soon.`,
          detectedAt: new Date().toISOString(),
          metric: String(lowStock),
        });
      }

      // Check for order spike (unusual activity)
      const recentOrders = orders.filter((o: any) => {
        const orderDate = new Date(o.createdAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return orderDate > weekAgo;
      }).length;
      if (recentOrders > 50) {
        indicators.push({
          id: "order-spike",
          type: "order_spike",
          severity: "low",
          title: "Order Volume Spike",
          description: `You've received ${recentOrders} orders in the last 7 days. Ensure you can fulfill all orders on time.`,
          detectedAt: new Date().toISOString(),
          metric: String(recentOrders),
        });
      }

      setRisks(indicators);
      setRiskScore(indicators.length === 0 ? 100 : Math.max(0, 100 - indicators.reduce((sum, r) => sum + (r.severity === "high" ? 30 : r.severity === "medium" ? 15 : 5), 0)));
    } catch {
      setError("Failed to analyze risk indicators.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const severityColor = (s: string) => s === "high" ? "red" : s === "medium" ? "amber" : "green";
  const severityIcon = (s: string) => s === "high" ? "🔴" : s === "medium" ? "🟡" : "🟢";

  return (
    <DashboardShell role="Seller" title="Risk & Fraud Indicators" subtitle="Monitor unusual patterns and potential risks in your store">
      <div className="space-y-6">
        {error && <ErrorState message={error} onRetry={loadData} />}

        {/* Risk Score */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon="🛡️" value={`${riskScore}/100`} label="Risk Score" note="Higher is better" color={riskScore >= 80 ? "success" : riskScore >= 50 ? "warning" : "error"} />
          <StatCard icon="⚠️" value={String(risks.filter((r) => r.severity === "high").length)} label="High Risk" note="Critical issues" color="error" />
          <StatCard icon="📊" value={String(risks.length)} label="Total Alerts" note="All alerts" color="default" />
        </div>

        {/* Risk Indicators */}
        <Panel title="Risk Indicators">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-muted-bg animate-pulse" />
              ))}
            </div>
          ) : risks.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-2xl">✅</div>
              <h3 className="text-base font-bold text-text mb-1">All Clear!</h3>
              <p className="text-xs text-muted">No unusual patterns detected. Your store is operating normally.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {risks.map((risk) => (
                <div key={risk.id} className={`rounded-xl border p-4 ${risk.severity === "high" ? "border-red-500/20 bg-red-500/5" : risk.severity === "medium" ? "border-amber-500/20 bg-amber-500/5" : "border-border bg-surface"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{severityIcon(risk.severity)}</span>
                      <div>
                        <h4 className="text-sm font-bold text-text">{risk.title}</h4>
                        <p className="text-xs text-muted mt-0.5">{risk.description}</p>
                        <p className="text-[10px] text-muted mt-1">Detected: {new Date(risk.detectedAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${risk.severity === "high" ? "bg-red-500/10 text-red-600" : risk.severity === "medium" ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"}`}>
                      {risk.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Disclaimer */}
        <div className="rounded-xl border border-border bg-muted-bg/50 p-4 text-xs text-muted">
          <strong>Note:</strong> Risk indicators are based on your store's historical data and patterns. They are suggestions for investigation, not definitive fraud claims. Always review orders manually before taking action.
        </div>
      </div>
    </DashboardShell>
  );
}
