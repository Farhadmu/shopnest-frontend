"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { deliveryManDashboardLinks } from "@/lib/constants/dashboard-nav";
import {
  getAvailableReverseDeliveries,
  getMyReverseDeliveries,
  acceptReverseDelivery,
  type ReverseDeliveryRequest,
} from "@/lib/api/delivery";
import {
  startReversePickup,
  completeReversePickup,
} from "@/lib/api/returns";
import {
  FiArrowLeft,
  FiPackage,
  FiMapPin,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiRefreshCw,
  FiFilter,
  FiUpload,
} from "react-icons/fi";
import { FaMotorcycle } from "react-icons/fa";

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  available: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20", label: "Available" },
  assigned: { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/20", label: "Assigned" },
  accepted: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/20", label: "Accepted" },
  pickup_started: { bg: "bg-indigo-500/10", text: "text-indigo-600", border: "border-indigo-500/20", label: "Pickup Started" },
  picked_up: { bg: "bg-teal-500/10", text: "text-teal-600", border: "border-teal-500/20", label: "Picked Up" },
  in_transit: { bg: "bg-orange-500/10", text: "text-orange-600", border: "border-orange-500/20", label: "In Transit" },
  seller_received: { bg: "bg-pink-500/10", text: "text-pink-600", border: "border-pink-500/20", label: "Delivered" },
  failed: { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/20", label: "Failed" },
  cancelled: { bg: "bg-gray-500/10", text: "text-gray-600", border: "border-gray-500/20", label: "Cancelled" },
};

export default function DeliveryReturnsPage() {
  const [tab, setTab] = useState<"available" | "my">("available");
  const [items, setItems] = useState<ReverseDeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadItems = async () => {
    setLoading(true);
    try {
      if (tab === "available") {
        const data = await getAvailableReverseDeliveries();
        setItems(data || []);
      } else {
        const data = await getMyReverseDeliveries();
        setItems(data || []);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [tab]);

  const handleAccept = async (id: string) => {
    setActioningId(id);
    setNotification(null);
    try {
      const res = await acceptReverseDelivery(id);
      setNotification({ type: "success", message: "Reverse delivery accepted! Check My Deliveries." });
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err: any) {
      const isConflict = err?.status === 409 || err?.message?.includes("already been accepted");
      setNotification({
        type: "error",
        message: isConflict ? "Another rider just claimed this. Refreshing..." : err?.message || "Failed to accept.",
      });
      loadItems();
    } finally {
      setActioningId(null);
    }
  };

  return (
    <DashboardShell
      role="Delivery Man"
      title="Reverse Deliveries"
      subtitle="Pick up returned items from customers and deliver them to sellers."
      links={deliveryManDashboardLinks}
    >
      <div className="space-y-6">
        {/* Notification */}
        {notification && (
          <div className={`rounded-2xl border p-4 text-xs font-bold flex items-center justify-between gap-3 ${
            notification.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
              : "border-rose-500/30 bg-rose-500/10 text-rose-500"
          }`}>
            <span>{notification.message}</span>
            <button type="button" onClick={() => setNotification(null)} className="text-muted hover:text-foreground">✕</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab("available")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              tab === "available"
                ? "bg-primary text-white shadow-md"
                : "border border-border bg-surface text-muted hover:text-foreground"
            }`}
          >
            Available ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("my")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              tab === "my"
                ? "bg-primary text-white shadow-md"
                : "border border-border bg-surface text-muted hover:text-foreground"
            }`}
          >
            My Reverse Deliveries
          </button>
          <button
            type="button"
            onClick={loadItems}
            className="ml-auto rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-bold text-foreground hover:border-primary transition cursor-pointer"
          >
            <FiRefreshCw className="inline mr-1" /> Refresh
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl border border-border bg-surface/50" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Panel>
            <div className="py-16 text-center">
               <FaMotorcycle className="mx-auto text-4xl text-muted/40 mb-3" />
              <h3 className="text-base font-bold text-foreground mb-1">
                {tab === "available" ? "No Open Reverse Deliveries" : "No Active Reverse Deliveries"}
              </h3>
              <p className="text-xs text-muted max-w-md mx-auto">
                {tab === "available"
                  ? "All customer return pickups have been claimed by other riders."
                  : "You haven't accepted any reverse delivery requests yet."}
              </p>
            </div>
          </Panel>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => {
              const style = STATUS_STYLES[item.status] || STATUS_STYLES.available;
              return (
                <div key={item.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="font-black text-foreground text-sm">
                        #{String(item.orderId).slice(-8).toUpperCase()}
                      </span>
                      <p className="text-[11px] text-muted mt-0.5">{item.productTitle}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}>
                      {style.label}
                    </span>
                  </div>
                  <div className="text-xs text-muted space-y-1">
                    <p className="flex items-center gap-1"><FiMapPin className="text-primary" /> Pickup: {item.customerAddress}</p>
                    <p className="flex items-center gap-1"><FiMapPin className="text-primary" /> Deliver to: {item.sellerAddress}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {tab === "available" && item.status === "available" && (
                      <button
                        type="button"
                        onClick={() => handleAccept(item.id)}
                        disabled={actioningId === item.id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-black hover:bg-primary-hover transition disabled:opacity-50 cursor-pointer"
                      >
                        <FiCheckCircle /> Accept
                      </button>
                    )}
                    {tab === "my" && item.status === "assigned" && (
                      <Link
                        href={`/dashboard/delivery/returns/${item.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-black hover:bg-primary-hover transition"
                      >
                          <FaMotorcycle /> View Mission
                      </Link>
                    )}
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
