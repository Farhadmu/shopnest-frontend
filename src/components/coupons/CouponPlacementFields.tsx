"use client";

import { useMemo } from "react";
import { Button, Chip, Input, Label } from "@heroui/react";
import { Clock } from "lucide-react";
import type { CouponPlacement } from "@/types/coupon";

interface CouponPlacementFieldsProps {
  /** "seller" gets all 3 placements; "admin" coupons are always platform-wide. */
  mode: "seller" | "admin";
  placement: CouponPlacement;
  startsAt: string;
  expiresAt: string;
  promoStartDate: string;
  durationDays: number;
  onPlacementChange: (placement: CouponPlacement) => void;
  onField: (patch: Partial<{ startsAt: string; expiresAt: string; promoStartDate: string; durationDays: number }>) => void;
}

const SELLER_PLACEMENTS: { id: CouponPlacement; title: string; desc: string; icon: string }[] = [
  { id: "store", title: "My Store Page", desc: "Goes live instantly on your store", icon: "🏬" },
  { id: "homepage", title: "Marketplace Homepage", desc: "Needs admin approval first", icon: "🚀" },
  { id: "private", title: "Private / Share Only", desc: "Shown nowhere — you share the code", icon: "🔒" },
];

const ADMIN_PLACEMENTS: { id: CouponPlacement; title: string; desc: string; icon: string }[] = [
  { id: "homepage", title: "Platform Homepage", desc: "Live across the marketplace immediately", icon: "🌐" },
];

const PRESETS = [
  { label: "24 Hours", days: 1, hours: 0 },
  { label: "3 Days", days: 3, hours: 0 },
  { label: "4 Days 6 Hrs", days: 4, hours: 6 },
  { label: "7 Days (1 Wk)", days: 7, hours: 0 },
  { label: "14 Days", days: 14, hours: 0 },
  { label: "30 Days", days: 30, hours: 0 },
];

/** Formats decimal durationDays into human-readable Days & Hours string */
export function formatDurationText(durationDays: number): string {
  const totalHours = Math.round((durationDays || 0) * 24);
  const d = Math.floor(totalHours / 24);
  const h = totalHours % 24;

  const parts: string[] = [];
  if (d > 0) parts.push(`${d} Day${d > 1 ? "s" : ""}`);
  if (h > 0) parts.push(`${h} Hour${h > 1 ? "s" : ""}`);
  return parts.join(" ") || "0 Hours";
}

/** Reusable "where does this coupon show up" block: placement picker + the matching conditional schedule fields. */
export function CouponPlacementFields({
  mode,
  placement,
  startsAt,
  expiresAt,
  promoStartDate,
  durationDays,
  onPlacementChange,
  onField,
}: CouponPlacementFieldsProps) {
  const options = mode === "admin" ? ADMIN_PLACEMENTS : SELLER_PLACEMENTS;

  // Split decimal durationDays into integer days and hours
  const { currentDays, currentHours, totalHours } = useMemo(() => {
    const rawTotalHours = Math.round((durationDays || 7) * 24);
    const d = Math.floor(rawTotalHours / 24);
    const h = rawTotalHours % 24;
    return { currentDays: d, currentHours: h, totalHours: rawTotalHours };
  }, [durationDays]);

  const updateDuration = (days: number, hours: number) => {
    const safeDays = Math.max(0, Math.min(60, days));
    const safeHours = Math.max(0, Math.min(23, hours));
    const computedTotalDays = Number((safeDays + safeHours / 24).toFixed(4));
    onField({ durationDays: computedTotalDays > 0 ? computedTotalDays : 0.0417 }); // min 1 hour = ~0.0417 day
  };

  return (
    <div className="flex flex-col gap-3">
      {options.length > 1 && (
        <div>
          <Label className="font-semibold text-text">
            Placement <span className="text-error">*</span>
          </Label>
          <div className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onPlacementChange(opt.id)}
                className={`cursor-pointer rounded-xl border-2 p-3 text-left transition-all ${
                  placement === opt.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40 hover:bg-background"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{opt.icon}</span>
                  <span className="text-xs font-bold text-text">{opt.title}</span>
                </div>
                <p className="mt-1 text-[11px] text-muted">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-background/70 p-4">
        {placement === "homepage" ? (
          <div className="flex flex-col gap-4">
            {mode === "admin" && (
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-bold text-text">
                  Launch Date <span className="text-error">*</span>
                </Label>
                <Input
                  type="date"
                  value={promoStartDate}
                  onChange={(e) => onField({ promoStartDate: e.target.value })}
                  fullWidth
                />
              </div>
            )}

            {/* Duration Selector Header */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5 text-xs font-bold text-text">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>Campaign Duration (Days &amp; Hours)</span>
                  <span className="text-error">*</span>
                </Label>
                <Chip size="sm" variant="soft" color="accent" className="font-bold">
                  {formatDurationText(durationDays)} ({totalHours}h)
                </Chip>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((preset) => {
                  const isSelected =
                    currentDays === preset.days && currentHours === preset.hours;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => updateDuration(preset.days, preset.hours)}
                      className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-primary text-white shadow-xs"
                          : "border border-border bg-surface text-muted hover:border-primary/40 hover:text-text"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Days and Hours Interactive Inputs */}
            <div className="grid grid-cols-2 gap-3">
              {/* Days Input */}
              <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text">Days</span>
                  <span className="text-[10px] font-semibold text-muted">0 to 60 days</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onPress={() => updateDuration(Math.max(0, currentDays - 1), currentHours)}
                    className="h-8 w-8 min-w-8 font-bold text-sm"
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    value={String(currentDays)}
                    onChange={(e) => updateDuration(Number(e.target.value) || 0, currentHours)}
                    className="text-center font-bold"
                    fullWidth
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onPress={() => updateDuration(Math.min(60, currentDays + 1), currentHours)}
                    className="h-8 w-8 min-w-8 font-bold text-sm"
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Hours Input */}
              <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text">Hours</span>
                  <span className="text-[10px] font-semibold text-muted">0 to 23 hours</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onPress={() => updateDuration(currentDays, Math.max(0, currentHours - 1))}
                    className="h-8 w-8 min-w-8 font-bold text-sm"
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min={0}
                    max={23}
                    value={String(currentHours)}
                    onChange={(e) => updateDuration(currentDays, Number(e.target.value) || 0)}
                    className="text-center font-bold"
                    fullWidth
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onPress={() => updateDuration(currentDays, Math.min(23, currentHours + 1))}
                    className="h-8 w-8 min-w-8 font-bold text-sm"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            {/* Explanatory Approval Card for Seller */}
            {mode === "seller" && (
              <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-text">
                <span className="text-base">⏱️</span>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-primary">Starts Upon Admin Approval</span>
                  <span className="text-[11px] text-muted">
                    Your campaign will run for exactly{" "}
                    <strong className="text-text">{formatDurationText(durationDays)}</strong> from the moment an administrator approves your homepage request.
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-bold text-text">Start Date</Label>
              <Input type="date" value={startsAt} onChange={(e) => onField({ startsAt: e.target.value })} fullWidth />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-bold text-text">End Date (optional)</Label>
              <Input
                type="date"
                value={expiresAt}
                onChange={(e) => onField({ expiresAt: e.target.value })}
                fullWidth
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
