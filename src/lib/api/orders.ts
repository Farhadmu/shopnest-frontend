import { protectedFetch, protectedMutation } from "@/lib/core/server";

export interface Order {
  id: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

export async function getOrders() {
  return protectedFetch<Order[]>("/orders");
}

export async function getOrderById(id: string) {
  return protectedFetch<Order>(`/orders/${id}`);
}

export async function createOrder(data: { shippingAddress: string; paymentMethod: string }) {
  return protectedMutation<Order>("/orders", "POST", data);
}
