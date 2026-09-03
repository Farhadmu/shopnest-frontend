"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { LoadingCard, ErrorState } from "@/components/dashboard/DashboardStates";
import { clientFetch, clientMutation } from "@/lib/core/client";

interface StoreData {
  storeName: string;
  description: string;
  logo: string;
  banner: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
}

export default function StoreSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<StoreData>({
    storeName: "",
    description: "",
    logo: "",
    banner: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await clientFetch<any>("/sellers/me");
      const d = r.data ?? r;
      setForm({
        storeName: d.storeName || "",
        description: d.description || "",
        logo: d.logo || "",
        banner: d.banner || "",
        contactEmail: d.contactEmail || "",
        contactPhone: d.contactPhone || "",
        address: d.address || "",
      });
    } catch {
      setError("Failed to load store settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await clientMutation("/sellers/me", "PATCH", form);
      setSuccess("Store settings updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell role="Seller" title="Store Settings" subtitle="Manage your store profile, branding, and contact information">
      <div className="space-y-6">
        {error && <ErrorState message={error} onRetry={loadData} />}

        {success && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-600">
            ✅ {success}
          </div>
        )}

        {loading ? (
          <LoadingCard />
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Store Identity */}
            <Panel title="Store Identity">
              <div className="grid gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-muted">Store Name</label>
                  <input
                    type="text"
                    value={form.storeName}
                    onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                    placeholder="Your store name"
                    required
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-muted">Store Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe your store and what you sell..."
                    rows={5}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </Panel>

            {/* Branding */}
            <Panel title="Branding">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-muted">Logo URL</label>
                  <input
                    type="url"
                    value={form.logo}
                    onChange={(e) => setForm({ ...form, logo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                  {form.logo && (
                    <div className="mt-2 h-16 w-16 rounded-lg bg-muted-bg overflow-hidden">
                      <img src={form.logo} alt="Logo" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-muted">Banner URL</label>
                  <input
                    type="url"
                    value={form.banner}
                    onChange={(e) => setForm({ ...form, banner: e.target.value })}
                    placeholder="https://example.com/banner.png"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                  {form.banner && (
                    <div className="mt-2 h-16 w-full rounded-lg bg-muted-bg overflow-hidden">
                      <img src={form.banner} alt="Banner" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </Panel>

            {/* Contact Information */}
            <Panel title="Contact Information">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-muted">Contact Email</label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    placeholder="store@example.com"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-muted">Contact Phone</label>
                  <input
                    type="tel"
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    placeholder="+880 1XXX-XXXXXX"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold text-muted">Business Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Full business address"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </Panel>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50 transition"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardShell>
  );
}
