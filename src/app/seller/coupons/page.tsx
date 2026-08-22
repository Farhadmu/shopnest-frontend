"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button, Input } from "@heroui/react";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { formatCurrency } from "@/lib/utils";
import { getErrorMessage } from "@/lib/core/errors";
import {
  Coupon,
  CreateCouponInput,
  createCoupon,
  deleteCoupon,
  getCoupons,
} from "@/lib/api/coupons";

const EMPTY_FORM: CreateCouponInput = {
  code: "",
  type: "percentage",
  value: 10,
  minPurchase: 0,
};

export default function SellerCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<CreateCouponInput>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadCoupons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCoupons();
      setCoupons(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const handleCreate = async () => {
    setFormError(null);
    if (!form.code.trim()) {
      setFormError("Coupon code is required");
      return;
    }
    if (!form.value || form.value <= 0) {
      setFormError("Value must be greater than 0");
      return;
    }

    setIsSubmitting(true);
    try {
      await createCoupon({ ...form, code: form.code.trim().toUpperCase() });
      setIsFormOpen(false);
      setForm(EMPTY_FORM);
      await loadCoupons();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Coupons</h1>
          <p className="text-muted">Create and manage discount coupons for your customers.</p>
        </div>
        <Button variant="primary" onPress={() => setIsFormOpen((prev) => !prev)}>
          {isFormOpen ? "Close" : "+ New Coupon"}
        </Button>
      </div>

      {isFormOpen && (
        <div className="rounded-xl border border-border p-4 flex flex-col gap-4">
          <h3 className="font-semibold text-foreground">Create Coupon</h3>
          {formError && <p className="text-sm text-error">{formError}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">Coupon Code</label>
              <Input
                placeholder="e.g. SAVE20"
                value={form.code}
                onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                fullWidth
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">Discount Type</label>
              <select
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
                value={form.type}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, type: e.target.value as "percentage" | "fixed" }))
                }
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">
                {form.type === "percentage" ? "Percentage Off" : "Amount Off"}
              </label>
              <Input
                type="number"
                value={String(form.value)}
                onChange={(e) => setForm((prev) => ({ ...prev, value: Number(e.target.value) }))}
                fullWidth
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">Minimum Purchase</label>
              <Input
                type="number"
                value={String(form.minPurchase ?? 0)}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, minPurchase: Number(e.target.value) }))
                }
                fullWidth
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">Usage Limit (optional)</label>
              <Input
                type="number"
                value={form.usageLimit ? String(form.usageLimit) : ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    usageLimit: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                fullWidth
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">Expires At (optional)</label>
              <Input
                type="date"
                value={form.expiresAt ? form.expiresAt.slice(0, 10) : ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, expiresAt: e.target.value || undefined }))
                }
                fullWidth
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onPress={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" isDisabled={isSubmitting} onPress={handleCreate}>
              {isSubmitting ? "Creating..." : "Create Coupon"}
            </Button>
          </div>
        </div>
      )}

      {error && <ErrorState message={error} onRetry={loadCoupons} />}

      {!error && isLoading && <LoadingState message="Loading coupons..." />}

      {!error && !isLoading && coupons.length === 0 && (
        <EmptyState
          title="No coupons yet"
          description="Create your first coupon to offer discounts to customers."
          actionLabel="Create Coupon"
          onAction={() => setIsFormOpen(true)}
        />
      )}

      {!error && !isLoading && coupons.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/5 text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Min Purchase</th>
                <th className="px-4 py-3">Usage</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-t border-border">
                  <td className="px-4 py-3 font-semibold">{coupon.code}</td>
                  <td className="px-4 py-3 capitalize">{coupon.type}</td>
                  <td className="px-4 py-3">
                    {coupon.type === "percentage" ? `${coupon.value}%` : formatCurrency(coupon.value)}
                  </td>
                  <td className="px-4 py-3">{formatCurrency(coupon.minPurchase)}</td>
                  <td className="px-4 py-3">
                    {coupon.usedCount}
                    {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        coupon.isActive ? "bg-primary/10 text-primary" : "bg-muted/10 text-muted"
                      }`}
                    >
                      {coupon.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="danger" onPress={() => handleDelete(coupon.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
