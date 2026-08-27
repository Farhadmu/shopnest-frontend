"use client";
import { useEffect, useState } from "react";
import {
  DashboardShell,
  FeatureGrid,
  Panel,
  StatCard,
  DashboardLink,
} from "@/components/dashboard/DashboardUI";
import { getSellerDashboardMetrics } from "@/lib/api/sellers";
import { getCoupons } from "@/lib/api/coupons";
import { clientFetch } from "@/lib/core/client";
const links: DashboardLink[] = [
  {
    label: "Store Overview",
    href: "/seller/dashboard",
    icon: "📊",
    description: "Revenue, orders, catalog and store health.",
  },
  {
    label: "Product Management",
    href: "/seller/products",
    icon: "🛍️",
    description: "Create, update and remove products.",
  },
  {
    label: "Smart Inventory",
    href: "/seller/inventory",
    icon: "📦",
    description: "Monitor stock and identify low-stock items.",
  },
  {
    label: "Order Fulfillment",
    href: "/seller/orders",
    icon: "🚚",
    description: "Process seller orders and update status.",
  },
  {
    label: "Coupons & Campaigns",
    href: "/seller/coupons",
    icon: "🎟️",
    description: "Create promotions and discount campaigns.",
  },
  {
    label: "Trust & Reviews",
    href: "/seller/trust-score",
    icon: "🛡️",
    description: "Monitor seller trust and customer feedback.",
  },
  {
    label: "Sales Analytics",
    href: "/seller/analytics",
    icon: "📈",
    description: "Track revenue, products and order trends.",
  },
  {
    label: "AI Seller Tools",
    href: "/seller/ai-tools",
    icon: "✨",
    description: "Generate product content and get business guidance.",
  },
  {
    label: "Store Settings",
    href: "/seller/store-settings",
    icon: "⚙️",
    description: "Manage your public storefront information.",
  },
];
export default function SellerDashboard() {
  const [m, setM] = useState({ totalSales: 0, totalOrders: 0, totalProducts: 0 });
  const [couponCount, setCouponCount] = useState(0);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([getSellerDashboardMetrics(), getCoupons()])
      .then(([metrics, coupons]) => {
        setM(metrics);
        setCouponCount(coupons.length);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Unable to load metrics"));
  }, []);
  return (
    <DashboardShell
      role="Seller"
      title="Seller Growth Hub"
      subtitle="Run your ShopNest storefront, fulfill orders, optimize inventory and use AI to grow your business."
      links={links}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="৳"
          label="Total sales"
          value={`৳${m.totalSales.toLocaleString()}`}
          note="Gross seller sales"
        />
        <StatCard
          icon="📦"
          label="Orders"
          value={String(m.totalOrders)}
          note="Orders containing your products"
        />
        <StatCard
          icon="🛍️"
          label="Products"
          value={String(m.totalProducts)}
          note="Active catalog items"
        />
        <StatCard
          icon="🎟️"
          label="Coupons"
          value={String(couponCount)}
          note="Active seller promotions"
        />
      </div>
      {error && (
        <div className="mt-4 rounded-xl border border-error/30 bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <Panel title="Seller workflow">
          <div className="grid gap-3 sm:grid-cols-3">
            <a
              href="/seller/products/add"
              className="rounded-xl bg-primary p-4 text-sm font-bold text-white"
            >
              + Add product
            </a>
            <a
              href="/seller/orders"
              className="rounded-xl border border-border p-4 text-sm font-bold"
            >
              Process orders
            </a>
            <a
              href="/seller/ai-tools"
              className="rounded-xl border border-border p-4 text-sm font-bold"
            >
              Open AI tools
            </a>
          </div>
        </Panel>
        <Panel title="Store health">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Catalog</span>
              <b>{m.totalProducts > 0 ? "Active" : "Needs products"}</b>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Orders</span>
              <b>{m.totalOrders > 0 ? "Receiving" : "No orders yet"}</b>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Promotion</span>
              <b>{couponCount > 0 ? "Running" : "Create a coupon"}</b>
            </div>
          </div>
        </Panel>
      </div>
      <div className="mt-5">
        <Panel title="Your 9 seller features">
          <FeatureGrid links={links} />
        </Panel>
      </div>
    </DashboardShell>
  );
}
