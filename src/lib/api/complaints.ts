/**
 * ShopNest Complaint API Client
 * Strongly typed client bindings for customer, delivery, and seller complaint flows.
 */

import { clientFetch, clientMutation } from "../core/client";

export interface ComplaintListItem {
  id: string;
  incidentCode: string;
  title: string;
  description: string;
  category: string;
  source: "customer" | "delivery_man" | "seller";
  status: string;
  severity: string;
  assignedAdmin?: {
    adminId: string;
    adminName: string;
    assignedAt: string;
  };
  createdAt: string;
  updatedAt: string;
  orderId?: string;
  productId?: string;
  deliveryId?: string;
  sellerId?: string;
  attachments: string[];
}

export interface ComplaintDetail extends ComplaintListItem {
  entityId: string;
  entityName: string;
  notes: Array<{ authorId: string; authorName: string; note: string; createdAt: string }>;
  history: Array<{ action: string; changedBy: string; timestamp: string; details?: string }>;
  evidence: Array<{ description: string; reference: string; addedBy: string; addedAt: string }>;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionSummary?: string;
  closedAt?: string;
  closedBy?: string;
  closeReason?: string;
}

export interface ComplaintListResponse {
  items: ComplaintListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ComplaintStats {
  total: number;
  customer: number;
  deliveryMan: number;
  seller: number;
  open: number;
  inReview: number;
  resolved: number;
}

export interface CreateComplaintInput {
  title: string;
  description: string;
  category: "order" | "payment" | "product" | "seller" | "delivery" | "refund" | "return" | "account" | "technical" | "other";
  orderId?: string;
  productId?: string;
  deliveryId?: string;
  sellerId?: string;
  attachments?: File[];
}

export async function getCustomerComplaints(params: { page?: number; limit?: number; status?: string } = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.status) searchParams.set("status", params.status);

  const qs = searchParams.toString();
  return clientFetch<ComplaintListResponse>(`/complaints${qs ? `?${qs}` : ""}`);
}

export async function getCustomerComplaintById(id: string) {
  return clientFetch<ComplaintDetail>(`/complaints/${id}`);
}

export async function createCustomerComplaint(data: CreateComplaintInput) {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("category", data.category);
  if (data.orderId) formData.append("orderId", data.orderId);
  if (data.productId) formData.append("productId", data.productId);
  if (data.deliveryId) formData.append("deliveryId", data.deliveryId);
  if (data.sellerId) formData.append("sellerId", data.sellerId);
  if (data.attachments) {
    data.attachments.forEach((file) => formData.append("attachments", file));
  }

  return clientMutation<ComplaintDetail>("/complaints", "POST", formData);
}

export async function getDeliveryComplaints(params: { page?: number; limit?: number; status?: string } = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.status) searchParams.set("status", params.status);

  const qs = searchParams.toString();
  return clientFetch<ComplaintListResponse>(`/delivery/complaints${qs ? `?${qs}` : ""}`);
}

export async function getDeliveryComplaintById(id: string) {
  return clientFetch<ComplaintDetail>(`/delivery/complaints/${id}`);
}

export async function createDeliveryComplaint(data: CreateComplaintInput) {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("category", data.category);
  if (data.orderId) formData.append("orderId", data.orderId);
  if (data.productId) formData.append("productId", data.productId);
  if (data.deliveryId) formData.append("deliveryId", data.deliveryId);
  if (data.sellerId) formData.append("sellerId", data.sellerId);
  if (data.attachments) {
    data.attachments.forEach((file) => formData.append("attachments", file));
  }

  return clientMutation<ComplaintDetail>("/delivery/complaints", "POST", formData);
}

export async function getSellerComplaints(params: { page?: number; limit?: number; status?: string } = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.status) searchParams.set("status", params.status);

  const qs = searchParams.toString();
  return clientFetch<ComplaintListResponse>(`/seller/complaints${qs ? `?${qs}` : ""}`);
}

export async function getSellerComplaintById(id: string) {
  return clientFetch<ComplaintDetail>(`/seller/complaints/${id}`);
}

export async function createSellerComplaint(data: CreateComplaintInput) {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("category", data.category);
  if (data.orderId) formData.append("orderId", data.orderId);
  if (data.productId) formData.append("productId", data.productId);
  if (data.deliveryId) formData.append("deliveryId", data.deliveryId);
  if (data.sellerId) formData.append("sellerId", data.sellerId);
  if (data.attachments) {
    data.attachments.forEach((file) => formData.append("attachments", file));
  }

  return clientMutation<ComplaintDetail>("/seller/complaints", "POST", formData);
}

export async function getAdminComplaintStats() {
  return clientFetch<ComplaintStats>("/admin/incidents/complaint-stats");
}
