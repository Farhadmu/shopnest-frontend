/**
 * ShopNest Delivery & Logistics API Client
 * Strongly typed client bindings for courier telemetry, requests, ratings, and incident management
 */

import { clientFetch, clientMutation } from "../core/client";

export interface DeliveryManPersonalInfo {
  fullName: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  currentAddress?: string;
  permanentAddress?: string;
  city?: string;
  district?: string;
  serviceArea?: string[];
  profilePhoto?: string;
}

export interface DeliveryManIdentityInfo {
  nidNumber?: string;
  nidType?: string;
  nidFrontImage?: string;
  nidBackImage?: string;
  selfieImage?: string;
}

export interface DeliveryManLicenseInfo {
  licenseNumber?: string;
  licenseType?: string;
  licenseExpiryDate?: string;
  licenseFrontImage?: string;
  licenseBackImage?: string;
  drivingExperience?: number;
  vehicleExperience?: string;
}

export interface DeliveryManVehicleInfo {
  vehicleType?: "motorcycle" | "bicycle" | "car" | "van" | "other";
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  vehicleRegistrationNumber?: string;
  vehicleRegistrationDocument?: string;
  vehicleOwnershipType?: "owned" | "rented" | "company_provided";
  vehiclePhoto?: string;
  vehicleFrontPhoto?: string;
  vehicleBackPhoto?: string;
  vehicleFitnessExpiryDate?: string;
  vehicleCapacity?: number;
  packageCapacity?: number;
  weightCapacityKg?: number;
  volumeCapacityLiters?: number;
}

export interface DeliveryManBankInfo {
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  branchName?: string;
  routingNumber?: string;
  mobileBankingProvider?: "bkash" | "nagad" | "rocket" | "bank";
  mobileBankingNumber?: string;
}

export interface DeliveryManPreferences {
  preferredServiceZones?: string[];
  maxActiveDeliveries?: number;
  preferredVehicleType?: string;
  availabilityPreference?: "full_time" | "part_time" | "weekends" | "on_call";
  deliveryRadius?: number;
}

export interface DeliveryManProfile {
  id: string;
  userId: string;
  status: "pending_verification" | "approved" | "rejected" | "suspended";
  rejectionReason?: string;
  resubmissionRequired?: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryManDetails {
  id?: string;
  userId: string;
  personal?: DeliveryManPersonalInfo;
  identity?: DeliveryManIdentityInfo;
  license?: DeliveryManLicenseInfo;
  vehicle?: DeliveryManVehicleInfo;
  bank?: DeliveryManBankInfo;
  preferences?: DeliveryManPreferences;
  isActive: boolean;
  availabilityStatus: "offline" | "available" | "busy" | "full_capacity" | "on_break" | "suspended";
  currentLocation?: {
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    accuracy?: number;
    updatedAt?: string;
  };
  rating: number;
  ratingCount: number;
  totalDeliveries: number;
  completedDeliveries: number;
  failedDeliveries: number;
  lastActiveAt?: string;
}

export interface DeliveryStats {
  availabilityStatus: "offline" | "available" | "busy" | "full_capacity" | "on_break" | "suspended";
  isActive: boolean;
  totalDeliveries: number;
  completedDeliveries: number;
  failedDeliveries: number;
  activeDeliveries: number;
  todayDeliveries: number;
  todayEarnings: number;
  totalEarnings: number;
  avgDeliveryTimeMinutes: number;
  rating: number;
  ratingCount: number;
  deliveriesByStatus: Record<string, number>;
}

export interface DeliveryRequest {
  id: string;
  orderId: string;
  sellerId: string;
  customerId: string;
  status:
    | "available"
    | "assigned"
    | "pickup_started"
    | "picked_up"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "failed"
    | "cancelled"
    | "rescheduled";
  assignedDeliveryManId?: string;
  assignedAt?: string;
  acceptedAt?: string;
  pickupStartedAt?: string;
  pickedUpAt?: string;
  inTransitAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  deliveryOtp?: string;
  deliveryOtpVerifiedAt?: string;
  deliveryProofImage?: string;
  deliveryFailedReason?: string;
  priority: "normal" | "high" | "urgent";
  pickupAddress?: string;
  deliveryAddress?: string;
  pickupCoordinates?: { latitude: number; longitude: number } | null;
  deliveryCoordinates?: { latitude: number; longitude: number } | null;
  pickupContact?: string;
  deliveryContact?: string;
  deliveryFee?: number;
  estimatedDistance?: number;
  distanceKm?: number;
  packageInfo?: {
    weight?: number;
    dimensions?: string;
    fragile?: boolean;
    specialInstructions?: string;
  };
  ranking?: {
    pickupDistanceKm?: number | null;
    estimatedTravelMinutes?: number | null;
    fitsCapacity?: boolean;
    fitsWeight?: boolean;
    routeCompatibility?: string;
    remainingSlots?: number;
    remainingWeightKg?: number;
  };
  facts?: Record<string, any>;
  calculations?: Record<string, any>;
  inferences?: Record<string, any>;
  sellerNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeliveryIncident {
  id: string;
  deliveryRequestId?: string;
  orderId?: string;
  deliveryManId: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  evidenceImages?: string[];
  status: "open" | "investigating" | "resolved" | "closed";
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
}

export interface DeliveryTrackingResponse {
  orderId: string;
  status: string;
  isLiveTrackingActive: boolean;
  assignedRider: {
    name: string;
    avatar?: string;
    phone?: string;
    rating: number;
    ratingCount: number;
    vehicleType: string;
    vehicleModel?: string;
    vehicleRegistrationNumber?: string;
    status: string;
  } | null;
  currentLocation?: {
    latitude: number;
    longitude: number;
    updatedAt?: string;
  } | null;
  breadcrumbs: Array<{
    latitude: number;
    longitude: number;
    recordedAt: string;
  }>;
  timestamps: {
    assignedAt?: string;
    pickupStartedAt?: string;
    pickedUpAt?: string;
    inTransitAt?: string;
    outForDeliveryAt?: string;
    deliveredAt?: string;
  };
  pickupAddress?: string;
  deliveryAddress?: string;
  pickupCoordinates?: { latitude: number; longitude: number } | null;
  deliveryCoordinates?: { latitude: number; longitude: number } | null;
}

// ─── API Client Functions ──────────────────────────────────────────────────────

export async function getDeliveryProfile() {
  return clientFetch<{ profile: DeliveryManProfile | null; details: DeliveryManDetails | null }>(
    "/delivery/profile"
  );
}

export async function updateDeliveryProfile(data: {
  personal?: Partial<DeliveryManPersonalInfo>;
  identity?: Partial<DeliveryManIdentityInfo>;
  license?: Partial<DeliveryManLicenseInfo>;
  vehicle?: Partial<DeliveryManVehicleInfo>;
  bank?: Partial<DeliveryManBankInfo>;
  preferences?: Partial<DeliveryManPreferences>;
}) {
  return clientMutation<{ profile: DeliveryManProfile; details: DeliveryManDetails }>(
    "/delivery/profile",
    "PATCH",
    data
  );
}

export async function uploadDeliveryDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return clientMutation<{ url: string; filename: string }>("/delivery/upload-document", "POST", formData);
}

export async function uploadDeliveryProof(id: string, file: File) {
  const formData = new FormData();
  formData.append("proofImage", file);
  return clientMutation<{ deliveryProofImage: string }>(`/delivery/requests/${id}/proof`, "POST", formData);
}

export async function setDeliveryAvailability(data: {
  availabilityStatus?: "offline" | "available" | "busy";
  isActive?: boolean;
}) {
  return clientMutation<{ availabilityStatus: string; isActive: boolean }>(
    "/delivery/availability",
    "PATCH",
    data
  );
}

export async function updateDeliveryLocation(data: {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  deliveryRequestId?: string;
}) {
  return clientMutation("/delivery/location", "PATCH", data);
}

export async function getDeliveryStats() {
  return clientFetch<{
    profile: DeliveryManProfile | null;
    details: DeliveryManDetails | null;
    stats: DeliveryStats;
  }>("/delivery/stats");
}

export async function getAvailableDeliveries(page = 1, limit = 20, zone?: string) {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (zone) query.set("zone", zone);
  return clientFetch<{
    items: DeliveryRequest[];
    data?: DeliveryRequest[];
    total: number;
    page: number;
    limit: number;
  }>(`/delivery/requests/available?${query.toString()}`);
}

export async function getMyDeliveries(options?: {
  status?: string;
  timeRange?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (options?.status) query.set("status", options.status);
  if (options?.timeRange) query.set("timeRange", options.timeRange);
  if (options?.page) query.set("page", String(options.page));
  if (options?.limit) query.set("limit", String(options.limit));

  return clientFetch<{
    items: DeliveryRequest[];
    data?: DeliveryRequest[];
    total: number;
    page: number;
    limit: number;
  }>(`/delivery/requests/my?${query.toString()}`);
}

export async function getDeliveryById(id: string) {
  return clientFetch<{
    deliveryRequest: DeliveryRequest;
    order?: any;
    locations?: any[];
    ratings?: any[];
    incidents?: any[];
  }>(`/delivery/requests/${id}`);
}

export async function acceptDelivery(id: string) {
  return clientMutation<{ deliveryRequest: DeliveryRequest; deliveryOtp: string }>(
    `/delivery/requests/${id}/accept`,
    "PATCH",
    {}
  );
}

export async function updateDeliveryStatus(
  id: string,
  status: DeliveryRequest["status"],
  failureReason?: string
) {
  return clientMutation<DeliveryRequest>(`/delivery/requests/${id}/status`, "PATCH", {
    status,
    failureReason,
  });
}

export async function verifyDeliveryOtp(id: string, otp: string) {
  return clientMutation(`/delivery/requests/${id}/verify-otp`, "PATCH", { otp });
}

export async function reportDeliveryIncident(
  deliveryId: string | undefined,
  data: {
    category: string;
    severity?: "low" | "medium" | "high" | "critical";
    description: string;
    evidenceImages?: string[];
  }
) {
  if (!deliveryId || deliveryId === "general") {
    return clientMutation<{ incident: DeliveryIncident }>("/delivery/incidents", "POST", data);
  }
  return clientMutation<{ incident: DeliveryIncident }>(
    `/delivery/requests/${deliveryId}/incident`,
    "POST",
    data
  );
}

export async function createGeneralIncident(data: {
  category: string;
  severity?: "low" | "medium" | "high" | "critical";
  description: string;
  evidenceImages?: string[];
  deliveryRequestId?: string;
  orderId?: string;
}) {
  return clientMutation<{ incident: DeliveryIncident }>("/delivery/incidents", "POST", data);
}

export async function getMyIncidents() {
  return clientFetch<DeliveryIncident[]>("/delivery/incidents");
}

export async function getSellerActiveDeliveries(status?: string) {
  const query = status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
  return clientFetch<DeliveryRequest[]>(`/delivery/seller/active-deliveries${query}`);
}

export async function getDeliveryTracking(orderId: string) {
  return clientFetch<DeliveryTrackingResponse>(`/delivery/tracking/${orderId}`);
}

export async function rateDelivery(
  orderOrDeliveryId: string,
  data: {
    rating: number;
    professionalism?: number;
    timeliness?: number;
    communication?: number;
    comment?: string;
  }
) {
  return clientMutation(`/delivery/orders/${orderOrDeliveryId}/rate`, "POST", data);
}

// ─── AI Delivery Copilot API ──────────────────────────────────────────────────

export interface DeliveryCopilotResponse {
  answer: string;
  summary: string;
  intent: string;
  confidence: number;
  timeRange: { start: string; end: string; label: string };
  metrics?: Array<{ label: string; value: number; formatted: string }>;
  insights?: Array<{ severity: string; title: string; description: string }>;
  sources: Array<{ name: string; type: string; recordCount?: number }>;
  suggestedActions?: Array<{ label: string; action: string; targetUrl?: string; description?: string }>;
  isFallback: boolean;
}

export async function askDeliveryCopilot(query: string, conversationMessages?: Array<{ role: string; content: string }>) {
  return clientMutation<DeliveryCopilotResponse>("/ai/delivery-copilot/chat", "POST", {
    query,
    conversationMessages,
  });
}

// ─── Seller Ready For Pickup ───────────────────────────────────────────────────

export async function markOrderReadyForPickup(orderId: string, data?: { packageInfo?: any; sellerNotes?: string }) {
  return clientMutation<{ order: any; deliveryRequest: DeliveryRequest }>(
    `/orders/${orderId}/ready-for-pickup`,
    "POST",
    data || {}
  );
}

// ─── Admin Delivery Demand Heatmap ──────────────────────────────────────────

export interface DeliveryHeatmapPoint {
  latitude: number;
  longitude: number;
  weight: number;
  count: number;
  address?: string;
}

export interface DeliveryHeatmapResponse {
  timeRange: string;
  totalDeliveriesAnalyzed: number;
  pointCount: number;
  points: DeliveryHeatmapPoint[];
}

export async function getAdminDeliveryHeatmap(timeRange: "today" | "7d" | "30d" | "all" = "30d"): Promise<DeliveryHeatmapResponse> {
  const res = await clientFetch<{ data: DeliveryHeatmapResponse }>(`/delivery/admin/heatmap?timeRange=${timeRange}`);
  return (res as any)?.data ?? res;
}

// ─── Reverse Delivery (Returns) ───────────────────────────────────────────────

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
  deliveryFailedReason?: string;
  priority: "normal" | "high" | "urgent";
  packageInfo?: {
    weight?: number;
    dimensions?: string;
    specialInstructions?: string;
    fragile?: boolean;
  };
  status: "available" | "assigned" | "accepted" | "pickup_started" | "picked_up" | "in_transit" | "seller_received" | "failed" | "cancelled";
  statusHistory: Array<{ status: string; at: string; note?: string }>;
  createdAt: string;
  updatedAt: string;
}

export async function getAvailableReverseDeliveries() {
  return clientFetch<ReverseDeliveryRequest[]>("/customer/features/reverse-delivery/available");
}

export async function getMyReverseDeliveries() {
  return clientFetch<ReverseDeliveryRequest[]>("/customer/features/reverse-delivery/my");
}

export async function acceptReverseDelivery(id: string) {
  return clientMutation<{ reverseDelivery: ReverseDeliveryRequest }>(
    `/customer/features/reverse-delivery/${id}/accept`,
    "POST",
    {}
  );
}

export async function updateReverseDeliveryStatus(
  id: string,
  status: ReverseDeliveryRequest["status"],
  failureReason?: string
) {
  return clientMutation<{ reverseDelivery: ReverseDeliveryRequest }>(
    `/customer/features/reverse-delivery/${id}/status`,
    "PATCH",
    { status, failureReason }
  );
}
