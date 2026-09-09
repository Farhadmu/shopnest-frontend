"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getSecurityOverview,
  getActiveSessions,
  revokeSession,
  revokeAllOtherSessions,
  getSecurityTimeline,
  SecurityOverviewData,
  DeviceSessionItem,
  SecurityTimelineItem,
} from "@/lib/api/security-intelligence";

export function useSecurityData() {
  const [overview, setOverview] = useState<SecurityOverviewData | null>(null);
  const [sessions, setSessions] = useState<DeviceSessionItem[]>([]);
  const [timeline, setTimeline] = useState<SecurityTimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [overRes, sessRes, timeRes] = await Promise.all([
        getSecurityOverview().catch(() => null),
        getActiveSessions().catch(() => []),
        getSecurityTimeline().catch(() => []),
      ]);
      if (overRes) setOverview(overRes);
      if (sessRes) setSessions(sessRes);
      if (timeRes) setTimeline(timeRes);
    } catch {
      setError("Failed to load security data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getSecurityOverview()
      .then((overRes) => {
        if (!active) return Promise.resolve([[], []] as [DeviceSessionItem[], SecurityTimelineItem[]]);
        if (overRes) setOverview(overRes);
        return Promise.all([getActiveSessions().catch(() => []), getSecurityTimeline().catch(() => [])]) as Promise<[DeviceSessionItem[], SecurityTimelineItem[]]>;
      })
      .then(([sessRes, timeRes]) => {
        if (!active) return;
        if (sessRes) setSessions(sessRes);
        if (timeRes) setTimeline(timeRes);
      })
      .catch(() => {
        if (active) setError("Failed to load security data");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const handleRevokeSession = async (id: string) => {
    await revokeSession(id);
    await refresh();
  };

  const handleRevokeAll = async () => {
    await revokeAllOtherSessions();
    await refresh();
  };

  return { overview, sessions, timeline, loading, error, refresh, handleRevokeSession, handleRevokeAll };
}
