"use client";

import { useEffect, useState } from "react";
import { clientFetch, clientMutation } from "@/lib/core/client";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiDollarSign,
  FiSearch,
  FiFilter,
  FiAlertTriangle,
  FiClock,
} from "react-icons/fi";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = () => {
    setLoading(true);
    clientFetch<any[]>("/orders/admin/all")
      .then((r) => setOrders((r as any).data ?? r ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
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

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const orderId = String(o._id || o.id || "").toLowerCase();
    const address = String(o.shippingAddress || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || orderId.includes(query) || address.includes(query);
    return matchesStatus && matchesSearch;
  });

  const totalGMV = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Platform Orders & Governance
          </h1>
          <p className="text-sm text-muted mt-1">
            Global marketplace order supervision, transaction monitoring, and dispute triage.
          </p>
        </div>
      </div>

      {/* KPI Cards (Computed strictly from real orders) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-muted">Total GMV Transacted</span>
          <p className="text-2xl font-black text-primary mt-1">৳{totalGMV.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-muted">Total Platform Orders</span>
          <p className="text-2xl font-black text-foreground mt-1">{orders.length}</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-muted">Pending Fulfillment</span>
          <p className="text-2xl font-black text-amber-500 mt-1">{pendingOrders}</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-muted">Successfully Delivered</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">{deliveredOrders}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm" />
          <input
            type="text"
            placeholder="Search orders by ID, address, or customer details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                statusFilter === status
                  ? "bg-primary text-white shadow-sm"
                  : "bg-card border border-border text-muted hover:text-foreground"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="py-20 text-center text-muted text-sm animate-pulse">
          Loading platform order transactions...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-2xl">
            <FiPackage />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            {orders.length === 0 ? "No Platform Orders Recorded Yet" : "No Orders Match Your Filter"}
          </h3>
          <p className="text-xs text-muted">
            All customer checkouts and transactions across all stores will appear here live in real-time.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((o) => {
            const orderId = String(o._id || o.id);
            const isUpdating = updatingId === orderId;

            return (
              <div
                key={orderId}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">
                      <FiPackage />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">
                          Order #{orderId.slice(-8).toUpperCase()}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
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
                        Customer ID: {o.userId?.slice(-6) || "N/A"} • Placed {new Date(o.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-xs text-muted block">Transaction Amount</span>
                    <span className="text-base font-black text-primary">৳{o.totalAmount?.toLocaleString() || "0"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-muted-bg/50 rounded-xl border border-border/40">
                    <p className="font-semibold text-muted mb-1">Delivery Address & Payment Method</p>
                    <p className="text-foreground font-medium">{o.shippingAddress}</p>
                    <p className="text-muted mt-1">Payment: <strong className="text-foreground uppercase">{o.paymentMethod || "COD"}</strong></p>
                  </div>

                  <div className="p-3 bg-muted-bg/50 rounded-xl border border-border/40">
                    <p className="font-semibold text-muted mb-1">Purchased Products ({o.items?.length || 0})</p>
                    <div className="space-y-1">
                      {(o.items || []).map((it: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-foreground">
                          <span className="line-clamp-1">{it.title || `Item #${idx + 1}`} × {it.quantity}</span>
                          <span className="font-semibold shrink-0">৳{(it.price * it.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Admin Status Override */}
                <div className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-muted">Admin Override Action:</span>
                  <div className="flex flex-wrap gap-2">
                    {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((st) => (
                      <button
                        key={st}
                        disabled={isUpdating || o.status === st}
                        onClick={() => handleUpdateStatus(orderId, st)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                          o.status === st
                            ? "bg-primary text-white"
                            : "bg-background border border-border text-muted hover:text-foreground"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
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
