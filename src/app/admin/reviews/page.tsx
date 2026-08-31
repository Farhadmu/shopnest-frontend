"use client";
import { useEffect, useState } from "react";
import { clientFetch } from "@/lib/core/client";
export default function AdminReviews() {
  const [items, setItems] = useState<Array<{ id?: string; _id?: string; rating: number; comment: string; createdAt: string }>>([]);
  useEffect(() => {
    clientFetch<Array<{ id?: string; _id?: string; rating: number; comment: string; createdAt: string }>>("/admin/reviews/reported")
      .then((r) => setItems((r as { data?: Array<{ id?: string; _id?: string; rating: number; comment: string; createdAt: string }> }).data ?? r))
      .catch(() => setItems([]));
  }, []);
  return (
    <div>
      <h1 className="text-3xl font-black">Reported Reviews</h1>
      <p className="mt-2 text-sm text-muted">
        Review community reports and maintain marketplace trust.
      </p>
      <div className="mt-5 grid gap-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center text-muted">
            No reported reviews.
          </div>
        ) : (
          items.map((r) => (
            <div key={r._id || r.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex justify-between">
                <b>{r.rating} / 5</b>
                <span className="text-xs text-muted">{new Date(r.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-sm">{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
