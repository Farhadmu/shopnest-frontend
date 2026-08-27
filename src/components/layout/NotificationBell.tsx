"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@heroui/react";
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  type Notification,
} from "@/lib/api/notifications";
import { getErrorMessage } from "@/lib/core/errors";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

const POLL_INTERVAL_MS = 30000;

export const NotificationBell: React.FC = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.count);
    } catch {
      // Silently ignore; bell just won't show a badge until the next poll.
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getNotifications(1, 10);
      setItems(res.items);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Best-effort; leave state as-is on failure.
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationRead(notification.id);
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

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-muted/10 transition-colors"
        aria-label="Notifications"
      >
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-xl border border-border bg-background shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            {items.some((n) => !n.isRead) && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading && <p className="px-4 py-6 text-center text-sm text-muted">Loading...</p>}
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
                  className={`w-full text-left px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/5 transition-colors ${
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
                    </div>
                  </div>
                </button>
              ))}
          </div>

          <div className="px-4 py-2 border-t border-border">
            <Button
              onPress={() => loadNotifications()}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Refresh
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
