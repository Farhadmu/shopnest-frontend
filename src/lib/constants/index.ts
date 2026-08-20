/**
 * Shared constants across the application.
 */

export const APP_NAME = "ShopNest";

export const USER_ROLES = {
  CUSTOMER: "customer",
  SELLER: "seller",
  ADMIN: "admin",
} as const;

export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;
