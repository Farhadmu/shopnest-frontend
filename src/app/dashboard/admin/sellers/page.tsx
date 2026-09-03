"use client";
import { useEffect, useState } from "react";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { EmptyState } from "@/components/dashboard/DashboardStates";
import { clientFetch, clientMutation } from "@/lib/core/client";

export default function AdminSellers() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    clientFetch<any[]>("/admin/sellers")
      .then((r) => setStores((r as any).data ?? r))
      .catch(() => setStores([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const update = (id: string, status: string) =>
    clientMutation(`/admin/sellers/${id}/status`, "PATCH", { status }).then(load);

  return (
    <DashboardShell
      title="Seller Verification"
      subtitle="Approve trustworthy stores and keep the marketplace healthy."
      role="Administrator"
      showContinueShopping={false}
    >
      <Panel title="Pending Applications">
        {loading ? (
          <div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-surface p-5 animate-pulse">
                <div className="h-5 w-40 rounded-lg bg-muted-bg mb-2" />
                <div className="h-4 w-64 rounded-lg bg-muted-bg" />
              </div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <EmptyState
            icon="🏬"
            title="No seller applications"
            description="There are no pending seller applications to review at this time."
          />
        ) : (
          <div className="grid gap-3">
            {stores.map((s) => (
              <div key={s._id || s.id} className="rounded-2xl border border-border bg-surface p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-black text-text">{s.storeName}</h2>
                    <p className="mt-1 text-sm text-muted">
                      Status: <b className="text-text">{s.status}</b> · Trust {s.trustScore ?? 0}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {s.description || "No description provided."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => update(s._id || s.id, "approved")}
                      className="rounded-lg bg-success px-3 py-2 text-xs font-bold text-white hover:bg-success/80 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => update(s._id || s.id, "rejected")}
                      className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-bold text-text hover:border-error/40 hover:text-error transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => update(s._id || s.id, "suspended")}
                      className="rounded-lg bg-error px-3 py-2 text-xs font-bold text-white hover:bg-error/80 transition"
                    >
                      Suspend
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </DashboardShell>
  );
}
