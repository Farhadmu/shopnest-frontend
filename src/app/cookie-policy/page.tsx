import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Learn how ShopNest uses cookies and session storage for authentication, preferences, and security.",
};

export default function CookiePolicyPage() {
  return (
    <article className="max-w-3xl py-8">
      <p className="text-xs font-black uppercase tracking-[.2em] text-primary">Legal</p>
      <h1 className="mt-3 text-4xl font-black">Cookie Policy</h1>
      <p className="mt-2 text-xs text-muted">Last Updated: 2026-09-17</p>

      <div className="mt-8 space-y-8 leading-7 text-muted">
        <section>
          <h2 className="text-xl font-black text-text">What Are Cookies</h2>
          <p>
            Cookies are small text strings stored by your browser. ShopNest uses them to maintain
            sessions, remember preferences, and support platform security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">Authentication & Session Cookies</h2>
          <p>
            ShopNest uses session cookies for authenticated access. These cookies allow the platform
            to recognize logged-in users across requests and maintain secure dashboard access.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">Preference Cookies</h2>
          <p>
            Preference cookies may store UI choices such as theme selection. These settings improve
            the browsing experience across visits.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">Security Cookies</h2>
          <p>
            Security-related cookies help protect accounts and detect abnormal behavior. They are
            used as part of the platform&apos;s authentication and session management design.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">Analytics Cookies</h2>
          <p>
            Analytics cookies are only used if analytics features are explicitly enabled. If no
            analytics service is active, the platform does not rely on advertising or tracking
            cookies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">Managing Cookies</h2>
          <p>
            You can manage or clear cookies through your browser settings. Disabling certain cookies
            may affect login sessions or preference behavior on the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-text">Contact</h2>
          <p>
            For cookie-related questions, use the <Link href="/contact" className="text-primary underline">Contact</Link> page or the support pathways in the platform.
          </p>
        </section>
      </div>
    </article>
  );
}
