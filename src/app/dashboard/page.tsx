"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { getOrders, Order } from "@/lib/api/orders";
import { getCart } from "@/lib/api/cart";
import { getWishlist } from "@/lib/api/wishlist";
import { getUnreadCount } from "@/lib/api/notifications";
import {
  getShoppingJourney,
  ShoppingJourneyData,
  generateBudgetPlan,
  BudgetPlanResult,
  getShoppingGoals,
  ShoppingGoalData,
  createShoppingGoal,
  updateShoppingGoal,
  deleteShoppingGoal,
  getProductLifecycles,
  ProductLifecycleItem,
} from "@/lib/api/customer-intelligence";
import {
  getSecurityOverview,
  SecurityOverviewData,
  getActiveSessions,
  DeviceSessionItem,
  revokeSession,
  revokeAllOtherSessions,
  getSecurityTimeline,
  SecurityTimelineItem,
} from "@/lib/api/security-intelligence";
import { detectShoppingIntent, IntentDetectionResult } from "@/lib/api/ai-commerce";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { GaugeMeter } from "@/components/analytics/GaugeMeter";
import { ActivityTimeline } from "@/components/analytics/ActivityTimeline";
import { AiCommerceCopilot } from "@/components/ai/AiCommerceCopilot";

export default function CustomerDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "journey" | "budget" | "goals" | "lifecycle" | "security">("overview");

  // Overview Data
  const [stats, setStats] = useState({ orders: 0, cart: 0, wishlist: 0, notifications: 0, total: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  // Journey Data
  const [journeyData, setJourneyData] = useState<ShoppingJourneyData | null>(null);

  // Budget Planner State
  const [budgetInput, setBudgetInput] = useState(50000);
  const [budgetPurpose, setBudgetPurpose] = useState("gaming");
  const [budgetPlan, setBudgetPlan] = useState<BudgetPlanResult | null>(null);
  const [budgetLoading, setBudgetLoading] = useState(false);

  // Shopping Goals State
  const [goals, setGoals] = useState<ShoppingGoalData[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalBudget, setNewGoalBudget] = useState(25000);

  // Lifecycle State
  const [lifecycles, setLifecycles] = useState<ProductLifecycleItem[]>([]);

  // Security Center State
  const [securityData, setSecurityData] = useState<SecurityOverviewData | null>(null);
  const [sessions, setSessions] = useState<DeviceSessionItem[]>([]);
  const [securityTimeline, setSecurityTimeline] = useState<SecurityTimelineItem[]>([]);

  // Intent Assistant State
  const [intentQuery, setIntentQuery] = useState("");
  const [intentResult, setIntentResult] = useState<IntentDetectionResult | null>(null);
  const [intentLoading, setIntentLoading] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/login");
      return;
    }
    const userRole = (session?.user as { role?: string } | undefined)?.role;
    if (userRole === "seller") {
      router.replace("/seller/dashboard");
      return;
    }
    if (userRole === "admin") {
      router.replace("/admin/dashboard");
      return;
    }

    if (session?.user) {
      // Load core stats & sub-systems
      Promise.all([
        getOrders(),
        getCart(),
        getWishlist(),
        getUnreadCount(),
        getShoppingJourney().catch(() => null),
        getShoppingGoals().catch(() => []),
        getProductLifecycles().catch(() => []),
        getSecurityOverview().catch(() => null),
        getActiveSessions().catch(() => []),
        getSecurityTimeline().catch(() => []),
      ]).then(([orders, cart, wish, notes, journey, goalsRes, lifeRes, secRes, sessRes, timeRes]) => {
        setStats({
          orders: orders.length,
          cart: cart.items?.reduce((s, i) => s + i.quantity, 0) || 0,
          wishlist: wish.length,
          notifications: notes.count,
          total: orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0),
        });
        setRecentOrders(orders.slice(0, 4));
        if (journey) setJourneyData(journey);
        if (goalsRes) setGoals(goalsRes);
        if (lifeRes) setLifecycles(lifeRes);
        if (secRes) setSecurityData(secRes);
        if (sessRes) setSessions(sessRes);
        if (timeRes) setSecurityTimeline(timeRes);
      });
    }
  }, [isPending, session, router]);

  const handleGenerateBudget = async () => {
    setBudgetLoading(true);
    try {
      const res = await generateBudgetPlan(budgetInput, budgetPurpose);
      setBudgetPlan(res);
    } catch {
      // handled
    } finally {
      setBudgetLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    try {
      const created = await createShoppingGoal({
        title: newGoalTitle,
        category: "General Setup",
        targetBudget: Number(newGoalBudget),
        items: [
          { title: "Primary Essential", estimatedPrice: Math.round(newGoalBudget * 0.7), isCompleted: false },
          { title: "Complementary Accessory", estimatedPrice: Math.round(newGoalBudget * 0.3), isCompleted: false },
        ],
      });
      setGoals((prev) => [created, ...prev]);
      setNewGoalTitle("");
    } catch {
      // handled
    }
  };

  const handleToggleGoalItem = async (goalId: string, itemIdx: number) => {
    const target = goals.find((g) => g.id === goalId);
    if (!target) return;
    const updatedItems = target.items.map((it, idx) =>
      idx === itemIdx ? { ...it, isCompleted: !it.isCompleted } : it
    );
    try {
      const updated = await updateShoppingGoal(goalId, { items: updatedItems });
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
    } catch {
      // handled
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteShoppingGoal(goalId);
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    } catch {
      // handled
    }
  };

  const handleRevokeSession = async (sessId: string) => {
    try {
      await revokeSession(sessId);
      setSessions((prev) => prev.filter((s) => s.id !== sessId));
    } catch {
      // handled
    }
  };

  const handleRevokeAllOther = async () => {
    try {
      await revokeAllOtherSessions();
      setSessions((prev) => prev.filter((s) => s.isCurrentSession));
    } catch {
      // handled
    }
  };

  const handleDetectIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intentQuery.trim()) return;
    setIntentLoading(true);
    try {
      const res = await detectShoppingIntent(intentQuery);
      setIntentResult(res);
    } catch {
      // handled
    } finally {
      setIntentLoading(false);
    }
  };

  const links = [
    { label: "Overview", href: "#overview", icon: "📊", description: "Shopping metrics & active status." },
    { label: "Spending Analytics", href: "/customer/analytics", icon: "📈", description: "Spending charts, offers & searches." },
    { label: "Shopping Journey", href: "#journey", icon: "🚀", description: "Personalized exploration timeline." },
    { label: "Budget Planner", href: "#budget", icon: "💰", description: "Allocate optimal cart combinations." },
    { label: "Shopping Goals", href: "#goals", icon: "🎯", description: "Track target milestones." },
    { label: "Product Lifecycle", href: "#lifecycle", icon: "🛡️", description: "Warranty & maintenance tracker." },
    { label: "Security Center", href: "/customer/security", icon: "🔐", description: "Active sessions & security score." },
  ];

  return (
    <DashboardShell
      role="Customer"
      title="Commerce Command Center"
      subtitle="Discover personalized shopping journeys, plan smart budgets, track product lifecycles and protect your account with AI intelligence."
      links={links}
    >
      {/* Interactive Navigation Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {[
          { id: "overview", label: "📊 Overview", count: null },
          { id: "journey", label: "🚀 Shopping Journey", count: journeyData?.journey?.journeyProgress != null ? `${journeyData.journey.journeyProgress}%` : null },
          { id: "budget", label: "💰 Budget Planner", count: null },
          { id: "goals", label: "🎯 Goals", count: goals.length || null },
          { id: "lifecycle", label: "🛡️ Lifecycles", count: lifecycles.length || null },
          { id: "security", label: "🔐 Security Center", count: securityData?.securityScore != null ? `${securityData.securityScore}/100` : null },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === tab.id
                ? "bg-primary text-white shadow-md shadow-primary/25"
                : "bg-surface text-muted hover:bg-muted-bg hover:text-text border border-border"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count && (
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-black ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon="📦" label="Orders Placed" value={String(stats.orders)} note="Lifetime fulfilled purchases" />
            <StatCard icon="🛒" label="Cart Items" value={String(stats.cart)} note="Ready for immediate checkout" />
            <StatCard icon="♡" label="Wishlist" value={String(stats.wishlist)} note="Saved favorite products" />
            <StatCard icon="🔔" label="Notifications" value={String(stats.notifications)} note="Order & price drop alerts" />
          </div>

          {/* AI Shopping Intent Extractor */}
          <Panel title="✨ AI Natural Language Shopping Assistant">
            <form onSubmit={handleDetectIntent} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={intentQuery}
                onChange={(e) => setIntentQuery(e.target.value)}
                placeholder="e.g. 'I need something for my brother's birthday under 5000 tk'"
                className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={intentLoading}
                className="rounded-xl bg-primary px-6 py-3 text-xs font-bold text-white transition hover:bg-primary-hover disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {intentLoading ? "Analyzing Intent..." : "Find Best Matches"}
              </button>
            </form>

            {intentResult && (
              <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-primary">
                    🎯 Intent: {intentResult.extractedIntent.occasion} for {intentResult.extractedIntent.recipient}
                  </span>
                  <span className="rounded-lg bg-surface px-2.5 py-1 text-[11px] font-bold text-text shadow-xs">
                    Target: {intentResult.extractedIntent.detectedBudget}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">{intentResult.recommendationSummary}</p>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {intentResult.matchingProducts.slice(0, 3).map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.id}`}
                      className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition hover:border-primary/50"
                    >
                      <div className="h-12 w-12 shrink-0 rounded-lg bg-muted-bg overflow-hidden flex items-center justify-center font-bold text-muted text-xs">
                        {p.images?.[0] ? <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" /> : "🛍️"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-text">{p.title}</p>
                        <p className="text-xs font-extrabold text-primary">৳{(p.discountPrice || p.price).toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </Panel>

          {/* Quick Snapshot Grid */}
          <div className="grid gap-5 lg:grid-cols-2">
            <Panel title="Recent Purchases">
              {recentOrders.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted">No orders placed yet.</div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                      <div>
                        <p className="text-xs font-bold text-text">Order #{o.id.slice(-6)}</p>
                        <p className="text-[11px] text-muted">{o.items.length} items • ৳{o.totalAmount.toLocaleString()}</p>
                      </div>
                      <span className="rounded-lg bg-success/15 px-2.5 py-1 text-[11px] font-extrabold text-success uppercase">
                        {o.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Security & Protection Status">
              <div className="flex items-center justify-between p-2">
                <GaugeMeter score={securityData?.securityScore || 92} title="Account Shield" subtitle="Active Fraud & ATO Protection" size={150} type="security" />
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-success">✓</span>
                    <span className="font-semibold text-text">Strong HMAC Auth</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-success">✓</span>
                    <span className="font-semibold text-text">Session Guard Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-success">✓</span>
                    <span className="font-semibold text-text">Zero Breach Signals</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("security")}
                    className="mt-2 text-xs font-bold text-primary hover:underline block"
                  >
                    Open Security Center →
                  </button>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* TAB 2: SMART SHOPPING JOURNEY */}
      {activeTab === "journey" && (
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
                  <p className="text-2xl font-black text-primary">{journeyData?.journey?.journeyProgress ?? 45}%</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                  style={{ width: `${journeyData?.journey?.journeyProgress ?? 45}%` }}
                />
              </div>
            </div>

            {/* Journey Stages Roadmap */}
            <div className="grid gap-3 sm:grid-cols-5 text-center text-xs font-bold">
              {[
                { stage: "Discovery", desc: "Exploring Categories", passed: true },
                { stage: "Evaluation", desc: "Comparing Specs", passed: (journeyData?.journey?.journeyProgress ?? 0) >= 40 },
                { stage: "Intent", desc: "Saved to Wishlist", passed: (journeyData?.journey?.journeyProgress ?? 0) >= 60 },
                { stage: "Ready to Buy", desc: "Added to Cart", passed: (journeyData?.journey?.journeyProgress ?? 0) >= 80 },
                { stage: "Completed", desc: "Delivered Order", passed: (journeyData?.journey?.journeyProgress ?? 0) === 100 },
              ].map((s, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border p-3 ${
                    s.passed ? "border-primary bg-primary/5 text-primary" : "border-border bg-muted-bg/40 text-muted"
                  }`}
                >
                  <span className="text-base">{s.passed ? "✓" : "○"}</span>
                  <p className="mt-1 font-black text-text">{s.stage}</p>
                  <p className="text-[10px] font-medium text-muted">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Recommended Next Items */}
            <div className="mt-6">
              <h4 className="font-extrabold text-text text-sm mb-3">Recommended Next Steps for Your Journey</h4>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {(journeyData?.recommendedItems || []).map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.id}`}
                    className="group rounded-2xl border border-border bg-surface p-3.5 shadow-sm transition hover:border-primary/50 hover:shadow-md"
                  >
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
      )}

      {/* TAB 3: SMART BUDGET PLANNER */}
      {activeTab === "budget" && (
        <div className="space-y-6">
          <Panel title="💰 Smart AI Budget Planner">
            <div className="rounded-2xl border border-border bg-muted-bg/30 p-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">Total Shopping Budget (BDT)</label>
                  <input
                    type="number"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-text font-bold focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text mb-1">Setup Purpose / Persona</label>
                  <select
                    value={budgetPurpose}
                    onChange={(e) => setBudgetPurpose(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-text font-bold focus:border-primary focus:outline-none"
                  >
                    <option value="gaming">🎮 Gaming & Streaming Setup</option>
                    <option value="work_office">💼 Work & Office Productivity</option>
                    <option value="photography">📷 Photography & Creator Gear</option>
                    <option value="student">🎓 Student Essentials</option>
                    <option value="general">✨ General Tech Blueprint</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleGenerateBudget}
                    disabled={budgetLoading}
                    className="w-full rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-primary-hover disabled:opacity-50 cursor-pointer"
                  >
                    {budgetLoading ? "Optimizing Plan..." : "⚡ Generate Optimized Blueprint"}
                  </button>
                </div>
              </div>
            </div>

            {budgetPlan && (
              <div className="mt-6 space-y-4">
                {/* Summary Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-primary/10 border border-primary/30 p-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Budget Optimization</span>
                    <p className="text-xs font-bold text-text mt-0.5">{budgetPlan.planSummary}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-muted">Allocated Spend</p>
                      <p className="text-base font-black text-text">৳{budgetPlan.totalPlannedSpend.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted">Remaining Buffer</p>
                      <p className="text-base font-black text-success">৳{budgetPlan.remainingBudget.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="grid gap-3">
                  {budgetPlan.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted-bg text-base font-black text-primary">
                          {idx + 1}
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-primary">{item.role}</span>
                          <h4 className="text-xs font-bold text-text">{item.selectedProduct?.title || "Curated Match"}</h4>
                          <p className="text-[11px] text-muted">Allocated: ৳{item.allocatedBudget.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {item.selectedProduct && (
                          <Link
                            href={`/products/${item.selectedProduct.id}`}
                            className="rounded-xl border border-border bg-muted-bg px-3 py-1.5 text-xs font-bold text-text hover:border-primary"
                          >
                            View Details →
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Panel>
        </div>
      )}

      {/* TAB 4: PERSONAL SHOPPING GOALS */}
      {activeTab === "goals" && (
        <div className="space-y-6">
          <Panel title="🎯 Personal Shopping Goals">
            {/* Create Goal Form */}
            <form onSubmit={handleCreateGoal} className="mb-6 rounded-2xl border border-border bg-muted-bg/30 p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  type="text"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="e.g. Build Home Audio Setup"
                  className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
                <input
                  type="number"
                  value={newGoalBudget}
                  onChange={(e) => setNewGoalBudget(Number(e.target.value))}
                  placeholder="Target Budget"
                  className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-primary-hover cursor-pointer"
                >
                  + Add Shopping Goal
                </button>
              </div>
            </form>

            {/* Goals List */}
            <div className="grid gap-4 sm:grid-cols-2">
              {goals.map((g) => (
                <div key={g.id} className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-primary">{g.category}</span>
                      <h4 className="text-base font-black text-text">{g.title}</h4>
                      <p className="text-xs text-muted">Budget: ৳{g.targetBudget.toLocaleString()}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(g.id)}
                      className="text-muted hover:text-error text-xs p-1 cursor-pointer"
                      title="Remove goal"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-muted">Goal Progress</span>
                      <span className="text-primary">{g.progressPercentage}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-success transition-all duration-500"
                        style={{ width: `${g.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    {g.items.map((it, iIdx) => (
                      <div
                        key={iIdx}
                        onClick={() => handleToggleGoalItem(g.id, iIdx)}
                        className="flex items-center justify-between text-xs rounded-lg p-2 hover:bg-muted-bg transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className={it.isCompleted ? "text-success font-black" : "text-muted"}>
                            {it.isCompleted ? "✓" : "○"}
                          </span>
                          <span className={it.isCompleted ? "line-through text-muted" : "font-semibold text-text"}>
                            {it.title}
                          </span>
                        </div>
                        <span className="font-bold text-muted">৳{it.estimatedPrice.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 5: PRODUCT LIFECYCLE */}
      {activeTab === "lifecycle" && (
        <div className="space-y-6">
          <Panel title="🛡️ Product Lifecycle & Maintenance Tracker">
            <div className="grid gap-4 sm:grid-cols-2">
              {lifecycles.map((lc) => (
                <div key={lc.id} className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-primary">{lc.category}</span>
                      <h4 className="text-base font-black text-text">{lc.productTitle}</h4>
                      <p className="text-xs text-muted">Purchased: {new Date(lc.purchaseDate).toLocaleDateString()}</p>
                    </div>
                    <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success capitalize">
                      {lc.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Lifespan Usage */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-muted">Estimated Lifespan ({lc.estimatedLifespanMonths} Mo.)</span>
                      <span className="text-text">{lc.usagePercentage}% Used</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${lc.usagePercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Warranty & Reminders */}
                  <div className="rounded-xl bg-muted-bg p-3 text-xs space-y-2">
                    <p className="font-bold text-text">
                      🛡️ Warranty Expiry: <span className="text-primary">{new Date(lc.warrantyExpiryDate).toLocaleDateString()}</span>
                    </p>
                    <div className="space-y-1 pt-1 border-t border-border/50">
                      {lc.maintenanceReminders.map((r, rIdx) => (
                        <div key={rIdx} className="flex items-center justify-between text-[11px]">
                          <span className="text-muted">• {r.title}</span>
                          <span className="font-bold text-text">Due: {new Date(r.dueDate).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 6: SECURITY CENTER */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_1.5fr]">
            <Panel title="Account Security Score">
              <GaugeMeter
                score={securityData?.securityScore || 92}
                title="Protection Rating"
                subtitle={securityData?.statusLevel || "Optimal Shield"}
                size={180}
                type="security"
              />

              <div className="mt-4 space-y-2">
                {(securityData?.checklist || []).map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-xl border border-border p-3 text-xs">
                    <div>
                      <p className="font-bold text-text">{item.title}</p>
                      <p className="text-[10px] text-muted">{item.note}</p>
                    </div>
                    <span className="rounded-md bg-success/15 px-2 py-0.5 font-extrabold text-success">
                      +{item.score}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            <div className="space-y-5">
              {/* Active Sessions */}
              <Panel
                title="Active Devices & Sessions"
                action={
                  <button
                    type="button"
                    onClick={handleRevokeAllOther}
                    className="text-xs font-bold text-error hover:underline cursor-pointer"
                  >
                    Revoke All Other Sessions
                  </button>
                }
              >
                <div className="space-y-3">
                  {sessions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-xl border border-border p-3.5 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-text">{s.deviceName}</span>
                          {s.isCurrentSession && (
                            <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                              This Device
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted mt-0.5">
                          {s.locationCity} • IP: {s.ipAddress} • {new Date(s.lastActiveAt).toLocaleTimeString()}
                        </p>
                      </div>

                      {!s.isCurrentSession && (
                        <button
                          type="button"
                          onClick={() => handleRevokeSession(s.id)}
                          className="rounded-lg border border-error/40 px-3 py-1 text-[11px] font-bold text-error hover:bg-error/10 cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Security Activity Timeline */}
              <Panel title="Security Audit Timeline">
                <ActivityTimeline items={securityTimeline} />
              </Panel>
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Customer Copilot */}
      <AiCommerceCopilot role="customer" />
    </DashboardShell>
  );
}
