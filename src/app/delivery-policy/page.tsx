import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delivery Policy",
  description: "Understand ShopNest delivery operations, from order preparation to delivery completion and tracking.",
};

export default function DeliveryPolicyPage() {
  return (
    <article className="max-w-3xl py-8">
      <p className="text-xs font-black uppercase tracking-[.2em] text-primary">Policies</p>
      <h1 className="mt-3 text-4xl font-black">Delivery Policy</h1>
      <p className="mt-3 leading-7 text-muted">
        This page describes how delivery operations work on ShopNest. Actual delivery experiences
        depend on seller preparation, delivery partner availability, and customer location details.
      </p>

      <div className="mt-8 space-y-8 leading-7 text-muted">
        <section>
          <h2 className="text-xl font-black text-text">Order Processing</h2>
          <p>
            After an order is placed, the seller reviews and prepares it. Once preparation is
            complete, the seller can mark the order as ready for pickup.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">Delivery Request</h2>
          <p>
            Orders marked ready for pickup become visible to delivery partners as open delivery
            requests. Delivery partners can browse and accept requests based on their location and
            availability.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">Pickup & Transit</h2>
          <p>
            After acceptance, the delivery partner navigates to the pickup point, collects the order,
            and begins transit to the customer address. Status updates are recorded during this
            stage.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">Out for Delivery</h2>
          <p>
            The delivery partner updates the order status when it is out for delivery. Customers and
            sellers can view the current status from their respective order or delivery views.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">Delivery Completion</h2>
          <p>
            Delivery is completed using the platform&apos;s required handoff method, which may include
            OTP verification or proof upload. After successful completion, the delivery mission is
            marked finished and the order status advances.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">Tracking</h2>
          <p>
            Tracking information is available through order and delivery status updates. The platform
            provides operational tracking rather than guaranteed real-time GPS mapping unless
            explicitly implemented in a given workflow.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">Issues</h2>
          <p>
            Delivery issues can be reported through the complaint system. Admins review delivery
            incidents and complaints as part of platform operations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">Need Help?</h2>
          <p>
            Visit the <Link href="/support" className="text-primary underline">Support</Link> page or{" "}
            <Link href="/contact" className="text-primary underline">Contact</Link> page for delivery-related help.
          </p>
        </section>
      </div>
    </article>
  );
}
