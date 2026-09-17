import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About ShopNest",
  description: "Learn about ShopNest's AI-powered multi-vendor commerce platform, ecosystem, and how it connects customers, sellers, delivery partners, and admins.",
};

export default function AboutPage() {
  return (
    <div className="py-8">
      <div className="max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[.2em] text-primary">About ShopNest</p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">Shop Smarter. Sell Better.</h1>
        <p className="mt-5 text-base leading-8 text-muted">
          ShopNest is an AI-powered multi-vendor commerce platform where customers discover products,
          sellers grow their stores, and delivery partners complete real-world deliveries. It combines
          marketplace shopping, seller store management, AI assistance, and real-time delivery
          operations in one ecosystem.
        </p>
      </div>

      <div className="mt-12 max-w-3xl space-y-10">
        <section>
          <h2 className="text-2xl font-black">Who We Are</h2>
          <p className="mt-3 leading-7 text-muted">
            ShopNest is built as a practical multi-vendor marketplace system. It gives customers a
            unified place to browse products, compare options, manage orders, and request support.
            Sellers get tools to manage products, inventory, orders, coupons, and store performance.
            Delivery partners get access to open delivery requests, route-relevant assistance, and
            delivery tracking. Admins get platform-wide analytics, moderation, and incident management.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black">What We Solve</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="text-sm font-bold">For Customers</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
                <li>Discover and compare products across multiple sellers</li>
                <li>Track orders and delivery status in one place</li>
                <li>Submit complaints and get support when needed</li>
                <li>Use AI shopping assistance for product discovery</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="text-sm font-bold">For Sellers</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
                <li>Manage product catalog, inventory, and pricing</li>
                <li>Process orders and mark items ready for pickup</li>
                <li>Use AI seller tools for product creation and insights</li>
                <li>View analytics, trust score, and store health</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="text-sm font-bold">For Delivery Partners</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
                <li>Browse available delivery requests</li>
                <li>Accept deliveries and navigate to pickup</li>
                <li>Upload proof of delivery and complete missions</li>
                <li>Use AI copilot for workload and earnings guidance</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="text-sm font-bold">For Admins</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
                <li>Monitor platform-wide operations and users</li>
                <li>Moderate products, sellers, and reviews</li>
                <li>Investigate incidents and manage complaints</li>
                <li>Use admin intelligence, risk, and analytics tools</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black">How ShopNest Works</h2>
          <p className="mt-3 leading-7 text-muted">
            A customer discovers products and places an order. The seller prepares the order and marks
            it ready for pickup. A delivery partner accepts the request, picks up the order, and
            completes delivery with tracking and proof. Admins oversee the marketplace, moderate
            content, and handle incidents. AI features assist customers, sellers, delivery partners,
            and admins throughout the flow.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black">Our Ecosystem</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/products" className="rounded-2xl border border-border bg-surface p-5 transition hover:border-primary/40">
              <h3 className="text-sm font-bold">Customer</h3>
              <p className="mt-2 text-xs text-muted">Browse, compare, order, track, review, and request support.</p>
            </Link>
            <Link href="/become-seller" className="rounded-2xl border border-border bg-surface p-5 transition hover:border-primary/40">
              <h3 className="text-sm font-bold">Seller</h3>
              <p className="mt-2 text-xs text-muted">Register, build a store, list products, fulfill orders, and grow sales.</p>
            </Link>
            <Link href="/delivery/register" className="rounded-2xl border border-border bg-surface p-5 transition hover:border-primary/40">
              <h3 className="text-sm font-bold">Delivery Partner</h3>
              <p className="mt-2 text-xs text-muted">Register, verify identity, accept requests, and complete deliveries.</p>
            </Link>
            <Link href="/dashboard/admin" className="rounded-2xl border border-border bg-surface p-5 transition hover:border-primary/40">
              <h3 className="text-sm font-bold">Admin</h3>
              <p className="mt-2 text-xs text-muted">Monitor, moderate, analyze, and secure the platform.</p>
            </Link>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black">AI-Powered Commerce</h2>
          <p className="mt-3 leading-7 text-muted">
            ShopNest includes practical AI capabilities for real user tasks. Customers can use the AI
            Shopping Advisor for product discovery and comparison. Sellers have AI Product Studio and
            AI seller tools for listing creation and insights. Delivery partners have an AI copilot for
            workload and earnings guidance. Admins have intelligence and risk tools for platform
            oversight. These features are integrated into the existing routes and dashboards.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black">Real-Time Delivery</h2>
          <p className="mt-3 leading-7 text-muted">
            ShopNest uses location-aware delivery workflows. Delivery partners can accept open
            requests, navigate to pickup points, and complete deliveries with OTP or proof uploads.
            Customers and sellers can track delivery progress through order and delivery workflows.
            Admin tools are available for monitoring delivery operations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black">Trust & Safety</h2>
          <p className="mt-3 leading-7 text-muted">
            The platform uses role-based access control, session tracking, product moderation, seller
            verification, complaint handling, and incident management. Admins can review security
            events, assign incidents, and manage platform-wide risk signals. These systems are
            intended to keep transactions, accounts, and deliveries safer for all participants.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black">Our Vision</h2>
          <p className="mt-3 leading-7 text-muted">
            ShopNest is designed as a practical commerce platform for real buying, selling, and
            delivery workflows. The goal is to keep improving discovery, trust, and operational
            clarity for customers, sellers, delivery partners, and admins.
          </p>
        </section>
      </div>
    </div>
  );
}
