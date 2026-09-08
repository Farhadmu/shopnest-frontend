export type CouponDiscountType = "percentage" | "fixed";
export type CouponScope = "all-products" | "specific-category" | "specific-products";
export type CouponPlacement = "store" | "homepage" | "private";
export type CouponApprovalStatus = "approved" | "pending" | "rejected";

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

  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
};
