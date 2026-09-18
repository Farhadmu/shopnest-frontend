"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { adminDashboardLinks } from "@/lib/constants/dashboard-nav";
import { adminGetReturnDetails, processRefund, type ReturnRequest } from "@/lib/api/returns";
import {
  FiArrowLeft,
  FiPackage,
  FiTruck,
  FiMapPin,
  FiCheckCircle,
  FiCheck,
  FiXCircle,
  FiClock,
  FiDollarSign,
  FiRefreshCw,
  FiInfo,
  FiCopy,
  FiUser,
  FiShoppingBag,
} from "react-icons/fi";

const TIMELINE_STEPS = [
  { key: "requested", label: "Return Requested", icon: FiPackage },
  { key: "under_review", label: "Under Review", icon: FiInfo },
  { key: "approved", label: "Approved", icon: FiCheckCircle },
  { key: "reverse_available", label: "Awaiting Pickup", icon: FiClock },
  { key: "pickup_started", label: "Pickup Started", icon: FiTruck },
  { key: "picked_up", label: "Picked Up", icon: FiCheckCircle },
  { key: "in_transit", label: "In Transit", icon: FiTruck },
  { key: "seller_received", label: "Seller Received", icon: FiMapPin },
  { key: "inspection_pending", label: "Inspection", icon: FiInfo },
  { key: "refund_pending", label: "Refund Pending", icon: FiDollarSign },
  { key: "refund_processing", label: "Processing", icon: FiDollarSign },
  { key: "refunded", label: "Refunded", icon: FiCheckCircle },
];

const TERMINAL_STATES = new Set(["rejected", "cancelled", "refund_failed", "failed"]);

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

export default function AdminReturnDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const [data, setData] = useState<{ returnRequest: ReturnRequest; order: any; refunds: any[]; reverseDelivery: any; auditLogs: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await adminGetReturnDetails(id);
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Return not found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const [processingRefundId, setProcessingRefundId] = useState<string | null>(null);

  const handleProcessRefund = async (refundId: string) => {
    if (!confirm("Are you sure you want to complete and disburse this refund?")) return;
    setProcessingRefundId(refundId);
    try {
      await processRefund(refundId);
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to process refund");
    } finally {
      setProcessingRefundId(null);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <DashboardShell role="Admin" title="Return Details" subtitle="Loading..." links={adminDashboardLinks}>
        <div className="max-w-4xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl border border-border bg-surface/50" />
          ))}
        </div>
      </DashboardShell>
    );
  }

  if (error || !data) {
    return (
      <DashboardShell role="Admin" title="Return Details" subtitle="Error" links={adminDashboardLinks}>
        <div className="max-w-3xl mx-auto py-16 px-4 text-center">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
            <h1 className="text-2xl font-black text-foreground">Return Not Found</h1>
            <p className="mt-2 text-sm text-muted">{error || "This return may not exist."}</p>
            <Link href="/dashboard/admin/returns" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold">
              <FiArrowLeft /> Back to Returns
            </Link>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const ret = data.returnRequest;
  const statusKey = ret.status;
  const isTerminal = TERMINAL_STATES.has(statusKey);
  const currentIdx = TIMELINE_STEPS.findIndex((s) => s.key === statusKey);
  const activeIdx = currentIdx === -1 && !isTerminal ? 0 : currentIdx;

  return (
    <DashboardShell role="Admin" title={`Return #${String(ret.orderId).slice(-8).toUpperCase()}`} subtitle="Complete return details and timeline." links={adminDashboardLinks}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className={`rounded-2xl border p-6 shadow-sm ${
          statusKey === "refunded"
            ? "border-emerald-500/30 bg-emerald-500/5"
            : statusKey === "rejected" || statusKey === "refund_failed" || statusKey === "failed"
            ? "border-red-500/30 bg-red-500/5"
            : "border-primary/20 bg-primary/5"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-lg font-black text-foreground">{ret.productTitle}</h1>
              <p className="text-xs text-muted mt-1">Quantity: {ret.quantity} × ৳{ret.requestedRefundAmount?.toLocaleString()}</p>
              <p className="text-xs text-muted">Reason: {ret.reason}</p>
            </div>
            <div className="text-left sm:text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${STATUS_STYLES[statusKey]?.bg || "bg-gray-500/10"} ${STATUS_STYLES[statusKey]?.text || "text-gray-600"} ${STATUS_STYLES[statusKey]?.border || "border-gray-500/20"}`}>
                {STATUS_STYLES[statusKey]?.label || statusKey.replace(/_/g, " ")}
              </span>
              <p className="text-[10px] text-muted mt-2">Return ID</p>
              <div className="flex items-center gap-1.5 justify-left sm:justify-end">
                <p className="text-xs font-mono font-bold text-foreground">{ret.id}</p>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(ret.id)}
                  className="text-muted hover:text-primary transition"
                  title="Copy return ID"
                >
                  <FiCopy size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-6 flex items-center gap-2">
            <FiTruck className="text-primary text-lg" /> Return Timeline
          </h2>
          <div className="space-y-0">
            {TIMELINE_STEPS.map((step, idx) => {
              const isCompleted = !isTerminal && idx <= activeIdx;
              const isCurrent = idx === activeIdx && !isTerminal;
              const StepIcon = step.icon;
              return (
                <div key={step.key} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      isCompleted ? "bg-primary text-white shadow-md" : "bg-muted-bg text-muted border border-border"
                    }`}>
                      {isCompleted ? <FiCheckCircle className="text-sm" /> : <StepIcon className="text-sm" />}
                    </div>
                    {idx < TIMELINE_STEPS.length - 1 && (
                      <div className={`w-px h-8 ${isCompleted ? "bg-primary/30" : "bg-border"}`} />
                    )}
                  </div>
                  <div className="pb-6 flex-1">
                    <p className={`text-xs font-bold ${isCurrent ? "text-primary font-black" : isCompleted ? "text-foreground" : "text-muted"}`}>
                      {step.label}
                    </p>
                    {ret.statusHistory?.find((h) => h.status === step.key) && (
                      <p className="text-[10px] text-muted mt-0.5">
                        {new Date(ret.statusHistory.find((h) => h.status === step.key)!.at).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Related Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-muted mb-3 flex items-center gap-1.5">
              <FiUser className="text-primary" /> Customer
            </h3>
            <p className="text-sm font-bold text-foreground">Customer ID: {ret.userId}</p>
            <p className="text-xs text-muted">Order ID: {String(ret.orderId).slice(-8).toUpperCase()}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-muted mb-3 flex items-center gap-1.5">
              <FiShoppingBag className="text-primary" /> Seller
            </h3>
            <p className="text-sm font-bold text-foreground">Seller ID: {ret.sellerId}</p>
            <p className="text-xs text-muted">Product: {ret.productTitle}</p>
          </div>
        </div>

        {/* Refund Info */}
        {data.refunds?.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-muted mb-4 flex items-center gap-1.5">
              <FiDollarSign className="text-primary" /> Refund Information
            </h3>
            <div className="space-y-3">
              {data.refunds.map((refund: any) => (
                <div key={refund.id} className="flex items-center justify-between p-3 bg-surface rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-foreground">Refund ID: {refund.refundId}</p>
                    <p className="text-[10px] text-muted">Amount: ৳{refund.amount?.toLocaleString()}</p>
                    <p className="text-[10px] text-muted">Provider: {refund.provider}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                      refund.status === "succeeded" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                      refund.status === "failed" ? "bg-red-500/10 text-red-600 border-red-500/20" :
                      "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}>
                      {refund.status}
                    </span>
                    {refund.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleProcessRefund(refund.refundId || refund.id)}
                        disabled={processingRefundId === (refund.refundId || refund.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        <FiCheck /> Complete Refund
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reverse Delivery Info */}
        {data.reverseDelivery && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-muted mb-3 flex items-center gap-1.5">
              <FiTruck className="text-primary" /> Reverse Delivery
            </h3>
            <p className="text-sm font-bold text-foreground">Status: {data.reverseDelivery.status?.replace(/_/g, " ")}</p>
            {data.reverseDelivery.assignedDeliveryManId && (
              <p className="text-xs text-muted">Delivery Man: {data.reverseDelivery.assignedDeliveryManId}</p>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/returns" className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-border bg-card text-foreground rounded-xl text-xs font-bold hover:bg-muted-bg transition">
            <FiArrowLeft /> Back to Returns
          </Link>
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-border bg-card text-foreground rounded-xl text-xs font-bold hover:bg-muted-bg transition"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
