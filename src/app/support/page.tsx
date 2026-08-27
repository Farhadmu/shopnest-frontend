import Link from "next/link";
export default function SupportPage() {
  return (
    <div className="py-8">
      <div className="max-w-3xl rounded-[2rem] border border-border bg-surface p-7 sm:p-10">
        <p className="text-xs font-black uppercase tracking-[.2em] text-primary">Support</p>
        <h1 className="mt-3 text-4xl font-black">How can we help?</h1>
        <p className="mt-4 leading-7 text-muted">
          For project/demo support, start with your account, orders or seller dashboard. You can
          also browse products and use the AI Advisor.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/orders"
            className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white"
          >
            My orders
          </Link>
          <Link
            href="/ai-advisor"
            className="rounded-xl border border-border bg-muted-bg px-4 py-3 text-sm font-bold"
          >
            AI Advisor
          </Link>
          <Link
            href="/products"
            className="rounded-xl border border-border bg-muted-bg px-4 py-3 text-sm font-bold"
          >
            Browse products
          </Link>
        </div>
      </div>
    </div>
  );
}
