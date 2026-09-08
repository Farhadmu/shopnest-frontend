import { clientFetch, clientMutation } from "@/lib/core/client";
import type { Order } from "@/lib/api/orders";

interface StripeCheckoutApiResponse {
  success: boolean;
  message: string;
  data: {
    sessionId: string;
    checkoutUrl: string | null;
  };
}

export interface StripeCheckoutResponse {
  sessionId: string;
  checkoutUrl: string | null;
}

export interface StripeVerifyApiResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    paymentStatus: "paid" | "unpaid" | "refunded";
    orderStatus: string;
    transactionId?: string;
    amount?: number;
    customerEmail?: string;
    order?: Order;
  };
}

export async function createStripeCheckoutSession(data: {
  orderId: string;
  customerEmail?: string;
}): Promise<StripeCheckoutResponse> {
  const response = await clientMutation<StripeCheckoutApiResponse>(
    "/payment/stripe/create-checkout-session",
    "POST",
    data
  );

  return response.data;
}

export async function verifyStripeCheckoutSession(sessionId: string) {
  const response = await clientFetch<StripeVerifyApiResponse>(
    `/payment/stripe/verify-session?sessionId=${encodeURIComponent(sessionId)}`
  );

  return response.data;
}