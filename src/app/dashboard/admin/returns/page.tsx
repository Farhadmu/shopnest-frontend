"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { adminDashboardLinks } from "@/lib/constants/dashboard-nav";
import { adminGetReturns, type ReturnRequest } from "@/lib/api/returns";
import {
  FiArrowLeft,
  FiPackage,
  FiFilter,
  FiSearch,
  FiEye,
  FiRefreshCw,
} from "react-icons/fi";

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  requested: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/20", label: "Requested" },
  under_review: { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/20", label: "Under Review" },
  approved: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20", label: "Approved" },
  rejected: { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/20", label: "Rejected" },
  reverse_available: { bg: "bg-cyan-500/10", text: "text-cyan-600", border: "border-cyan-500/20", label: "Awaiting Pickup" },
  reverse_assigned: { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/20", label: "Pickup Assigned" },
  pickup_started: { bg: "bg-indigo-500/10", text: "text-indigo-600", border: "border-indigo-500/20", label: "Pickup Started" },
  picked_up: { bg: "bg-teal-500/10", text: "text-teal-600", border: "border-teal-500/20", label: "Picked Up" },
  in_transit: { bg: "bg-orange-500/10", text: "text-orange-600", border: "border-orange-500/20", label: "In Transit" },
  seller_received: { bg: "bg-pink-500/10", text: "text-pink-600", border: "border-pink-500/20", label: "Seller Received" },
  inspection_pending: { bg: "bg-yellow-500/10", text: "text-yellow-600", border: "border-yellow-500/20", label: "Inspection" },
  inspection_approved: { bg: "bg-green-500/10", text: "text-green-600", border: "border-green-500/20", label: "Inspection Approved" },
  inspection_rejected: { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/20", label: "Inspection Rejected" },
  refund_pending: { bg: "bg-sky-500/10", text: "text-sky-600", border: "border-sky-500/20", label: "Refund Pending" },
  refund_processing: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/20", label: "Processing" },
  refunded: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20", label: "Refunded" },
  refund_failed: { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/20", label: "Refund Failed" },
  cancelled: { bg: "bg-gray-500/10", text: "text-gray-600", border: "border-gray-500/20", label: "Cancelled" },
  failed: { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/20", label: "Failed" },
};

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadReturns = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminGetReturns({
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setReturns(data.returns || []);
    } catch {
      setReturns([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadReturns();
  }, [loadReturns]);

  const stats = {
    total: returns.length,
    pending: returns.filter((r) => ["requested", "under_review"].includes(r.status)).length,
    approved: returns.filter((r) => r.status === "approved").length,
    reverseDelivery: returns.filter((r) => ["reverse_available", "reverse_assigned", "pickup_started", "picked_up", "in_transit"].includes(r.status)).length,
    inspection: returns.filter((r) => r.status === "inspection_pending").length,
    refundPending: returns.filter((r) => ["refund_pending", "refund_processing"].includes(r.status)).length,
    refunded: returns.filter((r) => r.status === "refunded").length,
  };

  return (
    <DashboardShell
      role="Admin"
      title="Returns & Refunds"
      subtitle="Platform-wide return and refund management."
      links={adminDashboardLinks}
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-[11px] font-bold text-muted uppercase tracking-wider">Total</p>
            <p className="text-2xl font-black text-foreground mt-1">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-[11px] font-bold text-muted uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-black text-foreground mt-1">{stats.pending}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-[11px] font-bold text-muted uppercase tracking-wider">Approved</p>
            <p className="text-2xl font-black text-foreground mt-1">{stats.approved}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-[11px] font-bold text-muted uppercase tracking-wider">Reverse Delivery</p>
            <p className="text-2xl font-black text-foreground mt-1">{stats.reverseDelivery}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-[11px] font-bold text-muted uppercase tracking-wider">Inspection</p>
            <p className="text-2xl font-black text-foreground mt-1">{stats.inspection}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-[11px] font-bold text-muted uppercase tracking-wider">Refund Pending</p>
            <p className="text-2xl font-black text-foreground mt-1">{stats.refundPending}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-[11px] font-bold text-muted uppercase tracking-wider">Refunded</p>
            <p className="text-2xl font-black text-foreground mt-1">{stats.refunded}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search returns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-xs font-semibold text-foreground outline-none transition focus:border-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground outline-none transition focus:border-primary"
          >
            <option value="all">All Statuses</option>
            <option value="requested">Requested</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="reverse_available">Awaiting Pickup</option>
            <option value="picked_up">Picked Up</option>
            <option value="in_transit">In Transit</option>
            <option value="seller_received">Seller Received</option>
            <option value="inspection_pending">Inspection</option>
            <option value="refund_pending">Refund Pending</option>
            <option value="refunded">Refunded</option>
            <option value="refund_failed">Refund Failed</option>
            <option value="cancelled">Cancelled</option>
            <option value="failed">Failed</option>
          </select>
          <button
            type="button"
            onClick={() => { setRefreshing(true); loadReturns(); }}
            className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs font-bold text-foreground hover:border-primary transition"
          >
            <FiRefreshCw className={`inline mr-1 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Returns List */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl border border-border bg-surface/50" />
            ))}
          </div>
        ) : returns.length === 0 ? (
          <Panel>
            <div className="py-16 text-center">
              <FiPackage className="mx-auto text-4xl text-muted/40 mb-3" />
              <h3 className="text-base font-bold text-foreground mb-1">No Returns Found</h3>
              <p className="text-xs text-muted max-w-md mx-auto">
                No returns match your current filters. Try adjusting your search or status filter.
              </p>
            </div>
          </Panel>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {returns.map((ret) => {
              const style = STATUS_STYLES[ret.status] || STATUS_STYLES.requested;
              return (
                <Link
                  key={ret.id}
                  href={`/dashboard/admin/returns/${ret.id}`}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3 transition hover:border-primary/50 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="font-black text-foreground text-sm">
                        #{String(ret.orderId).slice(-8).toUpperCase()}
                      </span>
                      <p className="text-[11px] text-muted mt-0.5">
                        {ret.productTitle} × {ret.quantity}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}>
                      {style.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>Reason: {ret.reason}</span>
                    <span className="font-bold text-foreground">৳{ret.requestedRefundAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted">
                    <span>Customer: {ret.userId?.slice(-8)}</span>
                    <span>Seller: {ret.sellerId?.slice(-8)}</span>
                  </div>
                  <div className="text-[11px] text-muted">
                    {new Date(ret.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
