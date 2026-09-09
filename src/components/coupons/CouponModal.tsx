"use client";

import { useEffect, useState } from "react";
import { Button, Card, Chip, Description, Input, Label } from "@heroui/react";
import { Percent, Sparkles, X, Ticket } from "lucide-react";
import { createCoupon, updateCoupon, getCategoryLimit } from "@/lib/api/coupons";
import { getErrorMessage } from "@/lib/core/errors";
import { CouponScopeFields } from "./CouponScopeFields";
import { CouponPlacementFields } from "./CouponPlacementFields";
import type { Coupon, CouponDiscountType, CouponPlacement, CouponScope } from "@/types/coupon";

interface CouponModalProps {
  /** "seller" can pick store / homepage(request) / private. "admin" coupons are always platform-wide. */
  mode: "seller" | "admin";
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  couponToEdit?: Coupon | null;
}

interface FormState {
  code: string;
  type: CouponDiscountType;
  value: number;
  minPurchase: number;
  maxDiscount: string;
  scope: CouponScope;
  category: string;
  categories: string[];
  productIds: string[];
  placement: CouponPlacement;
  usageLimit: string;
  startsAt: string;
  expiresAt: string;
  promoStartDate: string;
  durationDays: number;
}

function emptyForm(mode: "seller" | "admin"): FormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    code: "",
    type: "percentage",
    value: 10,
    minPurchase: 0,
    maxDiscount: "",
    scope: "all-products",
    category: "",
    categories: [],
    productIds: [],
    placement: mode === "admin" ? "homepage" : "store",
    usageLimit: "",
    startsAt: today,
    expiresAt: "",
    promoStartDate: today,
    durationDays: 7,
  };
}

function formFromCoupon(coupon: Coupon, mode: "seller" | "admin"): FormState {
  const today = new Date().toISOString().slice(0, 10);
  const categories =
    coupon.categories && coupon.categories.length > 0
      ? coupon.categories
      : coupon.category
        ? [coupon.category]
        : [];

  return {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    minPurchase: coupon.minPurchase || 0,
    maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : "",
    scope: coupon.scope,
    category: coupon.category || (categories[0] || ""),
    categories,
    productIds: coupon.productIds || [],
    placement: coupon.placement || (mode === "admin" ? "homepage" : "store"),
    usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
    startsAt: coupon.startsAt ? coupon.startsAt.slice(0, 10) : today,
    expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
    promoStartDate: coupon.promoStartDate ? coupon.promoStartDate.slice(0, 10) : today,
    durationDays: coupon.durationDays ?? 7,
  };
}

/**
 * Single reusable "Create/Edit Coupon" modal powered by HeroUI components.
 * Seller Coupons page and Admin Coupons page both render this component —
 * dynamic labels and fields adjust based on whether Percentage (%) or Fixed Amount (৳) is chosen.
 */
export function CouponModal({ mode, isOpen, onClose, onCreated, couponToEdit }: CouponModalProps) {
  const [form, setForm] = useState<FormState>(() =>
    couponToEdit ? formFromCoupon(couponToEdit, mode) : emptyForm(mode)
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryLimit, setCategoryLimit] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      if (couponToEdit) {
        setForm(formFromCoupon(couponToEdit, mode));
      } else {
        setForm(emptyForm(mode));
      }
      setError(null);
      getCategoryLimit()
        .then(setCategoryLimit)
        .catch(() => setCategoryLimit(undefined));
    }
  }, [isOpen, couponToEdit, mode]);

  if (!isOpen) return null;

  const patch = (data: Partial<FormState>) => setForm((prev) => ({ ...prev, ...data }));

  const handleClose = () => {
    setForm(emptyForm(mode));
    setError(null);
    onClose();
  };

  const generateRandomCode = () => {
    const prefixes = ["SAVE", "DEAL", "SPECIAL", "SUPER", "SHOP", "FEST", "BONUS"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = form.value > 0 && form.value <= 90 ? form.value : Math.floor(Math.random() * 40) + 10;
    patch({ code: `${prefix}${num}` });
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.code.trim()) return setError("Coupon code is required.");
    if (form.code.trim().length < 3) return setError("Coupon code must be at least 3 characters.");
    if (!form.value || form.value <= 0) return setError("Discount value must be greater than 0.");
    if (form.type === "percentage" && form.value > 100) {
      return setError("Percentage discount cannot exceed 100%.");
    }
    if (form.type === "fixed" && form.minPurchase > 0 && form.value > form.minPurchase) {
      return setError("Fixed discount cannot be greater than the minimum purchase requirement.");
    }
    if (form.scope === "specific-products" && form.productIds.length === 0) {
      return setError("Select at least one product.");
    }
    if (
      form.scope === "specific-category" &&
      (!form.categories || form.categories.length === 0) &&
      !form.category
    ) {
      return setError("Choose at least one category.");
    }
    if (
      form.placement === "homepage" &&
      form.scope === "specific-category" &&
      categoryLimit !== undefined &&
      form.categories.length > categoryLimit
    ) {
      return setError(`You cannot select more than ${categoryLimit} categories for homepage coupons as per admin configuration.`);
    }
    if (form.placement === "homepage") {
      if (!form.durationDays || form.durationDays <= 0) {
        return setError("Please specify a valid campaign duration in days.");
      }
      if (mode === "admin" && !form.promoStartDate) {
        return setError("Please set a launch date for the platform campaign.");
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: form.value,
        minPurchase: form.minPurchase,
        maxDiscount: form.type === "percentage" && form.maxDiscount ? Number(form.maxDiscount) : undefined,
        scope: form.scope,
        category: form.scope === "specific-category" ? form.categories[0] || form.category : undefined,
        categories: form.scope === "specific-category" ? form.categories : undefined,
        productIds: form.scope === "specific-products" ? form.productIds : undefined,
        placement: form.placement,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        startsAt: form.placement !== "homepage" ? form.startsAt || undefined : undefined,
        expiresAt: form.placement !== "homepage" ? form.expiresAt || undefined : undefined,
        promoStartDate:
          mode === "admin" && form.placement === "homepage" ? form.promoStartDate : undefined,
        durationDays: form.placement === "homepage" ? form.durationDays : undefined,
      };

      if (couponToEdit) {
        await updateCoupon(couponToEdit.id, payload);
      } else {
        await createCoupon(payload);
      }
      onCreated();
      handleClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = Boolean(couponToEdit);
  const submitLabel = isEditing
    ? "Update Coupon"
    : mode === "seller" && form.placement === "homepage"
      ? "Send Request to Admin"
      : "Save Coupon";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="relative my-auto flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text">
                {isEditing
                  ? mode === "admin"
                    ? "Edit Platform Site-Wide Coupon"
                    : "Edit Promotional Coupon"
                  : mode === "admin"
                    ? "Create Platform Site-Wide Coupon"
                    : "Create Promotional Coupon"}
              </h2>
              <p className="text-xs text-muted">
                {isEditing
                  ? "Update discount parameters, eligible scope, and campaign schedules."
                  : "Configure discount rules, inventory scope, and campaign placement."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-background hover:text-text cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="custom-scrollbar flex flex-col gap-6 overflow-y-auto p-6 text-sm">
          {error && (
            <p className="rounded-xl border border-error/20 bg-error/10 px-4 py-2.5 text-xs font-semibold text-error">
              {error}
            </p>
          )}

          {/* =========================================================
              LIVE PREVIEW TICKET (HeroUI Card)
          ========================================================= */}
          <Card className="border border-primary/25 bg-gradient-to-r from-primary/10 via-primary/5 to-surface shadow-xs">
            <Card.Content className="p-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
                    {form.type === "percentage" ? (
                      <span className="text-lg font-black tracking-tight">{form.value || 0}%</span>
                    ) : (
                      <span className="text-base font-black tracking-tight">৳{form.value || 0}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-extrabold tracking-wider text-text">
                        {form.code.trim() ? form.code.toUpperCase() : "COUPON_CODE"}
                      </span>
                      <Chip size="sm" variant="soft" color="accent">
                        {form.type === "percentage" ? "Percentage Off" : "Flat Cash Discount"}
                      </Chip>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {form.type === "percentage"
                        ? `${form.value || 0}% off qualifying items ${form.maxDiscount ? `(Cap: ৳${form.maxDiscount})` : ""}`
                        : `Flat ৳${form.value || 0} deducted from cart`}
                      {form.minPurchase > 0 ? ` • Min Spend: ৳${form.minPurchase}` : " • No min spend"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Chip size="sm" variant="secondary" color="default">
                    {form.placement === "store"
                      ? "🏬 Store Page"
                      : form.placement === "homepage"
                        ? "🚀 Homepage Live"
                        : "🔒 Private Share"}
                  </Chip>
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* =========================================================
              SECTION 1: CODE & DISCOUNT TYPE
          ========================================================= */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Coupon Code */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-text">
                  Coupon Code <span className="text-error">*</span>
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onPress={generateRandomCode}
                  className="h-6 px-2 text-[11px] font-bold text-primary hover:bg-primary/10 cursor-pointer"
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  Random Code
                </Button>
              </div>
              <Input
                value={form.code}
                onChange={(e) =>
                  patch({ code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") })
                }
                placeholder="e.g. SUMMER50"
                fullWidth
              />
              <Description className="text-[11px] text-muted">
                Letters, numbers, and hyphens only.
              </Description>
            </div>

            {/* Discount Type (Percentage vs Fixed) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-text">
                  Discount Type <span className="text-error">*</span>
                </Label>
                <span className="text-[11px] font-semibold text-primary">
                  {form.type === "percentage" ? "Percentage Calculation" : "Flat Amount Deduction"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-muted-bg p-1">
                <Button
                  type="button"
                  size="sm"
                  variant={form.type === "percentage" ? "primary" : "ghost"}
                  onPress={() => patch({ type: "percentage" })}
                  className={`flex items-center justify-center gap-2 rounded-lg font-bold transition-all cursor-pointer ${
                    form.type === "percentage" ? "shadow-sm" : "text-muted hover:text-text hover:bg-surface/50"
                  }`}
                >
                  <Percent className="h-3.5 w-3.5" />
                  <span>Percentage (%)</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={form.type === "fixed" ? "primary" : "ghost"}
                  onPress={() => patch({ type: "fixed" })}
                  className={`flex items-center justify-center gap-2 rounded-lg font-bold transition-all cursor-pointer ${
                    form.type === "fixed" ? "shadow-sm" : "text-muted hover:text-text hover:bg-surface/50"
                  }`}
                >
                  <span className="text-sm font-black">৳</span>
                  <span>Fixed Amount (৳)</span>
                </Button>
              </div>
              <Description className="text-[11px] text-muted">
                {form.type === "percentage"
                  ? "Calculates a dynamic % reduction based on order total."
                  : "Deducts a fixed taka amount regardless of order total."}
              </Description>
            </div>
          </div>

          {/* =========================================================
              SECTION 2: DYNAMIC VALUE & MIN/MAX FIELDS (HeroUI)
          ========================================================= */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Discount Value */}
            <div className="flex flex-col gap-1">
              <Label className="flex items-center justify-between text-xs font-bold text-text">
                <span>
                  {form.type === "percentage"
                    ? "Discount Percentage (%)"
                    : "Flat Discount Amount (৳)"}{" "}
                  <span className="text-error">*</span>
                </span>
                <span className="text-[11px] font-normal text-muted">
                  {form.type === "percentage" ? "1% to 100%" : "Direct ৳ discount"}
                </span>
              </Label>
              <Input
                type="number"
                min={1}
                max={form.type === "percentage" ? 100 : undefined}
                value={String(form.value)}
                onChange={(e) => patch({ value: Number(e.target.value) })}
                placeholder={form.type === "percentage" ? "e.g. 15 for 15% off" : "e.g. 200 for ৳200 off"}
                fullWidth
              />
              <Description className="text-[11px] text-muted">
                {form.type === "percentage"
                  ? `Customers receive ${form.value || 0}% off qualifying cart items.`
                  : `Customers receive flat ৳${form.value || 0} off their subtotal.`}
              </Description>
            </div>

            {/* Minimum Purchase */}
            <div className="flex flex-col gap-1">
              <Label className="flex items-center justify-between text-xs font-bold text-text">
                <span>
                  {form.type === "percentage"
                    ? "Minimum Order Value (৳)"
                    : "Minimum Spend Requirement (৳)"}
                </span>
                <span className="text-[11px] font-normal text-muted">
                  {form.minPurchase > 0 ? `৳${form.minPurchase} required` : "No minimum"}
                </span>
              </Label>
              <Input
                type="number"
                min={0}
                value={String(form.minPurchase)}
                onChange={(e) => patch({ minPurchase: Number(e.target.value) })}
                placeholder="0 for no minimum spend"
                fullWidth
              />
              <Description className="text-[11px] text-muted">
                {form.type === "percentage"
                  ? "Cart total required before the percentage discount applies."
                  : `Subtotal must reach this amount to redeem the ৳${form.value || 0} discount.`}
              </Description>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Max Discount Cap */}
            <div className="flex flex-col gap-1">
              {form.type === "percentage" ? (
                <>
                  <Label className="flex items-center justify-between text-xs font-bold text-text">
                    <span>Maximum Discount Cap (৳)</span>
                    <span className="text-[11px] font-normal text-muted">Optional cap</span>
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.maxDiscount}
                    onChange={(e) => patch({ maxDiscount: e.target.value })}
                    placeholder="e.g. 500 (Max taka discount)"
                    fullWidth
                  />
                  <Description className="text-[11px] text-muted">
                    Limits the discount on large orders (e.g. {form.value || 0}% up to ৳{form.maxDiscount || "..."}).
                  </Description>
                </>
              ) : (
                <>
                  <Label className="flex items-center justify-between text-xs font-bold text-muted">
                    <span>Maximum Discount Cap</span>
                    <Chip size="sm" variant="soft" color="default" className="text-[10px]">
                      Not Needed
                    </Chip>
                  </Label>
                  <div className="flex h-10 items-center rounded-xl border border-dashed border-border bg-muted-bg/40 px-3 text-xs text-muted">
                    Not applicable (discount is already fixed at ৳{form.value || 0})
                  </div>
                  <Description className="text-[11px] text-muted">
                    Flat vouchers are naturally capped at their exact value.
                  </Description>
                </>
              )}
            </div>

            {/* Total Usage Limit */}
            <div className="flex flex-col gap-1">
              <Label className="flex items-center justify-between text-xs font-bold text-text">
                <span>Total Usage Limit</span>
                <span className="text-[11px] font-normal text-muted">
                  {form.usageLimit ? `${form.usageLimit} redemptions max` : "Unlimited uses"}
                </span>
              </Label>
              <Input
                type="number"
                min={1}
                value={form.usageLimit}
                onChange={(e) => patch({ usageLimit: e.target.value })}
                placeholder="e.g. 100 (leave empty for unlimited)"
                fullWidth
              />
              <Description className="text-[11px] text-muted">
                Maximum number of times this coupon can be redeemed platform-wide.
              </Description>
            </div>
          </div>

          {/* Scope Fields */}
          <CouponScopeFields
            scope={form.scope}
            category={form.category}
            categories={form.categories}
            productIds={form.productIds}
            categoryLimit={categoryLimit}
            placement={form.placement}
            onScopeChange={(scope) => patch({ scope })}
            onCategoryChange={(category) => patch({ category })}
            onCategoriesChange={(categories) => patch({ categories })}
            onToggleProduct={(id) =>
              setForm((prev) => ({
                ...prev,
                productIds: prev.productIds.includes(id)
                  ? prev.productIds.filter((p) => p !== id)
                  : [...prev.productIds, id],
              }))
            }
          />

          {/* Placement Fields */}
          <CouponPlacementFields
            mode={mode}
            placement={form.placement}
            startsAt={form.startsAt}
            expiresAt={form.expiresAt}
            promoStartDate={form.promoStartDate}
            durationDays={form.durationDays}
            onPlacementChange={(placement) => patch({ placement })}
            onField={(f) => patch(f)}
          />
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-border bg-background/60 px-6 py-4">
          <Button variant="outline" onPress={handleClose} isDisabled={isSubmitting} className="cursor-pointer">
            Cancel
          </Button>
          <Button variant="primary" onPress={handleSubmit} isDisabled={isSubmitting} className="cursor-pointer font-bold shadow-sm">
            {isSubmitting ? "Saving…" : submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
