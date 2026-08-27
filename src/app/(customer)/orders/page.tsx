"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getOrders, Order } from "@/lib/api/orders";
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);
  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-3xl font-black">Order History</h1>
        <p className="mt-2 text-sm text-muted">Track purchases and follow every order milestone.</p>
      </div>
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-10 text-center text-muted">
          No orders yet.{" "}
          <Link className="font-bold text-primary" href="/products">
            Start shopping →
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/orders/${o.id}`}
              className="rounded-2xl border border-border bg-surface p-5 transition hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-muted">Order #{o.id.slice(-8)}</p>
                  <h2 className="mt-1 font-black">৳{o.totalAmount.toLocaleString()}</h2>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold capitalize text-primary">
                  {o.status.replaceAll("_", " ")}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
                {o.items.map((i, index) => (
                  <span
                    key={`${i.productId}-${index}`}
                    className="rounded-lg bg-muted-bg px-2 py-1"
                  >
                    {i.title || `Product ${i.productId}`} × {i.quantity}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
