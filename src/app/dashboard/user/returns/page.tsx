"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { userDashboardLinks } from "@/lib/constants/dashboard-nav";
import { getReturnRequests, type ReturnRequest } from "@/lib/api/returns";
import {
  FiArrowLeft,
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiTruck,
  FiDollarSign,
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

export default function CustomerReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const loadReturns = async () => {
    setLoading(true);
    try {
      const data = await getReturnRequests();
      setReturns(data || []);
    } catch {
      setReturns([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, []);

  const filtered = returns.filter((r) => {
    if (filter === "all") return true;
    if (filter === "active") return !["refunded", "cancelled", "rejected", "refund_failed"].includes(r.status);
    if (filter === "completed") return ["refunded", "cancelled"].includes(r.status);
    return r.status === filter;
  });

  return (
    <DashboardShell
      role="Customer"
      title="Returns & Refunds"
      subtitle="Track your return requests, pickup status, and refund progress."
      links={userDashboardLinks}
    >
      <div className="space-y-6">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: "All Returns" },
            { key: "active", label: "Active" },
            { key: "completed", label: "Completed" },
            { key: "requested", label: "Pending" },
            { key: "refunded", label: "Refunded" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                filter === tab.key
                  ? "bg-primary text-white shadow-md"
                  : "border border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setRefreshing(true); loadReturns(); }}
            className="ml-auto rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-bold text-foreground hover:border-primary transition cursor-pointer"
          >
            <FiRefreshCw className={`inline mr-1 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Returns List */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl border border-border bg-surface/50" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Panel>
            <div className="py-16 text-center">
              <FiPackage className="mx-auto text-4xl text-muted/40 mb-3" />
              <h3 className="text-base font-bold text-foreground mb-1">No Returns Found</h3>
              <p className="text-xs text-muted max-w-md mx-auto">
                You haven&apos;t submitted any return requests yet. Returns must be initiated from your delivered order details page.
              </p>
            </div>
          </Panel>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((ret) => {
              const style = STATUS_STYLES[ret.status] || STATUS_STYLES.requested;
              return (
                <Link
                  key={ret.id}
                  href={`/dashboard/user/returns/${ret.id}`}
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
