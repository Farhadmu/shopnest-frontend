"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import { getSellerReturns, sellerApproveReturn, sellerRejectReturn, sellerInspectReturn, sellerReceiveReturn, type ReturnRequest } from "@/lib/api/returns";
import {
  FiArrowLeft,
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDollarSign,
  FiRefreshCw,
  FiFilter,
  FiEye,
  FiCheck,
  FiX,
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
  seller_received: { bg: "bg-pink-500/10", text: "text-pink-600", border: "border-pink-500/20", label: "Received" },
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

export default function SellerReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadReturns = async () => {
    setLoading(true);
    try {
      const data = await getSellerReturns();
      setReturns(data || []);
    } catch {
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, []);

  const handleApprove = async (id: string) => {
    setActioningId(id);
    try {
      await sellerApproveReturn(id, "Return approved by seller");
      await loadReturns();
    } catch (err: any) {
      alert(err?.message || "Failed to approve return");
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Rejection reason (required):");
    if (!reason?.trim()) return;
    setActioningId(id);
    try {
      await sellerRejectReturn(id, reason.trim());
      await loadReturns();
    } catch (err: any) {
      alert(err?.message || "Failed to reject return");
    } finally {
      setActioningId(null);
    }
  };

  const handleInspect = async (id: string, status: "approved" | "rejected") => {
    const notes = prompt(`Inspection notes (${status}):`);
    if (notes === null) return;
    setActioningId(id);
    try {
      await sellerInspectReturn(id, status, notes || "No notes provided");
      await loadReturns();
    } catch (err: any) {
      alert(err?.message || "Failed to update inspection");
    } finally {
      setActioningId(null);
    }
  };

  const filtered = returns.filter((r) => {
    if (filter === "all") return true;
    if (filter === "pending") return ["requested", "under_review"].includes(r.status);
    if (filter === "action_required") return ["approved", "seller_received", "inspection_pending"].includes(r.status);
    return r.status === filter;
  });

  return (
    <DashboardShell
      role="Seller"
      title="Returns & Refunds"
      subtitle="Manage customer return requests, inspections, and refunds for your products."
      links={sellerDashboardLinks}
    >
      <div className="space-y-6">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: "All Returns" },
            { key: "pending", label: "Pending Review" },
            { key: "action_required", label: "Action Required" },
            { key: "refunded", label: "Refunded" },
            { key: "rejected", label: "Rejected" },
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
            onClick={loadReturns}
            className="ml-auto rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-bold text-foreground hover:border-primary transition cursor-pointer"
          >
            <FiRefreshCw className="inline mr-1" /> Refresh
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
              <p className="text-xs text-muted max-w-md mx-auto">You have no return requests matching the current filter.</p>
            </div>
          </Panel>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((ret) => {
              const style = STATUS_STYLES[ret.status] || STATUS_STYLES.requested;
              const canApprove = ret.status === "requested" || ret.status === "under_review";
              const canReject = ret.status === "requested" || ret.status === "under_review";
              const canInspect = ret.status === "seller_received" || ret.status === "inspection_pending";
              const canReceive = ret.status === "in_transit";
              return (
                <div key={ret.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
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
                  <p className="text-xs text-muted">Reason: {ret.reason}</p>
                  <p className="text-xs text-muted">Customer Requested Refund: ৳{ret.requestedRefundAmount?.toLocaleString()}</p>
                  {ret.rejectionReason && (
                    <p className="text-xs text-red-500 font-bold">Rejection: {ret.rejectionReason}</p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {canApprove && (
                      <button
                        type="button"
                        onClick={() => handleApprove(ret.id)}
                        disabled={actioningId === ret.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-[11px] font-bold hover:bg-emerald-600 transition disabled:opacity-50 cursor-pointer"
                      >
                        <FiCheck /> Approve
                      </button>
                    )}
                    {canReject && (
                      <button
                        type="button"
                        onClick={() => handleReject(ret.id)}
                        disabled={actioningId === ret.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-xl text-[11px] font-bold hover:bg-red-600 transition disabled:opacity-50 cursor-pointer"
                      >
                        <FiX /> Reject
                      </button>
                    )}
                    {canInspect && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleInspect(ret.id, "approved")}
                          disabled={actioningId === ret.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-[11px] font-bold hover:bg-emerald-600 transition disabled:opacity-50 cursor-pointer"
                        >
                          <FiCheck /> Approve Refund
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInspect(ret.id, "rejected")}
                          disabled={actioningId === ret.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-xl text-[11px] font-bold hover:bg-red-600 transition disabled:opacity-50 cursor-pointer"
                        >
                          <FiX /> Reject Inspection
                        </button>
                      </>
                    )}
                    {canReceive && (
                      <button
                        type="button"
                        onClick={() => handleInspect(ret.id, "approved")}
                        disabled={actioningId === ret.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-[11px] font-bold hover:bg-emerald-600 transition disabled:opacity-50 cursor-pointer"
                      >
                        <FiCheck /> Mark Received & Inspect
                      </button>
                    )}
                    <Link
                      href={`/dashboard/seller/returns/${ret.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border bg-surface text-foreground rounded-xl text-[11px] font-bold hover:border-primary transition"
                    >
                      <FiEye /> Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
