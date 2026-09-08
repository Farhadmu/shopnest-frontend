"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createStripeCheckoutSession } from "@/lib/api/payments";

function ConfirmPaymentContent() {
  const searchParams = useSearchParams();

  const method = searchParams.get("method");
  const orderId = searchParams.get("orderId");

  const [error, setError] = useState<string | null>(null);

  const validationError = !orderId
    ? "Order ID is missing."
    : method !== "stripe"
    ? "Unsupported payment method."
    : null;

  useEffect(() => {
    if (validationError || !orderId) return;

    const startStripeCheckout = async () => {
      try {
        setError(null);

        const response = await createStripeCheckoutSession({
          orderId,
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

    startStripeCheckout();
  }, [orderId, method, validationError]);

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