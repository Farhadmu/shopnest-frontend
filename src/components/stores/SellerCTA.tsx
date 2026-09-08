import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import RevenueCalculator from "./RevenueCalculator";

export default function SellerCTA() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 sm:p-12 text-white shadow-xl border border-slate-800">
          
          {/* Background Glow Effect */}
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-600/20 blur-[100px] pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7">
              <span className="inline-block text-[11px] font-bold tracking-widest text-blue-400 uppercase mb-3">
                MERCHANT ACCELERATOR
              </span>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl text-white">
                Ready to sell to millions of high-intent shoppers?
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-400 max-w-xl">
                Launch your branded digital storefront in under 48 hours. Enjoy automated payouts, multi-currency checkout, integrated carrier labels, and zero platform listing fees.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500"
                >
                  Open Your Storefront <FaArrowRight className="text-[10px]" />
                </Link>
                <Link
                  href="/handbook"
                  className="text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  Explore Seller Handbook →
                </Link>
              </div>
            </div>

            {/* Right Revenue Calculator Component */}
            <div className="lg:col-span-5">
              <RevenueCalculator />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}