"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { deliveryManDashboardLinks } from "@/lib/constants/dashboard-nav";
import { clientFetch } from "@/lib/core/client";
import { FaBell, FaSyncAlt, FaCheck, FaBox, FaMapPin, FaExclamationTriangle, FaStar } from "react-icons/fa";

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  relatedId?: string;
  relatedType?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DeliveryNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await clientFetch<Notification[]>("/notifications?limit=100");
      setNotifications(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleRefresh = () => {
    loadNotifications();
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await clientFetch(`/notifications/${id}/read`, { method: "PATCH" } as any);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_delivery_request":
      case "delivery_assignment":
        return <FaBox className="text-blue-400" />;
      case "delivery_status_update":
        return <FaMapPin className="text-indigo-400" />;
      case "delivery_completed":
        return <FaCheck className="text-emerald-400" />;
      case "delivery_failed":
        return <FaExclamationTriangle className="text-rose-400" />;
      case "new_rating":
        return <FaStar className="text-amber-400" />;
      default:
        return <FaBell className="text-muted" />;
    }
  };

  return (
    <DashboardShell
      role="Delivery Man"
      title="Notifications"
      subtitle="Stay updated on your delivery activities."
      links={deliveryManDashboardLinks}
    >
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={handleRefresh}
          className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-bold text-text hover:border-primary transition cursor-pointer"
        >
          <FaSyncAlt className={`text-primary ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border border-border bg-surface/50" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Panel title="Notifications">
          <div className="py-12 text-center">
            <FaBell className="mx-auto text-4xl text-muted/50 mb-4" />
            <h3 className="text-lg font-black text-text mb-2">No Notifications</h3>
            <p className="text-sm text-muted">You don't have any notifications at the moment.</p>
          </div>
        </Panel>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl border border-border bg-surface p-4 text-xs transition cursor-pointer ${
                !notification.isRead ? "border-primary/30 bg-primary/5" : "hover:bg-muted-bg/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <p className={`font-bold ${!notification.isRead ? "text-text" : "text-muted"}`}>
                      {notification.title}
                    </p>
                    <span className="text-[10px] text-muted whitespace-nowrap ml-2">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-muted line-clamp-2">{notification.message}</p>
                  {!notification.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="mt-2 text-[10px] font-bold text-primary hover:underline"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
