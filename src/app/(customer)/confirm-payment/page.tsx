"use client";

import { useEffect, useState, useSyncExternalStore, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  createStripeCheckoutSession,
  createSSLCommerzPaymentSession,
} from "@/lib/api/payments";

function ConfirmPaymentContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const method = searchParams.get("method");
  const orderId = searchParams.get("orderId");
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const [error, setError] = useState<string | null>(null);

  const validationError = !isHydrated
    ? null
    : !orderId
    ? "Order ID is missing."
    : method !== "stripe" && method !== "sslcommerz"
    ? "Unsupported payment method."
    : null;

  useEffect(() => {
    if (validationError || !orderId) return;

    const startStripeCheckout = async () => {
      try {
        setError(null);

        const response = await createStripeCheckoutSession({
          orderId,
          customerEmail: session?.user?.email || undefined,
        });

        if (!response.checkoutUrl) {
          throw new Error("Stripe checkout URL was not returned.");
        }

        window.location.href = response.checkoutUrl;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to start Stripe checkout."
        );
      }
    };

    const startSSLCommerzCheckout = async () => {
      try {
        setError(null);

        const response = await createSSLCommerzPaymentSession({
          orderId,
          customerEmail: session?.user?.email || undefined,
        });


        const redirectUrl =
          response.GatewayPageURL || response.redirectGatewayURL;

        if (!redirectUrl) {
          throw new Error(
            response.failedreason || "SSLCommerz checkout URL was not returned."
          );
        }

        window.location.href = redirectUrl;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to start SSLCommerz checkout."
        );
      }
    };

    if (method === "stripe") {
      startStripeCheckout();
    } else if (method === "sslcommerz") {
      startSSLCommerzCheckout();
    }
  }, [orderId, method, session?.user?.email, validationError]);

  const displayedError = error || validationError;

  if (displayedError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-500">
            Payment Error
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {displayedError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />

        <h1 className="text-lg font-bold">
          Redirecting to Payment Page...
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Please wait while we securely redirect you to the payment page.
        </p>
      </div>
    </div>
  );
}

export default function ConfirmPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
            <h1 className="text-lg font-bold">Loading...</h1>
          </div>
        </div>
      }
    >
      <ConfirmPaymentContent />
    </Suspense>
  );
}
