import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "ShopNest privacy policy covering account, order, seller, delivery, AI, complaint, and technical data handling.",
};

export default function PrivacyPolicyPage() {
  return (
    <article className="max-w-3xl py-8">
      <p className="text-xs font-black uppercase tracking-[.2em] text-primary">Legal</p>
      <h1 className="mt-3 text-4xl font-black">Privacy Policy</h1>
      <p className="mt-2 text-xs text-muted">Last Updated: 2026-09-17</p>

      <div className="mt-8 space-y-8 leading-7 text-muted">
        <section>
          <h2 className="text-xl font-black text-text">1. Introduction</h2>
          <p>
            ShopNest is an AI-powered multi-vendor commerce platform. This Privacy Policy explains
            what information is collected, how it is used, and the choices available to users. It
            covers customers, sellers, delivery partners, and administrators.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">2. Information We Collect</h2>
          <p>
            ShopNest collects information needed to operate marketplace transactions, account
            management, delivery operations, and support workflows. The sections below describe the
            main categories of data handled by the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">3. Account Information</h2>
          <p>
            Account data includes name, email, phone, role, authentication state, and profile
            details. This information is used for login, identity, role-based access, and
            communication related to account activity.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">4. Customer Data</h2>
          <p>
            Customer data includes addresses, orders, cart activity, wishlists, reviews, complaints,
            and support requests. This data supports order fulfillment, customer support, and
            platform improvement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">5. Seller Data</h2>
          <p>
            Seller data includes store details, product listings, inventory, orders, coupons,
            payouts-related context, trust scores, and seller support or complaint records. This data
            supports store operations, buyer trust, and platform moderation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">6. Delivery Partner Data</h2>
          <p>
            Delivery partner data includes profile information, delivery missions, availability
            status, location context used for delivery workflows, proof uploads, and delivery
            incident or complaint records. This data supports delivery operations and accountability.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">7. Order & Transaction Data</h2>
          <p>
            Order data includes products, quantities, pricing, payment status, delivery status,
            timestamps, and related identifiers. Transaction data is used to fulfill orders,
            reconcile seller and delivery workflows, and provide customer support.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">8. Location Data</h2>
          <p>
            Location data may be used in delivery workflows to support pickup, transit, and delivery
            completion. Location handling is limited to operational delivery needs. The platform
            does not advertise location data for unrelated profiling.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">9. Product, Search & Browsing Data</h2>
          <p>
            Browsing and search activity may be used to improve product discovery, recommendations,
            and platform usability. AI-assisted shopping features may use this context to provide
            more relevant suggestions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">10. AI Interaction Data</h2>
          <p>
            Interactions with AI features, such as the AI Shopping Advisor, AI seller tools, and AI
            copilots, may be processed to generate responses, improve relevance, and support platform
            operations. Sensitive personal secrets should not be shared with AI features.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">11. Complaint & Incident Data</h2>
          <p>
            Complaint and incident records include descriptions, attachments, status history, notes,
            and related entity references. This data is used for support, moderation, and platform
            safety workflows.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">12. Device & Technical Data</h2>
          <p>
            Technical data may include browser type, session identifiers, IP addresses, device
            context, and logs needed for security, debugging, and platform reliability.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">13. Cookies & Similar Technologies</h2>
          <p>
            ShopNest uses cookies and session storage for authentication, preferences, and security.
            Analytics or advertising cookies are only used if explicitly implemented. Users can
            manage cookie preferences through their browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">14. How We Use Information</h2>
          <p>
            Collected information is used to operate the marketplace, process orders, manage
            accounts, provide support, improve features, and maintain platform safety. It is not
            used for unrelated third-party advertising unless explicitly disclosed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">15. AI Processing</h2>
          <p>
            AI features process user-provided context to generate suggestions, recommendations, or
            operational guidance. AI outputs are assistance, not guarantees. Users remain
            responsible for their own decisions and actions on the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">16. Delivery Tracking</h2>
          <p>
            Delivery workflows use operational data needed to complete pickups, transit, and delivery
            handoff. Tracking-related data is not sold or shared outside the platform beyond what is
            necessary to complete the delivery.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">17. Payment Processing</h2>
          <p>
            Payment processing is handled through integrated payment providers. ShopNest does not
            store full payment card credentials unless explicitly implemented through a payment
            processor. Payment-related identifiers and statuses are stored for order lifecycle needs.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">18. Third-Party Services</h2>
          <p>
            ShopNest may rely on third-party infrastructure or libraries for hosting, payments,
            maps, or AI processing. These services are selected to support platform functionality.
            Users should review the terms and privacy notices of any third-party services involved.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">19. Data Sharing</h2>
          <p>
            Data is shared with other participants only as needed for marketplace operations: buyers
            and sellers see order-relevant details, delivery partners see delivery-relevant details,
            and admins see platform-relevant details for moderation and support.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">20. Security</h2>
          <p>
            ShopNest uses authentication, role-based access control, session handling, and incident
            management to protect accounts and operations. No system can guarantee absolute security,
            but the platform is designed to reduce unauthorized access and misuse.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">21. Data Retention</h2>
          <p>
            Data is retained for as long as needed to operate accounts, orders, deliveries, support,
            and legal obligations. Users may request account or data removal through available
            support pathways.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">22. User Rights</h2>
          <p>
            Users can access and update account information through profile settings. Additional
            data-related requests can be submitted through the support or complaint pathways
            available in the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">23. Account & Data Deletion</h2>
          <p>
            Account deletion or data removal requests are handled through the support or complaint
            system. Platform admins review and process valid requests in line with operational and
            legal constraints.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">24. Children&apos;s Privacy</h2>
          <p>
            ShopNest is intended for adult users. The platform does not knowingly collect personal
            information from children. If a minor is using the platform, it should be done with
            verified guardian involvement where required by applicable rules.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">25. Regional Considerations</h2>
          <p>
            ShopNest is developed as a general marketplace project. Local laws, payment rules, tax
            obligations, and delivery regulations vary by country and region. Users are responsible
            for complying with their local laws when using the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">26. Policy Changes</h2>
          <p>
            This policy may be updated as the platform evolves. Continued use of ShopNest after
            changes are published constitutes acceptance of the updated policy where applicable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">27. Contact</h2>
          <p>
            For privacy-related questions, use the platform&apos;s support or complaint pathways.
            Public contact options are available on the <Link href="/contact" className="text-primary underline">Contact</Link> page.
          </p>
        </section>
      </div>
    </article>
  );
}
