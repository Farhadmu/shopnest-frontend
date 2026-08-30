"use client";

import { useEffect, useState } from "react";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { getAuditLogs, AuditLogItem } from "@/lib/api/admin-intelligence";
import { FaSearch, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const loadData = () => {
    getAuditLogs({
      search: search || undefined,
      role: roleFilter || undefined,
    })
      .then(setLogs)
      .catch(() => setLogs([]));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    loadData();
  }, [roleFilter, search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const links = [
    { label: "Command Center", href: "/admin/dashboard", icon: "🌐", description: "Macro marketplace telemetry." },
    { label: "Platform Analytics", href: "/admin/analytics", icon: "📈", description: "Marketplace-wide growth trends." },
    { label: "Security Center", href: "/admin/security", icon: "🛡️", description: "Platform security & access logs." },
    { label: "Risk & Fraud Matrix", href: "/admin/risk", icon: "🚨", description: "Heuristic anomaly & abuse risk." },
    { label: "Incident Manager", href: "/admin/incidents", icon: "📑", description: "Security incident triage & notes." },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: "📜", description: "System & admin audit trail." },
    { label: "User Management", href: "/admin/users", icon: "👥", description: "Platform user status & accounts." },
    { label: "Seller Verification", href: "/admin/sellers", icon: "🏪", description: "Merchant approvals & vetting." },
    { label: "Product Moderation", href: "/admin/products", icon: "📦", description: "Catalog compliance & reviews." },
  ];

  return (
    <DashboardShell
      role="Administrator"
      title="Platform Security & Governance Audit Log"
      subtitle="Immutable audit trail of administrator approvals, merchant modifications, product moderations, system rate-limiting actions, and access policies."
      links={links}
    >
      <div className="grid gap-6">
        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3 sm:p-4">
          <form onSubmit={handleSearchSubmit} className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-md">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-muted-bg px-3 py-1.5 focus-within:border-primary">
              <FaSearch size={12} className="text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search actor, action or resource..."
                className="min-w-0 flex-1 bg-transparent text-xs text-text outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white transition hover:bg-primary-hover"
            >
              Filter
            </button>
          </form>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-border bg-muted-bg px-3 py-1.5 text-xs font-bold text-text outline-none focus:border-primary"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="seller">Seller</option>
              <option value="system">System Sentinel</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <Panel
          title={`Audit Records (${logs.length})`}
          action={
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
              Zero Secrets Exposed
            </span>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="pb-3 font-bold">Timestamp</th>
                  <th className="pb-3 font-bold">Actor</th>
                  <th className="pb-3 font-bold">Role</th>
                  <th className="pb-3 font-bold">Action</th>
                  <th className="pb-3 font-bold">Resource</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {logs.map((log) => (
                  <tr key={log.id} className="transition hover:bg-muted-bg/50">
                    <td className="py-3 text-[11px] text-muted whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 font-extrabold text-text max-w-[160px] truncate">{log.actorName}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                          log.role === "admin"
                            ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                            : log.role === "seller"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : log.role === "system"
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            : "bg-primary/15 text-primary"
                        }`}
                      >
                        {log.role}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-bold text-text">{log.action}</td>
                    <td className="py-3 text-muted">{log.resource}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          log.status === "success"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : log.status === "warning"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {log.status === "success" ? <FaCheckCircle size={9} /> : <FaExclamationTriangle size={9} />}
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-muted">{log.ip || "127.0.0.1"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
