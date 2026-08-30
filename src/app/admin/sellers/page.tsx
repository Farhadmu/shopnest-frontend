"use client";
import { useEffect, useState } from "react";
import { clientFetch, clientMutation } from "@/lib/core/client";
export default function AdminSellers() {
  const [stores, setStores] = useState<Array<{ id?: string; _id?: string; storeName: string; status: string; trustScore?: number; description?: string }>>([]);
  const load = () => {
    clientFetch<Array<{ id?: string; _id?: string; storeName: string; status: string; trustScore?: number; description?: string }>>("/admin/sellers")
      .then((r) => setStores((r as { data?: Array<{ id?: string; _id?: string; storeName: string; status: string; trustScore?: number; description?: string }> }).data ?? r))
      .catch(() => setStores([]));
  };
  useEffect(() => {
    load();
  }, []);
  const update = (id: string | undefined, status: string) => {
    if (!id) return Promise.resolve();
    return clientMutation(`/admin/sellers/${id}/status`, "PATCH", { status }).then(load);
  };
  return (
    <div>
      <h1 className="text-3xl font-black">Seller Verification</h1>
      <p className="mt-2 text-sm text-muted">
        Approve trustworthy stores and keep the marketplace healthy.
      </p>
      <div className="mt-5 grid gap-3">
        {stores.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center text-muted">
            No seller applications found.
          </div>
        ) : (
          stores.map((s) => (
            <div key={s._id || s.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-black">{s.storeName}</h2>
                  <p className="mt-1 text-sm text-muted">
                    Status: <b>{s.status}</b> · Trust {s.trustScore ?? 0}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {s.description || "No description provided."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => update(s._id || s.id, "approved")}
                    className="rounded-lg bg-success px-3 py-2 text-xs font-bold text-white"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => update(s._id || s.id, "rejected")}
                    className="rounded-lg border border-border px-3 py-2 text-xs font-bold"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => update(s._id || s.id, "suspended")}
                    className="rounded-lg bg-error px-3 py-2 text-xs font-bold text-white"
                  >
                    Suspend
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
