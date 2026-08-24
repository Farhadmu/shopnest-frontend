import { clientFetch } from "@/lib/core/client";

export interface SellerStore {
  id: string;
  storeName: string;
  description: string;
  trustScore: number;
}

export async function getStoreById(storeId: string) {
  return clientFetch<SellerStore>(`/sellers/stores/${storeId}`);
}

export async function getSellerDashboardMetrics() {
  return clientFetch<{ totalSales: number; totalOrders: number; totalProducts: number }>(
    "/sellers/metrics"
  );
}
