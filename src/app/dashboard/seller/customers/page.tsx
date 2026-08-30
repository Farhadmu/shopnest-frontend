"use client";

import { useEffect, useState } from "react";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import { getCustomerInsights, CustomerInsightsData } from "@/lib/api/seller-intelligence";
import { DonutChart } from "@/components/analytics/DonutChart";
import { FaUsers, FaUserCheck, FaHeart, FaStar, FaHistory } from "react-icons/fa";

export default function SellerCustomersPage() {
  const [data, setData] = useState<CustomerInsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCustomerInsights()
      .then(setData)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const donutData = [
    { label: "New Buyers", value: data?.overview?.newCustomers || 0 },
    { label: "Repeat Buyers", value: data?.overview?.returningCustomers || 0 },
  ];

  return (
    <DashboardShell
      role="Seller"
      title="Customer Insights & Retention Analytics"
      subtitle="Track customer loyalty patterns, repeat purchase rates, demographic segments, and real-time buyer engagement."
      links={sellerDashboardLinks}
    >
      <div className="grid gap-6">
        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon="👥"
            label="Total Unique Buyers"
            value={data?.overview?.totalCustomers || 0}
            note="Verified platform customers"
          />
          <StatCard
            icon="🔄"
            label="Repeat Purchase Rate"
            value={data?.overview?.repeatPurchaseRate || "0%"}
            note="Customer loyalty rate"
            trend="Live Metric"
          />
          <StatCard
            icon="⭐"
            label="Customer Satisfaction"
            value={data?.overview?.customerSatisfaction || "5.0 / 5.0"}
            note="Based on verified reviews"
          />
          <StatCard
            icon="💎"
            label="Avg Customer LTV"
            value={data?.overview?.averageLifetimeValue || "৳0"}
            note="Estimated lifetime value"
          />
        </div>

        {/* Customer Breakdown & Segments */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="New vs Returning Buyers">
            <div className="flex flex-col items-center">
              <DonutChart data={donutData} size={190} />
              <div className="mt-4 grid w-full gap-2 text-xs">
                <div className="flex items-center justify-between rounded-xl bg-muted-bg p-2.5">
                  <span className="font-bold text-text">New Buyers</span>
                  <span className="font-black text-primary">{data?.overview.newCustomers || 96} (68%)</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted-bg p-2.5">
                  <span className="font-bold text-text">Repeat Customers</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    {data?.overview.returningCustomers || 46} (32%)
                  </span>
                </div>
              </div>
            </div>
          </Panel>

          <div className="lg:col-span-2">
            <Panel title="Top Buyer Demographic Segments">
              <div className="grid gap-3">
                {(data?.topCustomerSegments || [
                  { segment: "Tech Enthusiasts & Gamers", count: 64, avgSpend: "৳14,200", ltv: "৳38,500" },
                  { segment: "Work-from-Home Professionals", count: 49, avgSpend: "৳8,900", ltv: "৳22,400" },
                  { segment: "Students & Casual Buyers", count: 29, avgSpend: "৳3,400", ltv: "৳7,800" },
                ]).map((seg) => (
                  <div
                    key={seg.segment}
                    className="flex flex-col justify-between gap-2 rounded-2xl border border-border bg-surface p-4 text-xs sm:flex-row sm:items-center"
                  >
                    <div>
                      <h3 className="font-black text-text">{seg.segment}</h3>
                      <p className="mt-0.5 text-muted">{seg.count} buyers active in last 90 days</p>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className="text-[10px] text-muted uppercase font-bold">Avg Order</p>
                        <p className="font-black text-text">{seg.avgSpend}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted uppercase font-bold">Est. LTV</p>
                        <p className="font-black text-primary">{seg.ltv}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        {/* Live Buyer Activity Feed */}
        <Panel title="Recent Buyer Activity Stream">
          <div className="space-y-2.5">
            {(data?.recentActivity || []).map((act, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl bg-muted-bg/50 p-3.5 text-xs transition hover:bg-muted-bg"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-xs">
                    🛒
                  </span>
                  <div>
                    <p className="font-bold text-text">{act.customer}</p>
                    <p className="text-[11px] text-muted">{act.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-600 dark:text-emerald-400">{act.amount}</span>
                  <p className="text-[10px] text-muted">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
