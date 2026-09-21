import { clientFetch, clientMutation } from "@/lib/core/client";

export interface SellerStore {
  id: string;
  storeName: string;
  description: string;
  trustScore: number;
}

export interface PublicSellerStore {
  _id?: string;
  id?: string;
  storeName: string;
  slug: string;
  description: string;
  logo?: string;
  banner?: string;
  bannerUrl?: string;
  bannerImage?: string;
  status: StoreStatus;
  trustScore: number;
  rating: number;
  ratingCount: number;
  followersCount: number;
  businessInfo?: BusinessInfo;
  salesNumber?: number;
  products?: Array<{
    title?: string;
    category?: string;
    tags?: string[];
    images?: string[];
  }>;
}

export type StoreStatus = "pending" | "approved" | "rejected" | "suspended";

export interface CategoryObj {
  _id?: string;
  id?: string;
  name?: string;
  slug?: string;
  image?: string;
}

export function resolveCategoryTitle(
  cat: string | CategoryObj | undefined | null,
  fallback = "General Marketplace"
): string {
  if (!cat) return fallback;
  if (typeof cat === "object" && cat !== null) {
    return cat.name || cat.slug || fallback;
  }
  if (typeof cat === "string") {
    const trimmed = cat.trim();
    if (!trimmed) return fallback;
    // If it's a 24-char Mongo ObjectId that was not populated, return fallback rather than raw hex
    if (/^[0-9a-fA-F]{24}$/.test(trimmed)) {
      return fallback;
    }
    return trimmed;
  }
  return fallback;
}

export interface BusinessInfo {
  ownerName?: string;
  contactPhone?: string;
  businessAddress?: string;
  nidOrTradeLicense?: string;
  taxId?: string;
  categoryId?: string | CategoryObj;
  category?: string | CategoryObj;
  payoutMethod?: "bank" | "bkash" | "nagad" | "rocket" | string;
  payoutAccountNumber?: string;
  payoutAccountName?: string;
  bankBranch?: string;
}

export interface MyStore {
  id: string;
  _id?: string;
  ownerId: string;
  storeName: string;
  slug: string;
  description: string;
  logo?: string;
  banner?: string;
  businessInfo?: BusinessInfo;
  rejectionReason?: string;
  suspensionReason?: string;
  appeal?: {
    reason: string;
    email?: string;
    submittedAt?: string;
    status: "pending" | "reviewed" | "rejected";
    adminResponse?: string;
  };
  verifiedAt?: string;
  verifiedBy?: string;
  status: StoreStatus;
  trustScore: number;
  rating: number;
  ratingCount: number;
  followersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStoreRecord extends MyStore {
  ownerEmail?: string | null;
  ownerFullName?: string | null;
  ownerImage?: string | null;
}

export interface AdminSellerFullDetails extends AdminStoreRecord {
  ownerRole?: string;
  ownerCreatedAt?: string;
  metrics?: {
    totalProducts: number;
    totalOrders: number;
    totalSales: number;
  };
  recentProducts?: Array<{
    id: string;
    title: string;
    price: number;
    images?: string[];
    stock?: number;
    status?: string;
    category?: string;
  }>;
}

export interface RegisterStoreInput {
  storeName: string;
  description: string;
  logo?: string;
  banner?: string;
  businessInfo?: BusinessInfo;
  resubmit?: boolean;
}

export async function getStoreById(storeId: string) {
  return clientFetch<SellerStore>(`/sellers/stores/${storeId}`);
}

/** Fetches approved public stores and their real product/sales summaries. */
export async function getPublicSellerStores() {
  return clientFetch<PublicSellerStore[]>('/sellers');
}

export async function getPublicSellerStoreBySlug(slug: string) {
  return clientFetch<PublicSellerStore & { success?: boolean }>(
    `/sellers/stores/${encodeURIComponent(slug)}`
  );
}

export async function getSellerDashboardMetrics() {
  return clientFetch<{ totalSales: number; totalOrders: number; totalProducts: number }>(
    "/sellers/metrics"
  );
}

/** Submits the seller application. Creates a Store with status "pending" — visible in seller dashboard only after admin approval. */
export async function registerStore(input: RegisterStoreInput) {
  return clientMutation<MyStore>("/sellers/register", "POST", input);
}

/** Fetches the signed-in seller's own store, including its approval status. */
export async function getMyStore() {
  return clientFetch<MyStore>("/sellers/me");
}

export async function updateMyStore(input: Partial<RegisterStoreInput>) {
  return clientMutation<MyStore>("/sellers/me", "PATCH", input);
}

/** Submits an official merchant appeal for a suspended store */
export async function submitSellerAppeal(input: { reason: string; email?: string }) {
  return clientMutation<{ message: string; store: MyStore }>("/sellers/me/appeal", "POST", input);
}

/** Admin endpoints for seller moderation */
export async function listAdminSellers(params?: { status?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search && params.search.trim()) query.set("search", params.search.trim());
  const queryString = query.toString();
  return clientFetch<AdminStoreRecord[]>(`/admin/sellers${queryString ? `?${queryString}` : ""}`);
}

export async function getAdminSellerDetails(id: string) {
  return clientFetch<AdminSellerFullDetails>(`/admin/sellers/${id}`);
}

export async function updateAdminSellerStatus(
  id: string,
  input: { status: StoreStatus; rejectionReason?: string; suspensionReason?: string }
) {
  return clientMutation<MyStore>(`/admin/sellers/${id}/status`, "PATCH", input);
}
