"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { getActivityTimeline, clearActivityTimeline } from "@/lib/api/customer-features";

export default function ActivityTimelinePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [activities, setActivities] = useState<Array<{ id: string; activityType: string; title: string; details?: string; createdAt: string }>>([]);
  const [grouped, setGrouped] = useState<Record<string, Array<{ id: string; activityType: string; title: string; details?: string; createdAt: string }>>>({});
  const [range, setRange] = useState("month");

  useEffect(() => {
    if (!isPending && !session?.user) router.push("/login");
    loadActivity();
  }, [session, isPending, range]);

  async function loadActivity() {
    try {
      const data = await getActivityTimeline(range);
      setActivities(data.activities);
      setGrouped(data.grouped);
    } catch { /* ignore */ }
  }

  async function handleClear() {
    if (confirm("Clear all activity history?")) {
      await clearActivityTimeline();
      setActivities([]);
      setGrouped({});
    }
  }

  const typeIcons: Record<string, string> = {
    view: "👁️", search: "🔍", wishlist_add: "❤️", cart_add: "🛒",
    order: "📦", review: "⭐", security: "🔐",
  };

  const links = [
    { label: "Security Center", href: "/customer/security", icon: "🔐", description: "Account security" },
    { label: "Activity Timeline", href: "/customer/activity", icon: "🧑‍💻", description: "Account activity" },
    { label: "Notifications", href: "/customer/notifications", icon: "🔔", description: "Notification center" },
    { label: "Profile", href: "/customer/profile-preferences", icon: "🧠", description: "Shopping profile" },
  ];

  return (
    <DashboardShell title="Account Activity Timeline" subtitle="View your recent account activity" role="Customer" links={links}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {["today", "week", "month"].map((r) => (
              <button key={r} onClick={() => setRange(r)} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${range === r ? "bg-primary text-white" : "bg-muted-bg text-text hover:bg-primary/10"}`}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={handleClear} className="rounded-lg bg-error/10 px-3 py-1.5 text-xs font-bold text-error hover:bg-error/20">
            Clear History
          </button>
        </div>

        <Panel title="Activity Timeline">
          {activities.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted">No activity recorded in this period</div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([date, items]) => (
                <div key={date}>
                  <h4 className="mb-2 text-sm font-bold text-text">{date}</h4>
                  <div className="space-y-2 border-l-2 border-primary/20 pl-4">
                    {items.map((activity) => (
                      <div key={activity.id} className="relative flex items-start gap-3">
                        <div className="absolute -left-[1.35rem] flex h-6 w-6 items-center justify-center rounded-full bg-surface text-sm">
                          {typeIcons[activity.activityType] || "📋"}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-text">{activity.title}</p>
                          {activity.details && <p className="text-xs text-muted">{activity.details}</p>}
                          <p className="text-xs text-muted">{new Date(activity.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
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
