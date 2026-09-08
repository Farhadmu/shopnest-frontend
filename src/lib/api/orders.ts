import { clientFetch, clientMutation } from "@/lib/core/client";

export interface OrderItem {
  productId: string;
  title?: string;
  name?: string;
  quantity: number;
  price: number;
  image?: string;
  storeId?: string;
  sellerId?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee?: number;
  couponCode?: string;
  totalAmount: number;
  status:
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refunded";
  paymentMethod: string;
  paymentStatus: "unpaid" | "paid" | "refunded";
  shippingAddress: string;
  userId?: string;
  statusHistory: Array<{ status: string; at: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStats {
  totalOrders: number;
  totalGmv: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}

export interface OrderListResponse {
  orders: Order[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export async function getAdminOrderStats() {
  return clientFetch<OrderStats>("/orders/admin/stats");
}

export async function searchAdminOrders(params: {
  q?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  seller?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params.q) query.append("q", params.q);
  if (params.status && params.status !== "all") query.append("status", params.status);
  if (params.paymentStatus) query.append("paymentStatus", params.paymentStatus);
  if (params.paymentMethod) query.append("paymentMethod", params.paymentMethod);
  if (params.seller) query.append("seller", params.seller);
  if (params.dateFrom) query.append("dateFrom", params.dateFrom);
  if (params.dateTo) query.append("dateTo", params.dateTo);
  if (params.sortBy) query.append("sortBy", params.sortBy);
  if (params.sortDir) query.append("sortDir", params.sortDir);
  if (params.page) query.append("page", String(params.page));
  if (params.limit) query.append("limit", String(params.limit));
  const qStr = query.toString();
  return clientFetch<OrderListResponse>(`/orders/admin/search${qStr ? `?${qStr}` : ""}`);
}

export async function getOrders() {
  return clientFetch<Order[]>("/orders");
}

export async function getOrderById(id: string) {
  return clientFetch<Order>(`/orders/${id}`);
}

export async function createOrder(data: {
  shippingAddress: string;
  division: string;
  paymentMethod: string;
  couponCode?: string;
}) {
  return clientMutation<Order>("/orders", "POST", data);
}

export async function cancelOrder(id: string) {
  return clientMutation(`/orders/${id}/cancel`, "PATCH");
}

export async function requestReturn(id: string, data: { reason: string }) {
  return clientMutation(`/orders/${id}/return`, "POST", data);
}
