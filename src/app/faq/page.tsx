import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Find answers to common questions about ShopNest for customers, sellers, and delivery partners.",
};

const faqs = [
  {
    question: "How do I place an order?",
    answer:
      "Browse products, add items to your cart, and complete checkout. You can choose an online payment method or cash on delivery where available.",
  },
  {
    question: "How do I track my order?",
    answer:
      "Open your order details from the Orders page. Order and delivery status updates are shown there as the seller and delivery partner process the request.",
  },
  {
    question: "How does delivery tracking work?",
    answer:
      "Delivery partners update delivery status as they move through pickup, transit, and completion. Customers and sellers can view the current status from order or delivery pages.",
  },
  {
    question: "How do I return a product?",
    answer:
      "Use the complaint or support pathway in your account to submit a return request. The seller or admin reviews the request and arranges the next step.",
  },
  {
    question: "How do I request a refund?",
    answer:
      "Submit a complaint with the refund category and include the order details. Admins or sellers review refund requests through the incident and complaint workflows.",
  },
  {
    question: "How does AI Shopping Advisor work?",
    answer:
      "The AI Shopping Advisor helps with product discovery, comparisons, and shopping guidance. It is available from the customer dashboard and some public pages.",
  },
  {
    question: "Can I use AI Advisor without logging in?",
    answer:
      "Some AI assistance is available without login, but personalized features and order-related actions require authentication.",
  },
  {
    question: "How do I become a seller?",
    answer:
      "Use the Become a Seller page to start registration. After submitting the required information, the platform processes the request before store access is granted.",
  },
  {
    question: "How do I add products?",
    answer:
      "After your seller account is approved, use the seller dashboard to add products manually or with AI Product Studio.",
  },
  {
    question: "How does Ready for Pickup work?",
    answer:
      "When a seller marks an order as ready for pickup, it becomes visible to delivery partners as an open delivery request.",
  },
  {
    question: "How do I register as a delivery partner?",
    answer:
      "Use the Delivery Registration page to submit your details and documents. The platform verifies the information before activating delivery access.",
  },
  {
    question: "How do available delivery requests work?",
    answer:
      "Verified delivery partners can browse open delivery requests, accept suitable ones, and begin the delivery workflow.",
  },
  {
    question: "How do I complete a delivery?",
    answer:
      "After pickup, navigate to the customer address, complete delivery, and submit the required OTP or proof upload to finish the mission.",
  },
];

export default function FAQPage() {
  return (
    <article className="max-w-3xl py-8">
      <p className="text-xs font-black uppercase tracking-[.2em] text-primary">Help</p>
      <h1 className="mt-3 text-4xl font-black">Frequently Asked Questions</h1>
      <p className="mt-3 leading-7 text-muted">
        Browse questions about shopping, selling, delivery, and platform features. If your question is
        not listed, use the <Link href="/support" className="text-primary underline">Support</Link> page.
      </p>

      <div className="mt-8 space-y-6">
        {faqs.map((item) => (
          <div key={item.question} className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-sm font-bold text-text">{item.question}</h2>
            <p className="mt-2 text-sm text-muted">{item.answer}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-lg font-black">Still need help?</h2>
        <p className="mt-2 text-sm text-muted">
          If you could not find what you were looking for, visit the support center or submit a
          complaint through your dashboard.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/support" className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white">
            Support Center
          </Link>
          <Link href="/contact" className="rounded-xl border border-border bg-muted-bg px-4 py-2 text-xs font-bold">
            Contact Us
          </Link>
        </div>
      </div>
    </article>
  );
}
