import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description: "Learn about ShopNest returns, refunds, and replacement workflows for customer orders.",
};

export default function ReturnsRefundsPage() {
  return (
    <article className="max-w-3xl py-8">
      <p className="text-xs font-black uppercase tracking-[.2em] text-primary">Policies</p>
      <h1 className="mt-3 text-4xl font-black">Returns & Refunds</h1>
      <p className="mt-3 leading-7 text-muted">
        This page explains the platform&apos;s return and refund workflows. Actual outcomes depend on
        seller or admin review and the current order or delivery status.
      </p>

      <div className="mt-8 space-y-8 leading-7 text-muted">
        <section>
          <h2 className="text-xl font-black text-text">Return Requests</h2>
          <p>
            Customers can submit a return request when a product is eligible for return. The request
            is reviewed by the seller or admin, who decides whether to approve, reject, or request
            more information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">Refunds</h2>
          <p>
            Approved returns or refund requests may result in a refund. The refund process follows
            the platform&apos;s payment and support workflows. Refund timing can vary depending on the
            payment method and order state.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">Replacements</h2>
          <p>
            In some cases, a replacement may be offered instead of a refund. Replacement availability
            depends on seller stock, product eligibility, and the review outcome.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">Cancellations</h2>
          <p>
            Orders may be cancellable depending on their current status. If an order has not yet
            entered fulfillment, cancellation is more likely to be possible. Use the order or
            complaint pathway to request cancellation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">How to Request</h2>
          <p>
            Use the customer complaint system from your dashboard and select the relevant category
            such as return, refund, or order issue. Include the order ID and a clear description of
            the request.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">Need Help?</h2>
          <p>
            Visit the <Link href="/support" className="text-primary underline">Support</Link> page or{" "}
            <Link href="/contact" className="text-primary underline">Contact</Link> page for guidance.
          </p>
        </section>
      </div>
    </article>
  );
}
