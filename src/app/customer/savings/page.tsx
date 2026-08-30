"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { getSavingsDashboard, SavingsResult, getExpenseAnalytics, ExpenseAnalyticsResult } from "@/lib/api/customer-features";
import { BarChart } from "@/components/analytics/BarChart";
import { DonutChart } from "@/components/analytics/DonutChart";

export default function SavingsDashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [savings, setSavings] = useState<SavingsResult | null>(null);
  const [analytics, setAnalytics] = useState<ExpenseAnalyticsResult | null>(null);
  const [range, setRange] = useState("6_months");

  if (!isPending && !session?.user) router.push("/login");

  useState(() => {
    getSavingsDashboard().then(setSavings).catch(() => {});
    getExpenseAnalytics(range).then(setAnalytics).catch(() => {});
  });

  const links = [
    { label: "Savings", href: "/customer/savings", icon: "💸", description: "Your savings overview" },
    { label: "Analytics", href: "/customer/expense-analytics", icon: "📈", description: "Spending analytics" },
    { label: "Vouchers", href: "/customer/vouchers", icon: "🎟️", description: "Voucher wallet" },
    { label: "Payments", href: "/customer/payments", icon: "💳", description: "Payment center" },
  ];

  return (
    <DashboardShell title="Savings & Analytics" subtitle="Track your savings and spending patterns" role="Customer" links={links}>
      <div className="space-y-6">
        {savings && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon="💰" value={`৳${savings.totalSaved.toLocaleString()}`} label="Total Saved" note={`${savings.savingsPercentage}% of spending`} />
              <StatCard icon="🏷️" value={`৳${savings.discount.toLocaleString()}`} label="Product Discounts" note="From sale prices" />
              <StatCard icon="🎟️" value={`৳${savings.couponSavings.toLocaleString()}`} label="Coupon Savings" note="From vouchers" />
              <StatCard icon="🚚" value={`৳${savings.deliverySaved.toLocaleString()}`} label="Delivery Saved" note="Free delivery orders" />
            </div>

            <Panel title="Savings Breakdown">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex justify-between rounded-lg bg-muted-bg p-3">
                    <span className="text-sm text-muted">Original Price</span>
                    <span className="font-bold text-text">৳{savings.originalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between rounded-lg bg-success/10 p-3">
                    <span className="text-sm text-success">Total Saved</span>
                    <span className="font-bold text-success">৳{savings.totalSaved.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between rounded-lg bg-primary/10 p-3">
                    <span className="text-sm text-primary">Orders Placed</span>
                    <span className="font-bold text-primary">{savings.orderCount}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <DonutChart
                    data={[
                      { label: "Discounts", value: savings.discount, color: "#10b981" },
                      { label: "Coupons", value: savings.couponSavings, color: "#5b5cf0" },
                      { label: "Delivery", value: savings.deliverySaved, color: "#f59e0b" },
                    ]}
                  />
                </div>
              </div>
            </Panel>
          </>
        )}

        {analytics && (
          <Panel title="Expense Analytics">
            <div className="mb-4 flex gap-2">
              {["this_month", "last_month", "6_months", "this_year"].map((r) => (
                <button key={r} onClick={() => { setRange(r); getExpenseAnalytics(r).then(setAnalytics).catch(() => {}); }} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${range === r ? "bg-primary text-white" : "bg-muted-bg text-text hover:bg-primary/10"}`}>
                  {r.replace("_", " ")}
                </button>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 text-sm font-bold text-text">Monthly Spending</h4>
                <BarChart data={analytics.monthlySpending.map((m) => ({ label: m.month, value: m.amount }))} />
              </div>
              <div>
                <h4 className="mb-2 text-sm font-bold text-text">Category Breakdown</h4>
                <div className="space-y-2">
                  {analytics.categorySpending.slice(0, 5).map((cat) => (
                    <div key={cat.category} className="flex items-center gap-3">
                      <span className="w-20 truncate text-xs text-muted">{cat.category}</span>
                      <div className="flex-1 rounded-full bg-muted-bg h-2">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${cat.percentage}%` }} />
                      </div>
                      <span className="text-xs font-bold text-text">{cat.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        )}
      </div>
    </DashboardShell>
  );
}
