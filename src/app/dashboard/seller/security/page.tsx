"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { LoadingCard, ErrorState, EmptyState } from "@/components/dashboard/DashboardStates";
import { clientFetch, clientMutation } from "@/lib/core/client";

interface Session {
  id: string;
  deviceName: string;
  deviceType: string;
  browser: string;
  os: string;
  ipAddress: string;
  lastActiveAt: string;
  isCurrentSession: boolean;
  status: string;
}

interface SecurityEvent {
  id: string;
  type: string;
  message: string;
  severity: "low" | "medium" | "high";
  createdAt: string;
}

export default function SellerSecurityCenter() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [securityScore, setSecurityScore] = useState(85);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sessionsRes, timelineRes] = await Promise.allSettled([
        clientFetch<any>("/security/sessions"),
        clientFetch<any>("/security/timeline"),
      ]);

      if (sessionsRes.status === "fulfilled") setSessions(sessionsRes.value || []);
      if (timelineRes.status === "fulfilled") setEvents(timelineRes.value || []);
    } catch {
      setError("Failed to load security data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRevokeSession = async (id: string) => {
    try {
      await clientMutation(`/security/sessions/${id}`, "DELETE");
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch { /* ignore */ }
  };

  const handleRevokeAll = async () => {
    try {
      await clientMutation("/security/sessions/revoke-all", "POST");
      setSessions((prev) => prev.map((s) => (s.isCurrentSession ? s : { ...s, status: "revoked" })));
    } catch { /* ignore */ }
  };

  return (
    <DashboardShell role="Seller" title="Security Center" subtitle="Monitor sessions, devices, and security events">
      <div className="space-y-6">
        {error && <ErrorState message={error} onRetry={loadData} />}

        {/* Security Score */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon="🛡️" value={`${securityScore}/100`} label="Security Score" note="Account security" color="success" />
          <StatCard icon="📱" value={String(sessions.filter((s) => s.status === "active").length)} label="Active Sessions" note="Logged in devices" color="default" />
          <StatCard icon="🔔" value={String(events.length)} label="Security Events" note="Recent events" color="warning" />
        </div>

        {/* Active Sessions */}
        <Panel title="Active Sessions">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-10 w-10 rounded-lg bg-muted-bg" />
                  <div className="flex-1">
                    <div className="h-4 w-32 rounded bg-muted-bg mb-1" />
                    <div className="h-3 w-48 rounded bg-muted-bg" />
                  </div>
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <EmptyState icon="📱" title="No active sessions" description="You're not logged in on any device." />
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
                      {session.deviceType === "mobile" ? "📱" : "💻"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text">{session.deviceName || "Unknown Device"}</p>
                      <p className="text-xs text-muted">{session.browser} • {session.os} • {session.ipAddress}</p>
                      <p className="text-xs text-muted">Last active: {new Date(session.lastActiveAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {session.isCurrentSession ? (
                    <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-600">Current</span>
                  ) : (
                    <button onClick={() => handleRevokeSession(session.id)} className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-500/20">
                      Revoke
                    </button>
                  )}
                </div>
              ))}
              {sessions.filter((s) => !s.isCurrentSession).length > 0 && (
                <button onClick={handleRevokeAll} className="w-full rounded-xl bg-red-500/10 py-2.5 text-sm font-bold text-red-600 hover:bg-red-500/20 transition">
                  Revoke All Other Sessions
                </button>
              )}
            </div>
          )}
        </Panel>

        {/* Security Timeline */}
        <Panel title="Security Events">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-muted-bg animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <EmptyState icon="🔔" title="No security events" description="Your account security looks good." />
          ) : (
            <div className="space-y-2">
              {events.slice(0, 10).map((event) => (
                <div key={event.id} className="flex items-center gap-3 rounded-lg bg-muted-bg/50 p-3">
                  <span className={`h-2 w-2 rounded-full ${event.severity === "high" ? "bg-red-500" : event.severity === "medium" ? "bg-amber-500" : "bg-emerald-500"}`} />
                  <div className="flex-1">
                    <p className="text-sm text-text">{event.message}</p>
                    <p className="text-xs text-muted">{new Date(event.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${event.severity === "high" ? "bg-red-500/10 text-red-600" : event.severity === "medium" ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"}`}>
                    {event.severity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </DashboardShell>
  );
}
