"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOrders, Order } from "@/lib/api/orders";
import {
  FiPackage,
  FiShoppingBag,
  FiArrowRight,
} from "react-icons/fi";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    getOrders()
      .then((data) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "all") return true;
    return o.status === statusFilter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Order History</h1>
          <p className="text-sm text-muted mt-1">
            Track real-time delivery milestones, receipts, and order statuses.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-sm"
        >
          <FiShoppingBag /> Browse Catalog
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { key: "all", label: "All Orders", count: orders.length },
          { key: "pending", label: "Pending", count: orders.filter((o) => o.status === "pending").length },
          { key: "processing", label: "Processing", count: orders.filter((o) => o.status === "processing").length },
          { key: "shipped", label: "Shipped", count: orders.filter((o) => o.status === "shipped").length },
          { key: "delivered", label: "Delivered", count: orders.filter((o) => o.status === "delivered").length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === tab.key
                ? "bg-primary text-white shadow-sm"
                : "bg-card border border-border text-muted hover:text-foreground"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === tab.key ? "bg-white/20 text-white" : "bg-muted-bg text-muted"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted text-sm animate-pulse">
          Loading your verified order records...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-2xl">
            <FiPackage />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            {statusFilter === "all" ? "No Orders Placed Yet" : `No ${statusFilter} Orders`}
          </h3>
          <p className="text-xs text-muted mb-6">
            Explore authentic products from verified sellers and enjoy fast nationwide delivery.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors"
          >
            Start Shopping Now <FiArrowRight />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((o) => (
            <Link
              key={o.id}
              href={`/orders/${o.id}`}
              className="block bg-card border border-border rounded-2xl p-5 hover:border-primary/50 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">
                    <FiPackage />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">
                        Order #{o.id.slice(-8).toUpperCase()}
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
                      {new Date(o.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                </div>

                <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between">
                  <span className="text-xs text-muted">Grand Total</span>
                  <span className="text-base font-black text-primary">
                    ৳{o.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap gap-1.5">
                  {o.items.map((i, index) => (
                    <span
                      key={`${i.productId}-${index}`}
                      className="px-2.5 py-1 rounded-lg bg-muted-bg text-foreground font-medium text-[11px]"
                    >
                      {i.title || `Item ${index + 1}`} × {i.quantity}
                    </span>
                  ))}
                </div>

                <span className="inline-flex items-center gap-1 font-bold text-primary text-xs group-hover:translate-x-0.5 transition-transform">
                  Track Delivery <FiArrowRight />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
