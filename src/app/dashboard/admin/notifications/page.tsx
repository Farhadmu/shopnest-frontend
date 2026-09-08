"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell, StatCard, EmptyState, LoadingCard } from "@/components/dashboard/DashboardUI";
import { adminDashboardLinks } from "@/lib/constants/dashboard-nav";
import {
  getAdminNotifications,
  getAdminNotificationStats,
  getAdminUnreadCount,
  markAdminNotificationRead,
  markAdminNotificationUnread,
  markAllAdminNotificationsRead,
  bulkMarkAdminNotificationsRead,
  Notification,
  NotificationStats,
  NotificationListResponse,
} from "@/lib/api/notifications";
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaCheck,
  FaCheckDouble,
  FaEye,
  FaExclamationTriangle,
  FaInfoCircle,
  FaExclamationCircle,
  FaShoppingBag,
  FaStore,
  FaStar,
  FaShieldAlt,
  FaBug,
  FaCreditCard,
  FaTruck,
  FaBox,
  FaChartLine,
  FaRobot,
  FaBell,
  FaSpinner,
} from "react-icons/fa";

const PRIORITY_CONFIG: Record<string, { icon: React.ReactNode; bg: string; text: string; border: string }> = {
  info: {
    icon: <FaInfoCircle size={14} className="text-blue-500" />,
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/30",
  },
  warning: {
    icon: <FaExclamationTriangle size={14} className="text-amber-500" />,
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30",
  },
  high: {
    icon: <FaExclamationCircle size={14} className="text-orange-500" />,
    bg: "bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/30",
  },
  critical: {
    icon: <FaExclamationTriangle size={14} className="text-red-500" />,
    bg: "bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500/30",
  },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  orders: <FaShoppingBag size={14} className="text-primary" />,
  sellers: <FaStore size={14} className="text-primary" />,
  reviews: <FaStar size={14} className="text-primary" />,
  security: <FaShieldAlt size={14} className="text-primary" />,
  incidents: <FaBug size={14} className="text-primary" />,
  payments: <FaCreditCard size={14} className="text-primary" />,
  refunds: <FaCreditCard size={14} className="text-primary" />,
  delivery: <FaTruck size={14} className="text-primary" />,
  inventory: <FaBox size={14} className="text-primary" />,
  system: <FaChartLine size={14} className="text-primary" />,
  ai_insights: <FaRobot size={14} className="text-primary" />,
};

const ACTION_URLS: Record<string, string> = {
  seller: "/dashboard/admin/sellers",
  order: "/dashboard/admin/orders",
  review: "/dashboard/admin/reviews",
  incident: "/dashboard/admin/incidents",
  security_event: "/dashboard/admin/security",
  product: "/dashboard/admin/products",
  delivery: "/dashboard/admin/delivery",
  payment: "/dashboard/admin/orders",
  refund: "/dashboard/admin/orders",
};

export default function AdminNotificationsPage() {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [notificationsData, setNotificationsData] = useState<NotificationListResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("-1");
  const [page, setPage] = useState(1);

  const loadStats = useCallback(async () => {
    try {
      const data = await getAdminNotificationStats();
      setStats(data);
    } catch {
      setStats(null);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminNotifications({
        status: filterStatus || undefined,
        priority: filterPriority || undefined,
        category: filterCategory || undefined,
        search: search || undefined,
        sortBy,
        sortDir,
        page,
        limit: 20,
      });
      setNotificationsData(data);
      setSelectedIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
      setNotificationsData(null);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterPriority, filterCategory, sortBy, sortDir, page]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === (notificationsData?.items.length || 0)) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set((notificationsData?.items || []).map((n) => n.id)));
    }
  };

  const handleMarkRead = async (id: string) => {
    setActionLoading(true);
    try {
      await markAdminNotificationRead(id);
      await loadNotifications();
      await loadStats();
    } catch {
      // handled
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkUnread = async (id: string) => {
    setActionLoading(true);
    try {
      await markAdminNotificationUnread(id);
      await loadNotifications();
      await loadStats();
    } catch {
      // handled
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      await markAllAdminNotificationsRead();
      await loadNotifications();
      await loadStats();
    } catch {
      // handled
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkMarkRead = async () => {
    if (selectedIds.size === 0) return;
    setActionLoading(true);
    try {
      await bulkMarkAdminNotificationsRead(Array.from(selectedIds));
      await loadNotifications();
      await loadStats();
    } catch {
      // handled
    } finally {
      setActionLoading(false);
    }
  };

  const notifications = notificationsData?.items || [];
  const pagination = notificationsData ? { total: notificationsData.total, page: notificationsData.page, limit: notificationsData.limit, totalPages: notificationsData.totalPages } : null;
  const allSelected = notificationsData?.items.length ? selectedIds.size === notificationsData.items.length : false;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <DashboardShell
      role="Administrator"
      title="Marketplace Alert Center"
      subtitle="Monitor important marketplace events, security alerts, and platform activity"
      links={adminDashboardLinks}
      showContinueShopping={false}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon="🔔" label="Total Notifications" value={stats?.total || 0} note="All time" />
        <StatCard icon="📩" label="Unread" value={stats?.unread || 0} note="Requires attention" color="warning" />
        <StatCard icon="🚨" label="Critical" value={stats?.critical || 0} note="Critical priority" color="error" />
        <StatCard icon="⚠️" label="High Priority" value={stats?.high || 0} note="High priority" color="warning" />
        <StatCard icon="📅" label="Today" value={stats?.today || 0} note="Since midnight" />
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search notifications..."
                className="w-full rounded-xl border border-border bg-muted-bg pl-9 pr-4 py-2.5 text-sm text-text outline-none focus:border-primary"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="rounded-xl border border-border bg-muted-bg px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
            >
              <option value="createdAt">Newest First</option>
              <option value="-createdAt">Oldest First</option>
              <option value="priority">Priority</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            >
              <option value="">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }}
              className="rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
              className="rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            >
              <option value="">All Categories</option>
              <option value="orders">Orders</option>
              <option value="sellers">Sellers</option>
              <option value="reviews">Reviews</option>
              <option value="security">Security</option>
              <option value="incidents">Incidents</option>
              <option value="payments">Payments</option>
              <option value="refunds">Refunds</option>
              <option value="delivery">Delivery</option>
              <option value="inventory">Inventory</option>
              <option value="system">System</option>
              <option value="ai_insights">AI Insights</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/5 p-3">
          <span className="text-sm font-semibold text-text">{selectedIds.size} selected</span>
          <button
            onClick={handleBulkMarkRead}
            disabled={actionLoading}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-hover disabled:opacity-50"
          >
            <FaCheckDouble size={12} /> Mark Selected as Read
          </button>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center">
          <FaExclamationTriangle className="mx-auto text-red-500 text-3xl mb-2" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={loadNotifications}
            className="mt-3 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Notifications List */}
      {!error && (
        <div className="grid gap-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-12 text-center">
              <EmptyState
                icon="🔔"
                title="No Notifications Yet"
                description="There are currently no marketplace alerts."
              />
            </div>
          ) : (
            <div className="grid gap-3">
              {/* Select All */}
              <div className="flex items-center gap-2 px-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-xs font-semibold text-muted">Select All</span>
              </div>

              {notifications.map((notification) => {
                const priorityConfig = PRIORITY_CONFIG[notification.priority || "info"] || PRIORITY_CONFIG.info;
                const categoryIcon = CATEGORY_ICONS[notification.category || "system"] || <FaBell size={14} className="text-primary" />;
                const actionUrl = notification.link || ACTION_URLS[notification.relatedType || ""] || "/dashboard/admin";

                return (
                  <div
                    key={notification.id}
                    className={`rounded-2xl border p-4 sm:p-5 transition ${
                      notification.isRead
                        ? "border-border bg-surface"
                        : `${priorityConfig.border} ${priorityConfig.bg} shadow-sm`
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(notification.id)}
                        onChange={() => toggleSelect(notification.id)}
                        className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${priorityConfig.bg} ${priorityConfig.text}`}>
                              {priorityConfig.icon}
                            </span>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-black text-text">{notification.title}</span>
                                <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${priorityConfig.bg} ${priorityConfig.text} border ${priorityConfig.border}`}>
                                  {notification.priority || "info"}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-muted leading-5">{notification.message}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {categoryIcon}
                            <span className="text-xs text-muted">{formatDate(notification.createdAt)}</span>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkRead(notification.id)}
                              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold text-text transition hover:bg-muted-bg hover:text-primary"
                            >
                              <FaCheck size={12} /> Mark Read
                            </button>
                          )}
                          {notification.isRead && (
                            <button
                              onClick={() => handleMarkUnread(notification.id)}
                              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold text-text transition hover:bg-muted-bg hover:text-primary"
                            >
                              <FaTimes size={12} /> Mark Unread
                            </button>
                          )}
                          <a
                            href={actionUrl}
                            className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20"
                          >
                            <FaEye size={12} /> View
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
          <span className="text-xs text-muted">
            Page {pagination.page} of {pagination.totalPages} • {pagination.total} notifications
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-border bg-background px-4 py-1.5 text-xs font-bold text-text disabled:opacity-50 hover:bg-muted-bg"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= pagination.totalPages}
              className="rounded-lg border border-border bg-background px-4 py-1.5 text-xs font-bold text-text disabled:opacity-50 hover:bg-muted-bg"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Mark All Read Button */}
      {stats && stats.unread > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleMarkAllRead}
            disabled={actionLoading}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold text-text transition hover:border-primary/40 hover:text-primary disabled:opacity-50"
          >
            <FaCheckDouble size={14} /> Mark All Read
          </button>
        </div>
      )}
    </DashboardShell>
  );
}
