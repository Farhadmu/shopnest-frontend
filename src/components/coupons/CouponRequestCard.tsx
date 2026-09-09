"use client";

import { Button } from "@heroui/react";
import { formatCurrency } from "@/lib/utils";
import { formatDurationText } from "./CouponPlacementFields";
import type { Coupon } from "@/types/coupon";

interface CouponRequestCardProps {
  coupon: Coupon;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onReport?: (id: string) => void;
}

/** Bigger review card for a single pending "homepage placement" request, used on the Admin Pending Requests tab. */
export function CouponRequestCard({ coupon, onApprove, onReject, onReport }: CouponRequestCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 lg:w-1/4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
            {coupon.createdBy.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-text">Seller #{coupon.createdBy.slice(-6)}</p>
            <p className="text-xs text-muted">Requested homepage placement</p>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-3 rounded-xl bg-background/60 p-3 sm:grid-cols-4">
          <div>
            <p className="text-[10px] font-bold uppercase text-muted">Code</p>
            <p className="font-mono font-bold text-primary">{coupon.code}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-muted">Value</p>
            <p className="font-bold text-text">
              {coupon.type === "percentage" ? `${coupon.value}% OFF` : `${formatCurrency(coupon.value)} FLAT`}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-muted">Duration</p>
            <p className="font-semibold text-text">{formatDurationText(coupon.durationDays ?? 0)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-muted">Launch</p>
            <p className="font-semibold text-text">
              {coupon.promoStartDate ? new Date(coupon.promoStartDate).toLocaleDateString() : "Upon Approval"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {onReport && (
            <Button size="sm" variant="outline" onPress={() => onReport(coupon.id)}>
              Report
            </Button>
          )}
          <Button size="sm" variant="outline" onPress={() => onReject(coupon.id)}>
            Reject
          </Button>
          <Button size="sm" variant="primary" onPress={() => onApprove(coupon.id)}>
            Approve &amp; Publish
          </Button>
        </div>
      </div>
    </div>
  );
}
