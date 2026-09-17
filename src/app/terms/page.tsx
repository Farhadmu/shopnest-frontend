import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "ShopNest terms and conditions for customers, sellers, delivery partners, and admins using the marketplace platform.",
};

export default function TermsPage() {
  return (
    <article className="max-w-3xl py-8">
      <p className="text-xs font-black uppercase tracking-[.2em] text-primary">Legal</p>
      <h1 className="mt-3 text-4xl font-black">Terms & Conditions</h1>
      <p className="mt-2 text-xs text-muted">Last Updated: 2026-09-17</p>

      <div className="mt-8 space-y-8 leading-7 text-muted">
        <section>
          <h2 className="text-xl font-black text-text">1. Acceptance of Terms</h2>
          <p>
            By accessing or using ShopNest, you agree to these terms. If you do not agree, please do
            not use the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">2. Eligibility</h2>
          <p>
            You must have the legal capacity to enter into agreements and comply with these terms.
            Platform features are intended for adult users acting in good faith.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">3. Account Registration</h2>
          <p>
            Customers, sellers, and delivery partners must register with accurate information. You
            are responsible for maintaining the confidentiality of your account and for all activity
            under your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">4. Customer Responsibilities</h2>
          <p>
            Customers must provide accurate delivery and contact information, complete payments when
            required, and communicate respectfully with sellers and delivery partners.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">5. Seller Responsibilities</h2>
          <p>
            Sellers must list accurate products, honor order commitments, maintain inventory
            accuracy, and fulfill orders within agreed operational expectations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">6. Delivery Partner Responsibilities</h2>
          <p>
            Delivery partners must complete accepted deliveries honestly, respect customer property,
            follow pickup and delivery instructions, and upload valid proof when required.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">7. Marketplace Model</h2>
          <p>
            ShopNest operates as a multi-vendor marketplace. Sellers are independent participants.
            ShopNest facilitates transactions, discovery, and operational tools but does not act as
            the direct seller unless explicitly stated.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">8. Product Listings</h2>
          <p>
            Listings must be accurate, lawful, and not misleading. Prohibited, infringing, or unsafe
            products may be removed by admins.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">9. Orders</h2>
          <p>
            Orders represent a buyer request to purchase. Sellers may confirm, prepare, or update
            order status according to platform workflows. Admins may intervene when needed for
            platform safety.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">10. Payments</h2>
          <p>
            Payments are processed through integrated providers. Payment outcomes, refunds, and
            disputes follow the platform&apos;s payment and support workflows.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">11. Shipping & Delivery</h2>
          <p>
            Delivery operations depend on seller preparation, delivery partner availability, and
            customer location details. Actual delivery experiences may vary by region and request
            timing.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">12. Returns & Refunds</h2>
          <p>
            Returns and refunds are governed by seller/admin review and platform support workflows.
            Customers should submit clear return or refund requests through available channels.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">13. Cancellations</h2>
          <p>
            Order cancellations depend on order status, seller readiness, and delivery stage. The
            platform provides cancellation pathways where operationally possible.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">14. Reviews & User Content</h2>
          <p>
            Reviews and user-generated content should be honest and relevant. Fake, abusive, or
            misleading content may be removed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">15. Complaints</h2>
          <p>
            Complaints should be submitted through the platform complaint system. Admins review
            complaints and take action within platform workflows.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">16. AI Features</h2>
          <p>
            AI features are provided as assistance, not guarantees. Users remain responsible for
            their own decisions. Do not share sensitive credentials or private data with AI features.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">17. Prohibited Activities</h2>
          <p>
            Fraud, abuse, fake reviews, unauthorized access, manipulation of orders or reviews, and
            misuse of delivery or seller privileges are prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">18. Account Suspension</h2>
          <p>
            Admins may suspend or restrict accounts that violate these terms, pose platform risk, or
            fail verification requirements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">19. Limitation of Liability</h2>
          <p>
            ShopNest is provided as a project platform. To the maximum extent allowed, the platform
            is not liable for indirect, incidental, or consequential losses arising from use of the
            marketplace.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">20. Changes to Terms</h2>
          <p>
            Terms may be updated as the platform evolves. Continued use after updates constitutes
            acceptance of revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">21. Contact</h2>
          <p>
            For terms-related questions, use the <Link href="/contact" className="text-primary underline">Contact</Link> page or the support pathways available in the platform.
          </p>
        </section>
      </div>
    </article>
  );
}
