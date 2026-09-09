"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearReadNotifications,
  Notification,
} from "@/lib/api/notifications";

export function useNotifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getNotifications({ page: pageNum, limit: 20 });
      setItems(response.items);
      setTotalPages(response.totalPages);
      setPage(pageNum);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.count);
    } catch {
      // handled
    }
  }, []);

  useEffect(() => {
    let active = true;
    getNotifications({ page: 1, limit: 20 })
      .then((response) => {
        if (!active) return;
        setItems(response.items);
        setTotalPages(response.totalPages);
        setPage(1);
      })
      .catch(() => {
        if (active) setItems([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    getUnreadCount()
      .then((response) => {
        if (active) setUnreadCount(response.count);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [loadNotifications]);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    loadUnreadCount();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    loadUnreadCount();
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setItems((prev) => prev.filter((n) => n.id !== id));
    loadUnreadCount();
  };

  const handleClearRead = async () => {
    await clearReadNotifications();
    setItems((prev) => prev.filter((n) => !n.isRead));
    loadUnreadCount();
  };

  return {
    items,
    loading,
    error,
    page,
    totalPages,
    unreadCount,
    loadNotifications,
    handleMarkRead,
    handleMarkAllRead,
    handleDelete,
    handleClearRead,
  };
}
