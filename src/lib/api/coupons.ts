import { clientFetch, clientMutation } from "@/lib/core/client";

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minPurchase: number;
  maxDiscount?: number;
  category?: string;
  productId?: string;
  createdBy: string;
  startsAt?: string;
  expiresAt?: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidationResult {
  success: boolean;
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  value: number;
}

export interface CreateCouponInput {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  category?: string;
  productId?: string;
  startsAt?: string;
  expiresAt?: string;
  usageLimit?: number;
}

/** Validates a coupon code against a cart subtotal; returns the discount it would apply. */
export async function validateCoupon(code: string, subtotal: number) {
  return clientFetch<CouponValidationResult>(`/coupons/validate/${encodeURIComponent(code)}`, {
    params: { subtotal },
  });
}

/** Seller/admin: list coupons owned by the current user (all coupons if admin). */
export async function getCoupons() {
  return clientFetch<Coupon[]>("/coupons");
}

/** Seller/admin: create a new coupon. */
export async function createCoupon(data: CreateCouponInput) {
  return clientMutation<{ success: boolean } & Coupon>("/coupons", "POST", data);
}

/** Seller/admin: delete a coupon. */
export async function deleteCoupon(id: string) {
  return clientMutation<{ success: boolean }>(`/coupons/${id}`, "DELETE");
}
