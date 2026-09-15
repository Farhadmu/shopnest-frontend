import { clientMutation } from "@/lib/core/client";

export interface SellerCopilotAction {
  label: string;
  action: string;
  targetUrl?: string;
  description?: string;
}

export interface SellerCopilotResponse {
  answer: string;
  summary: string;
  intent: string;
  confidence: number;
  timeRange: {
    start: string;
    end: string;
    label: string;
  };
  metrics?: Array<{
    label: string;
    value: number;
    formatted: string;
    changePercent?: number;
    trend?: "up" | "down" | "neutral";
  }>;
  insights?: Array<{
    severity: "info" | "low" | "medium" | "high" | "critical";
    title: string;
    description: string;
    evidence?: Array<{ fact: string; value: string }>;
  }>;
  sources?: Array<{ name: string; type: string; recordCount?: number }>;
  suggestedActions?: SellerCopilotAction[];
  isFallback: boolean;
  conversationId?: string;
}

export async function askSellerCopilot(query: string, conversationId?: string): Promise<SellerCopilotResponse> {
  return clientMutation<SellerCopilotResponse>("/ai/seller-copilot", "POST", { query, conversationId });
}
