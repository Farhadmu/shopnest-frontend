import { publicFetch, protectedFetch } from "@/lib/core/server";

export interface SellerStore {
  id: string;
  storeName: string;
  description: string;
  trustScore: number;
}

export async function getStoreById(storeId: string) {
  return publicFetch<SellerStore>(`/sellers/stores/${storeId}`);
}

export async function getSellerDashboardMetrics() {
  return protectedFetch<{ totalSales: number; totalOrders: number; totalProducts: number }>(
    "/sellers/metrics"
  );
}
