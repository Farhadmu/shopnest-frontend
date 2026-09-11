"use client";

import { useEffect, useState } from "react";
import { Chip } from "@heroui/react";
import { X, Tag, ShoppingBag, Layers, Calendar, Ticket, TrendingUp, Shield, Truck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getProductById, type Product } from "@/lib/api/products";
import { CouponPlacementChip, CouponStatusChip } from "./CouponStatusChip";
import type { Coupon } from "@/types/coupon";
import Image from "next/image";
import { Button } from "@heroui/react";

interface CouponDetailModalProps {
  coupon: Coupon | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onReport?: (id: string) => void;
  onResolveReport?: (id: string) => void;
}

/** A read-only detail modal that shows everything about a coupon — shared by admin & seller pages. */
export function CouponDetailModal({ coupon, isOpen, onClose, onApprove, onReject, onReport, onResolveReport }: CouponDetailModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (!isOpen || !coupon) {
      setProducts([]);
      return;
    }

    const validProductIds = (coupon.productIds ?? []).filter(
      (id) => id && id !== "undefined" && id !== "null" && id.trim() !== ""
    );

    if (coupon.scope === "specific-products" && validProductIds.length > 0) {
      setLoadingProducts(true);
      Promise.allSettled(validProductIds.map((id) => getProductById(id)))
        .then((results) => {
          const loaded = results
            .filter((r): r is PromiseFulfilledResult<Product> => r.status === "fulfilled")
            .map((r) => r.value);
          setProducts(loaded);
        })
        .finally(() => setLoadingProducts(false));
    }
  }, [isOpen, coupon]);

  if (!isOpen || !coupon) return null;

  const discountLabel =
    coupon.type === "percentage"
      ? `${coupon.value}% Off`
      : coupon.type === "free-shipping"
        ? "Free Shipping"
        : `${formatCurrency(coupon.value)} Off`;

  const scopeLabel =
    coupon.scope === "all-products"
      ? "All Products (Store-wide)"
      : coupon.scope === "specific-category"
        ? "Specific Categories"
        : "Specific Products";

  const categories =
    coupon.categories && coupon.categories.length > 0
      ? coupon.categories
      : coupon.category
        ? [coupon.category]
        : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative my-auto flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text">Coupon Details</h2>
              <p className="text-xs text-muted">Complete overview of this promotional coupon.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-background hover:text-text cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="custom-scrollbar flex flex-col gap-5 overflow-y-auto p-6">

          {/* ── Coupon Preview Card ── */}
          <div className="rounded-xl border border-primary/25 bg-linear-to-r from-primary/10 via-primary/5 to-surface p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
                  {coupon.type === "percentage" ? (
                    <span className="text-xl font-black tracking-tight">{coupon.value}%</span>
                  ) : coupon.type === "free-shipping" ? (
                    <Truck className="h-6 w-6" />
                  ) : (
                    <span className="text-lg font-black tracking-tight">৳{coupon.value}</span>
                  )}
                </div>
                <div>
                  <span className="font-mono text-lg font-extrabold tracking-wider text-text">
                    {coupon.code}
                  </span>
                  <p className="mt-0.5 text-xs text-muted">{discountLabel}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <CouponStatusChip coupon={coupon} />
                <CouponPlacementChip placement={coupon.placement} />
              </div>
            </div>
          </div>

          {/* ── Discount Details ── */}
          <Section icon={<TrendingUp className="h-4 w-4" />} title="Discount Details">
            <div className="grid grid-cols-2 gap-3">
              <DetailItem label="Discount Type" value={coupon.type === "percentage" ? "Percentage (%)" : coupon.type === "free-shipping" ? "Free Shipping" : "Fixed Amount (৳)"} />
              <DetailItem label="Discount Value" value={discountLabel} />
              <DetailItem
                label="Minimum Purchase"
                value={coupon.minPurchase > 0 ? formatCurrency(coupon.minPurchase) : "No minimum"}
              />
              <DetailItem
                label="Max Discount Cap"
                value={
                  coupon.type === "percentage" && coupon.maxDiscount
                    ? formatCurrency(coupon.maxDiscount)
                    : coupon.type === "fixed"
                      ? "N/A (fixed)"
                      : "No cap"
                }
              />
            </div>
          </Section>

          {/* ── Scope & Eligibility ── */}
          <Section icon={<Layers className="h-4 w-4" />} title="Scope & Eligibility">
            <DetailItem label="Applies To" value={scopeLabel} />

            {/* Categories */}
            {coupon.scope === "specific-category" && categories.length > 0 && (
              <div className="mt-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Categories ({categories.length})
                </span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      <Tag className="h-3 w-3" />
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            {coupon.scope === "specific-products" && (
              <div className="mt-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Products ({coupon.productIds?.length ?? 0})
                </span>
                {loadingProducts ? (
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                    Loading products…
                  </div>
                ) : products.length > 0 ? (
                  <div className="mt-1.5 flex flex-col gap-1.5">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-2.5 rounded-lg border border-border bg-background/60 px-3 py-2"
                      >
                        {product.images && product.images.length > 0 && product.images[0] ? (
                          <Image
                            width={48}
                            height={48}
                            src={product.images[0]}
                            alt={product.title || "Product image"}
                            className="h-9 w-9 rounded-lg object-cover border border-border"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg text-muted">
                            <ShoppingBag className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-text">{product.title}</p>
                          <p className="text-[11px] text-muted">
                            {formatCurrency(product.discountPrice ?? product.price)}
                            {product.category ? ` • ${product.category}` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : coupon.productIds && coupon.productIds.length > 0 ? (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {coupon.productIds.map((id) => (
                      <Chip key={id} size="sm" variant="soft" color="default" className="font-mono text-[10px]">
                        {id.slice(-8)}
                      </Chip>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            {coupon.scope === "all-products" && (
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-xs font-medium text-success">
                <Shield className="h-3.5 w-3.5" />
                Applies to all current and future products in the store.
              </div>
            )}
          </Section>

          {/* ── Schedule & Usage ── */}
          <Section icon={<Calendar className="h-4 w-4" />} title="Schedule & Usage">
            <div className="grid grid-cols-2 gap-3">
              <DetailItem
                label="Starts At"
                value={
                  coupon.startsAt
                    ? new Date(coupon.startsAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                    : "Immediately"
                }
              />
              <DetailItem
                label="Expires At"
                value={
                  coupon.expiresAt
                    ? new Date(coupon.expiresAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                    : coupon.placement === "homepage" && coupon.durationDays
                      ? `${coupon.durationDays}-day campaign`
                      : "No expiration"
                }
              />
              <DetailItem
                label="Total Usage"
                value={`${coupon.usedCount} used${coupon.usageLimit ? ` / ${coupon.usageLimit} max` : " (unlimited)"}`}
              />
              <DetailItem
                label="Created On"
                value={new Date(coupon.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              />
            </div>

            {coupon.placement === "homepage" && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <DetailItem
                  label="Campaign Duration"
                  value={coupon.durationDays ? `${coupon.durationDays} days` : "—"}
                />
                <DetailItem
                  label="Campaign Launch"
                  value={
                    coupon.promoStartDate
                      ? new Date(coupon.promoStartDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                      : "—"
                  }
                />
              </div>
            )}
          </Section>

          {/* ── Admin Report / Rejection Note ── */}
          {coupon.rejectionNote && (
            <div className="rounded-xl border border-error/30 bg-error/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-error">
                <Shield className="h-4 w-4" />
                Admin Report / Rejection Note
              </div>
              <p className="text-sm font-medium text-text">{coupon.rejectionNote}</p>
            </div>
          )}

          {/* ── Metadata ── */}
          <Section icon={<Shield className="h-4 w-4" />} title="Metadata">
            <div className="grid grid-cols-2 gap-3">
              <DetailItem
                label="Created By"
                value={coupon.createdByRole === "admin" ? "Admin" : `Seller #${coupon.createdBy.slice(-6)}`}
              />
              <DetailItem label="Approval Status" value={coupon.approvalStatus} />
              <DetailItem label="Active" value={coupon.isActive ? "✅ Yes" : "❌ No"} />
              <DetailItem
                label="Last Updated"
                value={new Date(coupon.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              />
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border bg-background/60 px-6 py-4">
          <div className="flex items-center gap-2">
            {coupon?.approvalStatus === "pending" && onApprove && (
              <Button size="sm" variant="primary" className="cursor-pointer font-bold" onPress={() => void (async () => { await onApprove(coupon.id); onClose(); })()}>
                Approve
              </Button>
            )}
            {coupon?.approvalStatus === "pending" && onReject && (
              <Button size="sm" variant="danger" className="cursor-pointer font-bold" onPress={() => { onReject(coupon.id); onClose(); }}>
                Reject
              </Button>
            )}
            {onReport && coupon?.createdByRole === "seller" && (
              <Button size="sm" variant="outline" className="cursor-pointer font-bold text-warning border-warning/40 hover:bg-warning/10" onPress={() => { onReport(coupon.id); onClose(); }}>
                Report
              </Button>
            )}
            {coupon?.approvalStatus === "reported" && onResolveReport && (
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer font-bold text-success border-success/40 hover:bg-success/10"
                onPress={() => {
                  onResolveReport(coupon.id);
                  onClose();
                }}
              >
                Remove Report
              </Button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Helper sub-components ─── */

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="text-[11px] font-semibold text-muted">{label}</span>
      <p className="mt-0.5 text-sm font-medium text-text">{value}</p>
    </div>
  );
}
