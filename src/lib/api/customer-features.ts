import { clientFetch, clientMutation } from "@/lib/core/client";

// ============================================================
// 1. ADVANCED AI SEARCH (Feature 1)
// ============================================================
export interface SearchResult {
  products: Array<{
    id: string;
    title: string;
    price: number;
    discountPrice?: number;
    category: string;
    images: string[];
    ratingAvg: number;
    stock: number;
  }>;
  intent: { category?: string; budgetMax?: number; useCase?: string; brand?: string };
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export async function advancedSearch(params: {
  q: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  rating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const queryStr = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined) queryStr.append(k, String(v)); });
  return clientFetch<SearchResult>(`/customer/features/search?${queryStr.toString()}`);
}

export async function getSearchSuggestions(q: string) {
  return clientFetch<{ suggestions: string[]; recentSearches: string[] }>(`/customer/features/search/suggestions?q=${encodeURIComponent(q)}`);
}

export async function getSearchHistory() {
  return clientFetch<Array<{ id: string; query: string; createdAt: string }>>("/customer/features/search/history");
}

export async function clearSearchHistory() {
  return clientMutation("/customer/features/search/history", "DELETE");
}

// ============================================================
// 2. PERSONAL AI SHOPPING AGENT (Feature 2)
// ============================================================
export interface ShoppingAgentResponse {
  response: string;
  suggestedProducts: Array<{ id: string; title: string; price: number; category: string; image: string; ratingAvg: number }>;
  detectedBudget?: number;
}

export async function shoppingAgentChat(message: string) {
  return clientFetch<ShoppingAgentResponse>("/customer/features/shopping-agent", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

// ============================================================
// 3. AI GIFT FINDER (Feature 19)
// ============================================================
export interface GiftFinderResult {
  occasion: string;
  budget: number;
  recommendations: Array<{ id: string; title: string; price: number; originalPrice: number; category: string; image: string; ratingAvg: number; reason: string }>;
  aiSuggestion: string;
}

export async function giftFinder(params: { occasion?: string; relationship?: string; ageRange?: string; budget: number; interests?: string; gender?: string }) {
  return clientFetch<GiftFinderResult>("/customer/features/gift-finder", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// ============================================================
// 4. AI REVIEW ASSISTANT (Feature 20)
// ============================================================
export interface ReviewDraftResult {
  productId: string;
  productTitle: string;
  reviewDraft: string;
  suggestedRatings: { quality: number; delivery: number; packaging: number; value: number };
  averageRating: number;
  note: string;
}

export async function generateReviewDraft(params: { productId: string; quality?: number; delivery?: number; packaging?: number; value?: number; overallExperience?: string }) {
  return clientFetch<ReviewDraftResult>("/customer/features/review-draft", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// ============================================================
// 5. SMART DEAL FINDER (Feature 5)
// ============================================================
export interface DealResult {
  budget: number;
  purpose: string;
  totalFound: number;
  deals: Array<{ id: string; title: string; price: number; originalPrice: number; discountPercent: number; category: string; image: string; ratingAvg: number; ratingCount: number; seller: string; trustScore: number; valueScore: number; inStock: boolean }>;
}

export async function smartDealFinder(params: { budget: number; category?: string; purpose?: string; features?: string }) {
  return clientFetch<DealResult>("/customer/features/deal-finder", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// ============================================================
// 6. PRODUCT QUALITY SCORE (Feature 7)
// ============================================================
export interface QualityScoreResult {
  productId: string;
  overallScore: number;
  rating: number;
  ratingScore: number;
  value: number;
  seller: number;
  delivery: number;
  reviewCount: number;
  factors: Record<string, { score: number; weight: string; label: string }>;
}

export async function getProductQualityScore(productId: string) {
  return clientFetch<QualityScoreResult>(`/customer/features/products/${productId}/quality-score`);
}

// ============================================================
// 7. SELLER TRUST SCORE (Feature 6)
// ============================================================
export interface SellerTrustResult {
  storeId: string;
  storeName: string;
  trustScore: number;
  rating: number;
  indicators: Array<{ label: string; passed: boolean; detail: string }>;
  metrics: { totalOrders: number; completionRate: number; cancellationRate: number; returnRate: number; accountAgeDays: number };
}

export async function getSellerTrustScore(storeId: string) {
  return clientFetch<SellerTrustResult>(`/customer/features/sellers/${storeId}/trust-score`);
}

// ============================================================
// 8. PERSONAL PRICE INTELLIGENCE (Feature 4)
// ============================================================
export interface PriceIntelligenceResult {
  productId: string;
  currentPrice: number;
  previousPrice: number;
  priceChange: number;
  priceChangePercent: number;
  lowestRecorded: number;
  highestRecorded: number;
  averagePrice: number;
  trend: "dropping" | "rising" | "stable";
  history: Array<{ price: number; recordedAt: string }>;
  insight: string;
  recommendation: string;
}

export async function getPriceIntelligence(productId: string) {
  return clientFetch<PriceIntelligenceResult>(`/customer/features/products/${productId}/price-intelligence`);
}

// ============================================================
// 9. SMART BANGLADESH DELIVERY (Feature 9)
// ============================================================
export interface DeliveryEstimateResult {
  division: string;
  district: string | null;
  deliveryAvailable: boolean;
  codAvailable: boolean;
  estimatedDays: string;
  deliveryFee: number;
  currency: string;
  zoneName: string;
  productAvailable: boolean;
  freeDeliveryAbove: number;
}

export async function getDeliveryEstimate(division: string, district?: string, productId?: string) {
  const params = new URLSearchParams({ division });
  if (district) params.append("district", district);
  if (productId) params.append("productId", productId);
  return clientFetch<DeliveryEstimateResult>(`/customer/features/delivery/estimate?${params.toString()}`);
}

// ============================================================
// 10. ADVANCED ORDER TRACKING (Feature 10)
// ============================================================
export interface TrackingResult {
  orderId: string;
  status: string;
  currentStatus: string;
  timeline: Array<{ key: string; label: string; icon: string; completed: boolean; current: boolean; timestamp: string | null }>;
  items: Array<{ productId: string; title: string; quantity: number; price: number; image: string }>;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  estimatedDelivery: string | null;
  placedAt: string;
}

export async function getAdvancedTracking(orderId: string) {
  return clientFetch<TrackingResult>(`/customer/features/orders/${orderId}/tracking`);
}

// ============================================================
// 11. SMART RETURN CENTER (Feature 11)
// ============================================================
export interface ReturnRequest {
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  type: string;
  reason: string;
  status: string;
  refundAmount?: number;
  refundMethod?: string;
  createdAt: string;
}

export async function getReturnRequests() {
  return clientFetch<ReturnRequest[]>("/customer/features/returns");
}

export async function createReturnRequest(params: { orderId: string; productId: string; type: string; reason: string; evidenceUrls?: string[] }) {
  return clientMutation<ReturnRequest>("/customer/features/returns", "POST", params);
}

export async function getReturnDetails(id: string) {
  return clientFetch<ReturnRequest>(`/customer/features/returns/${id}`);
}

// ============================================================
// 12. SMART PAYMENT CENTER (Feature 12)
// ============================================================
export interface PaymentSummary {
  totalSpent: number;
  successfulPayments: number;
  failedPayments: number;
  refundedAmount: number;
  codOrders: number;
  methodBreakdown: Record<string, number>;
  currency: string;
}

export async function getPaymentHistory() {
  return clientFetch<Array<{ id: string; amount: number; method: string; status: string; description: string; createdAt: string }>>("/customer/features/payments");
}

export async function getPaymentSummary() {
  return clientFetch<PaymentSummary>("/customer/features/payments/summary");
}

// ============================================================
// 13. SMART VOUCHER WALLET (Feature 13)
// ============================================================
export interface VoucherWalletResult {
  available: Array<{ id: string; couponCode: string; title: string; description: string; type: string; value: number; minPurchase: number; expiresAt: string }>;
  expiringSoon: Array<{ id: string; couponCode: string; title: string; description: string; type: string; value: number; minPurchase: number; expiresAt: string }>;
  used: Array<{ id: string; couponCode: string; title: string; status: string }>;
  expired: Array<{ id: string; couponCode: string; title: string; status: string }>;
  sellerVouchers: Array<{ id: string; couponCode: string; title: string }>;
  freeDelivery: Array<{ id: string; couponCode: string; title: string }>;
  personalizedOffers: Array<{ id: string; couponCode: string; title: string }>;
  totalAvailable: number;
  totalUsed: number;
}

export async function getVoucherWallet() {
  return clientFetch<VoucherWalletResult>("/customer/features/vouchers");
}

export async function claimVoucher(couponCode: string) {
  return clientMutation("/customer/features/vouchers/claim", "POST", { couponCode });
}

export async function getBestVoucher(amount: number, category?: string) {
  const params = new URLSearchParams({ amount: String(amount) });
  if (category) params.append("category", category);
  return clientFetch<{ bestCoupon: unknown; allValid: unknown[]; potentialSavings: number }>(`/customer/features/vouchers/best?${params.toString()}`);
}

// ============================================================
// 14. SAVINGS DASHBOARD (Feature 14)
// ============================================================
export interface SavingsResult {
  originalPrice: number;
  discount: number;
  couponSavings: number;
  deliverySaved: number;
  totalSaved: number;
  orderCount: number;
  currency: string;
  savingsPercentage: number;
}

export async function getSavingsDashboard() {
  return clientFetch<SavingsResult>("/customer/features/savings");
}

// ============================================================
// 15. PERSONAL EXPENSE ANALYTICS (Feature 15)
// ============================================================
export interface ExpenseAnalyticsResult {
  overview: { totalSpend: number; orderCount: number; avgOrderValue: number; topCategory: string };
  monthlySpending: Array<{ month: string; amount: number; orders: number }>;
  categorySpending: Array<{ category: string; amount: number; percentage: number }>;
  range: string;
}

export async function getExpenseAnalytics(range?: string) {
  return clientFetch<ExpenseAnalyticsResult>(`/customer/features/expense-analytics${range ? `?range=${range}` : ""}`);
}

// ============================================================
// 16. INTELLIGENT NOTIFICATION CENTER (Feature 16)
// ============================================================
export async function getIntelligentNotifications(category?: string, page = 1) {
  const params = new URLSearchParams({ page: String(page) });
  if (category) params.append("category", category);
  return clientFetch<{ notifications: Array<{ id: string; type: string; title: string; message: string; isRead: boolean; createdAt: string }>; unreadCount: number; pagination: { total: number; page: number; totalPages: number } }>(`/customer/features/notifications/intelligent?${params.toString()}`);
}

export async function markNotificationRead(id: string) {
  return clientMutation(`/customer/features/notifications/${id}/read`, "PATCH");
}

export async function markAllNotificationsRead() {
  return clientMutation("/customer/features/notifications/read-all", "PATCH");
}

// ============================================================
// 17. SMART WISHLIST (Feature 17)
// ============================================================
export interface SmartWishlistResult {
  items: Array<{ id: string; title: string; currentPrice: number; originalPrice: number; priceDrop: number; priceDropPercent: number; hasPriceDrop: boolean; inStock: boolean; stock: number; category: string; images: string[]; ratingAvg: number; addedAt: string }>;
  priceDrops: Array<{ id: string; title: string; currentPrice: number; originalPrice: number; priceDrop: number; priceDropPercent: number }>;
  stockAlerts: Array<{ id: string; title: string; inStock: boolean }>;
  totalItems: number;
}

export async function getSmartWishlist() {
  return clientFetch<SmartWishlistResult>("/customer/features/wishlist/smart");
}

export async function togglePriceTracking(productId: string) {
  return clientMutation(`/customer/features/wishlist/${productId}/track-price`, "POST");
}

// ============================================================
// 18. SMART BUY AGAIN (Feature 18)
// ============================================================
export async function getBuyAgainProducts() {
  return clientFetch<{ items: Array<{ productId: string; title: string; category: string; lastPrice: number; currentPrice: number; purchaseCount: number; daysSincePurchase: number; inStock: boolean; image: string; available: boolean }> }>("/customer/features/buy-again");
}

// ============================================================
// 19. DIGITAL PURCHASE VAULT (Feature 22)
// ============================================================
export async function getPurchaseVault(type?: string) {
  return clientFetch<Array<{ id: string; orderId: string; type: string; title: string; documentNumber: string; issueDate: string; sellerName: string; totalAmount: number }>>(`/customer/features/purchase-vault${type ? `?type=${type}` : ""}`);
}

export async function getPurchaseDocument(id: string) {
  return clientFetch<Record<string, unknown>>(`/customer/features/purchase-vault/${id}`);
}

// ============================================================
// 20. WARRANTY MANAGER (Feature 23)
// ============================================================
export async function getWarranties() {
  return clientFetch<Array<{ orderId: string; productId: string; productTitle: string; category: string; purchaseDate: string; warrantyDuration: string; warrantyExpiry: string; sellerId: string; status: string }>>("/customer/features/warranties");
}

// ============================================================
// 21. CUSTOMER-SELLER COMMUNICATION (Feature 24)
// ============================================================
export interface ConversationResult {
  conversationId: string;
  participantId: string;
  subject: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export async function getConversations() {
  return clientFetch<ConversationResult[]>("/customer/features/messages");
}

export async function getConversationMessages(conversationId: string) {
  return clientFetch<Array<{ id: string; senderId: string; message: string; isRead: boolean; createdAt: string }>>(`/customer/features/messages/${conversationId}`);
}

export async function sendMessage(params: { receiverId: string; orderId?: string; productId?: string; subject: string; message: string }) {
  return clientMutation("/customer/features/messages", "POST", params);
}

export async function reportMessage(id: string, reason: string) {
  return clientMutation(`/customer/features/messages/${id}/report`, "POST", { reason });
}

// ============================================================
// 22. SMART CUSTOMER SUPPORT (Feature 25)
// ============================================================
export interface AiSupportResponse {
  response: string;
  suggestedAction: string;
  recentOrders: Array<{ id: string; status: string }>;
}

export async function aiSupportChat(message: string) {
  return clientFetch<AiSupportResponse>("/customer/features/support/ai-chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

// ============================================================
// 23. CUSTOMER LOYALTY & REWARDS (Feature 26)
// ============================================================
export interface LoyaltyStatus {
  totalPoints: number;
  availablePoints: number;
  lifetimePoints: number;
  level: "bronze" | "silver" | "gold" | "platinum";
  nextLevel: string | null;
  nextThreshold: number | null;
  progress: number;
  benefits: Record<string, string[]>;
}

export async function getLoyaltyStatus() {
  return clientFetch<LoyaltyStatus>("/customer/features/loyalty");
}

export async function getLoyaltyTransactions() {
  return clientFetch<Array<{ id: string; type: string; points: number; description: string; balanceAfter: number; createdAt: string }>>("/customer/features/loyalty/transactions");
}

export async function redeemPoints(points: number, rewardType: string) {
  return clientMutation("/customer/features/loyalty/redeem", "POST", { points, rewardType });
}

// ============================================================
// 24. ADDRESS INTELLIGENCE (Feature 27)
// ============================================================
export interface AddressIntelligent {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  city: string;
  streetAddress: string;
  postalCode: string;
  addressType: "home" | "office" | "university" | "other";
  isDefault: boolean;
}

export async function getAddressesIntelligent() {
  return clientFetch<AddressIntelligent[]>("/customer/features/addresses/intelligent");
}

export async function createAddressIntelligent(params: Omit<AddressIntelligent, "id">) {
  return clientMutation<AddressIntelligent>("/customer/features/addresses/intelligent", "POST", params);
}

export async function updateAddressIntelligent(id: string, params: Partial<AddressIntelligent>) {
  return clientMutation<AddressIntelligent>(`/customer/features/addresses/intelligent/${id}`, "PATCH", params);
}

export async function deleteAddressIntelligent(id: string) {
  return clientMutation(`/customer/features/addresses/intelligent/${id}`, "DELETE");
}

export async function setDefaultAddressIntelligent(id: string) {
  return clientMutation<AddressIntelligent>(`/customer/features/addresses/intelligent/${id}/default`, "PATCH");
}

// ============================================================
// 25. CUSTOMER SECURITY CENTER (Feature 28)
// ============================================================
export interface SecurityCenterResult {
  securityScore: number;
  sessions: Array<{ id: string; deviceName: string; deviceType: string; browser: string; os: string; ipAddress: string; lastActiveAt: string; isCurrentSession: boolean; status: string }>;
  timeline: Array<{ id: string; riskScore: number; riskLevel: string; actionTaken: string; createdAt: string }>;
  twoFactorEnabled: boolean;
  recommendations: string[];
}

export async function getSecurityCenter() {
  return clientFetch<SecurityCenterResult>("/customer/features/security/center");
}

export async function getActiveSessions() {
  return clientFetch<Array<{ id: string; deviceName: string; browser: string; os: string; lastActiveAt: string; isCurrentSession: boolean }>>("/customer/features/security/sessions");
}

export async function revokeSession(id: string) {
  return clientMutation(`/customer/features/security/sessions/${id}`, "DELETE");
}

export async function revokeAllSessions() {
  return clientMutation("/customer/features/security/sessions/revoke-all", "POST");
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return clientMutation("/customer/features/security/change-password", "POST", { currentPassword, newPassword });
}

// ============================================================
// 26. ACCOUNT ACTIVITY TIMELINE (Feature 29)
// ============================================================
export async function getActivityTimeline(range?: string) {
  return clientFetch<{ activities: Array<{ id: string; activityType: string; title: string; details?: string; createdAt: string }>; grouped: Record<string, Array<{ id: string; activityType: string; title: string; details?: string; createdAt: string }>>; range: string }>(`/customer/features/activity${range ? `?range=${range}` : ""}`);
}

export async function clearActivityTimeline() {
  return clientMutation("/customer/features/activity", "DELETE");
}

// ============================================================
// 27. PERSONAL SHOPPING PROFILE (Feature 30)
// ============================================================
export interface ShoppingProfile {
  preferredCategories: string[];
  typicalBudgetMin: number;
  typicalBudgetMax: number;
  preferredSellers: string[];
  preferredDelivery: "standard" | "express" | "any";
  favoriteBrands: string[];
  shoppingInterests: string[];
  allowPersonalization: boolean;
}

export async function getShoppingProfile() {
  return clientFetch<ShoppingProfile>("/customer/features/profile/preferences");
}

export async function updateShoppingProfile(params: Partial<ShoppingProfile>) {
  return clientMutation<ShoppingProfile>("/customer/features/profile/preferences", "PUT", params);
}

export async function resetShoppingProfile() {
  return clientMutation("/customer/features/profile/preferences", "DELETE");
}

export async function deletePersonalizationData() {
  return clientMutation("/customer/features/profile/personalization", "DELETE");
}
