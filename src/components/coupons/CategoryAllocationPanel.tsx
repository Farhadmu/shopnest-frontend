"use client";

import { useEffect, useState } from "react";
import { Button, Input } from "@heroui/react";
import { getAdminSettings, updateAdminSettings } from "@/lib/api/admin-settings";
import { getHomepageQueueStatus } from "@/lib/api/coupons";
import { getErrorMessage } from "@/lib/core/errors";
import type { Coupon } from "@/types/coupon";

interface SellerLockedCount {
  sellerId: string;
  count: number;
}

/** Admin control: per-seller cap on how many categories may be locked for homepage coupons. */
export function CategoryAllocationPanel() {
  const [categoryLength, setCategoryLength] = useState("");
  const [lockedCount, setLockedCount] = useState(0);
  const [sellerLockedCounts, setSellerLockedCounts] = useState<SellerLockedCount[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    getAdminSettings()
      .then((s) => {
        setCategoryLength(String(s.category_length));
        setLockedCount(s.lockedCategoriesCount);
        setSellerLockedCounts(s.sellerLockedCounts || []);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const handleSave = async () => {
    const value = Number(categoryLength);
    if (!value || value <= 0) return setError("Enter a valid positive number.");

    setError(null);
    setSuccess(null);
    setIsSaving(true);
    try {
      const res = await updateAdminSettings(value);
      setCategoryLength(String(res.category_length));
      setLockedCount(res.lockedCategoriesCount);
      setSellerLockedCounts(res.sellerLockedCounts || []);
      setSuccess("Category limit updated.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <h3 className="text-sm font-bold text-text">Category Allocation Limit (Per Seller)</h3>
      <p className="mt-1 text-xs text-muted">
        Maximum number of product categories a single seller can have locked/assigned at once for homepage coupons.
        Currently <span className="font-bold text-text">{lockedCount}</span> categor{lockedCount === 1 ? "y" : "ies"} locked globally across all sellers.
      </p>
      {sellerLockedCounts.length > 0 && (
        <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-border bg-background/50 p-2 text-xs">
          <p className="font-semibold text-text mb-1">Per-seller locked categories:</p>
          <ul className="space-y-0.5">
            {sellerLockedCounts.map((s) => (
              <li key={s.sellerId} className="flex justify-between text-muted">
                <span>Seller #{s.sellerId.slice(-6)}</span>
                <span className="font-bold text-text">{s.count} / {categoryLength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div className="w-40">
          <Input
            type="number"
            min={1}
            value={categoryLength}
            onChange={(e) => setCategoryLength(e.target.value)}
            placeholder="e.g. 10"
            fullWidth
          />
        </div>
        <Button variant="primary" onPress={handleSave} isDisabled={isSaving} className="cursor-pointer text-xs font-bold">
          {isSaving ? "Saving…" : "Save Limit"}
        </Button>
      </div>
      {error && <p className="mt-2 text-xs font-medium text-error">{error}</p>}
      {success && <p className="mt-2 text-xs font-medium text-success">{success}</p>}
    </div>
  );
}

/** Admin view: which homepage coupons are currently "running" (live, max 3) vs "queued" (waiting). */
export function HomepageQueuePanel() {
  const [running, setRunning] = useState<Coupon[]>([]);
  const [queued, setQueued] = useState<Coupon[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHomepageQueueStatus()
      .then((res) => {
        setRunning(res.running);
        setQueued(res.queued);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <h3 className="text-sm font-bold text-text">Homepage Coupon Queue</h3>
      <p className="mt-1 text-xs text-muted">Up to 3 coupons run live at once; the rest wait in queue.</p>
      {error && <p className="mt-2 text-xs font-medium text-error">{error}</p>}

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase text-success">Running ({running.length}/3)</p>
          {running.length === 0 ? (
            <p className="text-xs text-muted">No coupons currently live.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {running.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-lg bg-success/5 px-2.5 py-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-success">#{c.queuePosition ?? 0}</span>
                    <span className="font-mono font-bold text-text">{c.code}</span>
                  </div>
                  <span className="text-muted">
                    {c.expiresAt ? `ends ${new Date(c.expiresAt).toLocaleDateString()}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase text-warning">Queued ({queued.length})</p>
          {queued.length === 0 ? (
            <p className="text-xs text-muted">No coupons waiting.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {queued.map((c, i) => (
                <li key={c.id} className="flex items-center justify-between rounded-lg bg-warning/5 px-2.5 py-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-warning">#{c.queuePosition ?? i + 1}</span>
                    <span className="font-mono font-bold text-text">{c.code}</span>
                  </div>
                  <span className="text-muted">Approved: {c.approvedAt ? new Date(c.approvedAt).toLocaleDateString() : "—"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
