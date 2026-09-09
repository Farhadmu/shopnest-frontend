"use client";

import { useState } from "react";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { userDashboardLinks } from "@/lib/constants/dashboard-nav";
import { useSecurityData } from "@/hooks/dashboard/user/useSecurityData";
import { FaShieldAlt, FaDesktop, FaMobileAlt, FaTrash, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

export default function CustomerSecurityPage() {
  const { overview, sessions, timeline, loading, error, refresh, handleRevokeSession, handleRevokeAll } = useSecurityData();
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const getSecurityStatusColor = (score: number) => {
    if (score >= 85) return "text-success";
    if (score >= 65) return "text-warning";
    return "text-error";
  };

  const getSeverityColor = (severity: string) => {
    const map: Record<string, string> = {
      info: "bg-primary/15 text-primary",
      warning: "bg-warning/15 text-warning",
      critical: "bg-error/15 text-error",
    };
    return map[severity] || "bg-muted-bg text-muted";
  };

  return (
    <DashboardShell
      role="Customer"
      title="Customer Security & Session Center"
      subtitle="Monitor recognized login devices, terminate untrusted active sessions, inspect login history, and strengthen your account defense."
      links={userDashboardLinks}
    >
      <div className="grid gap-6">
        {actionSuccess && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <FaCheckCircle size={14} />
            <span>{actionSuccess}</span>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-error/30 bg-error/5 p-4 text-center text-sm text-error">
            {error}
            <button onClick={refresh} className="ml-3 underline text-xs">Retry</button>
          </div>
        )}

        {/* Security Overview */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Account Security Status">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-4">
                <div className="h-24 w-24 animate-pulse rounded-full bg-muted-bg" />
                <div className="mt-4 h-4 w-32 animate-pulse rounded-full bg-muted-bg" />
              </div>
            ) : overview ? (
              <div className="flex flex-col items-center justify-center p-4">
                <div className={`text-4xl font-black ${getSecurityStatusColor(overview.securityScore)}`}>
                  {overview.securityScore}
                </div>
                <p className="mt-2 text-center text-xs font-bold text-text">
                  Status: <span className="text-primary">{overview.statusLevel}</span>
                </p>
                <div className="mt-3 grid w-full grid-cols-2 gap-2 text-center text-[11px]">
                  <div className="rounded-xl bg-muted-bg/50 p-2">
                    <div className="font-black text-text">{overview.activeSessions}</div>
                    <div className="text-muted">Active Sessions</div>
                  </div>
                  <div className="rounded-xl bg-muted-bg/50 p-2">
                    <div className="font-black text-text">{overview.revokedSessions}</div>
                    <div className="text-muted">Revoked</div>
                  </div>
                  <div className="rounded-xl bg-muted-bg/50 p-2">
                    <div className="font-black text-text">{overview.failedLogins}</div>
                    <div className="text-muted">Failed Logins</div>
                  </div>
                  <div className="rounded-xl bg-muted-bg/50 p-2">
                    <div className="font-black text-text">{overview.recentSecurityEvents}</div>
                    <div className="text-muted">Events</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-muted">No security data available.</div>
            )}
          </Panel>

          <div className="lg:col-span-2">
            <Panel title="Security Health Checklist">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-xl bg-muted-bg" />
                  ))}
                </div>
              ) : overview?.checklist && overview.checklist.length > 0 ? (
                <div className="grid gap-3">
                  {overview.checklist.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-start justify-between rounded-xl border border-border bg-muted-bg/50 p-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        {item.status === "passed" ? (
                          <FaCheckCircle className="mt-0.5 text-emerald-500" size={13} />
                        ) : item.status === "warning" ? (
                          <FaExclamationTriangle className="mt-0.5 text-amber-500" size={13} />
                        ) : (
                          <FaShieldAlt className="mt-0.5 text-primary" size={13} />
                        )}
                        <div>
                          <p className="font-extrabold text-text">{item.title}</p>
                          <p className="text-[11px] text-muted">{item.note}</p>
                        </div>
                      </div>
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-black text-primary">
                        +{item.score} pts
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-muted">No checklist data available.</div>
              )}
            </Panel>
          </div>
        </div>

        {/* Active Devices & Sessions */}
        <Panel
          title="Recognized Devices & Active Sessions"
          action={
            <button
              type="button"
              onClick={() => {
                handleRevokeAll();
                setActionSuccess("Terminated all other active sessions");
                setTimeout(() => setActionSuccess(null), 3000);
              }}
              disabled={sessions.filter((s) => !s.isCurrentSession).length === 0}
              className="flex items-center gap-1.5 rounded-xl border border-error/30 bg-error/10 px-3 py-1.5 text-xs font-bold text-error transition hover:bg-error/20 disabled:opacity-50"
            >
              <FaTrash size={10} /> Revoke All Other Sessions
            </button>
          }
        >
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted-bg" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted-bg/20 p-8 text-center text-sm text-muted">
              No active sessions found.
            </div>
          ) : (
            <div className="grid gap-3">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className={`flex flex-col justify-between gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center ${
                    sess.isCurrentSession ? "border-primary/40 bg-primary/5" : "border-border bg-surface"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted-bg text-lg">
                      {sess.deviceType === "mobile" ? <FaMobileAlt /> : <FaDesktop />}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-text">{sess.deviceName}</h3>
                        {sess.isCurrentSession && (
                          <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                            This Device
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted">
                        {sess.browser} • {sess.os} • IP: {sess.ipAddress} • {sess.locationCity}
                      </p>
                      <p className="text-[10px] text-muted/80">
                        Last active: {new Date(sess.lastActiveAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {!sess.isCurrentSession && (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(sess.id)}
                      className="self-end rounded-xl border border-border bg-muted-bg px-3 py-1.5 text-xs font-bold text-muted transition hover:border-error/40 hover:text-error sm:self-auto"
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Security Audit Timeline */}
        <Panel title="Security & Login Events History">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-muted-bg" />
              ))}
            </div>
          ) : timeline.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted-bg/20 p-8 text-center text-sm text-muted">
              No recent security activity.
            </div>
          ) : (
            <div className="space-y-2.5">
              {timeline.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-muted-bg/50 p-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-base">{item.icon || "🔒"}</span>
                    <div>
                      <p className="font-extrabold text-text">{item.event}</p>
                      <p className="text-[11px] text-muted">{item.detail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${getSeverityColor(item.severity)}`}>
                      {item.severity}
                    </span>
                    <span className="text-[10px] text-muted">{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </DashboardShell>
  );
}
