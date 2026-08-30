"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { getSecurityCenter, revokeSession, revokeAllSessions, SecurityCenterResult } from "@/lib/api/customer-features";

export default function CustomerSecurityPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [security, setSecurity] = useState<SecurityCenterResult | null>(null);

  useEffect(() => {
    if (!isPending && !session?.user) router.push("/login");
    getSecurityCenter().then(setSecurity).catch(() => {});
  }, [session, isPending]);

  async function handleRevokeSession(id: string) {
    await revokeSession(id);
    getSecurityCenter().then(setSecurity).catch(() => {});
  }

  async function handleRevokeAll() {
    await revokeAllSessions();
    getSecurityCenter().then(setSecurity).catch(() => {});
  }

  const links = [
    { label: "Security Center", href: "/customer/security", icon: "🔐", description: "Account security" },
    { label: "Activity Timeline", href: "/customer/activity", icon: "🧑‍💻", description: "Account activity" },
    { label: "Notifications", href: "/customer/notifications", icon: "🔔", description: "Notification center" },
    { label: "Profile", href: "/customer/profile-preferences", icon: "🧠", description: "Shopping profile" },
  ];

  return (
    <DashboardShell title="Customer Security Center" subtitle="Protect your account and manage sessions" role="Customer" links={links}>
      <div className="space-y-6">
        {security && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard icon="🛡️" value={`${security.securityScore}/100`} label="Security Score" note="Good standing" />
              <StatCard icon="📱" value={String(security.sessions.length)} label="Active Sessions" note="Across devices" />
              <StatCard icon="🔔" value={security.twoFactorEnabled ? "On" : "Off"} label="2FA Status" note={security.twoFactorEnabled ? "Enabled" : "Not enabled"} />
            </div>

            <Panel title="Active Sessions">
              <div className="space-y-3">
                {security.sessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
                        {s.deviceType === "mobile" ? "📱" : "💻"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text">{s.deviceName}</p>
                        <p className="text-xs text-muted">{s.browser} • {s.os} • {s.ipAddress}</p>
                        <p className="text-xs text-muted">Last active: {new Date(s.lastActiveAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {s.isCurrentSession ? (
                      <span className="rounded-lg bg-success/10 px-2 py-1 text-xs font-bold text-success">Current</span>
                    ) : (
                      <button onClick={() => handleRevokeSession(s.id)} className="rounded-lg bg-error/10 px-3 py-1.5 text-xs font-bold text-error hover:bg-error/20">
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={handleRevokeAll} className="mt-4 rounded-lg bg-error/10 px-4 py-2 text-sm font-bold text-error hover:bg-error/20">
                Revoke All Other Sessions
              </button>
            </Panel>

            <Panel title="Security Timeline">
              <div className="space-y-2">
                {security.timeline.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 rounded-lg bg-muted-bg p-3">
                    <span className={`h-2 w-2 rounded-full ${event.riskLevel === "low" ? "bg-success" : event.riskLevel === "medium" ? "bg-warning" : "bg-error"}`} />
                    <div className="flex-1">
                      <span className="text-sm text-text">{event.actionTaken}</span>
                      <span className="ml-2 text-xs text-muted">Risk: {event.riskScore}/100</span>
                    </div>
                    <span className="text-xs text-muted">{new Date(event.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Security Recommendations">
              <ul className="space-y-2">
                {security.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted">
                    <span className="text-warning">⚠️</span> {rec}
                  </li>
                ))}
              </ul>
            </Panel>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
