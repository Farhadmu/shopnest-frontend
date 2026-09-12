"use client";

import { useEffect, useState } from "react";
import { clientFetch, clientMutation } from "@/lib/core/client";
import { getMyStore } from "@/lib/api/sellers";
import { useSession } from "@/lib/auth-client";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiDollarSign,
  FiFilter,
  FiUser,
} from "react-icons/fi";

const ORDER_STEPS = [
  { key: "confirmed", label: "Accept Order" },
  { key: "processing", label: "Mark Packing" },
  { key: "shipped", label: "Dispatched to Courier" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Mark Delivered" },
];

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const { data: session } = useSession();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const [ordersRes, storeRes] = await Promise.allSettled([
        clientFetch<any[]>("/orders/seller/mine"),
        getMyStore(),
      ]);

      const orderList = ordersRes.status === "fulfilled" ? ((ordersRes.value as any)?.data ?? ordersRes.value ?? []) : [];
      setOrders(orderList);
      if (storeRes.status === "fulfilled") setStoreInfo(storeRes.value);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleAdvanceStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await clientMutation(`/orders/${orderId}/status`, "PATCH", { status: newStatus });
      loadOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const userId = (session?.user as any)?.id;
  const validStoreIds = new Set([
    storeInfo?.id,
    storeInfo?._id,
    storeInfo?.slug,
    storeInfo?.ownerId,
    userId,
  ].filter(Boolean));

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "all") return true;
    return o.status === statusFilter;
  });

  // Calculate seller-specific revenue from store items
  let totalSellerRevenue = 0;
  orders
    .filter((o) => o.status !== "cancelled")
    .forEach((o) => {
      (o.items || []).forEach((it: any) => {
        if (validStoreIds.size === 0 || validStoreIds.has(it.storeId) || validStoreIds.has(it.sellerId)) {
          totalSellerRevenue += (it.price || 0) * (it.quantity || 1);
        }
      });
    });

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Seller Order Management</h1>
          <p className="text-sm text-muted mt-1">
            Track customer orders, advance fulfillment status, and dispatch items to courier.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-card border border-border px-4 py-2.5 rounded-2xl text-right shadow-sm">
            <span className="text-[11px] font-bold text-muted block">Store Realized Revenue</span>
            <span className="text-xl font-black text-primary">৳{totalSellerRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: "all", label: "All Orders", count: orders.length },
          { key: "pending", label: "Pending", count: orders.filter((o) => o.status === "pending").length },
          { key: "confirmed", label: "Confirmed", count: orders.filter((o) => o.status === "confirmed").length },
          { key: "processing", label: "Processing", count: orders.filter((o) => o.status === "processing").length },
          { key: "shipped", label: "Shipped", count: orders.filter((o) => o.status === "shipped").length },
          { key: "delivered", label: "Delivered", count: orders.filter((o) => o.status === "delivered").length },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === tab.key
                ? "bg-primary text-white shadow-sm"
                : "bg-card border border-border text-muted hover:text-foreground"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                statusFilter === tab.key ? "bg-white/20 text-white" : "bg-muted-bg text-muted"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-20 text-center text-muted text-sm animate-pulse">
          Loading store orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-2xl">
            <FiPackage />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            {statusFilter === "all" ? "No Store Orders Yet" : `No ${statusFilter} Orders`}
          </h3>
          <p className="text-xs text-muted">
            When customers purchase your listed items, orders will instantly appear here for fulfillment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((o) => {
            const orderId = String(o._id || o.id);
            const isUpdating = updatingId === orderId;

            // Seller items on this order
            const sellerItems = (o.items || []).filter(
              (it: any) =>
                validStoreIds.size === 0 ||
                validStoreIds.has(it.storeId) ||
                validStoreIds.has(it.sellerId) ||
                !it.storeId
            );

            const displayItems = sellerItems.length > 0 ? sellerItems : (o.items || []);
            const orderSubtotal = displayItems.reduce(
              (sum: number, it: any) => sum + (it.price || 0) * (it.quantity || 1),
              0
            );

            return (
              <div
                key={orderId}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 transition hover:border-primary/30"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">
                      <FiPackage />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-foreground text-sm">
                          Order #{orderId.slice(-8).toUpperCase()}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${
                            o.status === "delivered"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : o.status === "cancelled"
                              ? "bg-red-500/10 text-red-500 border border-red-500/20"
                              : "bg-primary/10 text-primary border border-primary/20"
                          }`}
                        >
                          {o.status.replaceAll("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        {new Date(o.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-xs text-muted block">Store Items Total</span>
                    <span className="text-base font-black text-primary">
                      ৳{orderSubtotal.toLocaleString() || (o.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Shipping info and items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-muted-bg/50 rounded-xl border border-border/40">
                    <p className="font-semibold text-muted mb-1 flex items-center gap-1">
                      <FiMapPin className="text-primary" /> Delivery Destination & Customer
                    </p>
                    <p className="text-foreground font-medium">{o.shippingAddress || "Customer Address On File"}</p>
                    <p className="text-muted mt-1">Payment Method: <strong className="text-foreground uppercase">{o.paymentMethod || "COD"}</strong></p>
                  </div>

                  <div className="p-3 bg-muted-bg/50 rounded-xl border border-border/40">
                    <p className="font-semibold text-muted mb-1 flex items-center gap-1">
                      <FiPackage className="text-primary" /> Store Line Items ({displayItems.length})
                    </p>
                    <div className="space-y-1">
                      {displayItems.map((it: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-foreground">
                          <span className="line-clamp-1">{it.title || `Item #${idx + 1}`} × {it.quantity}</span>
                          <span className="font-black shrink-0">৳{((it.price || 0) * (it.quantity || 1)).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-muted">Update Fulfillment Status:</span>
                  <div className="flex flex-wrap gap-2">
                    {ORDER_STEPS.map((step) => {
                      const isActive = o.status === step.key;
                      return (
                        <button
                          key={step.key}
                          type="button"
                          disabled={isUpdating || isActive}
                          onClick={() => handleAdvanceStatus(orderId, step.key)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isActive
                              ? "bg-emerald-500 text-white cursor-default"
                              : "bg-background border border-border text-foreground hover:bg-primary hover:text-white"
                          }`}
                        >
                          {isActive ? `✓ ${step.label}` : step.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

