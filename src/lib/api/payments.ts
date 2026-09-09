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

export interface SSLCommerzCheckoutResponse {
  status: string;
  failedreason?: string;
  sessionkey?: string;
  GatewayPageURL?: string;
  redirectGatewayURL?: string;
  [key: string]: any;
}

interface SSLCommerzApiResponse {
  success: boolean;
  message: string;
  data: SSLCommerzCheckoutResponse;
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

export async function createSSLCommerzPaymentSession(data: {
  orderId: string;
  customerEmail?: string;
}): Promise<SSLCommerzCheckoutResponse> {
  const response = await clientMutation<SSLCommerzApiResponse>(
    "/payment/sslcommerz/create-payment-session",
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

export interface SSLCommerzVerifyApiResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    paymentStatus: "paid" | "unpaid" | "refunded";
    orderStatus: string;
    order?: Order;
    customerEmail?: string;
  };
}

export async function verifySSLCommerzPayment(params: {
  orderId: string;
  sessionId?: string;
  val_id?: string;
}) {
  const query = new URLSearchParams({
    orderId: params.orderId,
    ...(params.sessionId ? { sessionId: params.sessionId } : {}),
    ...(params.val_id ? { val_id: params.val_id } : {}),
  });

  const response = await clientFetch<SSLCommerzVerifyApiResponse>(
    `/payment/sslcommerz/verify-payment?${query.toString()}`
  );

  return response.data;
}

