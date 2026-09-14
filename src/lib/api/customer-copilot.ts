import { clientMutation } from "@/lib/core/client";

export interface CustomerCopilotAction {
  label: string;
  action: string;
  targetUrl?: string;
}

export interface CustomerCopilotResponse {
  role: string;
  query: string;
  answer: string;
  suggestedActions: CustomerCopilotAction[];
  mode: string;
}

export async function askCustomerCopilot(query: string): Promise<CustomerCopilotResponse> {
  return clientMutation<CustomerCopilotResponse>("/ai/customer-copilot", "POST", { query });
}