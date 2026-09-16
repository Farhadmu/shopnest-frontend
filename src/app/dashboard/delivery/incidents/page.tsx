"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { deliveryManDashboardLinks } from "@/lib/constants/dashboard-nav";
import {
  reportDeliveryIncident,
  getMyIncidents,
  getMyDeliveries,
  type DeliveryIncident,
  type DeliveryRequest,
} from "@/lib/api/delivery";
import {
  FaExclamationTriangle,
  FaShieldAlt,
  FaCheckCircle,
  FaClock,
  FaSyncAlt,
  FaPlus,
  FaInfoCircle,
} from "react-icons/fa";

const CATEGORIES = [
  { value: "traffic", label: "Severe Traffic / Road Block" },
  { value: "accident", label: "Accident / Vehicle Damage" },
  { value: "customer_unavailable", label: "Customer Unreachable / Not Home" },
  { value: "wrong_address", label: "Wrong / Incomplete Address" },
  { value: "vehicle_breakdown", label: "Vehicle Breakdown / Mechanical Issue" },
  { value: "weather", label: "Severe Weather / Heavy Rain / Flood" },
  { value: "package_damaged", label: "Damaged Goods at Pickup" },
  { value: "other", label: "Other Operational Issue" },
];

export default function DeliveryIncidentsPage() {
  const searchParams = useSearchParams();
  const initialDeliveryId = searchParams?.get("deliveryId") || "";

  const [incidents, setIncidents] = useState<DeliveryIncident[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(!!initialDeliveryId);

  // Form State
  const [deliveryId, setDeliveryId] = useState(initialDeliveryId);
  const [category, setCategory] = useState("traffic");
  const [severity, setSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [description, setDescription] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [incRes, delRes] = await Promise.allSettled([
        getMyIncidents(),
        getMyDeliveries({ limit: 50 }),
      ]);
      if (incRes.status === "fulfilled" && incRes.value) {
        setIncidents(incRes.value);
      }
      if (delRes.status === "fulfilled" && delRes.value) {
        setActiveDeliveries(delRes.value.items ?? delRes.value.data ?? []);
      }
    } catch (err) {
      console.error("Failed to load incidents:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    setSubmitSuccess(false);

    try {
      await reportDeliveryIncident(deliveryId || "general", {
        category,
        severity,
        description: description.trim(),
      });
      setSubmitSuccess(true);
      setDescription("");
      setShowForm(false);
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to submit incident report.");
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "critical":
        return "bg-rose-500 text-white font-black";
      case "high":
        return "bg-rose-500/10 text-rose-500 border border-rose-500/30";
      case "medium":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/30";
      default:
        return "bg-blue-500/10 text-blue-500 border border-blue-500/30";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
      case "closed":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30";
      case "investigating":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/30";
      default:
        return "bg-primary/10 text-primary border border-primary/30";
    }
  };

  return (
    <DashboardShell
      role="Delivery Man"
      title="Delivery Incident Management"
      subtitle="Report operational emergencies, delays, or customer disputes for immediate Admin support."
      links={deliveryManDashboardLinks}
    >
      <div className="space-y-6">
        {/* Top Control */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted">Total Reported Incidents:</span>
            <span className="text-xs font-black text-foreground">{incidents.length}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover transition cursor-pointer"
            >
              <FaPlus size={10} />
              <span>{showForm ? "Close Form" : "Report New Incident"}</span>
            </button>
            <button
              type="button"
              onClick={loadData}
              className="rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold text-foreground hover:border-primary transition cursor-pointer"
            >
              <FaSyncAlt size={11} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {submitSuccess && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-500 font-bold flex items-center gap-2">
            <FaCheckCircle className="text-base" />
            <span>Incident report submitted successfully. ShopNest Dispatch Admin has been alerted.</span>
          </div>
        )}

        {/* Incident Form Drawer/Modal */}
        {showForm && (
          <div className="rounded-2xl border border-rose-500/30 bg-card p-6 shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-rose-500 font-black text-sm">
              <FaExclamationTriangle />
              <span>Submit Incident or Dispute Report</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">Related Delivery Mission</label>
                  <select
                    value={deliveryId}
                    onChange={(e) => setDeliveryId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-foreground focus:border-primary outline-none"
                  >
                    <option value="">General Platform Incident (No Order)</option>
                    {activeDeliveries.map((del) => (
                      <option key={del.id} value={del.id}>
                        Order #{del.orderId.slice(-8).toUpperCase()} ({del.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-foreground focus:border-primary outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">Severity Level</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-foreground focus:border-primary outline-none"
                  >
                    <option value="low">Low (Minor Delay)</option>
                    <option value="medium">Medium (Route Obstacle / Reschedule)</option>
                    <option value="high">High (Address Conflict / Damaged Box)</option>
                    <option value="critical">Critical (Accident / Immediate Support Needed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Detailed Description of Incident</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain what occurred, exact location, customer interactions, and any assistance required..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 text-foreground focus:border-primary outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted hover:text-foreground transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !description.trim()}
                  className="rounded-xl bg-rose-500 px-5 py-2.5 text-xs font-black text-white hover:bg-rose-600 shadow-md shadow-rose-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Incident Report"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Incidents History List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl border border-border bg-surface/50" />
            ))}
          </div>
        ) : incidents.length === 0 ? (
          <Panel>
            <div className="py-16 text-center text-muted">
              <FaShieldAlt className="mx-auto text-4xl text-emerald-500/40 mb-3" />
              <h3 className="text-base font-bold text-foreground mb-1">No Active Incidents</h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                All your delivery routes and dispatches are clear. If you experience unexpected delays or issues on the road, report them here.
              </p>
            </div>
          </Panel>
        ) : (
          <div className="space-y-4">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-foreground text-sm uppercase">
                      {inc.category.replace(/_/g, " ")}
                    </span>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] uppercase ${getSeverityBadge(inc.severity)}`}>
                      {inc.severity}
                    </span>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${getStatusBadge(inc.status)}`}>
                      {inc.status}
                    </span>
                  </div>

                  <span className="text-[11px] text-muted">
                    Reported on {new Date(inc.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-foreground font-medium whitespace-pre-line leading-relaxed">
                  {inc.description}
                </p>

                {inc.resolutionNotes && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-500 font-bold mb-1">
                      <FaCheckCircle size={11} />
                      <span>Admin Resolution Note:</span>
                    </div>
                    <p className="text-foreground">{inc.resolutionNotes}</p>
                    {inc.resolvedAt && (
                      <span className="block text-[10px] text-muted mt-1">
                        Resolved on {new Date(inc.resolvedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
