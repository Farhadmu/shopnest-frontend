import { protectedFetch } from "@/lib/core/server";
import { AdminStoreRecord, AdminSellerFullDetails, MyStore } from "./sellers";

export async function getAdminSellersServer(params?: { status?: string; search?: string }): Promise<AdminStoreRecord[]> {
  try {
    const query = new URLSearchParams();
    if (params?.status && params.status !== "all") query.set("status", params.status);
    if (params?.search && params.search.trim()) query.set("search", params.search.trim());
    const queryString = query.toString();
    const res = await protectedFetch<AdminStoreRecord[]>(`/admin/sellers${queryString ? `?${queryString}` : ""}`, {
      cache: "no-store",
    });
    return (res as any)?.data ?? res ?? [];
  } catch (err) {
    console.error("getAdminSellersServer failed:", err);
    return [];
  }
}

export async function getAdminSellerDetailsServer(id: string): Promise<AdminSellerFullDetails | null> {
  try {
    const res = await protectedFetch<AdminSellerFullDetails>(`/admin/sellers/${id}`, {
      cache: "no-store",
    });
    return (res as any)?.data ?? res ?? null;
  } catch (err) {
    console.error("getAdminSellerDetailsServer failed:", err);
    return null;
  }
}

export async function getMyStoreServer(): Promise<MyStore | null> {
  try {
    const res = await protectedFetch<MyStore>("/sellers/me", {
      cache: "no-store",
    });
    return (res as any)?.data ?? res ?? null;
  } catch (err) {
    console.error("getMyStoreServer failed:", err);
    return null;
  }
}
