export type CouponDiscountType = "percentage" | "fixed" | "free-shipping";
export type CouponScope = "all-products" | "specific-category" | "specific-products";
export type CouponPlacement = "store" | "homepage" | "private";
export type CouponApprovalStatus = "approved" | "pending" | "rejected" | "reported";
export type CouponHomepageStatus = "running" | "queued" | "expired";

export interface Coupon {
  id: string;
  code: string;
  type: CouponDiscountType;
  value: number;
  minPurchase: number;
  maxDiscount?: number;

  scope: CouponScope;
  category?: string;
  categories?: string[];
  productIds?: string[];

  placement: CouponPlacement;
  approvalStatus: CouponApprovalStatus;
  rejectionNote?: string;

  createdBy: string;
  createdByRole: "seller" | "admin";

  startsAt?: string;
  expiresAt?: string;

  promoStartDate?: string;
  durationDays?: number;
  approvedAt?: string;
  homepageStatus?: CouponHomepageStatus;
  queuePosition?: number;

  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  /** Attached by the public homepage endpoint: the coupon's seller's store info. */
  storeName?: string;
  logo?: string;
}

export interface CreateCouponInput {
  code: string;
  type: CouponDiscountType;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;

  scope: CouponScope;
  category?: string;
  categories?: string[];
  productIds?: string[];

  placement: CouponPlacement;

  startsAt?: string;
  expiresAt?: string;

  promoStartDate?: string;
  durationDays?: number;

  usageLimit?: number;

  homepageStatus?: CouponHomepageStatus;
  queuePosition?: number;
  approvedAt?: string;
}

export const COUPON_PLACEMENT_LABEL: Record<CouponPlacement, string> = {
  store: "Store Page",
  homepage: "Homepage",
  private: "Private",
};

export const COUPON_STATUS_LABEL: Record<CouponApprovalStatus, string> = {
  approved: "Active",
  pending: "Pending Review",
  rejected: "Rejected",
  reported: "Reported",
};

export const COUPON_HOMEPAGE_STATUS_LABEL: Record<CouponHomepageStatus, string> = {
  running: "🚀 Running",
  queued: "⏳ Queued",
  expired: "Expired",
};
