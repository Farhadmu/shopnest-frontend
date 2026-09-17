import { clientMutation } from "@/lib/core/client";

export interface CommerceCompanionProduct {
  id: string;
  title: string;
  price: number;
  discountPrice?: number;
  category: string;
  ratingAvg: number;
  ratingCount: number;
  stock: number;
  sold: number;
  images: string[];
  description?: string;
  specifications?: Record<string, string>;
  seller?: { storeName: string; trustScore: number };
  freeDelivery?: boolean;
  warrantyMonths?: number;
}

export interface CommerceCompanionOrder {
  id: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  items: Array<{ productId: string; title: string; price: number; quantity: number; image?: string }>;
  shippingAddress: string;
}

export interface CommerceCompanionWishlistItem {
  productId: string;
  title: string;
  price: number;
  discountPrice?: number;
  category: string;
  ratingAvg: number;
  stock: number;
  images: string[];
  addedAt: string;
}

export interface CommerceCompanionCartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  stock: number;
}

export interface CommerceCompanionAction {
  type: string;
  label: string;
  targetUrl?: string;
  payload?: Record<string, unknown>;
}

export interface CommerceCompanionResponse {
  reply: string;
  conversationId: string;
  contextReferences?: Array<{ id: string; type: string; title: string }>;
  products?: CommerceCompanionProduct[];
  orders?: CommerceCompanionOrder[];
  wishlistItems?: CommerceCompanionWishlistItem[];
  cartItems?: CommerceCompanionCartItem[];
  cartSummary?: { subtotal: number; itemCount: number };
  navigation?: CommerceCompanionAction[];
  actions?: CommerceCompanionAction[];
  isFallback: boolean;
  provider?: string;
  providerStatus?: "available" | "unavailable";
  thinking?: string;
}

export async function askCommerceCompanion(
  message: string,
  conversationId?: string,
  currentPage?: { route?: string; productId?: string; orderId?: string }
): Promise<CommerceCompanionResponse> {
  return clientMutation<CommerceCompanionResponse>("/ai/commerce-companion", "POST", {
    message,
    conversationId,
    currentPage,
  });
}

// New conversational AI endpoint with enhanced features
export async function askConversationalAdvisor(
  message: string,
  conversationId?: string
): Promise<CommerceCompanionResponse> {
  return clientMutation<CommerceCompanionResponse>("/ai/advisor/conversational", "POST", {
    message,
    conversationId,
  });
}
