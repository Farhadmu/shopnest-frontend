"use client";

import { useEffect, useState } from "react";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { getNotifications, markAllNotificationsRead, markNotificationRead, Notification } from "@/lib/api/notifications";
import { FaBell, FaCheck, FaCheckDouble } from "react-icons/fa";

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getNotifications()
      .then((r) => setItems(r.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, []);

  const links = [
    { label: "Command Center", href: "/admin/dashboard", icon: "🌐", description: "Macro marketplace telemetry." },
    { label: "Platform Analytics", href: "/admin/analytics", icon: "📈", description: "Marketplace-wide growth trends." },
    { label: "Security Center", href: "/admin/security", icon: "🛡️", description: "Platform security & access logs." },
    { label: "Risk & Fraud Matrix", href: "/admin/risk", icon: "🚨", description: "Heuristic anomaly & abuse risk." },
    { label: "Incident Manager", href: "/admin/incidents", icon: "📑", description: "Security incident triage & notes." },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: "📜", description: "System & admin audit trail." },
    { label: "User Management", href: "/admin/users", icon: "👥", description: "Platform user status & accounts." },
    { label: "Seller Verification", href: "/admin/sellers", icon: "🏪", description: "Merchant approvals & vetting." },
    { label: "Product Moderation", href: "/admin/products", icon: "📦", description: "Catalog compliance & reviews." },
  ];

  return (
    <DashboardShell
      role="Administrator"
      title="Platform Operations & Incident Notifications"
      subtitle="Critical marketplace alerts: seller onboarding requests, product moderation flags, security telemetry warnings, and refund approvals."
      links={links}
    >
      <Panel
        title="Admin Notifications Feed"
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
              Loading platform notifications...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
              <FaBell className="mx-auto mb-2 text-muted" size={24} />
              No pending notifications. Platform operations normal.
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
