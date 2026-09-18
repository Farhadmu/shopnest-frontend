"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@heroui/react";
import { IoIosNotifications } from "react-icons/io";
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  getAdminNotifications,
  getAdminUnreadCount,
  markAllAdminNotificationsRead,
  markAdminNotificationRead,
  type Notification,
} from "@/lib/api/notifications";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

const POLL_INTERVAL_MS = 30000;
const LOAD_ERROR_MESSAGE = "Unable to load notifications.";

export interface NotificationBellProps {
  variant?: "navbar" | "dashboard";
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  variant = "navbar",
  className = "",
}) => {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isAdmin = (session?.user as { role?: string })?.role === "admin";

  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = isAdmin ? await getAdminUnreadCount() : await getUnreadCount();
      setUnreadCount(res.count);
    } catch {
      // Silently ignore; bell just won't show a badge until the next poll.
    }
  }, [isAdmin]);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = isAdmin ? await getAdminNotifications({ limit: 10 }) : await getNotifications({ page: 1, limit: 10 });
      setItems(res.items);
    } catch (err) {
      // Keep the real error in the console for debugging; show a friendly
      // message in the dropdown.
      console.error("[Notifications] Failed to load notifications:", err);
      setError(LOAD_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isPending || !session?.user) return;
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isPending, session?.user, refreshUnreadCount]);

  useEffect(() => {
    if (isOpen && session?.user) loadNotifications();
  }, [isOpen, session?.user, loadNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      if (isAdmin) {
        await markAllAdminNotificationsRead();
      } else {
        await markAllNotificationsRead();
      }
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Best-effort; leave state as-is on failure.
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        if (isAdmin) {
          await markAdminNotificationRead(notification.id);
        } else {
          await markNotificationRead(notification.id);
        }
        setItems((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // Ignore; navigation still proceeds below.
      }
    }
    setIsOpen(false);
    if (notification.link) router.push(notification.link);
  };

  if (isPending || !session?.user) return null;

  const isDashboard = variant === "dashboard";

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={
          isDashboard
            ? `relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text hover:bg-muted-bg hover:text-primary transition cursor-pointer active:scale-95 shadow-xs ${className}`
            : `relative flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 cursor-pointer active:scale-95 ${className}`
        }
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <IoIosNotifications className="text-base sm:text-lg" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-xl border border-border bg-surface shadow-lg z-50">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            {items.some((n) => !n.isRead) && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="shrink-0 text-xs font-medium text-primary hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading && (
              <p className="px-4 py-6 text-center text-sm text-muted">Loading notifications...</p>
            )}
            {!isLoading && error && (
              <p className="px-4 py-6 text-center text-sm text-error">{error}</p>
            )}
            {!isLoading && !error && items.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-muted">No notifications yet.</p>
            )}
            {!isLoading &&
              !error &&
              items.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/5 transition-colors cursor-pointer ${
                    notification.isRead ? "" : "bg-primary/5"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!notification.isRead && (
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      {notification.createdAt && (
                        <p className="text-[10px] text-muted mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
          </div>

          <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-border bg-muted/5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                const role = (session?.user as { role?: string })?.role;
                const path =
                  role === "admin"
                    ? "/dashboard/admin/notifications"
                    : role === "seller"
                    ? "/dashboard/seller/notifications"
                    : role === "delivery" || role === "delivery_man"
                    ? "/dashboard/delivery/notifications"
                    : "/dashboard/user/notifications";
                router.push(path);
              }}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              View all
            </button>
            <Button
              onPress={() => loadNotifications()}
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2.5"
            >
              Refresh
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
