import { clientFetch, clientMutation } from "@/lib/core/client";

export type ReturnStatus =
  | "requested"
  | "under_review"
  | "approved"
  | "rejected"
  | "reverse_available"
  | "reverse_assigned"
  | "reverse_accepted"
  | "pickup_started"
  | "picked_up"
  | "in_transit"
  | "seller_received"
  | "inspection_pending"
  | "inspection_approved"
  | "inspection_rejected"
  | "refund_pending"
  | "refund_processing"
  | "refunded"
  | "refund_failed"
  | "cancelled"
  | "failed";

export interface ReturnRequest {
  id: string;
  userId: string;
  orderId: string;
  orderItemId: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  sellerId: string;
  sellerName?: string;
  type: "return" | "refund" | "replacement";
  reason: string;
  description: string;
  quantity: number;
  status: ReturnStatus;
  statusHistory: Array<{ status: string; at: string; note?: string }>;
  evidenceUrls: string[];
  pickupAddress?: string;
  sellerReturnAddress?: string;
  requestedRefundAmount: number;
  calculatedRefundAmount?: number;
  refundMethod?: string;
  refundId?: string;
  deliveryRequestId?: string;
  deliveryManId?: string;
  deliveryManName?: string;
  pickedUpAt?: string;
  receivedBySellerAt?: string;
  inspectionStatus?: "pending" | "approved" | "rejected";
  inspectionNotes?: string;
  rejectionReason?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnEligibility {
  orderId: string;
  orderIdShort: string;
  productTitle: string;
  productImage: string | null;
  unitPrice: number;
  orderedQuantity: number;
  sellerId: string;
  orderStatus: string;
  orderDeliveredAt?: string;
  isDelivered: boolean;
  isEligible: boolean;
  daysRemaining: number;
  returnWindow: string;
  reason?: string;
  requiredEvidence: string[];
  refundMethods: string[];
  expectedProcessingDays: string;
  maxEvidenceImages: number;
  pickupAddress?: string;
}

export interface CreateReturnInput {
  orderId: string;
  orderItemId?: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  sellerId: string;
  sellerName?: string;
  type: "return" | "refund" | "replacement";
  reason: string;
  description: string;
  quantity: number;
  evidenceUrls: string[];
  pickupAddress: string;
  sellerReturnAddress: string;
}

export interface ReverseDeliveryRequest {
  id: string;
  returnRequestId: string;
  orderId: string;
  orderItemId: string;
  productTitle: string;
  productImage?: string;
  customerId: string;
  customerName?: string;
  customerAddress: string;
  customerContact?: string;
  sellerId: string;
  sellerName?: string;
  sellerAddress: string;
  sellerContact?: string;
  assignedDeliveryManId?: string;
  assignedAt?: string;
  acceptedAt?: string;
  pickupStartedAt?: string;
  pickedUpAt?: string;
  inTransitAt?: string;
  sellerReceivedAt?: string;
  deliveryOtp?: string;
  deliveryOtpVerifiedAt?: string;
  deliveryProofImage?: string;
  priority: "normal" | "high" | "urgent";
  status: "available" | "assigned" | "accepted" | "pickup_started" | "picked_up" | "in_transit" | "seller_received" | "failed" | "cancelled";
  statusHistory: Array<{ status: string; at: string; note?: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface RefundRecord {
  id: string;
  refundId: string;
  returnRequestId: string;
  orderId: string;
  orderItemId: string;
  customerId: string;
  sellerId: string;
  paymentId?: string;
  amount: number;
  currency: string;
  provider: string;
  providerRefundId?: string;
  status: "pending" | "processing" | "succeeded" | "failed";
  reason?: string;
  requestedAt: string;
  processedAt?: string;
  failedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminReturnFilters {
  status?: string;
  refundStatus?: string;
  sellerId?: string;
  customerId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function getReturnRequests() {
  return clientFetch<ReturnRequest[]>("/customer/returns");
}

export async function createReturnRequest(data: CreateReturnInput) {
  return clientMutation<ReturnRequest>("/customer/returns", "POST", data);
}

export async function getReturnById(id: string) {
  return clientFetch<ReturnRequest>(`/customer/returns/${id}`);
}

export async function getReturnEligibility(orderId: string, productId: string) {
  return clientFetch<ReturnEligibility>(
    `/customer/orders/${orderId}/return-eligibility?productId=${encodeURIComponent(productId)}`
  );
}

export async function getCustomerRefunds() {
  return clientFetch<RefundRecord[]>("/customer/refunds");
}

export async function getRefundDetails(refundId: string) {
  return clientFetch<RefundRecord>(`/customer/refunds/${refundId}`);
}

export async function getReverseDeliveryById(id: string) {
  return clientFetch<{ reverseDelivery: ReverseDeliveryRequest; returnRequest: ReturnRequest | null }>(
    `/customer/features/reverse-delivery/${id}`
  );
}

export async function acceptReverseDelivery(id: string) {
  return clientMutation<{ reverseDelivery: ReverseDeliveryRequest }>(
    `/customer/features/reverse-delivery/${id}/accept`,
    "POST",
    {}
  );
}

export async function generateReverseOtp(id: string) {
  return clientMutation<{ deliveryOtp: string }>(
    `/customer/features/reverse-delivery/${id}/otp`,
    "POST",
    {}
  );
}

export async function verifyReverseOtp(id: string, otp: string) {
  return clientMutation<{ verified: boolean; reverseDelivery: ReverseDeliveryRequest }>(
    `/customer/features/reverse-delivery/${id}/verify-otp`,
    "POST",
    { otp }
  );
}

export async function startReversePickup(id: string, note?: string) {
  return clientMutation<{ reverseDelivery: ReverseDeliveryRequest }>(
    `/customer/features/reverse-delivery/${id}/start-pickup`,
    "POST",
    { note }
  );
}

export async function completeReversePickup(id: string, data: { deliveryProofImage?: string; note?: string }) {
  return clientMutation<{ reverseDelivery: ReverseDeliveryRequest }>(
    `/customer/features/reverse-delivery/${id}/pickup`,
    "POST",
    data
  );
}

export async function updateReverseDeliveryStatus(
  id: string,
  status: ReverseDeliveryRequest["status"],
  data?: { failureReason?: string; deliveryOtp?: string; deliveryProofImage?: string; note?: string }
) {
  return clientMutation<{ reverseDelivery: ReverseDeliveryRequest }>(
    `/customer/features/reverse-delivery/${id}/status`,
    "PATCH",
    { status, ...data }
  );
}

export async function updateReverseDeliveryLocation(id: string, data: {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
}) {
  return clientMutation<{ success: boolean }>(
    `/customer/features/reverse-delivery/${id}/location`,
    "PATCH",
    data
  );
}

export async function sellerApproveReturn(returnId: string, note?: string) {
  return clientMutation(`/sellers/returns/${returnId}/approve`, "POST", { note });
}

export async function sellerRejectReturn(returnId: string, rejectionReason: string) {
  return clientMutation(`/sellers/returns/${returnId}/reject`, "POST", { rejectionReason });
}

export async function sellerInspectReturn(returnId: string, status: "approved" | "rejected", notes: string, resalable?: boolean) {
  return clientMutation(`/sellers/returns/${returnId}/inspect`, "POST", {
    inspectionStatus: status,
    inspectionNotes: notes,
    resalable,
  });
}

export async function sellerReceiveReturn(returnId: string, data?: { proofImage?: string; note?: string }) {
  return clientMutation(`/sellers/returns/${returnId}/receive`, "POST", data);
}

export async function adminGetReturns(filters: AdminReturnFilters) {
  const query = new URLSearchParams();
  if (filters.status) query.set("status", filters.status);
  if (filters.refundStatus) query.set("refundStatus", filters.refundStatus);
  if (filters.sellerId) query.set("sellerId", filters.sellerId);
  if (filters.customerId) query.set("customerId", filters.customerId);
  if (filters.search) query.set("search", filters.search);
  if (filters.dateFrom) query.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) query.set("dateTo", filters.dateTo);
  return clientFetch<{ returns: ReturnRequest[]; total: number }>(
    `/customer/features/admin/returns?${query.toString()}`
  );
}

export async function adminGetReturnDetails(returnId: string) {
  return clientFetch<{
    returnRequest: ReturnRequest;
    order: any;
    refunds: RefundRecord[];
    reverseDelivery: ReverseDeliveryRequest | null;
    auditLogs: any[];
  }>(`/customer/features/admin/returns/${returnId}`);
}

export async function getSellerReturns() {
  return clientFetch<ReturnRequest[]>("/sellers/returns");
}

export async function processRefund(refundId: string) {
  return clientMutation(`/customer/features/refunds/${refundId}/process`, "PATCH", {});
}