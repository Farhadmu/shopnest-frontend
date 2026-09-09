import { clientFetch, clientMutation } from "@/lib/core/client";

export interface AdminSettings {
  id: string;
  category_length: number;
  lockedCategoriesCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Admin only: current global coupon-category allocation limit + how many are locked. */
export async function getAdminSettings() {
  return clientFetch<AdminSettings>("/admin/settings");
}

/** Admin only: update the global max number of categories that may be locked to sellers. */
export async function updateAdminSettings(category_length: number) {
  return clientMutation<{ success: boolean } & AdminSettings>("/admin/settings", "PATCH", { category_length });
}
