"use client";

import { useEffect, useState } from "react";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import { getCustomerInsights, CustomerInsightsData } from "@/lib/api/seller-intelligence";
import { getCustomerSegments, CustomerSegmentsData } from "@/lib/api/seller-intelligence";
import { DonutChart } from "@/components/analytics/DonutChart";
import { EmptyState, ErrorState, LoadingGrid } from "@/components/dashboard/DashboardStates";

export default function SellerCustomersPage() {
  const [data, setData] = useState<CustomerInsightsData | null>(null);
  const [segments, setSegments] = useState<CustomerSegmentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.allSettled([getCustomerInsights(), getCustomerSegments()])
      .then(([insightsRes, segmentsRes]) => {
        if (insightsRes.status === "fulfilled") setData(insightsRes.value);
        if (segmentsRes.status === "fulfilled") setSegments(segmentsRes.value);
      })
      .catch(() => setError("Failed to load customer data"))
      .finally(() => setLoading(false));
  }, []);

  const donutData = segments?.hasEnoughData
    ? segments.segments.map((s) => ({ label: s.name, value: s.count }))
    : [];

  return (
    <DashboardShell
      role="Seller"
      title="Customer Insights"
      subtitle="Customer loyalty, repeat purchase rates, and buyer segments for your store."
      links={sellerDashboardLinks}
    >
      <div className="grid gap-6">
        {error && <ErrorState message={error} />}

        {/* KPI Cards */}
        <section>
          {loading ? (
            <LoadingGrid count={4} />
          ) : data?.hasEnoughData ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon="👥" label="Total Customers" value={String(data.overview.totalCustomers)} note="Unique buyers" />
              <StatCard icon="📦" label="Total Orders" value={String(data.overview.totalOrders)} note="All orders" />
              <StatCard icon="🔄" label="Repeat Rate" value={`${data.overview.repeatPurchaseRate}%`} note="Returning buyers" color="success" />
              <StatCard icon="💳" label="Avg Order Value" value={`৳${data.overview.averageOrderValue.toLocaleString()}`} note="Per order" color="accent" />
            </div>
          ) : (
            <EmptyState icon="👥" title="No customer data" description="Customer insights will appear after your first sales." />
          )}
        </section>

        {/* Segments */}
        {segments?.hasEnoughData && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Panel title="Customer Segments">
              <div className="flex flex-col items-center">
                <DonutChart data={donutData} size={190} />
                <div className="mt-4 grid w-full gap-2 text-xs">
                  {segments.segments.map((seg) => (
                    <div key={seg.name} className="flex items-center justify-between rounded-xl bg-muted-bg p-2.5">
                      <span className="font-bold text-text">{seg.name}</span>
                      <span className="font-black text-primary">{seg.count} ({seg.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            <div className="lg:col-span-2">
              <Panel title="Segment Details">
                <div className="grid gap-3">
                  {segments.segments.map((seg) => (
                    <div key={seg.name} className="rounded-2xl border border-border bg-surface p-4 text-xs">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-text">{seg.name}</h3>
                        <span className="font-black text-primary">{seg.count} customers</span>
                      </div>
                      <p className="mt-1 text-muted">{seg.description}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
