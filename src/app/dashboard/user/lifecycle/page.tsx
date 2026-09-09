"use client";

import { useState } from "react";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { userDashboardLinks } from "@/lib/constants/dashboard-nav";
import { useProductLifecycle } from "@/hooks/dashboard/user/useProductLifecycle";
import { FaShieldAlt, FaTools, FaShoppingBag, FaPlus, FaTimes, FaExclamationTriangle } from "react-icons/fa";

export default function ProductLifecyclePage() {
  const { lifecycles, loading, error, refresh, addMaintenance } = useProductLifecycle();
  const [showMaintenance, setShowMaintenance] = useState<string | null>(null);
  const [mTitle, setMTitle] = useState("");
  const [mDueDate, setMDueDate] = useState("");
  const [mNotes, setMNotes] = useState("");

  const total = lifecycles.length;
  const underWarranty = lifecycles.filter((lc) => lc.warrantyStatus === "active").length;
  const expiringSoon = lifecycles.filter((lc) => lc.warrantyStatus === "expiring_soon").length;
  const expired = lifecycles.filter((lc) => lc.warrantyStatus === "expired").length;
  const maintenanceDue = lifecycles.filter((lc) => lc.maintenanceStatus === "due_soon" || lc.maintenanceStatus === "overdue").length;

  const getWarrantyBadge = (status?: string) => {
    const map: Record<string, string> = {
      active: "bg-success/15 text-success",
      expiring_soon: "bg-warning/15 text-warning",
      expired: "bg-error/15 text-error",
      not_available: "bg-muted-bg text-muted",
    };
    return map[status || "not_available"] || "bg-muted-bg text-muted";
  };

  const getMaintenanceBadge = (status?: string) => {
    const map: Record<string, string> = {
      up_to_date: "bg-success/15 text-success",
      due_soon: "bg-warning/15 text-warning",
      overdue: "bg-error/15 text-error",
      no_schedule: "bg-muted-bg text-muted",
    };
    return map[status || "no_schedule"] || "bg-muted-bg text-muted";
  };

  const handleAddMaintenance = async (lifecycleId: string) => {
    if (!mTitle.trim() || !mDueDate) return;
    await addMaintenance(lifecycleId, { title: mTitle.trim(), dueDate: mDueDate, notes: mNotes || undefined });
    setShowMaintenance(null);
    setMTitle("");
    setMDueDate("");
    setMNotes("");
  };

  return (
    <DashboardShell role="Customer" title="Product Lifecycle" subtitle="Warranty and maintenance tracking for what you've bought." links={userDashboardLinks}>
      <div className="space-y-6">
        {error && (
          <div className="rounded-2xl border border-error/30 bg-error/5 p-4 text-center text-sm text-error">
            {error}
            <button onClick={refresh} className="ml-3 underline text-xs">Retry</button>
          </div>
        )}

        {/* Summary */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Total Products", value: total, icon: <FaShoppingBag /> },
            { label: "Under Warranty", value: underWarranty, icon: <FaShieldAlt /> },
            { label: "Expiring Soon", value: expiringSoon, icon: <FaExclamationTriangle /> },
            { label: "Expired", value: expired, icon: <FaTimes /> },
            { label: "Maintenance Due", value: maintenanceDue, icon: <FaTools /> },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border bg-surface p-3 sm:p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted mb-1.5">{stat.icon} <span className="leading-tight">{stat.label}</span></div>
              <div className="text-xl sm:text-2xl font-black text-text">{stat.value}</div>
            </div>
          ))}
        </div>

        <Panel title="🛡️ Product Lifecycle & Maintenance Tracker">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted-bg/20 p-8 text-center text-sm text-muted">
              Loading your product lifecycle...
            </div>
          ) : lifecycles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted-bg/20 p-8 text-center text-sm text-muted">
              You haven&apos;t purchased any products yet. Products you buy will appear here with warranty and maintenance tracking.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {lifecycles.map((lc) => (
                <div key={lc.id} className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-primary">{lc.category}</span>
                      <h4 className="text-base font-black text-text">{lc.productTitle}</h4>
                      <p className="text-xs text-muted">Purchased: {new Date(lc.purchaseDate).toLocaleDateString()}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getWarrantyBadge(lc.warrantyStatus)}`}>
                      {lc.warrantyStatus.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-muted">Estimated Lifespan ({lc.estimatedLifespanMonths} Mo.)</span>
                      <span className="text-text">{lc.usagePercentage}% Used</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${lc.usagePercentage}%` }} />
                    </div>
                  </div>

                  <div className="rounded-xl bg-muted-bg p-3 text-xs space-y-2">
                    {lc.warrantyExpiryDate ? (
                      <p className="font-bold text-text">
                        🛡️ Warranty Expiry: <span className="text-primary">{new Date(lc.warrantyExpiryDate).toLocaleDateString()}</span>
                        {lc.warrantyRemainingDays !== undefined && (
                          <span className="ml-2 text-[10px] text-muted">({lc.warrantyRemainingDays > 0 ? `${lc.warrantyRemainingDays} days left` : "Expired"})</span>
                        )}
                      </p>
                    ) : (
                      <p className="font-bold text-text">🛡️ Warranty information unavailable</p>
                    )}
                    <div className="space-y-1 pt-1 border-t border-border/50">
                      {lc.maintenanceReminders.length === 0 ? (
                        <p className="text-muted">No maintenance reminders scheduled.</p>
                      ) : (
                        lc.maintenanceReminders.map((r, rIdx) => (
                          <div key={rIdx} className="flex items-center justify-between text-[11px]">
                            <span className="text-muted">• {r.title}</span>
                            <span className="font-bold text-text">Due: {new Date(r.dueDate).toLocaleDateString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${getMaintenanceBadge(lc.maintenanceStatus)}`}>
                      {lc.maintenanceStatus.replace(/_/g, " ")}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowMaintenance(lc.id)}
                      className="flex items-center gap-1 rounded-lg border border-border bg-muted-bg px-3 py-1.5 text-[11px] font-bold text-text transition hover:border-primary hover:text-primary cursor-pointer"
                    >
                      <FaPlus size={10} /> Add Maintenance
                    </button>
                  </div>

                  {showMaintenance === lc.id && (
                    <div className="space-y-2 rounded-xl border border-border bg-muted-bg/40 p-3">
                      <input
                        type="text"
                        value={mTitle}
                        onChange={(e) => setMTitle(e.target.value)}
                        placeholder="Maintenance title (e.g. Battery Check)"
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text focus:border-primary focus:outline-none"
                        autoFocus
                      />
                      <input
                        type="date"
                        value={mDueDate}
                        onChange={(e) => setMDueDate(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text focus:border-primary focus:outline-none"
                      />
                      <textarea
                        value={mNotes}
                        onChange={(e) => setMNotes(e.target.value)}
                        placeholder="Notes (optional)"
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text focus:border-primary focus:outline-none"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleAddMaintenance(lc.id)} className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-bold text-white cursor-pointer">Save</button>
                        <button type="button" onClick={() => { setShowMaintenance(null); setMTitle(""); setMDueDate(""); setMNotes(""); }} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[11px] font-bold text-text cursor-pointer">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </DashboardShell>
  );
}
