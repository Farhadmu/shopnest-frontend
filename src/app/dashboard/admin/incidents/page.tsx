"use client";

<<<<<<< HEAD
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
      showContinueShopping={false}
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
=======
import { useEffect, useState, useCallback } from "react";
import { DashboardShell, StatCard, EmptyState, LoadingCard } from "@/components/dashboard/DashboardUI";
import { adminDashboardLinks } from "@/lib/constants/dashboard-nav";
import {
  getSecurityIncidents,
  getSecurityIncidentById,
  getIncidentTimeline,
  updateIncidentStatus,
  updateIncidentSeverity,
  assignIncident,
  unassignIncident,
  addIncidentNote,
  resolveIncident,
  closeIncident,
  reopenIncident,
  IncidentListResponse,
  SecurityIncidentItem,
  IncidentStats,
  IncidentTimelineItem,
  IncidentQueryParams,
} from "@/lib/api/admin-intelligence";
import {
  FaShieldAlt,
  FaSearch,
  FaFilter,
  FaChevronRight,
  FaCheck,
  FaTimes,
  FaUser,
  FaUserShield,
  FaClock,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaInfoCircle,
  FaCheckCircle,
  FaBan,
  FaArrowLeft,
  FaPlus,
  FaStickyNote,
  FaHistory,
  FaChartLine,
  FaUserCog,
  FaLock,
  FaEnvelope,
  FaClipboardList,
  FaSync,
  FaTimesCircle,
} from "react-icons/fa";

const INCIDENT_TYPES: Record<string, string> = {
  suspicious_login: "Suspicious Login",
  account_takeover: "Account Takeover",
  authentication_anomaly: "Authentication Anomaly",
  api_abuse: "API Abuse",
  rate_limit_abuse: "Rate Limit Abuse",
  payment_security_anomaly: "Payment Security Anomaly",
  fraud_pattern: "Fraud Pattern",
  seller_security_incident: "Seller Security Incident",
  suspicious_order_activity: "Suspicious Order Activity",
  session_anomaly: "Session Anomaly",
  data_access_anomaly: "Data Access Anomaly",
  system_security_incident: "System Security Incident",
  other: "Other",
};

const SEVERITY_COLORS = {
  critical: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", border: "border-red-500/30", badge: "bg-red-500/15 text-red-600 dark:text-red-400" },
  high: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/30", badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  medium: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/30", badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  low: { bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400", border: "border-gray-500/30", badge: "bg-gray-500/15 text-gray-600 dark:text-gray-400" },
};

const STATUS_COLORS = {
  new: { bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", badge: "bg-violet-500/15 text-violet-600 dark:text-violet-400" },
  open: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  acknowledged: { bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400", badge: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400" },
  investigating: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  mitigated: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", badge: "bg-orange-500/15 text-orange-600 dark:text-orange-400" },
  resolved: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  closed: { bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400", badge: "bg-gray-500/15 text-gray-600 dark:text-gray-400" },
  dismissed: { bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400", badge: "bg-slate-500/15 text-slate-600 dark:text-slate-400" },
};

type DetailTab = "overview" | "notes" | "timeline" | "actions";

export default function AdminIncidentsPage() {
  const [response, setResponse] = useState<IncidentListResponse | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncidentItem | null>(null);
  const [incidentDetail, setIncidentDetail] = useState<SecurityIncidentItem | null>(null);
  const [timeline, setTimeline] = useState<IncidentTimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>("overview");
  
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("-1");
  const [page, setPage] = useState(1);
  
  const [newNote, setNewNote] = useState("");
  const [resolutionSummary, setResolutionSummary] = useState("");
  const [closeReason, setCloseReason] = useState("");
  const [reopenReason, setReopenReason] = useState("");
  const [severityReason, setSeverityReason] = useState("");
  
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [showSeverityModal, setShowSeverityModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const params: IncidentQueryParams = {
        status: filterStatus || undefined,
        severity: filterSeverity || undefined,
        type: filterType || undefined,
        search: search || undefined,
        sortBy,
        sortDir,
        page,
        limit: 20,
      };
      const data = await getSecurityIncidents(params);
      setResponse(data);
    } catch {
      setResponse(null);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterSeverity, filterType, search, sortBy, sortDir, page]);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  useEffect(() => {
    if (selectedIncident) {
      loadIncidentDetail(selectedIncident.id);
    }
  }, [selectedIncident?.id]);

  const loadIncidentDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const [detail, tl] = await Promise.all([
        getSecurityIncidentById(id),
        getIncidentTimeline(id),
      ]);
      setIncidentDetail(detail);
      setTimeline(tl);
    } catch {
      setIncidentDetail(null);
      setTimeline([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAction = async (action: () => Promise<any>, successMsg?: string) => {
    setActionLoading(true);
    try {
      await action();
      if (selectedIncident) {
        await loadIncidentDetail(selectedIncident.id);
        await loadIncidents();
      }
      setShowResolveModal(false);
      setShowCloseModal(false);
      setShowReopenModal(false);
      setShowSeverityModal(false);
      setNewNote("");
      setResolutionSummary("");
      setCloseReason("");
      setReopenReason("");
      setSeverityReason("");
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (status: string, notes?: string) => {
    if (!selectedIncident) return;
    await handleAction(async () => {
      await updateIncidentStatus(selectedIncident.id, status, notes);
    });
  };

  const handleSeverityChange = async (severity: string) => {
    if (!selectedIncident) return;
    await handleAction(async () => {
      await updateIncidentSeverity(selectedIncident.id, severity, severityReason);
    });
  };

  const handleResolve = async () => {
    if (!selectedIncident || !resolutionSummary.trim()) return;
    await handleAction(async () => {
      await resolveIncident(selectedIncident.id, resolutionSummary);
    });
  };

  const handleClose = async () => {
    if (!selectedIncident || !closeReason.trim()) return;
    await handleAction(async () => {
      await closeIncident(selectedIncident.id, closeReason);
    });
  };

  const handleReopen = async () => {
    if (!selectedIncident || !reopenReason.trim()) return;
    await handleAction(async () => {
      await reopenIncident(selectedIncident.id, reopenReason);
    });
  };

  const handleAddNote = async () => {
    if (!selectedIncident || !newNote.trim()) return;
    await handleAction(async () => {
      await addIncidentNote(selectedIncident.id, newNote);
    });
    setNewNote("");
  };

  const handleAssign = async (adminId: string, adminName: string) => {
    if (!selectedIncident) return;
    await handleAction(async () => {
      await assignIncident(selectedIncident.id, adminId, adminName);
    });
  };

  const handleUnassign = async () => {
    if (!selectedIncident) return;
    await handleAction(async () => {
      await unassignIncident(selectedIncident.id);
    });
  };

  const stats: IncidentStats | null = response?.stats || null;
  const incidents = response?.incidents || [];
  const pagination = response?.pagination;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadIncidents();
  };

  return (
    <DashboardShell
      role="Administrator"
      title="Security Incident Management"
      subtitle="Monitor, investigate, and resolve security incidents across the platform"
      links={adminDashboardLinks}
      showContinueShopping={false}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon="📋" label="Total" value={stats?.total || 0} note="All incidents" />
        <StatCard icon="🆕" label="Open" value={stats?.open || 0} note="Active incidents" color="warning" />
        <StatCard icon="🔍" label="Investigating" value={stats?.investigating || 0} note="Under investigation" color="accent" />
        <StatCard icon="⚠️" label="High" value={stats?.high || 0} note="High severity" color="warning" />
        <StatCard icon="🚨" label="Critical" value={stats?.critical || 0} note="Critical priority" color="error" />
        <StatCard icon="✅" label="Resolved" value={stats?.resolved || 0} note="Resolved this month" color="success" />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-border bg-surface p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search incidents..."
              className="w-full rounded-xl border border-border bg-muted-bg pl-9 pr-4 py-2 text-sm text-text outline-none focus:border-primary"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="open">Open</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="investigating">Investigating</option>
            <option value="mitigated">Mitigated</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="dismissed">Dismissed</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => { setFilterSeverity(e.target.value); setPage(1); }}
            className="rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          >
            <option value="">All Types</option>
            {Object.entries(INCIDENT_TYPES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={`${sortBy}:${sortDir}`}
            onChange={(e) => {
              const [by, dir] = e.target.value.split(":");
              setSortBy(by);
              setSortDir(dir);
              setPage(1);
            }}
            className="rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          >
            <option value="createdAt:-1">Newest First</option>
            <option value="createdAt:1">Oldest First</option>
            <option value="severity:-1">Severity (High-Low)</option>
            <option value="severity:1">Severity (Low-High)</option>
            <option value="riskScore:-1">Risk Score (High-Low)</option>
            <option value="updatedAt:-1">Recently Updated</option>
          </select>
        </form>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* Incident List */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface">
            <div className="border-b border-border p-4">
              <h2 className="font-bold text-text">
                Incidents {response?.pagination && `(${response.pagination.total})`}
              </h2>
            </div>
            
            <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
              {loading ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3].map((i) => (
                    <LoadingCard key={i} />
                  ))}
                </div>
              ) : incidents.length === 0 ? (
                <div className="p-8 text-center">
                  <EmptyState
                    icon="🛡️"
                    title="No Security Incidents"
                    description="There are no incidents matching your current filters."
                  />
                </div>
              ) : (
                <div className="space-y-2 p-2">
                  {incidents.map((incident) => {
                    const sevColors = SEVERITY_COLORS[incident.severity] || SEVERITY_COLORS.low;
                    const isSelected = selectedIncident?.id === incident.id;
                    return (
                      <button
                        key={incident.id}
                        onClick={() => setSelectedIncident(incident)}
                        className={`w-full rounded-xl border p-4 text-left transition-all ${
                          isSelected
                            ? `${sevColors.border} ${sevColors.bg} ring-2 ring-primary/20`
                            : "border-border bg-background hover:border-primary/30 hover:bg-muted-bg/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <span className="inline-block rounded-md bg-muted-bg px-2 py-0.5 font-mono text-[10px] font-bold text-muted">
                              {incident.incidentCode}
                            </span>
                            <h3 className="mt-1 truncate font-bold text-text">{incident.title}</h3>
                            <p className="mt-0.5 truncate text-xs text-muted">
                              {INCIDENT_TYPES[incident.type] || incident.type} • {incident.entityName}
                            </p>
                          </div>
                          <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${sevColors.badge}`}>
                            {incident.severity}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-[10px]">
                          <span className={`rounded px-1.5 py-0.5 font-semibold ${STATUS_COLORS[incident.status]?.badge || "bg-gray-500/15 text-gray-600"}`}>
                            {incident.status}
                          </span>
                          <span className="text-muted">
                            {new Date(incident.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border p-3">
                <span className="text-xs text-muted">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-bold text-text disabled:opacity-50 hover:bg-muted-bg"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= pagination.totalPages}
                    className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-bold text-text disabled:opacity-50 hover:bg-muted-bg"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Incident Detail */}
        <div className="rounded-2xl border border-border bg-surface">
          {selectedIncident ? (
            <>
              {/* Detail Header */}
              <div className="border-b border-border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedIncident(null)}
                        className="rounded-lg border border-border bg-background p-1.5 hover:bg-muted-bg lg:hidden"
                      >
                        <FaArrowLeft size={12} />
                      </button>
                      <span className="rounded-md bg-muted-bg px-2 py-1 font-mono text-sm font-bold text-muted">
                        {selectedIncident.incidentCode}
                      </span>
                      <span className={`rounded-md px-2 py-1 text-xs font-black uppercase ${
                        SEVERITY_COLORS[selectedIncident.severity]?.badge || ""
                      }`}>
                        {selectedIncident.severity}
                      </span>
                      <span className={`rounded-md px-2 py-1 text-xs font-semibold ${
                        STATUS_COLORS[selectedIncident.status]?.badge || ""
                      }`}>
                        {selectedIncident.status}
                      </span>
                    </div>
                    <h2 className="mt-2 text-lg font-black text-text">{selectedIncident.title}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {INCIDENT_TYPES[selectedIncident.type] || selectedIncident.type}
                    </p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="mt-4 flex gap-1 border-t border-border pt-4">
                  {(["overview", "notes", "timeline", "actions"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setDetailTab(tab)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition ${
                        detailTab === tab
                          ? "bg-primary text-white"
                          : "text-muted hover:bg-muted-bg hover:text-text"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detail Content */}
              <div className="p-4">
                {loadingDetail ? (
                  <LoadingCard />
                ) : (
                  <>
                    {/* Overview Tab */}
                    {detailTab === "overview" && incidentDetail && (
                      <div className="space-y-6">
                        {/* Metadata Grid */}
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-xl border border-border bg-muted-bg/30 p-4">
                            <h4 className="text-xs font-bold uppercase text-muted">Affected Entity</h4>
                            <p className="mt-1 font-semibold text-text">{incidentDetail.entityName}</p>
                            <p className="text-xs text-muted capitalize">{incidentDetail.entityType}</p>
                          </div>
                          <div className="rounded-xl border border-border bg-muted-bg/30 p-4">
                            <h4 className="text-xs font-bold uppercase text-muted">Source</h4>
                            <p className="mt-1 font-semibold text-text capitalize">{incidentDetail.source.replace("_", " ")}</p>
                            <p className="text-xs text-muted">Risk Score: {incidentDetail.riskScore}/100</p>
                          </div>
                          <div className="rounded-xl border border-border bg-muted-bg/30 p-4">
                            <h4 className="text-xs font-bold uppercase text-muted">Detected</h4>
                            <p className="mt-1 font-semibold text-text">
                              {new Date(incidentDetail.detectedAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="rounded-xl border border-border bg-muted-bg/30 p-4">
                            <h4 className="text-xs font-bold uppercase text-muted">Last Updated</h4>
                            <p className="mt-1 font-semibold text-text">
                              {new Date(incidentDetail.updatedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Description */}
                        {incidentDetail.description && (
                          <div>
                            <h4 className="text-xs font-bold uppercase text-muted">Description</h4>
                            <p className="mt-2 text-sm text-text">{incidentDetail.description}</p>
                          </div>
                        )}

                        {/* Assigned Admin */}
                        <div className="rounded-xl border border-border bg-muted-bg/30 p-4">
                          <h4 className="text-xs font-bold uppercase text-muted">Assigned Admin</h4>
                          {incidentDetail.assignedAdmin ? (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <FaUserShield size={14} />
                              </div>
                              <div>
                                <p className="font-semibold text-text">{incidentDetail.assignedAdmin.adminName}</p>
                                <p className="text-xs text-muted">
                                  Assigned: {new Date(incidentDetail.assignedAdmin.assignedAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-2 text-sm text-muted">Unassigned</p>
                          )}
                        </div>

                        {/* Signals */}
                        {incidentDetail.signals && incidentDetail.signals.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold uppercase text-muted">Evidence & Signals</h4>
                            <div className="mt-2 space-y-2">
                              {incidentDetail.signals.map((signal, idx) => (
                                <div key={idx} className="rounded-lg border border-border bg-background p-3">
                                  <p className="text-sm text-text">{signal}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Resolution Info */}
                        {(incidentDetail.resolvedAt || incidentDetail.closedAt) && (
                          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                            <h4 className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">
                              Resolution Summary
                            </h4>
                            {incidentDetail.resolutionSummary && (
                              <p className="mt-2 text-sm text-text">{incidentDetail.resolutionSummary}</p>
                            )}
                            {incidentDetail.resolvedBy && (
                              <p className="mt-2 text-xs text-muted">
                                Resolved by {incidentDetail.resolvedBy} on{" "}
                                {incidentDetail.resolvedAt && new Date(incidentDetail.resolvedAt).toLocaleString()}
                              </p>
                            )}
                            {incidentDetail.closeReason && (
                              <>
                                <p className="mt-2 text-xs text-muted">
                                  Closed by {incidentDetail.closedBy} on{" "}
                                  {incidentDetail.closedAt && new Date(incidentDetail.closedAt).toLocaleString()}
                                </p>
                                <p className="mt-1 text-sm text-text">Reason: {incidentDetail.closeReason}</p>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes Tab */}
                    {detailTab === "notes" && (
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Add internal investigation note..."
                            className="flex-1 rounded-xl border border-border bg-muted-bg px-4 py-2.5 text-sm text-text outline-none focus:border-primary"
                            onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                          />
                          <button
                            onClick={handleAddNote}
                            disabled={!newNote.trim() || actionLoading}
                            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover disabled:opacity-50"
                          >
                            <FaStickyNote size={14} /> Add
                          </button>
                        </div>

                        <div className="space-y-3">
                          {incidentDetail?.notes && incidentDetail.notes.length > 0 ? (
                            incidentDetail.notes.map((note, idx) => (
                              <div key={idx} className="rounded-xl border border-border bg-muted-bg/30 p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <FaUser size={12} className="text-primary" />
                                    <span className="text-xs font-bold text-text">{note.authorName}</span>
                                  </div>
                                  <span className="text-xs text-muted">
                                    {new Date(note.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm text-text">{note.note}</p>
                              </div>
                            ))
                          ) : (
                            <p className="py-8 text-center text-sm text-muted">No investigation notes yet.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Timeline Tab */}
                    {detailTab === "timeline" && (
                      <div className="relative">
                        <div className="absolute left-4 top-0 h-full w-px bg-border" />
                        <div className="space-y-4 pl-10">
                          {timeline.length > 0 ? (
                            timeline.map((event, idx) => (
                              <div key={idx} className="relative">
                                <div className="absolute -left-[26px] flex h-5 w-5 items-center justify-center rounded-full bg-surface">
                                  <div className={`h-2.5 w-2.5 rounded-full ${
                                    event.action.includes("RESOLVED") || event.action.includes("CLOSED")
                                      ? "bg-emerald-500"
                                      : event.action.includes("CREATED")
                                      ? "bg-violet-500"
                                      : event.action.includes("SEVERITY")
                                      ? "bg-amber-500"
                                      : "bg-primary"
                                  }`} />
                                </div>
                                <div className="rounded-xl border border-border bg-muted-bg/30 p-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-text">{event.action.replace(/_/g, " ")}</span>
                                    <span className="text-xs text-muted">
                                      {event.timestamp ? new Date(event.timestamp).toLocaleString() : ""}
                                    </span>
                                  </div>
                                  {event.actor && (
                                    <p className="mt-1 text-xs text-muted">by {event.actor}</p>
                                  )}
                                  {event.details && (
                                    <p className="mt-1 text-xs text-muted">{event.details}</p>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="py-8 text-center text-sm text-muted">No timeline events.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions Tab */}
                    {detailTab === "actions" && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-text">Quick Actions</h4>
                        
                        {/* Status Actions */}
                        <div className="space-y-2">
                          <h5 className="text-xs font-bold uppercase text-muted">Status Changes</h5>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {["acknowledged", "investigating", "mitigated"].includes(selectedIncident.status) && (
                              <button
                                onClick={() => handleStatusChange("investigating")}
                                disabled={actionLoading}
                                className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-600 transition hover:bg-amber-500/20 disabled:opacity-50"
                              >
                                <FaSearch size={14} /> Start Investigation
                              </button>
                            )}
                            {["acknowledged", "investigating", "mitigated"].includes(selectedIncident.status) && (
                              <button
                                onClick={() => handleStatusChange("mitigated")}
                                disabled={actionLoading}
                                className="flex items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm font-bold text-orange-600 transition hover:bg-orange-500/20 disabled:opacity-50"
                              >
                                <FaShieldAlt size={14} /> Mark Mitigated
                              </button>
                            )}
                            {["new", "open", "acknowledged", "investigating", "mitigated"].includes(selectedIncident.status) && (
                              <button
                                onClick={() => setShowResolveModal(true)}
                                disabled={actionLoading}
                                className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-600 transition hover:bg-emerald-500/20 disabled:opacity-50"
                              >
                                <FaCheckCircle size={14} /> Resolve
                              </button>
                            )}
                            {["resolved"].includes(selectedIncident.status) && (
                              <button
                                onClick={() => setShowCloseModal(true)}
                                disabled={actionLoading}
                                className="flex items-center justify-center gap-2 rounded-xl border border-gray-500/30 bg-gray-500/10 px-4 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-500/20 disabled:opacity-50"
                              >
                                <FaBan size={14} /> Close Incident
                              </button>
                            )}
                            {["resolved", "closed", "dismissed"].includes(selectedIncident.status) && (
                              <button
                                onClick={() => setShowReopenModal(true)}
                                disabled={actionLoading}
                                className="flex items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm font-bold text-violet-600 transition hover:bg-violet-500/20 disabled:opacity-50"
                              >
                                <FaSync size={14} /> Reopen Incident
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Severity Action */}
                        <div className="space-y-2">
                          <h5 className="text-xs font-bold uppercase text-muted">Severity</h5>
                          <button
                            onClick={() => setShowSeverityModal(true)}
                            disabled={actionLoading}
                            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted-bg px-4 py-3 text-sm font-bold text-text transition hover:bg-muted-bg/80 disabled:opacity-50 w-full sm:w-auto"
                          >
                            <FaExclamationTriangle size={14} /> Change Severity
                          </button>
                        </div>

                        {/* Dismiss */}
                        {["new", "open", "acknowledged"].includes(selectedIncident.status) && (
                          <div className="space-y-2">
                            <h5 className="text-xs font-bold uppercase text-muted">Other</h5>
                            <button
                              onClick={() => handleStatusChange("dismissed")}
                              disabled={actionLoading}
                              className="flex items-center justify-center gap-2 rounded-xl border border-slate-500/30 bg-slate-500/10 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-500/20 disabled:opacity-50"
                            >
                              <FaTimesCircle size={14} /> Dismiss Incident
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-[500px] items-center justify-center">
              <EmptyState
                icon="🛡️"
                title="Select an Incident"
                description="Choose an incident from the list to view details and take actions."
              />
>>>>>>> master
            </div>
          )}
        </div>
      </div>
<<<<<<< HEAD
=======

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-black text-text">Resolve Incident</h3>
            <p className="mt-1 text-sm text-muted">Provide a summary of the resolution.</p>
            <textarea
              value={resolutionSummary}
              onChange={(e) => setResolutionSummary(e.target.value)}
              placeholder="Describe how the incident was resolved..."
              rows={4}
              className="mt-4 w-full rounded-xl border border-border bg-muted-bg px-4 py-3 text-sm text-text outline-none focus:border-primary"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowResolveModal(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-text hover:bg-muted-bg"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={!resolutionSummary.trim() || actionLoading}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
              >
                <FaCheckCircle size={14} /> Resolve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-black text-text">Close Incident</h3>
            <p className="mt-1 text-sm text-muted">Provide a reason for closing this incident.</p>
            <textarea
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
              placeholder="Enter close reason..."
              rows={3}
              className="mt-4 w-full rounded-xl border border-border bg-muted-bg px-4 py-3 text-sm text-text outline-none focus:border-primary"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowCloseModal(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-text hover:bg-muted-bg"
              >
                Cancel
              </button>
              <button
                onClick={handleClose}
                disabled={!closeReason.trim() || actionLoading}
                className="flex items-center gap-2 rounded-xl bg-gray-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-gray-600 disabled:opacity-50"
              >
                <FaBan size={14} /> Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reopen Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-black text-text">Reopen Incident</h3>
            <p className="mt-1 text-sm text-muted">Explain why this incident needs to be reopened.</p>
            <textarea
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="Enter reopen reason..."
              rows={3}
              className="mt-4 w-full rounded-xl border border-border bg-muted-bg px-4 py-3 text-sm text-text outline-none focus:border-primary"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowReopenModal(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-text hover:bg-muted-bg"
              >
                Cancel
              </button>
              <button
                onClick={handleReopen}
                disabled={!reopenReason.trim() || actionLoading}
                className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-600 disabled:opacity-50"
              >
                <FaSync size={14} /> Reopen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Severity Modal */}
      {showSeverityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-black text-text">Change Severity</h3>
            <p className="mt-1 text-sm text-muted">Update the incident severity level.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {(["low", "medium", "high", "critical"] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => handleSeverityChange(sev)}
                  disabled={actionLoading || selectedIncident?.severity === sev}
                  className={`rounded-xl border p-4 text-center font-bold capitalize transition disabled:opacity-50 ${
                    SEVERITY_COLORS[sev].border
                  } ${
                    selectedIncident?.severity === sev
                      ? `${SEVERITY_COLORS[sev].bg} ${SEVERITY_COLORS[sev].text}`
                      : "bg-background text-text hover:bg-muted-bg"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <input
                type="text"
                value={severityReason}
                onChange={(e) => setSeverityReason(e.target.value)}
                placeholder="Reason for change (optional)"
                className="w-full rounded-xl border border-border bg-muted-bg px-4 py-2.5 text-sm text-text outline-none focus:border-primary"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowSeverityModal(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-text hover:bg-muted-bg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
>>>>>>> master
    </DashboardShell>
  );
}
