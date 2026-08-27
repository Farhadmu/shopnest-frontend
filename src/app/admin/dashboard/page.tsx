"use client";
import { useEffect, useState } from "react";
import {
  DashboardShell,
  FeatureGrid,
  Panel,
  StatCard,
  DashboardLink,
} from "@/components/dashboard/DashboardUI";
import { clientFetch } from "@/lib/core/client";
const links: DashboardLink[] = [
  {
    label: "Platform Overview",
    href: "/admin/dashboard",
    icon: "📊",
    description: "Monitor users, sellers, products, orders and revenue.",
  },
  {
    label: "User Management",
    href: "/admin/users",
    icon: "👥",
    description: "Search, suspend and activate marketplace users.",
  },
  {
    label: "Seller Verification",
    href: "/admin/sellers",
    icon: "🏪",
    description: "Approve, reject or suspend seller stores.",
  },
  {
    label: "Product Moderation",
    href: "/admin/products",
    icon: "🛡️",
    description: "Review catalog quality and moderation status.",
  },
  {
    label: "Order Operations",
    href: "/admin/orders",
    icon: "📦",
    description: "Monitor platform orders and order disputes.",
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: "🗂️",
    description: "Create and maintain marketplace categories.",
  },
  {
    label: "Coupons & Promotions",
    href: "/admin/coupons",
    icon: "🎟️",
    description: "Manage platform-wide coupon inventory.",
  },
  {
    label: "Security Center",
    href: "/admin/security",
    icon: "🔐",
    description: "Review security events and risk signals.",
  },
  {
    label: "Reported Reviews",
    href: "/admin/reviews",
    icon: "🚩",
    description: "Moderate reported customer reviews.",
  },
];
type Metrics = {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingSellers: number;
  reportedProducts: number;
  refundRequests: number;
};
export default function AdminDashboard() {
  const [m, setM] = useState<Metrics>({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingSellers: 0,
    reportedProducts: 0,
    refundRequests: 0,
  });
  useEffect(() => {
    clientFetch<{ success?: boolean; data?: Metrics } | Metrics>("/admin/dashboard")
      .then((r) => setM((r as any).data ?? (r as Metrics)))
      .catch(() => undefined);
  }, []);
  return (
    <DashboardShell
      role="Administrator"
      title="Platform Control Center"
      subtitle="Operate the ShopNest marketplace with centralized moderation, seller verification, commerce operations and security oversight."
      links={links}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="👥" label="Users" value={String(m.totalUsers)} note="Registered accounts" />
        <StatCard icon="🏪" label="Sellers" value={String(m.totalSellers)} note="Approved stores" />
        <StatCard icon="🛍️" label="Products" value={String(m.totalProducts)} note="Catalog items" />
        <StatCard icon="📦" label="Orders" value={String(m.totalOrders)} note="Platform orders" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="৳"
          label="Revenue"
          value={`৳${m.totalRevenue.toLocaleString()}`}
          note="Paid order revenue"
        />
        <StatCard
          icon="⏳"
          label="Seller queue"
          value={String(m.pendingSellers)}
          note="Awaiting approval"
        />
        <StatCard
          icon="🚩"
          label="Reported products"
          value={String(m.reportedProducts)}
          note="Need moderation"
        />
        <StatCard
          icon="↩️"
          label="Refunds"
          value={String(m.refundRequests)}
          note="Returned/refunded"
        />
      </div>
      <div className="mt-5">
        <Panel title="Admin command shortcuts">
          <div className="grid gap-3 sm:grid-cols-3">
            <a
              href="/admin/sellers"
              className="rounded-xl bg-primary p-4 text-sm font-bold text-white"
            >
              Review sellers
            </a>
            <a
              href="/admin/products"
              className="rounded-xl border border-border p-4 text-sm font-bold"
            >
              Moderate products
            </a>
            <a
              href="/admin/security"
              className="rounded-xl border border-border p-4 text-sm font-bold"
            >
              Open security
            </a>
          </div>
        </Panel>
      </div>
      <div className="mt-5">
        <Panel title="Your 9 admin features">
          <FeatureGrid links={links} />
        </Panel>
      </div>
    </DashboardShell>
  );
}
