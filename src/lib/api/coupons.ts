import { clientFetch, clientMutation } from "@/lib/core/client";
import type { Coupon, CreateCouponInput } from "@/types/coupon";

export type { Coupon, CreateCouponInput } from "@/types/coupon";

export interface CouponValidationResult {
  success: boolean;
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  value: number;
}

/** Validates a coupon code against a cart subtotal; returns the discount it would apply. */
export async function validateCoupon(code: string, subtotal: number) {
  return clientFetch<CouponValidationResult>(`/coupons/validate/${encodeURIComponent(code)}`, {
    params: { subtotal },
  });
}

/** Seller/admin: list coupons owned by the current user (all coupons if admin). */
export async function getCoupons(params?: { placement?: string; approvalStatus?: string }) {
  return clientFetch<Coupon[]>("/coupons", { params });
}

/** Seller/admin: create a new coupon. Sellers requesting "homepage" placement land as pending. */
export async function createCoupon(data: CreateCouponInput) {
  return clientMutation<{ success: boolean } & Coupon>("/coupons", "POST", data);
}

/** Admin only: approve a pending homepage placement request. */
export async function approveCoupon(id: string) {
  return clientMutation<{ success: boolean } & Coupon>(`/coupons/${id}/approve`, "PATCH");
}

/** Admin only: reject a pending homepage placement request. */
export async function rejectCoupon(id: string, rejectionNote?: string) {
  return clientMutation<{ success: boolean } & Coupon>(`/coupons/${id}/reject`, "PATCH", { rejectionNote });
}

/** Seller/admin: delete a coupon they own (admin can delete any). */
export async function deleteCoupon(id: string) {
  return clientMutation<{ success: boolean }>(`/coupons/${id}`, "DELETE");
}

/** Seller/admin: update an existing coupon they own (admin can update any). */
export async function updateCoupon(id: string, data: Partial<CreateCouponInput>) {
  return clientMutation<{ success: boolean } & Coupon>(`/coupons/${id}`, "PUT", data);
}

/** Public: approved + live coupons to feature on the marketplace homepage. */
export async function getHomepageCoupons() {
  return clientFetch<Coupon[]>("/coupons/public/homepage");
}

/** Public: approved + live coupons for one seller's store page. */
export async function getStoreCoupons(sellerId: string) {
  return clientFetch<Coupon[]>(`/coupons/public/store/${encodeURIComponent(sellerId)}`);
}
