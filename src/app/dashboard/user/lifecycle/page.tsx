"use client";

import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { useProductLifecycle } from "@/hooks/dashboard/user/useProductLifecycle";

export default function ProductLifecyclePage() {
  const { lifecycles } = useProductLifecycle();

  return (
    <DashboardShell role="Customer" title="Product Lifecycle" subtitle="Warranty and maintenance tracking for what you've bought.">
      <div className="space-y-6">
        <Panel title="🛡️ Product Lifecycle & Maintenance Tracker">
          <div className="grid gap-4 sm:grid-cols-2">
            {lifecycles.map((lc) => (
              <div key={lc.id} className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-primary">{lc.category}</span>
                    <h4 className="text-base font-black text-text">{lc.productTitle}</h4>
                    <p className="text-xs text-muted">Purchased: {new Date(lc.purchaseDate).toLocaleDateString()}</p>
                  </div>
                  <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success capitalize">{lc.status.replace(/_/g, " ")}</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-muted">Estimated Lifespan ({lc.estimatedLifespanMonths} Mo.)</span>
                    <span className="text-text">{lc.usagePercentage}% Used</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${lc.usagePercentage}%` }} />
                  </div>
                </div>

                <div className="rounded-xl bg-muted-bg p-3 text-xs space-y-2">
                  <p className="font-bold text-text">
                    🛡️ Warranty Expiry: <span className="text-primary">{new Date(lc.warrantyExpiryDate).toLocaleDateString()}</span>
                  </p>
                  <div className="space-y-1 pt-1 border-t border-border/50">
                    {lc.maintenanceReminders.map((r, rIdx) => (
                      <div key={rIdx} className="flex items-center justify-between text-[11px]">
                        <span className="text-muted">• {r.title}</span>
                        <span className="font-bold text-text">Due: {new Date(r.dueDate).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
