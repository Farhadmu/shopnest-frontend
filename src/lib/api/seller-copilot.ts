import { clientMutation } from "@/lib/core/client";

export interface SellerCopilotAction {
  label: string;
  action: string;
  targetUrl?: string;
}

export interface SellerCopilotResponse {
  role: string;
  query: string;
  answer: string;
  suggestedActions: SellerCopilotAction[];
  mode: string;
}

export async function askSellerCopilot(query: string): Promise<SellerCopilotResponse> {
  return clientMutation<SellerCopilotResponse>("/ai/seller-copilot", "POST", { query });
}