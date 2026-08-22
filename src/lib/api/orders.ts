import { clientFetch, clientMutation } from "@/lib/core/client";

export interface Order {
  id: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  subtotal: number;
  discount: number;
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
  createdAt: string;
}

export async function getOrders() {
  return clientFetch<Order[]>("/orders");
}

export async function getOrderById(id: string) {
  return clientFetch<Order>(`/orders/${id}`);
}

export async function createOrder(data: {
  shippingAddress: string;
  paymentMethod: string;
  couponCode?: string;
}) {
  return clientMutation<Order>("/orders", "POST", data);
}
