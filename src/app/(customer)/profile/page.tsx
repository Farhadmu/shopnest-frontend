"use client";
import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile, UserProfile } from "@/lib/api/users";
export default function ProfilePage() {
  const [p, setP] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    getUserProfile()
      .then((d) => {
        setP(d);
        setName(d.name);
      })
      .catch(() => undefined);
  }, []);
  const save = () =>
    updateUserProfile({ name })
      .then((d) => {
        setP(d);
        setMsg("Profile updated");
      })
      .catch((e) => setMsg(e instanceof Error ? e.message : "Update failed"));
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">Account</p>
      <h1 className="mt-1 text-3xl font-black">Profile & Security</h1>
      <p className="mt-2 text-sm text-muted">Manage your identity and account preferences.</p>
      <div className="mt-5 rounded-2xl border border-border bg-surface p-6">
        <div className="grid gap-4">
          <div>
            <label className="text-xs font-bold">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3"
            />
          </div>
          <div className="rounded-xl bg-muted-bg p-4">
            <p className="text-xs text-muted">Email</p>
            <p className="mt-1 font-bold">{p?.email || "Loading…"}</p>
          </div>
          <div className="rounded-xl bg-muted-bg p-4">
            <p className="text-xs text-muted">Role</p>
            <p className="mt-1 font-bold capitalize">{p?.role || "customer"}</p>
          </div>
          <button onClick={save} className="rounded-xl bg-primary px-4 py-3 font-bold text-white">
            Save changes
          </button>
          {msg && <p className="text-sm font-semibold text-primary">{msg}</p>}
        </div>
      </div>
    </div>
  );
}
