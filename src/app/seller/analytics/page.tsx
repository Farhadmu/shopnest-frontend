"use client";
import { useEffect, useState } from "react";
import { getSellerDashboardMetrics } from "@/lib/api/sellers";
export default function SellerAnalytics() {
  const [m, setM] = useState({ totalSales: 0, totalOrders: 0, totalProducts: 0 });
  useEffect(() => {
    getSellerDashboardMetrics()
      .then(setM)
      .catch(() => undefined);
  }, []);
  return (
    <div className="grid gap-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">
          Seller intelligence
        </p>
        <h1 className="mt-1 text-3xl font-black">Sales Analytics</h1>
        <p className="mt-2 text-sm text-muted">
          A clean overview of the commerce signals available from the current platform data.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-xs text-muted">Revenue</p>
          <p className="mt-2 text-3xl font-black">৳{m.totalSales.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-xs text-muted">Orders</p>
          <p className="mt-2 text-3xl font-black">{m.totalOrders}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-xs text-muted">Catalog</p>
          <p className="mt-2 text-3xl font-black">{m.totalProducts}</p>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-black">Growth checklist</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-muted-bg p-4">Add products to widen discovery</div>
          <div className="rounded-xl bg-muted-bg p-4">Use coupons to improve conversion</div>
          <div className="rounded-xl bg-muted-bg p-4">Respond to reviews consistently</div>
          <div className="rounded-xl bg-muted-bg p-4">Use AI content to improve listings</div>
        </div>
      </div>
    </div>
  );
}
