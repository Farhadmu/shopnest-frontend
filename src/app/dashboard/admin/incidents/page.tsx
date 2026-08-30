"use client";

import { useEffect, useState } from "react";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { adminDashboardLinks } from "@/lib/constants/dashboard-nav";
import {
  getSecurityIncidents,
  updateSecurityIncident,
  addIncidentNote,
  SecurityIncidentItem,
} from "@/lib/api/admin-intelligence";
import { FaShieldAlt, FaPlus, FaCheck, FaTimes, FaHistory, FaStickyNote, FaFilter } from "react-icons/fa";

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState<SecurityIncidentItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterSeverity, setFilterSeverity] = useState<string>("");
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncidentItem | null>(null);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    getSecurityIncidents({ status: filterStatus || undefined, severity: filterSeverity || undefined })
      .then((items) => {
        setIncidents(items);
        if (items.length > 0 && !selectedIncident) {
          setSelectedIncident(items[0]);
        } else if (selectedIncident) {
          const fresh = items.find((i) => i.id === selectedIncident.id);
          if (fresh) setSelectedIncident(fresh);
        }
      })
      .catch(() => setIncidents([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [filterStatus, filterSeverity]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateSecurityIncident(id, { status });
      loadData();
    } catch {
      // handled
    }
  };

  const handleUpdateSeverity = async (id: string, severity: string) => {
    try {
      await updateSecurityIncident(id, { severity });
      loadData();
    } catch {
      // handled
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !newNote.trim()) return;
    try {
      await addIncidentNote(selectedIncident.id, newNote.trim());
      setNewNote("");
      loadData();
    } catch {
      // handled
    }
  };

  return (
    <DashboardShell
      role="Administrator"
      title="Security Incident Triage & Lifecycle Management"
      subtitle="Investigate security anomalies, document internal investigation notes, adjust severity tiers, and resolve active incidents."
      links={adminDashboardLinks}
    >
      <div className="grid gap-6">
        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <FaFilter className="text-muted" size={12} />
            <span className="text-xs font-black uppercase text-muted">Filter Incidents:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-border bg-muted-bg px-3 py-1.5 text-xs font-bold text-text outline-none focus:border-primary"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="rounded-xl border border-border bg-muted-bg px-3 py-1.5 text-xs font-bold text-text outline-none focus:border-primary"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Master-Detail Layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Incident List */}
          <Panel title={`Active Incidents (${incidents.length})`}>
            <div className="space-y-3">
              {incidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`cursor-pointer rounded-2xl border p-4 text-xs transition ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                        : "border-border bg-surface hover:border-primary/40 hover:bg-muted-bg/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="rounded-md bg-muted-bg px-2 py-0.5 font-mono text-[10px] font-bold text-muted">
                          {inc.incidentCode}
                        </span>
                        <h3 className="mt-1 font-extrabold text-text">{inc.title}</h3>
                        <p className="mt-0.5 text-muted">Target: {inc.entityName}</p>
                      </div>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                          inc.severity === "critical"
                            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                            : inc.severity === "high"
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-border/80 pt-2 text-[10px] text-muted">
                      <span className="font-bold uppercase tracking-wider text-text">Status: {inc.status}</span>
                      <span>{new Date(inc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* Incident Detail & Investigation Notes */}
          {selectedIncident ? (
            <Panel
              title={`Incident Investigation: ${selectedIncident.incidentCode}`}
              action={
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedIncident.id, "investigating")}
                    className="rounded-lg bg-amber-500/15 px-2.5 py-1 text-[11px] font-black uppercase text-amber-600 dark:text-amber-400 hover:bg-amber-500/25"
                  >
                    Investigating
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedIncident.id, "resolved")}
                    className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25"
                  >
                    Resolve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedIncident.id, "dismissed")}
                    className="rounded-lg bg-muted-bg px-2.5 py-1 text-[11px] font-black uppercase text-muted hover:text-text"
                  >
                    Dismiss
                  </button>
                </div>
              }
            >
              <div className="space-y-4 text-xs">
                {/* Header Metadata */}
                <div className="rounded-2xl border border-border bg-muted-bg/50 p-4">
                  <h3 className="text-sm font-black text-text">{selectedIncident.title}</h3>
                  <p className="mt-1 text-muted">
                    Entity: <span className="font-bold text-text">{selectedIncident.entityName}</span> ({selectedIncident.entityType})
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-md bg-surface px-2 py-0.5 font-mono text-[10px] text-muted border border-border">
                      Risk Score: {selectedIncident.riskScore}/100
                    </span>
                    <span className="rounded-md bg-surface px-2 py-0.5 font-mono text-[10px] text-muted border border-border">
                      Status: {selectedIncident.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Evidence Signals */}
                <div>
                  <h4 className="font-bold text-text mb-2">Automated Signals & Evidence:</h4>
                  <div className="space-y-1.5">
                    {selectedIncident.signals.map((sig, idx) => (
                      <div key={idx} className="rounded-xl bg-surface border border-border p-2.5 text-muted">
                        • {sig}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Internal Investigation Notes */}
                <div>
                  <h4 className="font-bold text-text mb-2">Internal Administrator Notes:</h4>
                  <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                    {selectedIncident.notes.map((n, idx) => (
                      <div key={idx} className="rounded-xl bg-muted-bg p-3">
                        <div className="flex items-center justify-between text-[10px] text-muted mb-1">
                          <span className="font-black text-text">{n.authorName}</span>
                          <span>{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-text leading-relaxed">{n.note}</p>
                      </div>
                    ))}
                    {selectedIncident.notes.length === 0 && (
                      <p className="text-muted text-[11px] italic">No internal notes added yet.</p>
                    )}
                  </div>

                  <form onSubmit={handleAddNote} className="flex gap-2">
                    <input
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add internal investigation note..."
                      className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text outline-none focus:border-primary"
                    />
                    <button
                      type="submit"
                      className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-hover"
                    >
                      <FaStickyNote size={10} /> Add Note
                    </button>
                  </form>
                </div>

                {/* Incident Audit History */}
                <div>
                  <h4 className="font-bold text-text mb-2">Incident Audit Timeline:</h4>
                  <div className="space-y-1.5">
                    {selectedIncident.history.map((h, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-xl bg-muted-bg/40 p-2.5 text-[11px]">
                        <span className="font-bold text-text">{h.action} ({h.changedBy})</span>
                        <span className="text-[10px] text-muted">{new Date(h.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted">
              Select an incident to view details and investigation notes.
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
