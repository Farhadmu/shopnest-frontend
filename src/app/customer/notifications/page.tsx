"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { getIntelligentNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/api/customer-features";

export default function CustomerNotificationsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Array<{ id: string; type: string; title: string; message: string; isRead: boolean; createdAt: string }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!isPending && !session?.user) router.push("/login");
    loadNotifications();
  }, [session, isPending, filter]);

  async function loadNotifications() {
    try {
      const data = await getIntelligentNotifications(filter === "all" ? undefined : filter);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch { /* ignore */ }
  }

  async function handleMarkRead(id: string) {
    await markNotificationRead(id);
    loadNotifications();
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    loadNotifications();
  }

  const categories = [
    { key: "all", label: "All", icon: "📋" },
    { key: "important", label: "Important", icon: "🔴" },
    { key: "price_alerts", label: "Price Alerts", icon: "🟡" },
    { key: "recommendations", label: "Recommendations", icon: "🟢" },
    { key: "orders", label: "Orders", icon: "🔵" },
    { key: "promotions", label: "Promotions", icon: "🟣" },
    { key: "security", label: "Security", icon: "⚠️" },
  ];

  const typeIcons: Record<string, string> = {
    order_confirmation: "📦", order_shipped: "🚚", order_delivered: "✅",
    order_update: "📋", order_cancelled: "❌", price_drop: "💰",
    coupon: "🎟️", flash_sale: "⚡", low_stock: "⚠️",
  };

  const links = [
    { label: "Security Center", href: "/customer/security", icon: "🔐", description: "Account security" },
    { label: "Activity Timeline", href: "/customer/activity", icon: "🧑‍💻", description: "Account activity" },
    { label: "Notifications", href: "/customer/notifications", icon: "🔔", description: "Notification center" },
    { label: "Profile", href: "/customer/profile-preferences", icon: "🧠", description: "Shopping profile" },
  ];

  return (
    <DashboardShell title="Intelligent Notifications" subtitle="Stay updated with smart notification categories" role="Customer" links={links}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button key={cat.key} onClick={() => setFilter(cat.key)} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${filter === cat.key ? "bg-primary text-white" : "bg-muted-bg text-text hover:bg-primary/10"}`}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20">
              Mark All Read ({unreadCount})
            </button>
          )}
        </div>

        <Panel title={`Notifications (${unreadCount} unread)`}>
          <div className="space-y-2">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted">No notifications in this category</div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className={`flex items-start gap-3 rounded-lg border p-4 transition ${notif.isRead ? "border-border bg-surface" : "border-primary/30 bg-primary/5"}`}>
                  <span className="text-xl">{typeIcons[notif.type] || "📋"}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-text">{notif.title}</h4>
                      {!notif.isRead && (
                        <button onClick={() => handleMarkRead(notif.id)} className="text-xs font-medium text-primary hover:underline">
                          Mark read
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted">{notif.message}</p>
                    <p className="mt-1 text-xs text-muted">{new Date(notif.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
