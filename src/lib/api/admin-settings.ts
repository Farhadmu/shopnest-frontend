import { clientFetch, clientMutation } from "@/lib/core/client";

export interface SellerLockedCount {
  sellerId: string;
  count: number;
}

export interface AdminSettings {
  id: string;
  category_length: number;
  lockedCategoriesCount: number;
  sellerLockedCounts: SellerLockedCount[];
  createdAt: string;
  updatedAt: string;
}

/** Admin only: current per-seller coupon-category allocation limit + how many are locked. */
export async function getAdminSettings() {
  return clientFetch<AdminSettings>("/admin/settings");
}

/** Admin only: update the per-seller max number of categories that may be locked to sellers. */
export async function updateAdminSettings(category_length: number) {
  return clientMutation<{ success: boolean } & AdminSettings>("/admin/settings", "PATCH", { category_length });
}
