"use client";

import Link from "next/link";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { userDashboardLinks } from "@/lib/constants/dashboard-nav";
import { useShoppingJourney } from "@/hooks/dashboard/user/useShoppingJourney";

export default function ShoppingJourneyPage() {
  const { journeyData } = useShoppingJourney();
  const progress = journeyData?.journey?.journeyProgress ?? 45;

  return (
    <DashboardShell role="Customer" title="Shopping Journey" subtitle="Your personalized product discovery timeline." links={userDashboardLinks}>
      <div className="space-y-6">
        <Panel title="🚀 Your Personalized Shopping Journey">
          <div className="mb-4 rounded-2xl bg-gradient-to-r from-primary/15 via-accent/10 to-transparent p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Active Discovery Path</span>
                <h3 className="text-lg font-black text-text capitalize">
                  {journeyData?.journey?.category || "Electronics & Gaming"} Setup Path
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Stage: <span className="font-bold text-text uppercase">{journeyData?.journey?.currentStage ? journeyData.journey.currentStage.replace(/_/g, " ") : "Discovery"}</span>
                </p>
              </div>
              <div className="rounded-2xl border border-primary/30 bg-surface px-4 py-2 text-center shadow-xs">
                <p className="text-[10px] font-bold text-muted uppercase">Journey Progress</p>
                <p className="text-2xl font-black text-primary">{progress}%</p>
              </div>
            </div>

            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-surface">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-5 text-center text-xs font-bold">
            {[
              { stage: "Discovery", desc: "Exploring Categories", passed: true },
              { stage: "Evaluation", desc: "Comparing Specs", passed: progress >= 40 },
              { stage: "Intent", desc: "Saved to Wishlist", passed: progress >= 60 },
              { stage: "Ready to Buy", desc: "Added to Cart", passed: progress >= 80 },
              { stage: "Completed", desc: "Delivered Order", passed: progress === 100 },
            ].map((s, idx) => (
              <div key={idx} className={`rounded-xl border p-3 ${s.passed ? "border-primary bg-primary/5 text-primary" : "border-border bg-muted-bg/40 text-muted"}`}>
                <span className="text-base">{s.passed ? "✓" : "○"}</span>
                <p className="mt-1 font-black text-text">{s.stage}</p>
                <p className="text-[10px] font-medium text-muted">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="font-extrabold text-text text-sm mb-3">Recommended Next Steps for Your Journey</h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(journeyData?.recommendedItems || []).map((item) => (
                <Link key={item.id} href={`/products/${item.id}`} className="group rounded-2xl border border-border bg-surface p-3.5 shadow-sm transition hover:border-primary/50 hover:shadow-md">
                  <div className="h-32 w-full rounded-xl bg-muted-bg overflow-hidden flex items-center justify-center">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                    ) : (
                      <span className="text-2xl">🛍️</span>
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="truncate text-xs font-bold text-text">{item.title}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs font-black text-primary">৳{(item.discountPrice || item.price).toLocaleString()}</span>
                      <span className="text-[11px] font-bold text-amber-500">★ {item.ratingAvg.toFixed(1)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
