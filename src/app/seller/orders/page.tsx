"use client";
import { useEffect, useState } from "react";
import { clientFetch, clientMutation } from "@/lib/core/client";
export default function SellerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const load = () => {
    clientFetch<any[]>("/orders/seller/mine")
      .then((r) => setOrders((r as any).data ?? r))
      .catch(() => setOrders([]));
  };
  useEffect(() => {
    load();
  }, []);
  const advance = (id: string, status: string) =>
    clientMutation(`/orders/${id}/status`, "PATCH", { status })
      .then(load)
      .catch(() => undefined);
  return (
    <div>
      <h1 className="text-3xl font-black">Seller Orders</h1>
      <p className="mt-2 text-sm text-muted">Fulfill orders and keep customers informed.</p>
      <div className="mt-5 grid gap-3">
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center text-muted">
            No seller orders yet.
          </div>
        ) : (
          orders.map((o) => (
            <div key={o._id || o.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-muted">Order #{String(o._id || o.id).slice(-8)}</p>
                  <h2 className="mt-1 font-black">৳{o.totalAmount}</h2>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold capitalize text-primary">
                  {o.status.replaceAll("_", " ")}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["confirmed", "processing", "shipped", "out_for_delivery", "delivered"].map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => advance(o._id || o.id, s)}
                      className="rounded-lg border border-border px-3 py-2 text-xs font-bold capitalize"
                    >
                      {s.replaceAll("_", " ")}
                    </button>
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
