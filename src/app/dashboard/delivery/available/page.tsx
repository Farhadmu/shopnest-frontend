"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { deliveryManDashboardLinks } from "@/lib/constants/dashboard-nav";
import { getAvailableDeliveries, acceptDelivery, type DeliveryRequest } from "@/lib/api/delivery";
import {
  FaSyncAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaBox,
  FaCompass,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationCircle,
  FaFilter,
  FaMotorcycle,
} from "react-icons/fa";

export default function AvailableDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [zoneFilter, setZoneFilter] = useState<string>("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAvailableDeliveries(1, 50, zoneFilter || undefined);
      setDeliveries(res?.items ?? res?.data ?? []);
    } catch (error) {
      console.error("Failed to load deliveries:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [zoneFilter]);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDeliveries();
  };

  const handleAccept = async (id: string) => {
    setAcceptingId(id);
    setNotification(null);
    try {
      const res = await acceptDelivery(id);
      setNotification({
        type: "success",
        message: `🎉 Mission accepted! Order #${res.deliveryRequest?.orderId?.slice(-8)?.toUpperCase() || id.slice(-8)}. Proceed to pickup.`,
      });
      // Remove accepted job from available list
      setDeliveries((prev) => prev.filter((d) => d.id !== id));
    } catch (error: any) {
      const isConflict = error?.status === 409 || error?.message?.includes("already been accepted");
      setNotification({
        type: "error",
        message: isConflict
          ? "⚡ Another delivery partner just claimed this mission. Refreshing marketplace..."
          : error?.message || "Failed to accept delivery mission.",
      });
      loadDeliveries();
    } finally {
      setAcceptingId(null);
    }
  };

  const filteredDeliveries = deliveries.filter((d) => {
    if (priorityFilter === "all") return true;
    return d.priority === priorityFilter;
  });

  return (
    <DashboardShell
      role="Delivery Man"
      title="Open Delivery Marketplace"
      subtitle="Browse open merchant pickup dispatches and claim delivery jobs in real-time."
      links={deliveryManDashboardLinks}
    >
      <div className="space-y-6">
        {/* Notification Banner */}
        {notification && (
          <div
            className={`rounded-2xl border p-4 text-xs font-bold flex items-center justify-between gap-3 ${
              notification.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                : "border-rose-500/30 bg-rose-500/10 text-rose-500"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? <FaCheckCircle className="text-base" /> : <FaExclamationCircle className="text-base" />}
              <span>{notification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-muted hover:text-foreground text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-muted flex items-center gap-1">
              <FaFilter size={10} /> Priority:
            </span>
            {["all", "urgent", "high", "normal"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriorityFilter(p)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer capitalize ${
                  priorityFilter === p
                    ? "bg-primary text-white"
                    : "border border-border bg-surface text-muted hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Filter by zone (e.g. Gulshan, Dhanmondi)..."
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="rounded-xl border border-border bg-background px-3.5 py-1.5 text-xs text-foreground focus:border-primary outline-none"
            />

            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-bold text-foreground hover:border-primary transition cursor-pointer"
            >
              <FaSyncAlt className={`text-primary ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl border border-border bg-surface/50" />
            ))}
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <Panel>
            <div className="py-16 text-center">
              <FaMotorcycle className="mx-auto text-4xl text-muted/40 mb-3" />
              <h3 className="text-base font-bold text-foreground mb-1">No Open Deliveries Found</h3>
              <p className="text-xs text-muted max-w-md mx-auto">
                All customer orders in this zone have already been claimed by riders or are still being processed by merchants.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover transition cursor-pointer"
                >
                  Refresh Marketplace
                </button>
                <Link
                  href="/dashboard/delivery/my-deliveries"
                  className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-foreground hover:border-primary transition"
                >
                  View My Assigned Jobs
                </Link>
              </div>
            </div>
          </Panel>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 transition hover:border-primary/50 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-foreground text-sm">
                        Order #{delivery.orderId.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                          delivery.priority === "urgent"
                            ? "bg-rose-500/10 text-rose-500 border border-rose-500/30"
                            : delivery.priority === "high"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                        }`}
                      >
                        {delivery.priority}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-muted block">Payout</span>
                      <span className="text-base font-black text-emerald-500">৳{delivery.deliveryFee ?? 60}</span>
                    </div>
                  </div>

                  {/* Smart Ranking Telemetry Pills */}
                  {(delivery.ranking?.pickupDistanceKm != null || delivery.ranking?.estimatedTravelMinutes != null || delivery.ranking?.routeCompatibility) && (
                    <div className="flex flex-wrap gap-1.5 my-2">
                      {delivery.ranking?.pickupDistanceKm != null && (
                        <span className="rounded-lg bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                          📍 {delivery.ranking.pickupDistanceKm} km to pickup
                        </span>
                      )}
                      {delivery.ranking?.estimatedTravelMinutes != null && (
                        <span className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                          ⏱️ ~{delivery.ranking.estimatedTravelMinutes} min trip
                        </span>
                      )}
                      {delivery.ranking?.routeCompatibility === "high_overlap" && (
                        <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                          ✨ On Your Current Way
                        </span>
                      )}
                      {delivery.ranking?.fitsCapacity === false && (
                        <span className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-500">
                          ⚠️ Exceeds Capacity
                        </span>
                      )}
                    </div>
                  )}

                  {/* Route details */}
                  <div className="space-y-2.5 my-3 text-xs">
                    <div className="flex items-start gap-2">
                      <FaMapMarkerAlt className="text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold text-muted uppercase block">Pickup From Merchant</span>
                        <p className="font-semibold text-foreground line-clamp-2">
                          {delivery.pickupAddress || "Merchant Store Location"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <FaCompass className="text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold text-muted uppercase block">Deliver To Customer</span>
                        <p className="font-semibold text-foreground line-clamp-2">
                          {delivery.deliveryAddress || "Customer Delivery Address"}
                        </p>
                      </div>
                    </div>

                    {delivery.packageInfo?.fragile && (
                      <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-[11px] font-bold text-rose-500 flex items-center gap-1.5">
                        <span>⚠️ Fragile Item: Handle with extra care</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer and Actions */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-muted">
                    Est. Distance: <strong>{delivery.estimatedDistance ?? "3.5"} km</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/delivery/requests/${delivery.id}`}
                      className="rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold text-foreground hover:border-primary transition"
                    >
                      Inspect
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleAccept(delivery.id)}
                      disabled={acceptingId === delivery.id}
                      className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-black text-white hover:bg-primary-hover shadow-md shadow-primary/20 transition cursor-pointer disabled:opacity-50"
                    >
                      <FaMotorcycle size={11} />
                      <span>{acceptingId === delivery.id ? "Claiming..." : "Accept Job"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
