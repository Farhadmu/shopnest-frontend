"use client";

import { Chip } from "@heroui/react";
import type { Coupon, CouponPlacement } from "@/types/coupon";

const STATUS_STYLES: Record<Coupon["approvalStatus"], string> = {
  approved: "bg-success/10 text-success border border-success/20",
  pending: "bg-warning/10 text-warning border border-warning/20",
  rejected: "bg-error/10 text-error border border-error/20",
};

const PLACEMENT_META: Record<CouponPlacement, { icon: string; label: string }> = {
  store: { icon: "🏬", label: "Store Page" },
  homepage: { icon: "🚀", label: "Homepage" },
  private: { icon: "🔒", label: "Private" },
};

/** Shows whether a coupon is active/pending/rejected/expired, in one reusable pill. */
export function CouponStatusChip({
  coupon,
}: {
  coupon: Pick<Coupon, "approvalStatus" | "isActive" | "expiresAt">;
}) {
  const isExpired = coupon.expiresAt ? new Date(coupon.expiresAt) < new Date() : false;

  const label = isExpired
    ? "Expired"
    : coupon.approvalStatus === "pending"
      ? "Pending Review"
      : coupon.approvalStatus === "rejected"
        ? "Rejected"
        : coupon.isActive
          ? "Active"
          : "Inactive";

  const style = isExpired
    ? "bg-muted/10 text-muted border border-border"
    : (STATUS_STYLES[coupon.approvalStatus] ?? STATUS_STYLES.approved);

  return <Chip className={`text-[11px] font-semibold ${style}`}>{label}</Chip>;
}

/** Shows where a coupon is (will be) shown: store page, homepage, or private/share-only. */
export function CouponPlacementChip({ placement }: { placement: CouponPlacement }) {
  const meta = PLACEMENT_META[placement];
  return (
    <Chip variant="secondary" className="text-[11px] font-semibold">
      {meta.icon} {meta.label}
    </Chip>
  );
}
