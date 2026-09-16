"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { deliveryManDashboardLinks } from "@/lib/constants/dashboard-nav";
import {
  getMyDeliveries,
  updateDeliveryStatus,
  verifyDeliveryOtp,
  type DeliveryRequest,
} from "@/lib/api/delivery";
import {
  FaSyncAlt,
  FaBox,
  FaMapPin,
  FaStar,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMotorcycle,
  FaKey,
  FaArrowRight,
  FaCompass,
  FaFilter,
} from "react-icons/fa";

const STATUS_FLOW = [
  { key: "assigned", label: "Assigned" },
  { key: "pickup_started", label: "Heading to Store" },
  { key: "picked_up", label: "Items Picked Up" },
  { key: "in_transit", label: "In Transit" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

export default function MyDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "active" | "completed" | "failed">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // OTP Modal
  const [otpModalDelivery, setOtpModalDelivery] = useState<DeliveryRequest | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpVerifying, setOtpVerifying] = useState(false);

  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyDeliveries({ limit: 100 });
      setDeliveries(res?.items ?? res?.data ?? []);
    } catch (error) {
      console.error("Failed to load deliveries:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDeliveries();
  };

  const handleStatusUpdate = async (id: string, status: DeliveryRequest["status"]) => {
    setUpdatingId(id);
    try {
      await updateDeliveryStatus(id, status);
      await loadDeliveries();
    } catch (error: any) {
      alert(error?.message || "Failed to update mission status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleVerifyOtpSubmit = async () => {
    if (!otpModalDelivery || !otpInput.trim()) return;
    setOtpVerifying(true);
    setOtpError(null);
    try {
      await verifyDeliveryOtp(otpModalDelivery.id, otpInput.trim());
      alert("✅ OTP verified successfully! Order marked as DELIVERED.");
      setOtpModalDelivery(null);
      setOtpInput("");
      await loadDeliveries();
    } catch (err: any) {
      setOtpError(err?.message || "Invalid OTP code. Please verify with customer.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const isActiveDelivery = (status: string) =>
    ["assigned", "pickup_started", "picked_up", "in_transit", "out_for_delivery"].includes(status);

  const filteredDeliveries = deliveries.filter((d) => {
    if (filterTab === "active") return isActiveDelivery(d.status);
    if (filterTab === "completed") return d.status === "delivered";
    if (filterTab === "failed") return ["failed", "cancelled", "rescheduled"].includes(d.status);
    return true;
  });

  // Calculate stats from actual DB records
  const totalEarned = deliveries
    .filter((d) => d.status === "delivered")
    .reduce((acc, d) => acc + (d.deliveryFee ?? 60), 0);
  const activeCount = deliveries.filter((d) => isActiveDelivery(d.status)).length;
  const completedCount = deliveries.filter((d) => d.status === "delivered").length;

  return (
    <DashboardShell
      role="Delivery Man"
      title="My Deliveries & Missions"
      subtitle="Track your active route dispatches, verify customer handovers, and review completed orders."
      links={deliveryManDashboardLinks}
    >
      <div className="space-y-6">
        {/* Performance & Filter Header */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <span className="text-[11px] font-bold text-muted uppercase block">Active Missions</span>
            <span className="text-2xl font-black text-primary">{activeCount}</span>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <span className="text-[11px] font-bold text-muted uppercase block">Completed Deliveries</span>
            <span className="text-2xl font-black text-emerald-500">{completedCount}</span>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <span className="text-[11px] font-bold text-muted uppercase block">Total Payout Realized</span>
            <span className="text-2xl font-black text-foreground">৳{totalEarned.toLocaleString()}</span>
          </div>
        </div>

        {/* Tab Controls & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: "all", label: "All Missions", count: deliveries.length },
              { key: "active", label: "Active", count: activeCount },
              { key: "completed", label: "Completed", count: completedCount },
              { key: "failed", label: "Issues / Failed", count: deliveries.filter((d) => ["failed", "cancelled"].includes(d.status)).length },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterTab(tab.key as any)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  filterTab === tab.key
                    ? "bg-primary text-white shadow-sm"
                    : "border border-border bg-surface text-muted hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                    filterTab === tab.key ? "bg-white/20 text-white" : "bg-muted-bg text-muted"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-bold text-foreground hover:border-primary transition cursor-pointer"
            >
              <FaSyncAlt className={`text-primary ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/dashboard/delivery/available"
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-md shadow-primary/20 transition"
            >
              <FaMotorcycle size={11} />
              <span>Claim New Job</span>
            </Link>
          </div>
        </div>

        {/* Deliveries List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl border border-border bg-surface/50" />
            ))}
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <Panel>
            <div className="py-16 text-center">
              <FaBox className="mx-auto text-4xl text-muted/40 mb-3" />
              <h3 className="text-base font-bold text-foreground mb-1">No Missions Found</h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                {filterTab === "active"
                  ? "You have no active deliveries right now. Check the open marketplace to accept jobs."
                  : "No delivery records match the selected filter."}
              </p>
              <Link
                href="/dashboard/delivery/available"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover transition"
              >
                <FaMotorcycle size={11} />
                <span>Browse Marketplace</span>
              </Link>
            </div>
          </Panel>
        ) : (
          <div className="space-y-5">
            {filteredDeliveries.map((delivery) => {
              const currentStepIdx = STATUS_FLOW.findIndex((s) => s.key === delivery.status);
              const isCompleted = delivery.status === "delivered";
              const isFailed = ["failed", "cancelled"].includes(delivery.status);

              return (
                <div
                  key={delivery.id}
                  className={`rounded-2xl border bg-card p-5 shadow-sm space-y-4 transition ${
                    isActiveDelivery(delivery.status)
                      ? "border-primary/40 ring-2 ring-primary/5"
                      : "border-border"
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${
                          isCompleted
                            ? "bg-emerald-500/10 text-emerald-500"
                            : isFailed
                            ? "bg-rose-500/10 text-rose-500"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <FaMotorcycle />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-foreground text-sm">
                            Order #{delivery.orderId.slice(-8).toUpperCase()}
                          </span>
                          <span
                            className={`rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase ${
                              isCompleted
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                : isFailed
                                ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                : "bg-primary/10 text-primary border border-primary/20"
                            }`}
                          >
                            {delivery.status.replace(/_/g, " ")}
                          </span>
                          {delivery.priority === "urgent" && (
                            <span className="rounded-md bg-rose-500/10 text-rose-500 px-2 py-0.5 text-[10px] font-bold border border-rose-500/20">
                              URGENT
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted mt-0.5">
                          Assigned: {new Date(delivery.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:text-right">
                      <div>
                        <span className="text-[10px] text-muted block">Delivery Fee</span>
                        <span className="text-base font-black text-emerald-500">৳{delivery.deliveryFee ?? 60}</span>
                      </div>
                      <Link
                        href={`/dashboard/delivery/requests/${delivery.id}`}
                        className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-foreground hover:border-primary transition"
                      >
                        Mission Details →
                      </Link>
                    </div>
                  </div>

                  {/* Address Summary */}
                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    <div className="rounded-xl bg-surface/50 border border-border/40 p-3">
                      <span className="text-muted block text-[10px] font-bold uppercase mb-1 flex items-center gap-1">
                        <FaMapPin className="text-amber-500" /> Pickup (Seller)
                      </span>
                      <p className="font-semibold text-foreground line-clamp-2">
                        {delivery.pickupAddress || "Merchant Store Location"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-surface/50 border border-border/40 p-3">
                      <span className="text-muted block text-[10px] font-bold uppercase mb-1 flex items-center gap-1">
                        <FaCompass className="text-emerald-500" /> Delivery Destination
                      </span>
                      <p className="font-semibold text-foreground line-clamp-2">
                        {delivery.deliveryAddress || "Customer Delivery Address"}
                      </p>
                    </div>
                  </div>

                  {/* Lifecycle Stepper */}
                  <div className="pt-2">
                    <div className="grid grid-cols-6 gap-2 text-center text-[10px]">
                      {STATUS_FLOW.map((step, idx) => {
                        const isPast = currentStepIdx >= idx;
                        const isCurrent = currentStepIdx === idx;

                        return (
                          <div key={step.key} className="flex flex-col items-center">
                            <div
                              className={`flex h-6 w-6 items-center justify-center rounded-full font-black text-xs transition ${
                                isPast
                                  ? isCurrent
                                    ? "bg-primary text-white ring-2 ring-primary/30"
                                    : "bg-emerald-500 text-white"
                                  : "bg-muted-bg text-muted border border-border"
                              }`}
                            >
                              {isPast && !isCurrent ? "✓" : idx + 1}
                            </div>
                            <span
                              className={`mt-1 font-bold truncate max-w-full ${
                                isCurrent ? "text-primary" : isPast ? "text-foreground" : "text-muted"
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Bar */}
                  {isActiveDelivery(delivery.status) && (
                    <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs font-bold text-muted">Advance Mission Status:</span>

                      <div className="flex flex-wrap items-center gap-2">
                        {delivery.status === "assigned" && (
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(delivery.id, "pickup_started")}
                            disabled={updatingId === delivery.id}
                            className="rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white hover:bg-primary-hover transition cursor-pointer"
                          >
                            🚀 Start Heading to Store
                          </button>
                        )}

                        {delivery.status === "pickup_started" && (
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(delivery.id, "picked_up")}
                            disabled={updatingId === delivery.id}
                            className="rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white hover:bg-primary-hover transition cursor-pointer"
                          >
                            📦 Confirm Items Picked Up
                          </button>
                        )}

                        {delivery.status === "picked_up" && (
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(delivery.id, "in_transit")}
                            disabled={updatingId === delivery.id}
                            className="rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white hover:bg-primary-hover transition cursor-pointer"
                          >
                            🚚 Mark In Transit to Customer
                          </button>
                        )}

                        {delivery.status === "in_transit" && (
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(delivery.id, "out_for_delivery")}
                            disabled={updatingId === delivery.id}
                            className="rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white hover:bg-primary-hover transition cursor-pointer"
                          >
                            📍 Arrived (Out for Delivery)
                          </button>
                        )}

                        {delivery.status === "out_for_delivery" && (
                          <button
                            type="button"
                            onClick={() => {
                              setOtpModalDelivery(delivery);
                              setOtpInput("");
                              setOtpError(null);
                            }}
                            className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center gap-1.5"
                          >
                            <FaKey size={11} />
                            <span>Verify Customer OTP & Deliver</span>
                          </button>
                        )}

                        <Link
                          href={`/dashboard/delivery/incidents?deliveryId=${delivery.id}`}
                          className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/20 transition"
                        >
                          Report Issue
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Failure notes if any */}
                  {delivery.deliveryFailedReason && (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-500 flex items-center gap-2">
                      <FaExclamationTriangle />
                      <span>Issue Note: {delivery.deliveryFailedReason}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* OTP Verification Modal */}
      {otpModalDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground font-black text-base">
                <FaKey className="text-primary" />
                <span>Verify Delivery OTP</span>
              </div>
              <button
                type="button"
                onClick={() => setOtpModalDelivery(null)}
                className="text-muted hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted">
              Enter the 6-digit confirmation OTP given by the customer upon handover for Order #{otpModalDelivery.orderId.slice(-8).toUpperCase()}.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground">Customer 6-Digit OTP</label>
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full text-center tracking-widest text-2xl font-black py-3 rounded-xl border border-border bg-background text-foreground focus:border-primary outline-none"
              />
            </div>

            {otpError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold">
                {otpError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOtpModalDelivery(null)}
                className="px-4 py-2 text-xs font-bold text-muted hover:text-foreground rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyOtpSubmit}
                disabled={otpVerifying || otpInput.length < 6}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-black hover:bg-emerald-600 transition disabled:opacity-50"
              >
                {otpVerifying ? "Verifying..." : "Confirm Delivery Handover"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
