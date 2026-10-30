"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getFraudCustomers,
  getCustomerFraudDossier,
  updateCustomerFraudStatus,
  runGlobalFraudScan,
  CustomerFraudProfileItem,
  CustomerFraudStats,
  CustomerFraudDossierResponse,
} from "@/lib/api/admin-intelligence";
import { formatCurrency } from "@/lib/utils";
import { StatCard, Panel, EmptyState } from "@/components/dashboard/DashboardUI";

export function CustomerFraudRadar() {
  const [profiles, setProfiles] = useState<CustomerFraudProfileItem[]>([]);
  const [stats, setStats] = useState<CustomerFraudStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [riskLevel, setRiskLevel] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dossier Modal State
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [dossier, setDossier] = useState<CustomerFraudDossierResponse | null>(null);
  const [loadingDossier, setLoadingDossier] = useState(false);
  const [adminNoteInput, setAdminNoteInput] = useState("");
  const [savingAction, setSavingAction] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFraudCustomers({
        search: search.trim() || undefined,
        riskLevel: riskLevel !== "all" ? riskLevel : undefined,
        status: status !== "all" ? status : undefined,
        page,
        limit: 15,
      });
      setProfiles(res.profiles || []);
      setStats(res.stats || null);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch {
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [search, riskLevel, status, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRunScan = async () => {
    setScanning(true);
    setScanMessage(null);
    try {
      const res = await runGlobalFraudScan();
      setScanMessage(res.message);
      await loadData();
    } catch (err: any) {
      setScanMessage(err?.message || "Failed to complete fraud scan.");
    } finally {
      setScanning(false);
    }
  };

  const handleToggleCod = async (profile: CustomerFraudProfileItem) => {
    const nextState = !profile.isCodRestricted;
    try {
      await updateCustomerFraudStatus(profile.userId, {
        isCodRestricted: nextState,
        reason: nextState ? "Admin manually restricted Cash on Delivery" : "Admin lifted Cash on Delivery restriction",
      });
      setProfiles((prev) =>
        prev.map((p) => (p.userId === profile.userId ? { ...p, isCodRestricted: nextState } : p))
      );
      if (dossier && dossier.profile.userId === profile.userId) {
        setDossier({ ...dossier, profile: { ...dossier.profile, isCodRestricted: nextState } });
      }
    } catch (err: any) {
      alert(err?.message || "Failed to update COD restriction status");
    }
  };

  const handleToggleBlacklist = async (profile: CustomerFraudProfileItem) => {
    const nextState = !profile.isBlacklisted;
    const confirmMsg = nextState
      ? `Are you sure you want to BLACKLIST customer "${profile.customerName}"? They will not be able to place any orders.`
      : `Whitelist and restore access for "${profile.customerName}"?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await updateCustomerFraudStatus(profile.userId, {
        isBlacklisted: nextState,
        reason: nextState ? "Admin blacklisted customer for fraud prevention" : "Admin whitelisted customer",
      });
      setProfiles((prev) =>
        prev.map((p) => (p.userId === profile.userId ? { ...p, isBlacklisted: nextState } : p))
      );
      if (dossier && dossier.profile.userId === profile.userId) {
        setDossier({ ...dossier, profile: { ...dossier.profile, isBlacklisted: nextState } });
      }
    } catch (err: any) {
      alert(err?.message || "Failed to update blacklist status");
    }
  };

  const openDossier = async (userId: string) => {
    setSelectedUserId(userId);
    setLoadingDossier(true);
    try {
      const data = await getCustomerFraudDossier(userId);
      setDossier(data);
      setAdminNoteInput(data.profile.adminNotes || "");
    } catch {
      setDossier(null);
    } finally {
      setLoadingDossier(false);
    }
  };

  const saveAdminNote = async () => {
    if (!selectedUserId) return;
    setSavingAction(true);
    try {
      const updated = await updateCustomerFraudStatus(selectedUserId, {
        adminNotes: adminNoteInput,
        reason: "Updated internal moderation notes",
      });
      if (dossier) {
        setDossier({ ...dossier, profile: { ...dossier.profile, adminNotes: updated.adminNotes } });
      }
      setProfiles((prev) =>
        prev.map((p) => (p.userId === selectedUserId ? { ...p, adminNotes: updated.adminNotes } : p))
      );
      alert("Admin notes saved successfully.");
    } catch (err: any) {
      alert(err?.message || "Failed to save note");
    } finally {
      setSavingAction(false);
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level?.toLowerCase()) {
      case "critical":
        return <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-extrabold text-rose-500 border border-rose-500/30">CRITICAL</span>;
      case "high":
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-500 border border-amber-500/30">HIGH</span>;
      case "medium":
        return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/15 px-2.5 py-0.5 text-[11px] font-extrabold text-yellow-600 dark:text-yellow-400 border border-yellow-500/30">MEDIUM</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-500 border border-emerald-500/30">LOW / SAFE</span>;
    }
  };

  const getTrustGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "border-emerald-500 text-emerald-500 bg-emerald-500/10";
      case "B": return "border-blue-500 text-blue-500 bg-blue-500/10";
      case "C": return "border-amber-500 text-amber-500 bg-amber-500/10";
      case "D": return "border-orange-500 text-orange-500 bg-orange-500/10";
      default: return "border-rose-500 text-rose-500 bg-rose-500/10";
    }
  };

  return (
    <div className="grid gap-6">
      {/* KPI Stats Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon="👥"
          label="Audited Customers"
          value={stats?.totalMonitored ?? profiles.length}
          note="Evaluated fraud profiles"
        />
        <StatCard
          icon="🚨"
          label="Critical / High Risk"
          value={(stats?.criticalRisk || 0) + (stats?.highRisk || 0)}
          note={`${stats?.criticalRisk || 0} critical, ${stats?.highRisk || 0} high`}
          color={((stats?.criticalRisk || 0) + (stats?.highRisk || 0)) > 0 ? "error" : "success"}
        />
        <StatCard
          icon="🚫"
          label="COD Restricted"
          value={stats?.codRestricted || 0}
          note="Excessive RTO / Refusal"
          color="warning"
        />
        <StatCard
          icon="⛔"
          label="Blacklisted Accounts"
          value={stats?.blacklisted || 0}
          note="Suspended from ordering"
          color="error"
        />
      </div>

      {/* Action Banner & Global Scan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-gradient-to-r from-surface to-muted-bg/40 p-5 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <h3 className="text-base font-black text-text">Customer Fraud Intelligence Radar</h3>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">Active Guard</span>
          </div>
          <p className="text-xs text-muted max-w-2xl">
            Real-time fraud heuristics detecting parcel refusal (RTO abuse), fake cash-on-delivery orders, multi-account abuse, and abnormal order bursts.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunScan}
          disabled={scanning}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50 shrink-0"
        >
          {scanning ? (
            <>
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Scanning All Customers...</span>
            </>
          ) : (
            <>
              <span>⚡</span>
              <span>Run Global Fraud Audit</span>
            </>
          )}
        </button>
      </div>

      {scanMessage && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs font-medium text-primary">
          {scanMessage}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 rounded-2xl border border-border bg-surface p-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by customer name, email, phone or user ID..."
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={riskLevel}
            onChange={(e) => {
              setRiskLevel(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-text focus:border-primary focus:outline-none"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical Risk</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low / Safe</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-text focus:border-primary focus:outline-none"
          >
            <option value="all">All Enforcement Status</option>
            <option value="cod_restricted">COD Restricted Only</option>
            <option value="blacklisted">Blacklisted Accounts Only</option>
            <option value="clean">Unrestricted Accounts</option>
          </select>

          {(search || riskLevel !== "all" || status !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setRiskLevel("all");
                setStatus("all");
                setPage(1);
              }}
              className="rounded-xl border border-border px-3 py-2 text-xs font-bold text-muted transition hover:bg-muted-bg"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Customers Fraud Table */}
      <Panel title="Monitored Customer Directory">
        {loading ? (
          <div className="flex h-44 items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-muted">
              <svg className="h-4 w-4 animate-spin text-primary" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Analyzing customer telemetry and fraud factors...</span>
            </div>
          </div>
        ) : profiles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="pb-3 font-bold">Customer Profile</th>
                  <th className="pb-3 font-bold text-center">Grade</th>
                  <th className="pb-3 font-bold">Risk Score</th>
                  <th className="pb-3 font-bold">Orders / Spend</th>
                  <th className="pb-3 font-bold">RTO Rate (Refusal)</th>
                  <th className="pb-3 font-bold">Identified Risk Signals</th>
                  <th className="pb-3 font-bold text-center">COD Status</th>
                  <th className="pb-3 font-bold text-center">Access</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {profiles.map((profile) => (
                  <tr key={profile.userId} className="hover:bg-muted-bg/50 transition">
                    {/* Customer Info */}
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {profile.avatarUrl ? (
                            <img
                              src={profile.avatarUrl}
                              alt=""
                              className="h-9 w-9 rounded-full object-cover border border-border"
                            />
                          ) : (
                            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {profile.customerName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {profile.isBlacklisted && (
                            <span className="absolute -bottom-0.5 -right-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-rose-500 text-[8px] text-white" title="Blacklisted">
                              ✕
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-text leading-tight">{profile.customerName}</p>
                          <p className="text-[11px] text-muted truncate max-w-[180px]">{profile.customerEmail || "No email"}</p>
                          {profile.customerPhone && (
                            <p className="text-[10px] text-muted font-mono">{profile.customerPhone}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Trust Grade */}
                    <td className="py-3.5 text-center">
                      <span className={`inline-block w-6 h-6 rounded-lg border text-center font-black leading-6 text-xs ${getTrustGradeColor(profile.trustGrade)}`}>
                        {profile.trustGrade}
                      </span>
                    </td>

                    {/* Risk Score */}
                    <td className="py-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-text text-sm">{profile.riskScore}</span>
                          <span className="text-[10px] text-muted">/100</span>
                          {getRiskBadge(profile.riskLevel)}
                        </div>
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-border">
                          <div
                            className={`h-full transition-all ${
                              profile.riskScore >= 75
                                ? "bg-rose-500"
                                : profile.riskScore >= 50
                                ? "bg-amber-500"
                                : profile.riskScore >= 25
                                ? "bg-yellow-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, profile.riskScore)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Orders & Total Spend */}
                    <td className="py-3.5">
                      <p className="font-bold text-text">{profile.totalOrders} orders</p>
                      <p className="text-[11px] text-muted font-medium">{formatCurrency(profile.totalSpent)}</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                        ✓ {profile.deliveredOrders} delivered
                      </p>
                    </td>

                    {/* RTO (Refusal / Return Rate) */}
                    <td className="py-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-black ${profile.rtoRate >= 25 ? "text-rose-500" : profile.rtoRate > 0 ? "text-amber-500" : "text-emerald-500"}`}>
                            {profile.rtoRate}%
                          </span>
                          {profile.returnedOrders > 0 && (
                            <span className="rounded bg-rose-500/10 px-1 text-[10px] font-bold text-rose-500">
                              {profile.returnedOrders} RTO
                            </span>
                          )}
                        </div>
                        {profile.cancelledOrders > 0 && (
                          <p className="text-[10px] text-muted">{profile.cancelledOrders} cancelled</p>
                        )}
                      </div>
                    </td>

                    {/* Risk Factors */}
                    <td className="py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {profile.riskFactors && profile.riskFactors.length > 0 ? (
                          profile.riskFactors.slice(0, 2).map((factor, idx) => (
                            <span
                              key={idx}
                              title={factor.description}
                              className="rounded-md bg-muted-bg px-1.5 py-0.5 text-[10px] font-semibold text-text border border-border truncate max-w-[200px]"
                            >
                              {factor.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-muted">Clean track record</span>
                        )}
                        {profile.riskFactors && profile.riskFactors.length > 2 && (
                          <span className="rounded-md bg-muted-bg px-1.5 py-0.5 text-[10px] text-muted">
                            +{profile.riskFactors.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>

                    {/* COD Restriction Toggle */}
                    <td className="py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleCod(profile)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                          profile.isCodRestricted
                            ? "bg-rose-500/15 text-rose-500 hover:bg-rose-500/25 border border-rose-500/30"
                            : "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border border-emerald-500/30"
                        }`}
                        title="Click to toggle Cash on Delivery restriction"
                      >
                        {profile.isCodRestricted ? "🚫 COD Blocked" : "✓ COD Allowed"}
                      </button>
                    </td>

                    {/* Blacklist / Whitelist Toggle */}
                    <td className="py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleBlacklist(profile)}
                        className={`rounded-lg px-2 py-1 text-[11px] font-bold transition ${
                          profile.isBlacklisted
                            ? "bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                            : "bg-muted-bg text-muted hover:text-text hover:bg-muted-bg/80"
                        }`}
                        title="Click to toggle account blacklist"
                      >
                        {profile.isBlacklisted ? "BANNED" : "Active"}
                      </button>
                    </td>

                    {/* View Dossier Button */}
                    <td className="py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => openDossier(profile.userId)}
                        className="inline-flex items-center gap-1 rounded-xl bg-surface border border-border px-3 py-1.5 text-xs font-bold text-text shadow-sm hover:border-primary hover:text-primary transition"
                      >
                        <span>Audit</span>
                        <span>→</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
                <p className="text-xs text-muted">
                  Page <span className="font-bold text-text">{page}</span> of{" "}
                  <span className="font-bold text-text">{totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg border border-border px-3 py-1 text-xs font-bold text-text transition hover:bg-muted-bg disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-lg border border-border px-3 py-1 text-xs font-bold text-text transition hover:bg-muted-bg disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon="🛡️"
            title="No Flagged Customers Found"
            description="All active customers match safe ordering profiles, or adjust your search filter."
          />
        )}
      </Panel>

      {/* Customer Fraud Dossier Modal */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-surface p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🕵️‍♂️</span>
                  <h3 className="text-lg font-black text-text">Customer Security & Fraud Dossier</h3>
                </div>
                <p className="text-xs text-muted">User ID: <span className="font-mono">{selectedUserId}</span></p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedUserId(null);
                  setDossier(null);
                }}
                className="grid h-8 w-8 place-items-center rounded-xl bg-muted-bg text-muted hover:text-text"
              >
                ✕
              </button>
            </div>

            {loadingDossier ? (
              <div className="flex h-64 items-center justify-center">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <svg className="h-5 w-5 animate-spin text-primary" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Loading full customer telemetry and audit records...</span>
                </div>
              </div>
            ) : dossier ? (
              <div className="space-y-6 pt-5">
                {/* Profile Overview Card */}
                <div className="grid gap-4 sm:grid-cols-3 rounded-2xl border border-border bg-muted-bg/30 p-4">
                  <div>
                    <p className="text-[11px] font-bold text-muted uppercase">Customer Details</p>
                    <p className="text-sm font-black text-text mt-1">{dossier.profile.customerName}</p>
                    <p className="text-xs text-muted truncate">{dossier.profile.customerEmail || "No email"}</p>
                    <p className="text-xs text-muted font-mono">{dossier.profile.customerPhone || "No phone"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-muted uppercase">Risk & Trust Grade</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-block w-7 h-7 rounded-lg border text-center font-black leading-7 text-xs ${getTrustGradeColor(dossier.profile.trustGrade)}`}>
                        {dossier.profile.trustGrade}
                      </span>
                      <div>
                        <p className="text-sm font-black text-text">{dossier.profile.riskScore} / 100</p>
                        <p className="text-[10px] text-muted">{getRiskBadge(dossier.profile.riskLevel)}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-muted uppercase">Fulfillment Ratios</p>
                    <p className="text-xs font-bold text-text mt-1">Total Spent: {formatCurrency(dossier.profile.totalSpent)}</p>
                    <p className="text-xs text-emerald-500 font-semibold">{dossier.profile.deliveredOrders} Delivered ({dossier.profile.fulfillmentRate}%)</p>
                    <p className="text-xs text-rose-500 font-semibold">{dossier.profile.returnedOrders} Returns / RTO ({dossier.profile.rtoRate}%)</p>
                  </div>
                </div>

                {/* Risk Factors Breakdown */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-text">Detected Risk Factors</h4>
                  {dossier.profile.riskFactors && dossier.profile.riskFactors.length > 0 ? (
                    <div className="grid gap-2">
                      {dossier.profile.riskFactors.map((factor, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface p-3 text-xs"
                        >
                          <div>
                            <p className="font-bold text-text">{factor.name}</p>
                            <p className="text-muted text-[11px] mt-0.5">{factor.description}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-mono font-bold text-amber-500">
                              {factor.weight > 0 ? `+${factor.weight}` : factor.weight} pts
                            </span>
                            {getRiskBadge(factor.severity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                      No adverse risk factors identified for this customer.
                    </div>
                  )}
                </div>

                {/* Moderation Controls in Dossier */}
                <div className="rounded-2xl border border-border bg-surface p-4 space-y-4">
                  <h4 className="text-xs font-black uppercase text-text">Enforcement & Moderation Actions</h4>
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => handleToggleCod(dossier.profile)}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                        dossier.profile.isCodRestricted
                          ? "bg-rose-500 text-white hover:bg-rose-600"
                          : "bg-emerald-500 text-white hover:bg-emerald-600"
                      }`}
                    >
                      {dossier.profile.isCodRestricted ? "Lift COD Restriction" : "Restrict Cash on Delivery"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleBlacklist(dossier.profile)}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                        dossier.profile.isBlacklisted
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-rose-600 text-white hover:bg-rose-700"
                      }`}
                    >
                      {dossier.profile.isBlacklisted ? "Unban & Whitelist Customer" : "Blacklist Customer (Ban)"}
                    </button>
                  </div>

                  {/* Admin Notes */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <label className="text-xs font-bold text-text block">Admin Notes & Internal Audit Comments</label>
                    <textarea
                      value={adminNoteInput}
                      onChange={(e) => setAdminNoteInput(e.target.value)}
                      placeholder="Add notes about customer behavior, courier verification calls, or investigation results..."
                      rows={3}
                      className="w-full rounded-xl border border-border bg-background p-3 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={saveAdminNote}
                      disabled={savingAction}
                      className="rounded-xl bg-surface border border-border px-4 py-2 text-xs font-bold text-text shadow-sm hover:border-primary hover:text-primary transition disabled:opacity-50"
                    >
                      {savingAction ? "Saving..." : "Save Admin Notes"}
                    </button>
                  </div>
                </div>

                {/* Recent Orders in Dossier */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-text">Recent Orders History</h4>
                  {dossier.recentOrders && dossier.recentOrders.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-border bg-muted-bg/50">
                          <tr className="text-muted">
                            <th className="p-2.5 font-bold">Order ID</th>
                            <th className="p-2.5 font-bold">Amount</th>
                            <th className="p-2.5 font-bold">Payment</th>
                            <th className="p-2.5 font-bold">Status</th>
                            <th className="p-2.5 font-bold">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {dossier.recentOrders.map((ord: any) => (
                            <tr key={ord._id || ord.id} className="hover:bg-muted-bg/30">
                              <td className="p-2.5 font-mono text-muted">{String(ord._id || ord.id).substring(0, 10)}...</td>
                              <td className="p-2.5 font-bold text-text">{formatCurrency(ord.totalAmount)}</td>
                              <td className="p-2.5 capitalize">{ord.paymentMethod?.replace(/_/g, " ")}</td>
                              <td className="p-2.5">
                                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                  ord.status === "delivered" ? "bg-emerald-500/15 text-emerald-500" :
                                  ord.status === "cancelled" ? "bg-muted-bg text-muted" :
                                  ord.status === "returned" ? "bg-rose-500/15 text-rose-500" :
                                  "bg-amber-500/15 text-amber-500"
                                }`}>
                                  {ord.status}
                                </span>
                              </td>
                              <td className="p-2.5 text-muted">{new Date(ord.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-muted">No orders recorded for this customer yet.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-error py-8 text-center">Unable to load customer dossier.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
