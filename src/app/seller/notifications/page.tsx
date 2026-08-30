"use client";

import { useEffect, useState } from "react";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { getNotifications, markAllNotificationsRead, markNotificationRead, Notification } from "@/lib/api/notifications";
import { FaBell, FaCheck, FaCheckDouble } from "react-icons/fa";

export default function SellerNotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getNotifications()
      .then((r) => setItems(r.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const links = [
    { label: "Overview", href: "/seller/dashboard", icon: "📊", description: "Seller snapshot & quick stats." },
    { label: "Advanced Analytics", href: "/seller/analytics", icon: "📈", description: "Multi-range sales & conversion." },
    { label: "Sales Forecasting", href: "/seller/forecast", icon: "🔮", description: "Predictive revenue projections." },
    { label: "Smart Inventory", href: "/seller/inventory", icon: "📦", description: "Stockout risk & restock priorities." },
    { label: "Store Health", href: "/seller/store-health", icon: "🩺", description: "87/100 performance telemetry." },
    { label: "Customer Insights", href: "/seller/customers", icon: "👥", description: "New vs repeat customer metrics." },
    { label: "Products", href: "/seller/products", icon: "🛍️", description: "Catalog management & additions." },
    { label: "Orders", href: "/seller/orders", icon: "🚚", description: "Fulfillment & dispatch tracking." },
    { label: "Notifications", href: "/seller/notifications", icon: "🔔", description: "Store & fulfillment alerts." },
  ];

  return (
    <DashboardShell
      role="Seller"
      title="Store Notifications & Fulfillment Feed"
      subtitle="Immediate alerts for new orders, stock-out warnings, review feedback, catalog moderation updates, and payout summaries."
      links={links}
    >
      <Panel
        title="Store Alerts & Notifications"
        action={
          <button
            type="button"
            onClick={() => markAllNotificationsRead().then(load)}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text transition hover:border-primary/40 hover:text-primary"
          >
            <FaCheckDouble size={11} /> Mark All Read
          </button>
        }
      >
        <div className="grid gap-3">
          {loading ? (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted">
              Loading store notifications...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
              <FaBell className="mx-auto mb-2 text-muted" size={24} />
              No pending notifications for your store.
            </div>
          ) : (
            items.map((n) => (
              <div
                key={n.id}
                className={`rounded-2xl border p-4 transition ${
                  n.isRead ? "border-border bg-surface" : "border-primary/30 bg-primary/5 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-base">
                    🔔
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-sm font-black text-text">{n.title}</h3>
                      <span className="text-[11px] text-muted">{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted leading-5">{n.message}</p>
                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={() => markNotificationRead(n.id).then(load)}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                      >
                        <FaCheck size={10} /> Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Panel>
    </DashboardShell>
  );
}
