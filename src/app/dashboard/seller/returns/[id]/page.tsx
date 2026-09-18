"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import { getReturnById, sellerApproveReturn, sellerRejectReturn, sellerInspectReturn, sellerReceiveReturn, type ReturnRequest } from "@/lib/api/returns";
import {
  FiArrowLeft,
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDollarSign,
  FiRefreshCw,
  FiMapPin,
  FiTruck,
  FiEye,
  FiCheck,
  FiX,
} from "react-icons/fi";

const TIMELINE_STEPS = [
  { key: "requested", label: "Return Requested", icon: FiPackage },
  { key: "under_review", label: "Under Review", icon: FiEye },
  { key: "approved", label: "Approved", icon: FiCheckCircle },
  { key: "reverse_available", label: "Awaiting Pickup", icon: FiClock },
  { key: "pickup_started", label: "Pickup Started", icon: FiTruck },
  { key: "picked_up", label: "Picked Up", icon: FiCheckCircle },
  { key: "in_transit", label: "In Transit", icon: FiTruck },
  { key: "seller_received", label: "Seller Received", icon: FiMapPin },
  { key: "inspection_pending", label: "Inspection", icon: FiEye },
  { key: "refund_pending", label: "Refund Pending", icon: FiDollarSign },
  { key: "refund_processing", label: "Processing", icon: FiDollarSign },
  { key: "refunded", label: "Refunded", icon: FiCheckCircle },
];

export default function SellerReturnDetailsPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const [ret, setRet] = useState<ReturnRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [resalable, setResalable] = useState(true);

  const loadReturn = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getReturnById(id);
      setRet(data);
    } catch {
      setRet(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadReturn();
  }, [loadReturn]);

  const handleAction = async (action: "approve" | "reject" | "inspect" | "receive", data?: any) => {
    if (!ret) return;
    setActioning(true);
    try {
      switch (action) {
        case "approve":
          await sellerApproveReturn(ret.id, "Approved by seller");
          break;
        case "reject":
          await sellerRejectReturn(ret.id, data.reason || "Not eligible for return");
          break;
        case "inspect":
          await sellerInspectReturn(ret.id, data.status, data.notes || "", data.resalable);
          break;
        case "receive":
          await sellerReceiveReturn(ret.id, { proofImage: data.proofImage, note: data.note });
          break;
      }
      await loadReturn();
    } catch (err: any) {
      alert(err?.message || `Failed to ${action} return`);
    } finally {
      setActioning(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-bold text-foreground">Loading Return Details...</h2>
      </div>
    );
  }

  if (!ret) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
          <h1 className="text-2xl font-black text-foreground">Return Not Found</h1>
          <p className="mt-2 text-sm text-muted">This return may not exist or you don&apos;t have access.</p>
          <Link href="/dashboard/seller/returns" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold">
            <FiArrowLeft /> Back to Returns
          </Link>
        </div>
      </div>
    );
  }

  const canApprove = ret.status === "requested" || ret.status === "under_review";
  const canReject = ret.status === "requested" || ret.status === "under_review";
  const canInspect = ret.status === "seller_received" || ret.status === "inspection_pending";
  const canReceive = ret.status === "picked_up" || ret.status === "in_transit";

  return (
    <DashboardShell
      role="Seller"
      title={`Return #${String(ret.orderId).slice(-8).toUpperCase()}`}
      subtitle="Review return details, approve/reject, inspect, and process refunds."
      links={sellerDashboardLinks}
    >
      <div className="space-y-6">
        {/* Product Info */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {ret.productImage && (
              <img src={ret.productImage} alt={ret.productTitle} className="w-20 h-20 rounded-xl object-cover border border-border" />
            )}
            <div className="flex-1">
              <h3 className="text-base font-black text-foreground">{ret.productTitle}</h3>
              <p className="text-xs text-muted mt-1">Quantity: {ret.quantity}</p>
              <p className="text-xs text-muted">Reason: {ret.reason}</p>
              <p className="text-xs text-muted mt-1">Description: {ret.description}</p>
              {ret.inspectionNotes && (
                <p className="text-xs text-muted mt-1">Inspection Notes: {ret.inspectionNotes}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">Requested Refund</p>
              <p className="text-lg font-black text-foreground">৳{ret.requestedRefundAmount?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Evidence Images */}
        {ret.evidenceUrls && ret.evidenceUrls.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-muted mb-3">Customer Evidence</h3>
            <div className="flex flex-wrap gap-3">
              {ret.evidenceUrls.map((url, idx) => (
                <img key={idx} src={url} alt={`Evidence ${idx + 1}`} className="w-24 h-24 rounded-xl object-cover border border-border" />
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-6 flex items-center gap-2">
            <FiClock className="text-primary text-lg" /> Return Timeline
          </h2>
          <div className="space-y-0">
            {TIMELINE_STEPS.map((step, idx) => {
              const isCompleted = ret.statusHistory?.some((h) => h.status === step.key);
              const isCurrent = ret.status === step.key;
              const StepIcon = step.icon;
              return (
                <div key={step.key} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      isCurrent
                        ? "bg-primary text-white shadow-md ring-4 ring-primary/10"
                        : isCompleted
                        ? "bg-primary/20 text-primary"
                        : "bg-muted-bg text-muted border border-border"
                    }`}>
                      {isCurrent ? <FiCheckCircle className="text-sm" /> : <StepIcon className="text-sm" />}
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

        {/* Actions */}
        {(canApprove || canReject || canInspect || canReceive) && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-muted mb-4">Actions</h3>
            <div className="flex flex-wrap gap-3">
              {canApprove && (
                <button
                  type="button"
                  onClick={() => handleAction("approve")}
                  disabled={actioning}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black hover:bg-emerald-600 transition disabled:opacity-50 cursor-pointer"
                >
                  <FiCheck /> Approve Return
                </button>
              )}
              {canReject && (
                <button
                  type="button"
                  onClick={() => {
                    const reason = prompt("Rejection reason (required):");
                    if (reason?.trim()) handleAction("reject", { reason: reason.trim() });
                  }}
                  disabled={actioning}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-red-500 text-white rounded-xl text-xs font-black hover:bg-red-600 transition disabled:opacity-50 cursor-pointer"
                >
                  <FiX /> Reject Return
                </button>
              )}
              {canInspect && (
                <>
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-500/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-border cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resalable}
                      onChange={(e) => setResalable(e.target.checked)}
                      className="rounded border-border"
                    />
                    Resalable
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAction("inspect", { status: "approved", notes: "Approved by seller", resalable })}
                    disabled={actioning}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black hover:bg-emerald-600 transition disabled:opacity-50 cursor-pointer"
                  >
                    <FiCheck /> Approve Refund
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction("inspect", { status: "rejected", notes: "Rejected by seller", resalable: false })}
                    disabled={actioning}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-red-500 text-white rounded-xl text-xs font-black hover:bg-red-600 transition disabled:opacity-50 cursor-pointer"
                  >
                    <FiX /> Reject Inspection
                  </button>
                </>
              )}
              {canReceive && (
                <button
                  type="button"
                  onClick={() => handleAction("receive", { note: "Product received by seller" })}
                  disabled={actioning}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black hover:bg-emerald-600 transition disabled:opacity-50 cursor-pointer"
                >
                  <FiCheck /> Mark Received
                </button>
              )}
            </div>
          </div>
        )}

        <Link href="/dashboard/seller/returns" className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-border bg-card text-foreground rounded-xl text-xs font-bold hover:bg-muted-bg transition">
          <FiArrowLeft /> Back to Returns
        </Link>
      </div>
    </DashboardShell>
  );
}
