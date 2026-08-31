"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { getReturnRequests, createReturnRequest, ReturnRequest } from "@/lib/api/customer-features";
import { getOrders, Order } from "@/lib/api/orders";

export default function ReturnCenterPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [returnType, setReturnType] = useState("return");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!isPending && !session?.user) router.push("/login");
    getReturnRequests().then(setReturns).catch(() => {});
    getOrders().then((data) => setOrders(Array.isArray(data) ? data : [])).catch(() => {});
  }, [session, isPending]);

  async function handleSubmitReturn(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createReturnRequest({ orderId: selectedOrder, productId: selectedProduct, type: returnType, reason });
      setShowForm(false);
      setReason("");
      getReturnRequests().then(setReturns).catch(() => {});
    } catch { /* ignore */ }
  }

  const statusColors: Record<string, string> = {
    requested: "bg-warning/10 text-warning", approved: "bg-success/10 text-success",
    pickup: "bg-primary/10 text-primary", received: "bg-success/10 text-success",
    refunded: "bg-success/10 text-success", rejected: "bg-error/10 text-error",
  };

  const links = [
    { label: "Smart Wishlist", href: "/customer/wishlist", icon: "❤️", description: "Track prices & alerts" },
    { label: "Buy Again", href: "/customer/buy-again", icon: "🔁", description: "Quick reorder" },
    { label: "Warranties", href: "/customer/warranties", icon: "🛠️", description: "Warranty manager" },
    { label: "Returns", href: "/customer/returns", icon: "🔄", description: "Return center" },
  ];

  return (
    <DashboardShell title="Smart Return Center" subtitle="Request returns, refunds, and replacements" role="Customer" links={links}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-text">Return Requests</h3>
          <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover">
            {showForm ? "Cancel" : "+ New Return"}
          </button>
        </div>

        {showForm && (
          <Panel title="Request Return / Refund">
            <form onSubmit={handleSubmitReturn} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-muted">Select Order</label>
                <select value={selectedOrder} onChange={(e) => { setSelectedOrder(e.target.value); setSelectedProduct(""); }} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text">
                  <option value="">Choose an order</option>
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>Order #{order.id.slice(-6)} - ৳{order.totalAmount} ({order.status})</option>
                  ))}
                </select>
              </div>
              {selectedOrder && (
                <div>
                  <label className="mb-1 block text-xs font-bold text-muted">Select Product</label>
                  <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text">
                    <option value="">Choose a product</option>
                    {orders.find((o) => o.id === selectedOrder)?.items.map((item) => (
                      <option key={item.productId} value={item.productId}>{item.title}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-bold text-muted">Request Type</label>
                <select value={returnType} onChange={(e) => setReturnType(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text">
                  <option value="return">Return</option>
                  <option value="refund">Refund</option>
                  <option value="replacement">Replacement</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-muted">Reason</label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Please describe the reason for return..." className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-muted focus:border-primary focus:outline-none" />
              </div>
              <button type="submit" disabled={!selectedOrder || !selectedProduct || !reason} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50">
                Submit Request
              </button>
            </form>
          </Panel>
        )}

        <Panel title="Return History">
          <div className="space-y-3">
            {returns.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted">No return requests yet</div>
            ) : (
              returns.map((ret) => (
                <div key={ret.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-text">{ret.productTitle}</h4>
                      <p className="text-xs text-muted">{ret.type} • {ret.reason.slice(0, 50)}...</p>
                    </div>
                    <span className={`rounded-lg px-2 py-1 text-xs font-bold capitalize ${statusColors[ret.status] || "bg-muted-bg text-muted"}`}>
                      {ret.status}
                    </span>
                  </div>
                  {ret.refundAmount && (
                    <p className="mt-2 text-xs text-muted">Refund: ৳{ret.refundAmount.toLocaleString()}{ret.refundMethod ? ` via ${ret.refundMethod}` : ""}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
