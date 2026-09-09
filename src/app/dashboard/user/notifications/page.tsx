"use client";

import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { userDashboardLinks } from "@/lib/constants/dashboard-nav";
import { useNotifications } from "@/hooks/dashboard/user/useNotifications";
import { FaBell, FaTrash } from "react-icons/fa";

export default function CustomerNotificationsPage() {
  const {
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
  } = useNotifications();

  return (
    <DashboardShell
      role="Customer"
      title="Customer Notifications & Activity Feed"
      subtitle="Stay informed on order fulfillment dispatches, price drop opportunities, security logins, and personalized rewards."
      links={userDashboardLinks}
    >
      <Panel
        title="Notification Feed"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted">
              {unreadCount} unread
            </span>
            <button
              type="button"
              onClick={() => loadNotifications(1)}
              className="flex items-center gap-1 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text transition hover:border-primary/40 hover:text-primary"
            >
              Refresh
            </button>
          </div>
        }
      >
        <div className="grid gap-3">
          {loading ? (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted">
              Loading notifications...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-error/30 bg-error/5 p-8 text-center text-sm text-error">
              {error}
              <button onClick={() => loadNotifications(1)} className="ml-3 underline text-xs">Retry</button>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
              <FaBell className="mx-auto mb-2 text-muted" size={24} />
              You are all caught up! No notifications yet.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={items.every((n) => n.isRead)}
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text transition hover:border-primary/40 hover:text-primary disabled:opacity-50"
                >
                  Mark All Read
                </button>
                <button
                  type="button"
                  onClick={handleClearRead}
                  disabled={!items.some((n) => n.isRead)}
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text transition hover:border-error/40 hover:text-error disabled:opacity-50"
                >
                  <FaTrash size={10} /> Clear Read
                </button>
              </div>

              {items.map((n) => (
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
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-text">{n.title}</h3>
                          {!n.isRead && (
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <span className="text-[11px] text-muted">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted leading-5">{n.message}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {!n.isRead && (
                          <button
                            type="button"
                            onClick={() => handleMarkRead(n.id)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                          >
                            Mark as read
                          </button>
                        )}
                        {n.link && (
                          <a
                            href={n.link}
                            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                          >
                            View Details →
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(n.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-muted hover:text-error"
                        >
                          <FaTrash size={10} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => loadNotifications(page - 1)}
                    disabled={page <= 1}
                    className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-text transition hover:border-primary/40 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-muted">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => loadNotifications(page + 1)}
                    disabled={page >= totalPages}
                    className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-text transition hover:border-primary/40 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </Panel>
    </DashboardShell>
  );
}
