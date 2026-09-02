import { clientFetch, clientMutation } from "../core/client";

export interface CopilotMetric {
  label: string;
  value: number;
  formatted: string;
  changePercent?: number;
  trend?: "up" | "down" | "neutral";
}

export interface CopilotInsight {
  title: string;
  description: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  evidence?: Array<{ fact: string; value: string }>;
}

export interface CopilotSource {
  name: string;
  type: "database" | "analytics" | "security" | "telemetry";
  recordCount?: number;
}

export interface CopilotAction {
  label: string;
  action: string;
  targetUrl?: string;
  description?: string;
}

export interface CopilotResponse {
  answer: string;
  summary: string;
  intent: string;
  confidence: number;
  timeRange: {
    field: string;
    from: string;
    to: string;
    label: string;
  };
  metrics: CopilotMetric[];
  insights: CopilotInsight[];
  sources: CopilotSource[];
  suggestedActions: CopilotAction[];
  isFallback: boolean;
}

export interface CopilotQueryRequest {
  query: string;
  context?: Record<string, unknown>;
}

export async function askAdminCopilot(query: string): Promise<CopilotResponse> {
  return clientMutation<CopilotResponse>(
    "/ai/admin-copilot",
    "POST",
    { query }
  );
}
