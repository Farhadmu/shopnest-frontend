import { clientMutation, clientFetch } from "@/lib/core/client";

export type AIExperience =
  | "ADVISOR"
  | "CUSTOMER_COPILOT"
  | "SELLER_COPILOT"
  | "ADMIN_COPILOT"
  | "DELIVERY_COPILOT";

export interface AIEvidenceItem {
  type: "DATABASE" | "CALCULATION" | "SEARCH" | "SYSTEM";
  source: string;
  resourceId?: string;
  fact: string;
  value: string | number | boolean;
  timestamp: string;
}

export interface AIActionItem {
  id: string;
  riskLevel: "READ" | "LOW_RISK_WRITE" | "HIGH_RISK_WRITE";
  requiresConfirmation: boolean;
  action: string;
  label: string;
  description: string;
  targetUrl?: string;
  payload?: Record<string, unknown>;
}

export interface AIHandoffData {
  handoffId: string;
  from: AIExperience;
  to: AIExperience;
  userId?: string;
  productIds?: string[];
  orderIds?: string[];
  deliveryIds?: string[];
  conversationSummary?: string;
  suggestedAction?: string;
  preferences?: Record<string, unknown>;
  createdAt: string;
  expiresAt: string;
}

export interface UnifiedAiResponse {
  answer: string;
  aiType: AIExperience;
  conversationId: string;
  confidence: number;
  provider: string;
  isFallback: boolean;
  evidence: AIEvidenceItem[];
  actions: AIActionItem[];
  metrics?: Array<{
    label: string;
    value: string | number;
    changePercent?: number;
    trend?: "up" | "down" | "neutral";
  }>;
  referencedEntities?: {
    products?: Array<{
      id: string;
      title: string;
      price: number;
      image?: string;
      rating?: number;
      category?: string;
    }>;
    orders?: Array<{
      id: string;
      status: string;
      totalAmount: number;
      createdAt?: string;
    }>;
    deliveries?: Array<{
      id: string;
      status: string;
      pickupAddress?: string;
      deliveryAddress?: string;
      estimatedDistance?: number;
    }>;
    sellers?: Array<{
      id: string;
      storeName: string;
      status: string;
      trustScore?: number;
      rating?: number;
      orders?: number;
    }>;
    incidents?: Array<{
      id: string;
      title: string;
      severity: string;
      status: string;
    }>;
  };
  auditReceipt?: {
    auditId: string;
    action: string;
    targetType: string;
    targetId?: string;
    targetName?: string;
    performedBy: string;
    status: "SUCCESS" | "FAILED";
    timestamp: string;
    details?: Record<string, unknown>;
  };
  handoffAvailable?: boolean;
  handoffContext?: AIHandoffData;
}

/**
 * Sends a message turn to the Unified ShopNest AI Intelligence Core
 */
export async function askUnifiedAiCore(params: {
  prompt: string;
  aiType: AIExperience;
  conversationId?: string;
  sessionId?: string;
  currentPage?: string;
  handoffId?: string;
}): Promise<UnifiedAiResponse> {
  return clientMutation<UnifiedAiResponse>("/ai/core/chat", "POST", params);
}

/**
 * Confirms and executes an administrative mutation through server-side Admin AI
 */
export async function confirmAdminAiAction(params: {
  action: AIActionItem;
  conversationId?: string;
}): Promise<{
  success: boolean;
  message: string;
  receipt: any;
}> {
  return clientMutation<{ success: boolean; message: string; receipt: any }>("/admin/ai/confirm", "POST", params);
}

/**
 * Consumes a handoff context token from another experience
 */
export async function consumeHandoffToken(handoffId: string): Promise<AIHandoffData> {
  return clientFetch<AIHandoffData>(`/ai/core/handoff/${handoffId}`);
}

// Client-side cache timeout for conversational suggestions
export const AI_CLIENT_CACHE_TTL_MS = 60000;

// Verification flag for Unified AI Core client readiness
export const IS_UNIFIED_AI_CLIENT_ENABLED = true;
