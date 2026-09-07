import { clientFetch, clientMutation } from "@/lib/core/client";

export interface Order {
  id: string;
  items: Array<{
    productId: string;
    title?: string;
    name?: string;
    quantity: number;
    price: number;
    image:string; 
  }>;
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
