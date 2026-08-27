import { clientFetch, clientMutation } from "@/lib/core/client";

export interface ShoppingEvent {
  eventType: string;
  productId?: string;
  productTitle?: string;
  category?: string;
  price?: number;
  createdAt: string;
}

export interface ShoppingJourneyData {
  journey: {
    id: string;
    userId: string;
    category: string;
    currentStage: "discovery" | "evaluation" | "intent" | "ready_to_buy" | "completed";
    journeyProgress: number;
    recommendedNextCategory?: string;
    recommendedProducts?: string[];
    events: ShoppingEvent[];
  };
  recommendedItems: Array<{
    id: string;
    title: string;
    price: number;
    discountPrice?: number;
    category: string;
    images: string[];
    ratingAvg: number;
  }>;
}

export interface BudgetPlanResult {
  targetBudget: number;
  totalPlannedSpend: number;
  remainingBudget: number;
  purpose: string;
  items: Array<{
    role: string;
    allocatedBudget: number;
    selectedProduct?: {
      id: string;
      title: string;
      price: number;
      category: string;
      image: string;
    };
    alternatives: Array<{ id: string; title: string; price: number; type: "cheaper" | "premium" }>;
  }>;
  planSummary: string;
}

export interface CompatibilityResult {
  status: "compatible" | "potential_issue" | "not_compatible" | "insufficient_info";
  products: Array<{ id: string; title: string; category: string }>;
  checks: Array<{ aspect: string; result: "pass" | "warning" | "fail" | "unknown"; explanation: string }>;
  recommendation: string;
}

export interface ProductBundleData {
  id: string;
  bundleName: string;
  mainProductId: string;
  category: string;
  items: Array<{ productId: string; title: string; price: number; role: string }>;
  originalTotal: number;
  bundlePrice: number;
  savingsPercentage: number;
  compatibilityNote: string;
}

export interface ProductLifecycleItem {
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  category: string;
  purchaseDate: string;
  estimatedLifespanMonths: number;
  usagePercentage: number;
  warrantyExpiryDate: string;
  status: "active" | "replacement_recommended" | "retired";
  maintenanceReminders: Array<{ title: string; dueDate: string; status: "pending" | "completed" | "overdue"; notes?: string }>;
}

export interface ShoppingGoalData {
  id: string;
  title: string;
  category: string;
  targetBudget: number;
  targetDate?: string;
  items: Array<{ title: string; productId?: string; estimatedPrice: number; isCompleted: boolean }>;
  progressPercentage: number;
  status: "in_progress" | "achieved" | "archived";
}

export interface PriceHistoryData {
  productId: string;
  history: Array<{ price: number; recordedAt: string }>;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  currentPrice: number;
  trend: "dropping" | "rising" | "stable";
  insight: string;
}

export interface PurchaseDecisionScoreData {
  productId: string;
  overallScore: number;
  dimensions: {
    value: { score: number; label: string; note: string };
    quality: { score: number; label: string; note: string };
    popularity: { score: number; label: string; note: string };
    reliability: { score: number; label: string; note: string };
  };
  recommendation: string;
}

export interface ProductTrustCheckerData {
  productId: string;
  trustScore: number;
  badge: string;
  signals: Array<{ name: string; passed: boolean; details: string }>;
  disclaimer: string;
}

export interface ReturnRiskPreviewData {
  productId: string;
  riskLevel: "low" | "medium" | "high";
  historicalReturnRate: string;
  topReturnReasons: string[];
  proactiveAdvice: string[];
  guaranteeNotice: string;
}

// API functions
export async function getShoppingJourney() {
  return clientFetch<ShoppingJourneyData>("/customer/journey");
}

export async function recordShoppingEvent(data: { eventType: string; productId?: string; productTitle?: string; category?: string; price?: number }) {
  return clientMutation("/customer/journey/event", "POST", data);
}

export async function generateBudgetPlan(budget: number, purpose: string) {
  return clientMutation<BudgetPlanResult>("/customer/budget-planner", "POST", { budget, purpose });
}

export async function checkCompatibility(productIds: string[]) {
  return clientMutation<CompatibilityResult>("/customer/compatibility-check", "POST", { productIds });
}

export async function getProductBundle(productId: string) {
  return clientFetch<ProductBundleData>(`/customer/bundles/${productId}`);
}

export async function getProductLifecycles() {
  return clientFetch<ProductLifecycleItem[]>("/customer/lifecycle");
}

export async function getShoppingGoals() {
  return clientFetch<ShoppingGoalData[]>("/customer/goals");
}

export async function createShoppingGoal(data: Partial<ShoppingGoalData>) {
  return clientMutation<ShoppingGoalData>("/customer/goals", "POST", data);
}

export async function updateShoppingGoal(id: string, data: Partial<ShoppingGoalData>) {
  return clientMutation<ShoppingGoalData>(`/customer/goals/${id}`, "PATCH", data);
}

export async function deleteShoppingGoal(id: string) {
  return clientMutation(`/customer/goals/${id}`, "DELETE");
}

export async function getPriceHistory(productId: string) {
  return clientFetch<PriceHistoryData>(`/customer/products/${productId}/price-history`);
}

export async function getPurchaseDecisionScore(productId: string) {
  return clientFetch<PurchaseDecisionScoreData>(`/customer/products/${productId}/decision-score`);
}

export async function getProductTrustChecker(productId: string) {
  return clientFetch<ProductTrustCheckerData>(`/customer/products/${productId}/trust-checker`);
}

export async function getReturnRiskPreview(productId: string) {
  return clientFetch<ReturnRiskPreviewData>(`/customer/products/${productId}/return-risk`);
}

// 11. SPENDING ANALYTICS & PERSONAL SHOPPING INSIGHTS
export interface SpendingAnalyticsData {
  overview: {
    totalSpend: number;
    monthlySpend: number;
    orderFrequency: string;
    orderCount: number;
    avgOrderValue: number;
    favoriteCategory: string;
    shoppingStreak: string;
  };
  monthlySpending: Array<{ month: string; amount: number; orders: number }>;
  categorySpending: Array<{ category: string; amount: number; percentage: number }>;
  mostPurchasedProducts: Array<{ id: string; title: string; purchases: number; totalSpent: number; category: string }>;
}

export async function getSpendingAnalytics() {
  return clientFetch<SpendingAnalyticsData>("/customer/spending-analytics");
}

// 12. WISHLIST ANALYTICS & PRICE DROPS
export interface WishlistAnalyticsData {
  totalWishlistCount: number;
  totalPotentialSavings: number;
  items: Array<{
    id: string;
    title: string;
    currentPrice: number;
    originalPrice: number;
    hasDiscount: boolean;
    priceDrop: number;
    priceDropPercent: number;
    category: string;
    images: string[];
    ratingAvg: number;
    stock: number;
    viewsCount: number;
  }>;
  priceDropOpportunities: Array<{
    id: string;
    title: string;
    currentPrice: number;
    originalPrice: number;
    hasDiscount: boolean;
    priceDrop: number;
    priceDropPercent: number;
    category: string;
    images: string[];
  }>;
}

export async function getWishlistAnalytics() {
  return clientFetch<WishlistAnalyticsData>("/customer/wishlist-analytics");
}

// 13. SAVED SEARCHES
export interface SavedSearchItem {
  id: string;
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  resultCount: number;
  createdAt: string;
}

export async function getSavedSearches() {
  return clientFetch<SavedSearchItem[]>("/customer/saved-searches");
}

export async function createSavedSearch(data: { query: string; category?: string; minPrice?: number; maxPrice?: number; sort?: string }) {
  return clientMutation<SavedSearchItem>("/customer/saved-searches", "POST", data);
}

export async function deleteSavedSearch(id: string) {
  return clientMutation(`/customer/saved-searches/${id}`, "DELETE");
}

// 14. PERSONALIZED OFFERS
export interface PersonalizedOfferItem {
  id: string;
  code: string;
  title: string;
  description: string;
  discountPercent: number;
  category: string;
  minSpend: number;
  expiresAt: string;
}

export async function getPersonalizedOffers() {
  return clientFetch<PersonalizedOfferItem[]>("/customer/personalized-offers");
}

// 15. CUSTOMER ACTIVITY TIMELINE
export interface CustomerActivityItem {
  id: string;
  activityType: "view" | "search" | "wishlist_add" | "cart_add" | "order" | "review" | "security";
  title: string;
  details?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export async function getCustomerActivityTimeline() {
  return clientFetch<CustomerActivityItem[]>("/customer/activity-timeline");
}

