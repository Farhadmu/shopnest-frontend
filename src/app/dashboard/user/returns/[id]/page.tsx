"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { userDashboardLinks } from "@/lib/constants/dashboard-nav";
import { getReturnById, type ReturnRequest } from "@/lib/api/returns";
import {
  FiArrowLeft,
  FiPackage,
  FiTruck,
  FiMapPin,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDollarSign,
  FiRefreshCw,
  FiInfo,
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

export default function CustomerReturnTrackingPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const [ret, setRet] = useState<ReturnRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReturn = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getReturnById(id);
      setRet(data);
    } catch (err: any) {
      setError(err?.message || "Return not found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadReturn();
  }, [loadReturn]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-bold text-foreground">Loading Return Details...</h2>
      </div>
    );
  }

  if (error || !ret) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 shadow-sm">
          <h1 className="text-2xl font-black text-foreground">Return Not Found</h1>
          <p className="mt-2 text-sm text-muted">{error || "This return may not exist or you don't have access."}</p>
          <div className="mt-6">
            <Link href="/dashboard/user/returns" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold">
              <FiArrowLeft /> Back to Returns
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusKey = ret.status;
  const isTerminal = TERMINAL_STATES.has(statusKey);
  const currentIdx = TIMELINE_STEPS.findIndex((s) => s.key === statusKey);
  const activeIdx = currentIdx === -1 && !isTerminal ? 0 : currentIdx;

  return (
    <DashboardShell
      role="Customer"
      title={`Return #${String(ret.orderId).slice(-8).toUpperCase()}`}
      subtitle="Track your return status, pickup, and refund progress."
      links={userDashboardLinks}
    >
      <div className="space-y-6">
        {/* Status Banner */}
        <div className={`rounded-2xl border p-5 shadow-sm ${
          statusKey === "refunded"
            ? "border-emerald-500/30 bg-emerald-500/5"
            : statusKey === "rejected" || statusKey === "refund_failed" || statusKey === "failed"
            ? "border-red-500/30 bg-red-500/5"
            : "border-primary/20 bg-primary/5"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase text-muted tracking-wider">Current Status</p>
              <p className="text-base font-black text-foreground capitalize mt-1">
                {statusKey.replace(/_/g, " ")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted">Return ID</p>
              <p className="text-xs font-bold text-foreground font-mono">{ret.id}</p>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            {ret.productImage && (
              <img src={ret.productImage} alt={ret.productTitle} className="w-16 h-16 rounded-xl object-cover border border-border" />
            )}
            <div className="flex-1">
              <h3 className="text-sm font-black text-foreground">{ret.productTitle}</h3>
              <p className="text-xs text-muted mt-1">Quantity: {ret.quantity} × ৳{ret.requestedRefundAmount?.toLocaleString()}</p>
              <p className="text-xs text-muted">Reason: {ret.reason}</p>
              {ret.inspectionNotes && (
                <p className="text-xs text-muted mt-1">Inspection Notes: {ret.inspectionNotes}</p>
              )}
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
                      isCompleted
                        ? "bg-primary text-white shadow-md"
                        : "bg-muted-bg text-muted border border-border"
                    }`}>
                      {isCompleted ? <FiCheckCircle className="text-sm" /> : <StepIcon className="text-sm" />}
                    </div>
                    {idx < TIMELINE_STEPS.length - 1 && (
                      <div className={`w-px h-8 ${isCompleted ? "bg-primary/30" : "bg-border"}`} />
                    )}
                  </div>
                  <div className="pb-6">
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

        {/* Delivery Info */}
        {ret.deliveryManName && (
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-muted mb-3">Delivery Partner</h3>
            <p className="text-sm font-bold text-foreground">{ret.deliveryManName}</p>
          </div>
        )}

        {/* Refund Info */}
        {ret.refundId && (
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-muted mb-3 flex items-center gap-1.5">
              <FiDollarSign className="text-primary" /> Refund Information
            </h3>
            <p className="text-sm text-foreground font-bold">Refund ID: {ret.refundId}</p>
            <p className="text-xs text-muted mt-1">Amount: ৳{ret.requestedRefundAmount?.toLocaleString()}</p>
            <p className="text-xs text-muted">Method: {ret.refundMethod?.replace(/_/g, " ")}</p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Link href="/dashboard/user/orders" className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-border bg-card text-foreground rounded-xl text-xs font-bold hover:bg-muted-bg transition">
            <FiArrowLeft /> Back to Orders
          </Link>
          <Link href="/dashboard/user/returns" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition">
            <FiPackage /> All Returns
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
