import { clientFetch, clientMutation } from "@/lib/core/client";
import { Product } from "./products";

export interface BanglaSearchResponse {
  query: string;
  extractedIntent: {
    budgetLimit: number | null;
    detectedCategory: string | null;
    keywords: string[];
  } | null;
  totalFound: number;
  products: Product[];
}

export interface CODRiskResponse {
  riskLevel: "LOW RISK" | "MEDIUM RISK" | "HIGH RISK";
  riskScore: number;
  stats: {
    totalOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    returnedOrders: number;
    fulfillmentRatio: number;
  };
  recommendation: string;
}

export interface ProductTrustReport {
  productId: string;
  sellerTrust: number;
  productTrust: number;
  reviewQuality: string;
  returnRisk: string;
  returnRate: string;
  verifiedReviewsCount: number;
  totalReviewsCount: number;
  discountIntegrity: "verified" | "caution" | "standard";
  discountNote: string;
  calculatedAt: string;
}

export interface CourierOption {
  id: string;
  name: string;
  badge: string;
  rate: number;
  durationDays: string;
  estimatedDates: string;
  reliabilityScore: number;
  logoUrl: string;
}

export interface CourierComparisonResponse {
  destination: {
    division: string;
    district: string;
    isInsideDhaka: boolean;
  };
  weightKg: number;
  options: CourierOption[];
}

export interface ReturnEligibilityResponse {
  orderId: string;
  orderStatus: string;
  isEligible: boolean;
  daysRemaining: number;
  returnWindow: string;
  requiredEvidence: string[];
  refundMethods: string[];
  expectedProcessingDays: string;
}

export interface PriceAlertItem {
  id: string;
  productId: string;
  productTitle: string;
  targetPrice: number;
  currentPrice: number;
  isTriggered: boolean;
  createdAt: string;
}

export interface ProductAnswer {
  authorId: string;
  authorName: string;
  authorRole: "seller" | "customer" | "ai_assistant";
  content: string;
  helpfulVotes: number;
  createdAt: string;
}

export interface ProductQuestionItem {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  question: string;
  answers: ProductAnswer[];
  isAnswered: boolean;
  createdAt: string;
}

export interface WishlistGroupItem {
  id: string;
  userId: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  productIds: string[];
  createdAt: string;
}

export interface PurchaseBudgetTrackerResponse {
  monthlyBudget: number;
  spentThisMonth: number;
  remainingBudget: number;
  progressPercent: number;
  monthName: string;
  orderCount: number;
}

export interface PersonalSpendingAnalyticsResponse {
  totalSpent: number;
  totalOrders: number;
  averageOrderValue: number;
  monthlySpending: Array<{ month: string; amount: number; count: number }>;
  categorySpending: Array<{ category: string; amount: number; percentage: number }>;
}

export interface DeliveryFeedbackPayload {
  orderId: string;
  courierName?: string;
  speedRating: number;
  packagingRating: number;
  courierBehaviorRating: number;
  overallRating: number;
  feedbackText?: string;
}

export interface ProductReportPayload {
  productId: string;
  productTitle: string;
  category: "wrong_info" | "misleading_image" | "wrong_specs" | "suspicious_seller" | "damaged_product" | "other";
  description: string;
  evidenceUrls?: string[];
}

export interface ProductReportItem {
  id: string;
  productId: string;
  productTitle: string;
  category: string;
  description: string;
  status: "pending" | "investigating" | "resolved" | "dismissed";
  createdAt: string;
}

// -------------------------------------------------------------
// API CLIENT CALLS
// -------------------------------------------------------------

export async function searchBanglaSmart(query: string) {
  return clientFetch<BanglaSearchResponse>(`/customer/search/bangla?q=${encodeURIComponent(query)}`);
}

export async function getCODOrderRisk(orderAmount?: number) {
  const url = orderAmount ? `/customer/cod-risk?orderAmount=${orderAmount}` : "/customer/cod-risk";
  return clientFetch<CODRiskResponse>(url);
}

export async function getProductTrustReport(productId: string) {
  return clientFetch<ProductTrustReport>(`/customer/products/${productId}/trust-report`);
}

export async function getCourierComparison(division: string, district: string, weightKg: number = 1) {
  return clientFetch<CourierComparisonResponse>(
    `/customer/couriers/compare?division=${encodeURIComponent(division)}&district=${encodeURIComponent(district)}&weightKg=${weightKg}`
  );
}

export async function getReturnEligibility(orderId: string) {
  return clientFetch<ReturnEligibilityResponse>(`/customer/orders/${orderId}/return-eligibility`);
}

export async function subscribePriceAlert(productId: string, targetPrice?: number) {
  return clientMutation<PriceAlertItem>("/customer/price-alerts", "POST", { productId, targetPrice });
}

export async function getUserPriceAlerts() {
  return clientFetch<PriceAlertItem[]>("/customer/price-alerts");
}

export async function deletePriceAlert(id: string) {
  return clientMutation<{ success: boolean }>(`/customer/price-alerts/${id}`, "DELETE");
}

export async function subscribeStockAlert(productId: string, userEmail?: string) {
  return clientMutation<{ success: boolean }>("/customer/stock-alerts", "POST", { productId, userEmail });
}

export async function getBudgetShoppingRecommendations(budget: number, category?: string, purpose?: string) {
  let url = `/customer/budget-recommendations?budget=${budget}`;
  if (category) url += `&category=${encodeURIComponent(category)}`;
  if (purpose) url += `&purpose=${encodeURIComponent(purpose)}`;
  return clientFetch<{ targetBudget: number; category: string; recommendations: any[] }>(url);
}

export async function getValueForMoneyScore(productId: string) {
  return clientFetch<{
    productId: string;
    score: number;
    ratingAvg: number;
    breakdown: Array<{ factor: string; weight: string; score: number }>;
    summary: string;
  }>(`/customer/products/${productId}/value-score`);
}

export async function getProductQuestions(productId: string) {
  return clientFetch<ProductQuestionItem[]>(`/customer/products/${productId}/questions`);
}

export async function askProductQuestion(productId: string, question: string) {
  return clientMutation<ProductQuestionItem>("/customer/products/questions", "POST", { productId, question });
}

export async function answerProductQuestion(questionId: string, content: string, authorRole: string = "customer") {
  return clientMutation<ProductQuestionItem>(`/customer/products/questions/${questionId}/answers`, "POST", {
    content,
    authorRole,
  });
}

export async function getPersonalizedDeals() {
  return clientFetch<{ matchedPreferences: string[]; deals: Product[] }>("/customer/deals/personalized");
}

export async function getCompareHistory() {
  return clientFetch<Array<{ id: string; title: string; productIds: string[]; category: string; createdAt: string }>>(
    "/customer/compare-history"
  );
}

export async function saveCompareHistory(title: string, productIds: string[], category: string = "General") {
  return clientMutation("/customer/compare-history", "POST", { title, productIds, category });
}

export async function clearCompareHistory() {
  return clientMutation<{ success: boolean }>("/customer/compare-history", "DELETE");
}

export async function getWishlistGroups() {
  return clientFetch<WishlistGroupItem[]>("/customer/wishlist-groups");
}

export async function createWishlistGroup(data: { name: string; description?: string; icon?: string; color?: string; productIds?: string[] }) {
  return clientMutation<WishlistGroupItem>("/customer/wishlist-groups", "POST", data);
}

export async function updateWishlistGroup(id: string, data: Partial<WishlistGroupItem>) {
  return clientMutation<WishlistGroupItem>(`/customer/wishlist-groups/${id}`, "PATCH", data);
}

export async function deleteWishlistGroup(id: string) {
  return clientMutation<{ success: boolean }>(`/customer/wishlist-groups/${id}`, "DELETE");
}

export async function getPurchaseBudgetTracker() {
  return clientFetch<PurchaseBudgetTrackerResponse>("/customer/budget/tracker");
}

export async function getPersonalSpendingAnalytics() {
  return clientFetch<PersonalSpendingAnalyticsResponse>("/customer/analytics/spending");
}

export async function submitDeliveryFeedback(payload: DeliveryFeedbackPayload) {
  return clientMutation("/customer/delivery-feedback", "POST", payload);
}

export async function getDeliveryFeedback(orderId: string) {
  return clientFetch<DeliveryFeedbackPayload | null>(`/customer/delivery-feedback/${orderId}`);
}

export async function submitProductReport(payload: ProductReportPayload) {
  return clientMutation<ProductReportItem>("/customer/reports", "POST", payload);
}

export async function getUserProductReports() {
  return clientFetch<ProductReportItem[]>("/customer/reports");
}

export async function askPersonalCommerceAssistant(prompt: string) {
  return clientMutation<{ answer: string; isFallback?: boolean }>("/customer/commerce-assistant", "POST", { prompt });
}
