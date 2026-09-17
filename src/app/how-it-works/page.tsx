import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "How ShopNest Works",
  description: "Learn how ShopNest connects customers, sellers, delivery partners, and admins in one marketplace workflow.",
};

export default function HowItWorksPage() {
  return (
    <article className="max-w-3xl py-8">
      <p className="text-xs font-black uppercase tracking-[.2em] text-primary">Platform</p>
      <h1 className="mt-3 text-4xl font-black">How ShopNest Works</h1>
      <p className="mt-3 leading-7 text-muted">
        ShopNest is a multi-vendor marketplace with four main participants: customers, sellers,
        delivery partners, and admins. Each role has its own workflow, and the platform connects
        them through orders, delivery requests, and support systems.
      </p>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="text-2xl font-black">Customer Flow</h2>
          <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-muted">
            <li>Discover products through browsing, categories, stores, or the AI Shopping Advisor.</li>
            <li>Compare products and add items to cart.</li>
            <li>Place an order and complete checkout or cash-on-delivery flow.</li>
            <li>Track order status and delivery progress.</li>
            <li>Receive the delivery and leave a review.</li>
            <li>Request returns, refunds, or support through the complaints system if needed.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-black">Seller Flow</h2>
          <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-muted">
            <li>Register as a seller and complete verification.</li>
            <li>Set up the store profile and preferences.</li>
            <li>Add products manually or with AI Product Studio.</li>
            <li>Manage inventory, coupons, and store health.</li>
            <li>Receive orders and mark them ready for pickup.</li>
            <li>Track delivery completion and review analytics.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-black">Delivery Partner Flow</h2>
          <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-muted">
            <li>Register as a delivery partner and complete verification.</li>
            <li>Browse available delivery requests.</li>
            <li>Accept a delivery and navigate to the pickup point.</li>
            <li>Complete pickup and transit to the customer.</li>
            <li>Complete delivery with OTP or proof upload.</li>
            <li>Use AI copilot for workload and earnings guidance.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-black">Admin Flow</h2>
          <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-muted">
            <li>Monitor platform-wide metrics and user activity.</li>
            <li>Moderate products, sellers, reviews, and categories.</li>
            <li>Manage orders, coupons, hero banners, and delivery partners.</li>
            <li>Investigate incidents and manage complaints.</li>
            <li>Review risk signals, fraud alerts, and audit logs.</li>
            <li>Use admin intelligence tools for analytics and forecasting.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-black">AI Across Roles</h2>
          <p className="mt-3 leading-7 text-muted">
            AI features are integrated into customer shopping, seller product creation, delivery
            workload guidance, and admin intelligence. These features operate through existing
            routes and dashboards, not as a separate system.
          </p>
        </section>
      </div>
    </article>
  );
}
