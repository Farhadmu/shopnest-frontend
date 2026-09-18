import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact ShopNest support through the contact form or support center.",
};

export default function ContactPage() {
  return (
    <article className="max-w-3xl py-8">
      <p className="text-xs font-black uppercase tracking-[.2em] text-primary">Support</p>
      <h1 className="mt-3 text-4xl font-black">Contact Us</h1>
      <p className="mt-3 leading-7 text-muted">
        Use this page to reach ShopNest support. For order-specific or account-specific issues, the
        fastest path is usually the complaint or support center from your dashboard.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-bold">Customer Support</h2>
          <p className="mt-2 text-xs text-muted">
            For order issues, returns, refunds, and complaints, use the customer support pathways in
            your dashboard or the <Link href="/support" className="text-primary underline">Support</Link> page.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-bold">Seller Support</h2>
          <p className="mt-2 text-xs text-muted">
            Sellers can use seller dashboard support and complaint pathways for store, product, and
            order issues.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-bold">Delivery Partner Support</h2>
          <p className="mt-2 text-xs text-muted">
            Delivery partners can use the delivery dashboard support and complaint pathways for
            delivery-specific issues.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-bold">General Inquiries</h2>
          <p className="mt-2 text-xs text-muted">
            For general platform questions, browse the <Link href="/faq" className="text-primary underline">FAQ</Link> or{" "}
            <Link href="/support" className="text-primary underline">Support</Link> center first.
          </p>
        </div>
      </div>
    </article>
  );
}
