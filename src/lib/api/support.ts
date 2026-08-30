import { clientFetch, clientMutation } from "@/lib/core/client";

export interface SupportTicket {
  id: string;
  orderId?: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
  updatedAt: string;
}

export async function getSupportTickets() {
  return clientFetch<SupportTicket[]>("/customer/support-tickets");
}

export async function createSupportTicket(data: { orderId?: string; subject: string; message: string }) {
  return clientMutation<SupportTicket>("/customer/support-tickets", "POST", data);
}
