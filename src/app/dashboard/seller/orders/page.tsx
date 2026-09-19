"use client";

import { useEffect, useState } from "react";
import { clientFetch, clientMutation } from "@/lib/core/client";
import { getMyStore } from "@/lib/api/sellers";
import { markOrderReadyForPickup, getDeliveryTracking, getSellerActiveDeliveries, DeliveryTrackingResponse, DeliveryRequest } from "@/lib/api/delivery";
import { LiveDeliveryMap } from "@/components/delivery/LiveDeliveryMap";
import { getDeliverySocket } from "@/lib/socket/delivery-socket";
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
  FiCompass,
} from "react-icons/fi";
import { FaMotorcycle, FaBoxOpen, FaTimes } from "react-icons/fa";

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
  const [readyingPickupId, setReadyingPickupId] = useState<string | null>(null);
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const { data: session } = useSession();

  // Seller delivery tracking modal
  const [trackingModalOrder, setTrackingModalOrder] = useState<any | null>(null);
  const [sellerTrackingData, setSellerTrackingData] = useState<DeliveryTrackingResponse | null>(null);
  const [loadingTracking, setLoadingTracking] = useState(false);

  // Multi-Order Live Radar State
  const [sellerActiveDeliveries, setSellerActiveDeliveries] = useState<DeliveryRequest[]>([]);
  const [showLiveRadar, setShowLiveRadar] = useState(true);
  const [sellerGeoLocation, setSellerGeoLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setSellerGeoLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {},
        { timeout: 10000 }
      );
    }
  }, []);

  const handleOpenTrackingModal = async (order: any) => {
    const orderId = String(order._id || order.id);
    setTrackingModalOrder(order);
    setLoadingTracking(true);
    try {
      const data = await getDeliveryTracking(orderId);
      setSellerTrackingData(data);
    } catch {
      setSellerTrackingData(null);
    } finally {
      setLoadingTracking(false);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const [ordersRes, storeRes, deliveriesRes] = await Promise.allSettled([
        clientFetch<any[]>("/orders/seller/mine"),
        getMyStore(),
        getSellerActiveDeliveries(),
      ]);

      const orderList = ordersRes.status === "fulfilled" ? ((ordersRes.value as any)?.data ?? ordersRes.value ?? []) : [];
      setOrders(orderList);
      if (storeRes.status === "fulfilled") setStoreInfo(storeRes.value);
      if (deliveriesRes.status === "fulfilled") setSellerActiveDeliveries(deliveriesRes.value || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    if (typeof window !== "undefined") {
      const socket = getDeliverySocket();
      socket.emit("join:seller_operations");

      const onSellerDeliveryLocation = (payload: {
        deliveryRequestId?: string;
        riderId?: string;
        latitude?: number;
        longitude?: number;
        speed?: number;
        heading?: number;
        accuracy?: number;
        updatedAt?: string;
      }) => {
        if (!payload?.deliveryRequestId || typeof payload.latitude !== "number") return;
        setSellerActiveDeliveries((prev) =>
          prev.map((d: any) => {
            const id = d.id || d._id;
            if (id === payload.deliveryRequestId) {
              return {
                ...d,
                currentLocation: {
                  latitude: payload.latitude,
                  longitude: payload.longitude,
                  speed: payload.speed,
                  heading: payload.heading,
                  accuracy: payload.accuracy,
                  updatedAt: payload.updatedAt || new Date().toISOString(),
                },
              };
            }
            return d;
          })
        );
      };

      const onDeliveryStatusChange = (payload?: {
        deliveryRequestId?: string;
        orderId?: string;
        status?: string;
      }) => {
        if (payload?.status === "delivered" || payload?.status === "cancelled") {
          setSellerActiveDeliveries((prev) =>
            prev.filter(
              (d: any) => (d.id || d._id) !== payload.deliveryRequestId && d.orderId !== payload.orderId
            )
          );
        } else {
          getSellerActiveDeliveries()
            .then((res) => {
              if (res) setSellerActiveDeliveries(res);
            })
            .catch(() => {});
        }
        loadOrders();
      };

      const onDeliveryCompleted = (payload: { deliveryRequestId?: string; orderId?: string }) => {
        setSellerActiveDeliveries((prev) =>
          prev.filter(
            (d: any) => (d.id || d._id) !== payload.deliveryRequestId && d.orderId !== payload.orderId
          )
        );
        loadOrders();
      };

      socket.on("seller:delivery_location", onSellerDeliveryLocation);
      socket.on("seller:delivery_status", onDeliveryStatusChange);
      socket.on("delivery:completed", onDeliveryCompleted);

      const interval = setInterval(() => {
        getSellerActiveDeliveries()
          .then((res) => {
            if (res) setSellerActiveDeliveries(res);
          })
          .catch(() => {});
      }, 15000);

      return () => {
        clearInterval(interval);
        socket.off("seller:delivery_location", onSellerDeliveryLocation);
        socket.off("seller:delivery_status", onDeliveryStatusChange);
        socket.off("delivery:completed", onDeliveryCompleted);
      };
    }
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

  const [pickupModalOrder, setPickupModalOrder] = useState<any | null>(null);
  const [packageWeight, setPackageWeight] = useState("2");
  const [packageDimensions, setPackageDimensions] = useState("Standard");
  const [isFragile, setIsFragile] = useState(false);
  const [pickupNotes, setPickupNotes] = useState("");

  const handleOpenPickupModal = (order: any) => {
    setPickupModalOrder(order);
    setPackageWeight("2");
    setPackageDimensions("Standard");
    setIsFragile(false);
    setPickupNotes("");
  };

  const handleConfirmReadyForPickup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupModalOrder) return;
    const orderId = String(pickupModalOrder._id || pickupModalOrder.id);
    setReadyingPickupId(orderId);
    setNotification(null);
    try {
      await markOrderReadyForPickup(orderId, {
        packageInfo: {
          weight: Number(packageWeight) || 2,
          dimensions: packageDimensions || "Standard",
          fragile: isFragile,
          specialInstructions: isFragile ? "Fragile handling required" : undefined,
        },
        sellerNotes: pickupNotes || "Package is ready for delivery partner pickup at store counter.",
      });
      setNotification({
        type: "success",
        message: `🎉 Order #${orderId.slice(-8).toUpperCase()} (${packageWeight}kg) is now open on the Delivery Marketplace!`,
      });
      setPickupModalOrder(null);
      loadOrders();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err?.message || "Failed to mark order ready for pickup.",
      });
    } finally {
      setReadyingPickupId(null);
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
            Track customer orders, pack items, and dispatch open delivery requests to delivery partners.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-card border border-border px-4 py-2.5 rounded-2xl text-right shadow-sm">
            <span className="text-[11px] font-bold text-muted block">Store Realized Revenue</span>
            <span className="text-xl font-black text-primary">৳{totalSellerRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {notification && (
        <div
          className={`rounded-2xl border p-4 text-xs font-bold flex items-center justify-between gap-3 ${
            notification.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
              : "border-rose-500/30 bg-rose-500/10 text-rose-500"
          }`}
        >
          <span>{notification.message}</span>
          <button type="button" onClick={() => setNotification(null)} className="text-muted hover:text-foreground text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Store Active Logistics Radar */}
      {sellerActiveDeliveries.length > 0 && (
        <div className="rounded-2xl border border-primary/30 bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaMotorcycle className="text-primary text-base" />
              <h3 className="text-sm font-black text-foreground">
                Store Active Logistics Radar ({sellerActiveDeliveries.length} Active Missions)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                🟢 Live Real-Time Telemetry
              </span>
              <button
                type="button"
                onClick={() => setShowLiveRadar(!showLiveRadar)}
                className="px-3 py-1 bg-surface border border-border text-foreground text-xs font-bold rounded-lg hover:border-primary transition cursor-pointer"
              >
                {showLiveRadar ? "Hide Map" : "Show Map"}
              </button>
            </div>
          </div>

          {showLiveRadar && (
            <div className="space-y-3">
              <p className="text-xs text-muted">
                Displaying genuine GPS dispatch telemetry for your store orders across Bangladesh. Pickups (📦) and Customer Dropoffs (🏠) are scoped strictly to your store.
              </p>
              <LiveDeliveryMap
                multiDeliveries={sellerActiveDeliveries.map((d: any) => ({
                  id: d.id || d._id,
                  orderId: d.orderId,
                  pickupAddress: d.pickupAddress || storeInfo?.name || "Merchant Store",
                  deliveryAddress: d.deliveryAddress,
                  pickupCoordinates: d.pickupCoordinates,
                  deliveryCoordinates: d.deliveryCoordinates,
                  currentLocation: d.currentLocation,
                  assignedRider: d.assignedRider,
                  status: d.status,
                  riderName: d.assignedRider?.name,
                  riderPhone: d.assignedRider?.phone,
                }))}
                sellerLocation={sellerGeoLocation}
                storeLocation={storeInfo?.location ? { latitude: storeInfo.location.latitude, longitude: storeInfo.location.longitude } : null}
                trackingState="LIVE"
                height="h-80 sm:h-96"
                showFilterBar={true}
              />
            </div>
          )}
        </div>
      )}

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
            const isReadying = readyingPickupId === orderId;

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

                  <div className="flex items-center gap-4 sm:text-right">
                    <div>
                      <span className="text-xs text-muted block">Store Items Total</span>
                      <span className="text-base font-black text-primary">
                        ৳{orderSubtotal.toLocaleString() || (o.totalAmount || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* READY FOR PICKUP & TRACK COURIER BUTTONS */}
                    <div className="flex items-center gap-2">
                      {(o.status === "confirmed" || o.status === "processing") && (
                        <button
                          type="button"
                          onClick={() => handleOpenPickupModal(o)}
                          disabled={isReadying}
                          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-black text-white hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
                        >
                          <FaMotorcycle size={12} />
                          <span>{isReadying ? "Dispatching..." : "Ready for Pickup"}</span>
                        </button>
                      )}

                      {["shipped", "out_for_delivery", "delivered", "picked_up", "in_transit"].includes(o.status) && (
                        <button
                          type="button"
                          onClick={() => handleOpenTrackingModal(o)}
                          className="flex items-center gap-1.5 rounded-xl bg-card border border-primary/40 px-3.5 py-2 text-xs font-bold text-primary hover:bg-primary/10 transition cursor-pointer"
                        >
                          <FiCompass size={12} />
                          <span>Track Delivery</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping info and items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-muted-bg/50 rounded-xl border border-border/40">
                    <p className="font-semibold text-muted mb-1 flex items-center gap-1">
                      <FiMapPin className="text-primary" /> Delivery Destination & Customer
                    </p>
                    <p className="text-foreground font-medium">{o.shippingAddress || "Customer Address On File"}</p>
                    <p className="text-muted mt-1">
                      Payment Method: <strong className="text-foreground uppercase">{o.paymentMethod || "COD"}</strong>
                    </p>
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
                  <span className="text-xs font-semibold text-muted">Advance Fulfillment Status:</span>
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

      {/* ─── READY FOR PICKUP / PACKAGE SPECS MODAL ───────────────────────── */}
      {pickupModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <FaMotorcycle className="text-emerald-500" /> Dispatch to Open Marketplace
              </h3>
              <button
                type="button"
                onClick={() => setPickupModalOrder(null)}
                className="text-muted hover:text-foreground cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted">
              Configure package specifications for Order <strong>#{String(pickupModalOrder._id || pickupModalOrder.id).slice(-8).toUpperCase()}</strong> to list it on the delivery marketplace.
            </p>

            <form onSubmit={handleConfirmReadyForPickup} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Estimated Package Weight (kg)
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="100"
                  step="0.1"
                  value={packageWeight}
                  onChange={(e) => setPackageWeight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted-bg border border-border text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
                <span className="text-[10px] text-muted mt-1 block">
                  Used by the rider capacity engine to prevent vehicle overload.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Parcel Dimensions / Size
                </label>
                <input
                  type="text"
                  value={packageDimensions}
                  onChange={(e) => setPackageDimensions(e.target.value)}
                  placeholder="e.g. Small box (20x15x10cm), Standard bag"
                  className="w-full px-3 py-2 rounded-xl bg-muted-bg border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="fragileCheck"
                  checked={isFragile}
                  onChange={(e) => setIsFragile(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="fragileCheck" className="text-xs font-semibold text-foreground cursor-pointer">
                  ⚠️ Fragile / Handle with Extra Care
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Pickup Instructions for Courier (Optional)
                </label>
                <textarea
                  rows={2}
                  value={pickupNotes}
                  onChange={(e) => setPickupNotes(e.target.value)}
                  placeholder="e.g. Items packed at 2nd floor desk. Ask for Manager."
                  className="w-full px-3 py-2 rounded-xl bg-muted-bg border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setPickupModalOrder(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:bg-muted-bg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={readyingPickupId !== null}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs shadow-md hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 cursor-pointer"
                >
                  {readyingPickupId !== null ? "Listing..." : "Confirm & List for Couriers"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* SELLER LIVE DELIVERY TRACKING MODAL */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FaMotorcycle className="text-primary text-base" />
                <h3 className="text-base font-black text-foreground">
                  Order #{String(trackingModalOrder._id || trackingModalOrder.id).slice(-8).toUpperCase()} Live Tracking
                </h3>
              </div>
              <button
                onClick={() => {
                  setTrackingModalOrder(null);
                  setSellerTrackingData(null);
                }}
                className="text-muted hover:text-foreground cursor-pointer text-sm font-bold"
              >
                <FaTimes />
              </button>
            </div>

            {loadingTracking ? (
              <div className="py-12 text-center text-muted text-xs">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Loading realtime logistics telemetry...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <LiveDeliveryMap
                  pickupAddress={sellerTrackingData?.pickupAddress || storeInfo?.name || "Seller Store"}
                  deliveryAddress={sellerTrackingData?.deliveryAddress || trackingModalOrder.shippingAddress}
                  pickupCoordinates={sellerTrackingData?.pickupCoordinates}
                  deliveryCoordinates={sellerTrackingData?.deliveryCoordinates}
                  orderId={String(trackingModalOrder._id || trackingModalOrder.id)}
                  riderName={sellerTrackingData?.assignedRider?.name || "Assigned Courier"}
                  status={sellerTrackingData?.status || trackingModalOrder.status}
                  trackingState={sellerTrackingData?.isLiveTrackingActive ? "LIVE" : "LOCATION_UNAVAILABLE"}
                  riderLocation={sellerTrackingData?.currentLocation ? {
                    latitude: sellerTrackingData.currentLocation.latitude,
                    longitude: sellerTrackingData.currentLocation.longitude,
                    updatedAt: sellerTrackingData.currentLocation.updatedAt || new Date().toISOString(),
                  } : null}
                  height="h-72"
                />

                {sellerTrackingData?.assignedRider && (
                  <div className="flex items-center justify-between p-3 bg-muted-bg/50 rounded-xl border border-border/50 text-xs">
                    <div>
                      <span className="text-muted block text-[10px] uppercase font-bold">Assigned Courier</span>
                      <span className="font-bold text-foreground">{sellerTrackingData.assignedRider.name}</span>
                      <span className="text-muted text-[11px] ml-2">({sellerTrackingData.assignedRider.vehicleType})</span>
                    </div>
                    {sellerTrackingData.assignedRider.phone && (
                      <a
                        href={`tel:${sellerTrackingData.assignedRider.phone}`}
                        className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-sm hover:bg-emerald-600 transition"
                      >
                        Call Rider
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
