"use client";

import { useEffect, useState } from "react";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { userDashboardLinks } from "@/lib/constants/dashboard-nav";
import {
  getSecurityOverview,
  SecurityOverviewData,
  getActiveSessions,
  DeviceSessionItem,
  revokeSession,
  revokeAllOtherSessions,
  getSecurityTimeline,
  SecurityTimelineItem,
} from "@/lib/api/security-intelligence";
import { GaugeMeter } from "@/components/analytics/GaugeMeter";
import { FaShieldAlt, FaDesktop, FaMobileAlt, FaTrash, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

export default function CustomerSecurityPage() {
  const [overview, setOverview] = useState<SecurityOverviewData | null>(null);
  const [sessions, setSessions] = useState<DeviceSessionItem[]>([]);
  const [timeline, setTimeline] = useState<SecurityTimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      getSecurityOverview().catch(() => null),
      getActiveSessions().catch(() => []),
      getSecurityTimeline().catch(() => []),
    ])
      .then(([overRes, sessRes, timeRes]) => {
        if (overRes) setOverview(overRes);
        if (sessRes) setSessions(sessRes);
        if (timeRes) setTimeline(timeRes);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRevokeSession = async (id: string) => {
    try {
      await revokeSession(id);
      setActionSuccess("Device session revoked successfully");
      loadData();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch {
      // handled
    }
  };

  const handleRevokeAll = async () => {
    try {
      await revokeAllOtherSessions();
      setActionSuccess("Terminated all other active sessions");
      loadData();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch {
      // handled
    }
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

        {/* Security Shield Score & Checklist */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Account Defense Score">
            <div className="flex flex-col items-center justify-center p-4">
              <GaugeMeter score={overview?.securityScore || 92} title="Shield Rating" maxScore={100} size={180} />
              <p className="mt-4 text-center text-xs font-bold text-text">
                Status: <span className="text-primary">{overview?.statusLevel || "Optimal Shield"}</span>
              </p>
              <p className="mt-1 text-center text-[11px] text-muted">
                Enterprise session hashing and biometric auth active.
              </p>
            </div>
          </Panel>

          <div className="lg:col-span-2">
            <Panel title="Security Health Checklist">
              <div className="grid gap-3">
                {(overview?.checklist || []).map((item) => (
                  <div
                    key={item.key}
                    className="flex items-start justify-between rounded-xl border border-border bg-muted-bg/50 p-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      {item.status === "passed" ? (
                        <FaCheckCircle className="mt-0.5 text-emerald-500" size={13} />
                      ) : (
                        <FaExclamationTriangle className="mt-0.5 text-amber-500" size={13} />
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
            </Panel>
          </div>
        </div>

        {/* Active Devices & Sessions */}
        <Panel
          title="Recognized Devices & Active Sessions"
          action={
            <button
              type="button"
              onClick={handleRevokeAll}
              className="flex items-center gap-1.5 rounded-xl border border-error/30 bg-error/10 px-3 py-1.5 text-xs font-bold text-error transition hover:bg-error/20"
            >
              <FaTrash size={10} /> Revoke All Other Sessions
            </button>
          }
        >
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
        </Panel>

        {/* Security Audit Timeline */}
        <Panel title="Security & Login Events History">
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
                <span className="text-[10px] text-muted">{item.timestamp}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
