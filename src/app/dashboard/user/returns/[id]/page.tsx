"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { userDashboardLinks } from "@/lib/constants/dashboard-nav";
import { getReturnById, type ReturnRequest } from "@/lib/api/returns";
import { useDeliveryLiveTracking } from "@/hooks/delivery/useDeliveryLiveTracking";
import { LiveDeliveryMap } from "@/components/delivery/LiveDeliveryMap";
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
  FiCopy,
  FiExternalLink,
  FiImage,
  FiFileText,
  FiShoppingBag,
} from "react-icons/fi";

const TIMELINE_STEPS = [
  { key: "requested", label: "Return Requested", icon: FiPackage, color: "text-blue-600" },
  { key: "under_review", label: "Under Review", icon: FiInfo, color: "text-amber-600" },
  { key: "approved", label: "Approved", icon: FiCheckCircle, color: "text-emerald-600" },
  { key: "reverse_available", label: "Awaiting Pickup", icon: FiClock, color: "text-cyan-600" },
  { key: "pickup_started", label: "Pickup Started", icon: FiTruck, color: "text-indigo-600" },
  { key: "picked_up", label: "Picked Up", icon: FiCheckCircle, color: "text-teal-600" },
  { key: "in_transit", label: "In Transit", icon: FiTruck, color: "text-orange-600" },
  { key: "seller_received", label: "Seller Received", icon: FiMapPin, color: "text-pink-600" },
  { key: "inspection_pending", label: "Inspection", icon: FiInfo, color: "text-yellow-600" },
  { key: "refund_pending", label: "Refund Pending", icon: FiDollarSign, color: "text-sky-600" },
  { key: "refund_processing", label: "Processing", icon: FiDollarSign, color: "text-blue-600" },
  { key: "refunded", label: "Refunded", icon: FiCheckCircle, color: "text-emerald-600" },
];

const TERMINAL_STATES = new Set(["rejected", "cancelled", "refund_failed", "failed"]);

function StatusBadge({ status }: { status: string }) {
  const style: Record<string, { bg: string; text: string; border: string }> = {
    requested: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/20" },
    under_review: { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/20" },
    approved: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20" },
    rejected: { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/20" },
    reverse_available: { bg: "bg-cyan-500/10", text: "text-cyan-600", border: "border-cyan-500/20" },
    reverse_assigned: { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/20" },
    pickup_started: { bg: "bg-indigo-500/10", text: "text-indigo-600", border: "border-indigo-500/20" },
    picked_up: { bg: "bg-teal-500/10", text: "text-teal-600", border: "border-teal-500/20" },
    in_transit: { bg: "bg-orange-500/10", text: "text-orange-600", border: "border-orange-500/20" },
    seller_received: { bg: "bg-pink-500/10", text: "text-pink-600", border: "border-pink-500/20" },
    inspection_pending: { bg: "bg-yellow-500/10", text: "text-yellow-600", border: "border-yellow-500/20" },
    inspection_approved: { bg: "bg-green-500/10", text: "text-green-600", border: "border-green-500/20" },
    inspection_rejected: { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/20" },
    refund_pending: { bg: "bg-sky-500/10", text: "text-sky-600", border: "border-sky-500/20" },
    refund_processing: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/20" },
    refunded: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20" },
    refund_failed: { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/20" },
    cancelled: { bg: "bg-gray-500/10", text: "text-gray-600", border: "border-gray-500/20" },
    failed: { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/20" },
  };

  const s = style[status] || style.requested;
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${s.bg} ${s.text} ${s.border}`}>
      {label}
    </span>
  );
}

function Timeline({ returnRequest }: { returnRequest: ReturnRequest }) {
  const statusKey = returnRequest.status;
  const isTerminal = TERMINAL_STATES.has(statusKey);
  const currentIdx = TIMELINE_STEPS.findIndex((s) => s.key === statusKey);
  const activeIdx = currentIdx === -1 && !isTerminal ? 0 : currentIdx;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h2 className="text-base font-bold text-foreground mb-6 flex items-center gap-2">
        <FiTruck className="text-primary text-lg" />
        Return Timeline
      </h2>
      <div className="space-y-0">
        {TIMELINE_STEPS.map((step, idx) => {
          const isCompleted = !isTerminal && idx <= activeIdx;
          const isCurrent = idx === activeIdx && !isTerminal;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    isCompleted
                      ? "bg-primary text-white shadow-md"
                      : "bg-muted-bg text-muted border border-border"
                  }`}
                >
                  {isCompleted ? <FiCheckCircle className="text-sm" /> : <StepIcon className={`text-sm ${isCurrent ? step.color : ""}`} />}
                </div>
                {idx < TIMELINE_STEPS.length - 1 && (
                  <div className={`w-px h-8 ${isCompleted ? "bg-primary/30" : "bg-border"}`} />
                )}
              </div>
              <div className="pb-6 flex-1">
                <p
                  className={`text-xs font-bold ${
                    isCurrent ? "text-primary font-black" : isCompleted ? "text-foreground" : "text-muted"
                  }`}
                >
                  {step.label}
                </p>
                {returnRequest.statusHistory?.find((h) => h.status === step.key) && (
                  <p className="text-[10px] text-muted mt-0.5">
                    {new Date(returnRequest.statusHistory.find((h) => h.status === step.key)!.at).toLocaleString("en-US", {
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
  );
}

function EvidenceGallery({ images }: { images: string[] }) {
  if (!images?.length) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h3 className="text-xs font-bold uppercase text-muted mb-4 flex items-center gap-1.5">
        <FiImage className="text-primary" /> Evidence Images
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((url, idx) => (
          <a
            key={idx}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative group rounded-xl overflow-hidden border border-border aspect-square bg-muted-bg"
          >
            <img
              src={url}
              alt={`Evidence ${idx + 1}`}
              className="w-full h-full object-cover transition group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
              <FiExternalLink className="text-white opacity-0 group-hover:opacity-100 transition" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function RefundCard({ returnRequest }: { returnRequest: ReturnRequest }) {
  if (!returnRequest.refundId) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h3 className="text-xs font-bold uppercase text-muted mb-4 flex items-center gap-1.5">
        <FiDollarSign className="text-primary" /> Refund Information
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wider">Refund ID</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-xs font-mono font-bold text-foreground">{returnRequest.refundId}</p>
                {returnRequest.refundId && (
                  <button
                    type="button"
                    onClick={() => {
                      const refundId = returnRequest.refundId;
                      if (refundId) navigator.clipboard.writeText(refundId);
                    }}
                    className="text-muted hover:text-primary transition"
                    title="Copy refund ID"
                  >
                    <FiCopy size={12} />
                  </button>
                )}
              </div>
          </div>
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wider">Amount</p>
            <p className="text-sm font-black text-foreground mt-0.5">৳{returnRequest.requestedRefundAmount?.toLocaleString()}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wider">Method</p>
            <p className="text-xs font-bold text-foreground mt-0.5 capitalize">
              {returnRequest.refundMethod?.replace(/_/g, " ") || "N/A"}
            </p>
          </div>
          {returnRequest.calculatedRefundAmount && (
            <div>
              <p className="text-[10px] text-muted uppercase tracking-wider">Calculated Refund</p>
              <p className="text-xs font-bold text-emerald-600 mt-0.5">৳{returnRequest.calculatedRefundAmount.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReverseDeliveryLiveMapCard({ returnRequest }: { returnRequest: ReturnRequest }) {
  const isReverseActive = [
    "reverse_assigned",
    "reverse_accepted",
    "pickup_started",
    "picked_up",
    "in_transit",
  ].includes(returnRequest.status);

  const { currentLocation, trackingState, socketConnected, secondsSinceLastUpdate } = useDeliveryLiveTracking({
    deliveryId: returnRequest.deliveryRequestId,
    orderId: returnRequest.orderId,
    initialStatus: returnRequest.status,
    initialLocation: null,
  });

  if (!isReverseActive && !returnRequest.deliveryRequestId) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase text-muted flex items-center gap-1.5">
          <FiTruck className="text-primary" /> Live Reverse Delivery Radar
        </h3>
        <span className="text-[11px] font-bold text-muted">
          {socketConnected ? "🟢 Live Telemetry" : "🟡 Telemetry Standby"}
        </span>
      </div>
      <LiveDeliveryMap
        pickupAddress={returnRequest.pickupAddress || "Customer Pickup"}
        deliveryAddress={returnRequest.sellerReturnAddress || "Seller Destination"}
        status={returnRequest.status}
        orderId={String(returnRequest.orderId)}
        deliveryId={returnRequest.deliveryRequestId}
        riderName={returnRequest.deliveryManName || "Assigned Courier"}
        trackingState={trackingState}
        secondsSinceLastUpdate={secondsSinceLastUpdate}
        riderLocation={currentLocation || undefined}
        height="h-72 sm:h-80"
        showControls={false}
      />
    </div>
  );
}

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
      <DashboardShell role="Customer" title="Return Details" subtitle="Loading..." links={userDashboardLinks}>
        <div className="max-w-4xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl border border-border bg-surface/50" />
          ))}
        </div>
      </DashboardShell>
    );
  }

  if (error || !ret) {
    return (
      <DashboardShell role="Customer" title="Return Details" subtitle="Error" links={userDashboardLinks}>
        <div className="max-w-3xl mx-auto py-16 px-4 text-center">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 shadow-sm">
            <FiXCircle className="mx-auto text-4xl text-red-500 mb-3" />
            <h1 className="text-2xl font-black text-foreground">Return Not Found</h1>
            <p className="mt-2 text-sm text-muted">{error || "This return may not exist or you don't have access."}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/dashboard/user/returns" className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold">
                <FiArrowLeft className="inline mr-1.5" /> Back to Returns
              </Link>
              <Link href="/dashboard/user/orders" className="px-5 py-2.5 border border-border bg-card text-foreground rounded-xl text-xs font-bold">
                View Orders
              </Link>
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const statusKey = ret.status;
  const isTerminal = TERMINAL_STATES.has(statusKey);

  return (
    <DashboardShell
      role="Customer"
      title={`Return #${String(ret.orderId).slice(-8).toUpperCase()}`}
      subtitle="Track your return status, pickup, and refund progress."
      links={userDashboardLinks}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <div className={`rounded-2xl border p-6 shadow-sm ${
          statusKey === "refunded"
            ? "border-emerald-500/30 bg-emerald-500/5"
            : statusKey === "rejected" || statusKey === "refund_failed" || statusKey === "failed"
            ? "border-red-500/30 bg-red-500/5"
            : "border-primary/20 bg-primary/5"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              {ret.productImage && (
                <img
                  src={ret.productImage}
                  alt={ret.productTitle}
                  className="w-16 h-16 rounded-xl object-cover border border-border"
                />
              )}
              <div>
                <h1 className="text-lg font-black text-foreground">{ret.productTitle}</h1>
                <p className="text-xs text-muted mt-1">Quantity: {ret.quantity} × ৳{ret.requestedRefundAmount?.toLocaleString()}</p>
                <p className="text-xs text-muted">Reason: {ret.reason}</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <StatusBadge status={statusKey} />
              <p className="text-[10px] text-muted mt-2">Return ID</p>
              <div className="flex items-center gap-1.5 justify-left sm:justify-end">
                <p className="text-xs font-mono font-bold text-foreground">{ret.id}</p>
                {ret.id && (
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(ret.id)}
                    className="text-muted hover:text-primary transition"
                    title="Copy return ID"
                  >
                    <FiCopy size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live Reverse Delivery Radar */}
        <ReverseDeliveryLiveMapCard returnRequest={ret} />

        {/* Timeline */}
        <Timeline returnRequest={ret} />

        {/* Evidence Gallery */}
        {ret.evidenceUrls?.length > 0 && <EvidenceGallery images={ret.evidenceUrls} />}

        {/* Delivery Partner Info */}
        {ret.deliveryManName && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-muted mb-4 flex items-center gap-1.5">
              <FiTruck className="text-primary" /> Delivery Partner
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-foreground">{ret.deliveryManName}</p>
                <p className="text-xs text-muted mt-0.5">Assigned for reverse pickup</p>
              </div>
              {ret.pickedUpAt && (
                <span className="text-[10px] text-muted">
                  Picked up: {new Date(ret.pickedUpAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Refund Card */}
        <RefundCard returnRequest={ret} />

        {/* Inspection Notes */}
        {ret.inspectionNotes && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-muted mb-2 flex items-center gap-1.5">
              <FiFileText className="text-primary" /> Inspection Notes
            </h3>
            <p className="text-xs text-foreground leading-relaxed">{ret.inspectionNotes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/user/orders"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-border bg-card text-foreground rounded-xl text-xs font-bold hover:bg-muted-bg transition"
          >
            <FiArrowLeft /> Back to Orders
          </Link>
          <Link
            href="/dashboard/user/returns"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition"
          >
            <FiPackage /> All Returns
          </Link>
          <button
            type="button"
            onClick={loadReturn}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-border bg-card text-foreground rounded-xl text-xs font-bold hover:bg-muted-bg transition"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
