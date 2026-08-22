import { clientFetch, clientMutation } from "@/lib/core/client";

export type NotificationType =
  | "order_confirmation"
  | "order_shipped"
  | "order_delivered"
  | "price_drop"
  | "coupon"
  | "low_stock"
  | "seller_approval"
  | "new_review"
  | "flash_sale";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  relatedId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  success: boolean;
  items: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getNotifications(page = 1, limit = 20) {
  return clientFetch<NotificationListResponse>("/notifications", { params: { page, limit } });
}

export async function getUnreadCount() {
  return clientFetch<{ success: boolean; count: number }>("/notifications/unread-count");
}

export async function markNotificationRead(id: string) {
  return clientMutation<{ success: boolean } & Notification>(`/notifications/${id}/read`, "PATCH");
}

export async function markAllNotificationsRead() {
  return clientMutation<{ success: boolean }>("/notifications/read-all", "PATCH");
}
