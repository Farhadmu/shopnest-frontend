"use client";

import { useEffect, useState } from "react";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { getNotifications, markAllNotificationsRead, markNotificationRead, Notification } from "@/lib/api/notifications";
import { FaBell, FaCheck, FaCheckDouble } from "react-icons/fa";

export default function CustomerNotificationsPage() {
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
    { label: "Overview", href: "/dashboard", icon: "📊", description: "Main customer hub & orders." },
    { label: "Spending Analytics", href: "/customer/analytics", icon: "📈", description: "Charts, spend insights & offers." },
    { label: "Security Center", href: "/customer/security", icon: "🛡️", description: "Sessions, login history & safety." },
    { label: "My Orders", href: "/orders", icon: "📦", description: "Order timeline & delivery status." },
    { label: "Smart Cart", href: "/cart", icon: "🛍️", description: "Live cart and checkout." },
    { label: "Wishlist", href: "/wishlist", icon: "❤️", description: "Saved favorite items." },
    { label: "Notifications", href: "/customer/notifications", icon: "🔔", description: "Order updates & alerts." },
  ];

  return (
    <DashboardShell
      role="Customer"
      title="Customer Notifications & Activity Feed"
      subtitle="Stay informed on order fulfillment dispatches, price drop opportunities, security logins, and personalized rewards."
      links={links}
    >
      <Panel
        title="Notification Feed"
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
              Loading notifications...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
              <FaBell className="mx-auto mb-2 text-muted" size={24} />
              You are all caught up! No unread notifications.
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
