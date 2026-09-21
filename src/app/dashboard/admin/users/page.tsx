"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Loader2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { clientFetch, clientMutation } from "@/lib/core/client";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "customer" | "seller" | "admin" | "delivery_man";
  banned: boolean;
  createdAt?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [targetUser, setTargetUser] = useState<UserItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    clientFetch<UserItem[] | { data: UserItem[] }>("/users", { params: { search: search || undefined } })
      .then((r) => {
        const list = Array.isArray(r) ? r : ((r as { data?: UserItem[] })?.data ?? []);
        setUsers(list);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleStatus = async () => {
    if (!targetUser) return;
    setActionLoading(true);
    setFeedbackMessage(null);

    const newBannedState = !targetUser.banned;
    try {
      await clientMutation(`/users/${targetUser.id}/status`, "PATCH", { banned: newBannedState });
      setFeedbackMessage(
        newBannedState
          ? `User "${targetUser.name}" suspended. All active sessions have been revoked.`
          : `User "${targetUser.name}" has been activated.`
      );
      setTargetUser(null);
      load();
    } catch {
      setFeedbackMessage("Failed to update user status. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "seller":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "delivery_man":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">User Management</h1>
          </div>
          <p className="mt-1.5 text-sm text-muted">
            Search, review, activate, or suspend platform accounts to keep the community secure.
          </p>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary flex items-center justify-between">
          <span>{feedbackMessage}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="cursor-pointer text-xs underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search by name or email address..."
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
          />
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-primary-hover active:scale-98 transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span>Search</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-xs">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="border-b border-border bg-muted-bg/50">
            <tr>
              <th className="p-4 text-left font-bold text-xs uppercase tracking-wider text-muted">User</th>
              <th className="p-4 text-left font-bold text-xs uppercase tracking-wider text-muted">Role</th>
              <th className="p-4 text-left font-bold text-xs uppercase tracking-wider text-muted">Status</th>
              <th className="p-4 text-right font-bold text-xs uppercase tracking-wider text-muted">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-muted">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                  <span className="text-xs font-semibold">Loading users...</span>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-muted">
                  <p className="text-sm font-bold text-text">No users found</p>
                  <p className="text-xs text-muted mt-1">Try adjusting your search query.</p>
                  {search && (
                    <button
                      onClick={() => {
                        setSearch("");
                        clientFetch<UserItem[]>("/users").then((r) => setUsers(Array.isArray(r) ? r : []));
                      }}
                      className="cursor-pointer mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-text hover:bg-muted-bg"
                    >
                      <RotateCcw className="h-3 w-3" /> Clear search
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-muted-bg/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
                        {u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-text truncate">{u.name || "Unnamed User"}</p>
                        <p className="text-xs text-muted truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${getRoleBadgeClass(
                        u.role
                      )}`}
                    >
                      {u.role.replace("_", " ")}
                    </span>
                  </td>

                  <td className="p-4">
                    {u.banned ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                        <ShieldAlert className="h-3.5 w-3.5" /> Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <ShieldCheck className="h-3.5 w-3.5" /> Active
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    {u.banned ? (
                      <button
                        onClick={() => setTargetUser(u)}
                        className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-500 hover:text-white transition shadow-xs"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Activate</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setTargetUser(u)}
                        className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white transition shadow-xs"
                      >
                        <UserX className="h-3.5 w-3.5" />
                        <span>Suspend</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl ${
                  targetUser.banned ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                }`}
              >
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text">
                  {targetUser.banned ? "Activate Account" : "Suspend Account"}
                </h3>
                <p className="text-xs text-muted">{targetUser.email}</p>
              </div>
            </div>

            <p className="text-sm text-text leading-relaxed">
              {targetUser.banned ? (
                <>
                  Are you sure you want to activate <strong className="text-primary">{targetUser.name}</strong>?
                  They will be able to log in and use the platform normally.
                </>
              ) : (
                <>
                  Are you sure you want to suspend <strong className="text-red-500">{targetUser.name}</strong>?
                  All active login sessions will be <strong>revoked immediately</strong> and their access will be blocked.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTargetUser(null)}
                disabled={actionLoading}
                className="cursor-pointer rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text hover:bg-muted-bg transition disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={actionLoading}
                className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-bold text-white transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                  targetUser.banned ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {actionLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : targetUser.banned ? (
                  <UserCheck className="h-3.5 w-3.5" />
                ) : (
                  <UserX className="h-3.5 w-3.5" />
                )}
                <span>{targetUser.banned ? "Confirm Activate" : "Confirm Suspend"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
