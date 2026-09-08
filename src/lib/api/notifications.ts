import { clientFetch, clientMutation } from "@/lib/core/client";

export type NotificationType =
  | "order_confirmation"
  | "order_shipped"
  | "order_delivered"
  | "order_update"
  | "order_cancelled"
  | "return_update"
  | "price_drop"
  | "coupon"
  | "low_stock"
  | "seller_approval"
  | "new_review"
  | "flash_sale"
  | "security_alert"
  | "incident_alert"
  | "payment_alert"
  | "refund_alert"
  | "delivery_alert"
  | "inventory_alert"
  | "system_alert"
  | "ai_insight"
  | "admin_alert";

export type NotificationCategory =
  | "orders"
  | "sellers"
  | "reviews"
  | "security"
  | "incidents"
  | "payments"
  | "refunds"
  | "delivery"
  | "inventory"
  | "system"
  | "ai_insights";

export type NotificationPriority = "info" | "warning" | "high" | "critical";

export type NotificationSource =
  | "order"
  | "seller"
  | "review"
  | "security"
  | "incident"
  | "payment"
  | "refund"
  | "delivery"
  | "inventory"
  | "system"
  | "ai"
  | "admin";

export type NotificationRelatedType =
  | "order"
  | "seller"
  | "review"
  | "incident"
  | "security_event"
  | "product"
  | "user"
  | "delivery"
  | "payment"
  | "refund"
  | "system";

export interface Notification {
  id: string;
  userId: string;
  recipientType?: string;
  type: NotificationType;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  source?: NotificationSource;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  relatedId?: string;
  relatedType?: NotificationRelatedType;
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

export interface NotificationStats {
  success: boolean;
  total: number;
  unread: number;
  critical: number;
  high: number;
  today: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
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

// Admin notification endpoints
export async function getAdminNotifications(params?: {
  status?: string;
  priority?: string;
  category?: string;
  source?: string;
  search?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.priority) query.append("priority", params.priority);
  if (params?.category) query.append("category", params.category);
  if (params?.source) query.append("source", params.source);
  if (params?.search) query.append("search", params.search);
  if (params?.sortBy) query.append("sortBy", params.sortBy);
  if (params?.sortDir) query.append("sortDir", params.sortDir);
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  const qStr = query.toString();
  return clientFetch<NotificationListResponse>(`/admin/notifications${qStr ? `?${qStr}` : ""}`);
}

export async function getAdminNotificationStats() {
  return clientFetch<NotificationStats>("/admin/notifications/stats");
}

export async function getAdminUnreadCount() {
  return clientFetch<{ success: boolean; count: number }>("/admin/notifications/unread-count");
}

export async function markAdminNotificationRead(id: string) {
  return clientMutation<{ success: boolean } & Notification>(`/admin/notifications/${id}/read`, "PATCH");
}

export async function markAdminNotificationUnread(id: string) {
  return clientMutation<{ success: boolean } & Notification>(`/admin/notifications/${id}/unread`, "PATCH");
}

export async function markAllAdminNotificationsRead() {
  return clientMutation<{ success: boolean }>("/admin/notifications/read-all", "PATCH");
}

export async function bulkMarkAdminNotificationsRead(ids: string[]) {
  return clientMutation<{ success: boolean; modified: number }>("/admin/notifications/bulk-read", "PATCH", { ids });
}
