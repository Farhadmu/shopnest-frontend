"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { Eye, Info, MessageSquare, Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CouponPlacementChip, CouponStatusChip } from "./CouponStatusChip";
import { CouponDetailModal } from "./CouponDetailModal";
import { useConfirm } from "@/context/ConfirmDialogContext";
import type { Coupon } from "@/types/coupon";

interface CouponTableProps {
  coupons: Coupon[];
  /** Admin's "All Platform Coupons" view adds a seller/owner column. */
  showOwner?: boolean;
  onEdit?: (coupon: Coupon) => void;
  onDelete?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onReport?: (id: string) => void;
  onResolveReport?: (id: string) => void;
}

function scopeLabel(coupon: Coupon): string {
  if (coupon.scope === "all-products") return "All Products";
  if (coupon.scope === "specific-category") {
    if (coupon.categories && coupon.categories.length > 0) {
      return coupon.categories.length === 1 ? coupon.categories[0] : `${coupon.categories.length} Categories`;
    }
    return coupon.category || "Category";
  }
  return `${coupon.productIds?.length ?? 0} Product(s)`;
}

/** Reusable coupon list table — shared by the seller "My Store Coupons" tab and the admin "All Platform Coupons" tab. */
export function CouponTable({ coupons, showOwner, onDelete, onEdit, onApprove, onReject, onReport, onResolveReport }: CouponTableProps) {
  const [viewingCoupon, setViewingCoupon] = useState<Coupon | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const confirm = useConfirm();

  const handleDeleteClick = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete Coupon?",
      message: "Are you sure you want to delete this coupon? This action cannot be undone.",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        setDeletingId(id);
        await onDelete?.(id);
        setDeletingId(null);
      },
    });
    if (!confirmed) {
      return;
    }
  };

  if (coupons.length === 0) return null;

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted-bg/60 text-left text-xs uppercase text-muted">
            <tr>
              {showOwner && <th className="px-4 py-3">Seller</th>}
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Scope</th>
              <th className="px-4 py-3">Placement</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-t border-border hover:bg-background/60">
                {showOwner && (
                  <td className="px-4 py-3 text-xs text-muted">
                    {coupon.createdByRole === "admin" ? "Admin" : `Seller #${coupon.createdBy.slice(-6)}`}
                  </td>
                )}
                <td className="px-4 py-3 font-mono font-bold text-text">{coupon.code}</td>
                <td className="px-4 py-3">
                  {coupon.type === "percentage" ? `${coupon.value}%` : formatCurrency(coupon.value)}
                </td>
                <td className="px-4 py-3 text-xs text-muted">{scopeLabel(coupon)}</td>
                <td className="px-4 py-3 min-w-32.5 inline-flex items-center gap-1">
                  <CouponPlacementChip placement={coupon.placement} />
                </td>
                <td className="px-4 py-3 text-xs">
                  {coupon.usedCount}
                  {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                </td>
                <td className="px-4 py-3 text-xs text-muted">
                  {coupon.expiresAt
                    ? new Date(coupon.expiresAt).toLocaleDateString()
                    : coupon.placement === "homepage" && coupon.durationDays
                      ? `${coupon.durationDays}d campaign`
                      : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CouponStatusChip coupon={coupon} />
                    {(coupon.approvalStatus === "rejected" || coupon.approvalStatus === "reported") && coupon.rejectionNote && (
                      <span
                        className="inline-flex cursor-help items-center rounded-full bg-error/10 px-2 py-0.5 text-[10px] font-bold text-error"
                        title={coupon.rejectionNote}
                      >
                        <Info className="mr-1 h-3 w-3" />
                        Admin Report
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* View Detail */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="cursor-pointer text-xs font-bold text-primary hover:bg-primary/10 flex gap-1.5 items-center"
                      onPress={() => setViewingCoupon(coupon)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                    {coupon.approvalStatus === "pending" && onApprove && (
                      <Button
                        size="sm"
                        variant="primary"
                        className="cursor-pointer text-xs font-bold"
                        onPress={() => onApprove(coupon.id)}
                      >
                        Approve
                      </Button>
                    )}
                    {coupon.approvalStatus === "pending" && onReject && (
                      <Button
                        size="sm"
                        variant="danger"
                        className="cursor-pointer text-xs font-bold"
                        onPress={() => onReject(coupon.id)}
                      >
                        Reject
                      </Button>
                    )}
                    {coupon.approvalStatus === "reported" && onResolveReport && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer text-xs font-bold text-success border-success/40 hover:bg-success/10"
                        onPress={() => onResolveReport(coupon.id)}
                      >
                        Remove Report
                      </Button>
                    )}
                    {onEdit && (!showOwner || coupon.createdByRole === "admin") && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="cursor-pointer text-xs font-bold flex gap-1.5 items-center"
                        onPress={() => onEdit(coupon)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    )}
                    {onReport && showOwner && coupon.createdByRole === "seller" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer text-xs font-bold flex gap-1.5 items-center text-warning border-warning/40 hover:bg-warning/10"
                        onPress={() => onReport(coupon.id)}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Report
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer text-xs font-bold text-error hover:border-error hover:bg-error/10 disabled:opacity-70"
                        onPress={() => void handleDeleteClick(coupon.id)}
                        isDisabled={deletingId === coupon.id}
                      >
                        {deletingId === coupon.id ? (
                          <span className="flex items-center gap-1.5">
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-error/30 border-t-error" />
                            Deleting...
                          </span>
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reusable Coupon Detail Modal */}
      <CouponDetailModal
        coupon={viewingCoupon}
        isOpen={viewingCoupon !== null}
        onClose={() => setViewingCoupon(null)}
        onApprove={onApprove}
        onReject={onReject}
        onReport={onReport}
        onResolveReport={onResolveReport}
      />
    </>
  );
}
