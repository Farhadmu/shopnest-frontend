import { clientMutation } from "@/lib/core/client";

export interface CustomerCopilotAction {
  label: string;
  action: string;
  targetUrl?: string;
  description?: string;
}

export interface CustomerCopilotResponse {
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
  suggestedActions?: CustomerCopilotAction[];
  isFallback: boolean;
  conversationId?: string;
}

export async function askCustomerCopilot(query: string, conversationId?: string): Promise<CustomerCopilotResponse> {
  return clientMutation<CustomerCopilotResponse>("/ai/customer-copilot", "POST", { query, conversationId });
}
