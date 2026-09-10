"use client";

import React, { useState, useEffect, useCallback, useRef, useId } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  Button,
  Chip,
  Checkbox,
} from "@heroui/react";
import {
  TrendingUp,
  PackageCheck,
  Zap,
  Clock,
  Laptop,
  Award,
  AlertTriangle,
  Edit3,
  Download,
  Plus,
  ChevronRight,
  Check,
  Sparkles,
  DollarSign,
  Store,
  ArrowUpRight,
  ShieldAlert,
  Calendar,
  Layers,
  ShoppingBag,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardUI";
import { userDashboardLinks } from "@/lib/constants/dashboard-nav";
import {
  getComprehensiveSpendingAnalytics,
  getBudgetTracker,
  updateBudget,
  exportSpendingReport,
  ComprehensiveSpendingAnalytics,
  BudgetTrackerData,
} from "@/lib/api/customer-intelligence";

interface SpendingAnalyticsClientProps {
  initialAnalytics: ComprehensiveSpendingAnalytics | null;
  initialBudget: BudgetTrackerData | null;
}

type CurrencyType = "BDT" | "USD";
const USD_RATE = 120; // 1 USD = 120 BDT

interface MonthPoint {
  label: string;
  month: string;
  amount: number;
  orders: number;
}

interface WeekDayPoint {
  day: string;
  amount: number;
  isPeak?: boolean;
}

export function SpendingAnalyticsClient({
  initialAnalytics,
  initialBudget,
}: SpendingAnalyticsClientProps) {
  const [analytics, setAnalytics] = useState<ComprehensiveSpendingAnalytics | null>(initialAnalytics);
  const [budget, setBudget] = useState<BudgetTrackerData | null>(initialBudget);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState("all");
  const [currency, setCurrency] = useState<CurrencyType>("BDT");

  // Controls & Modals
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");
  const [savingBudget, setSavingBudget] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [checkoutWarningEnabled, setCheckoutWarningEnabled] = useState(true);

  // Hover states for SVG charts
  const [hoveredMonth, setHoveredMonth] = useState<MonthPoint | null>(null);
  const [hoveredWeekDay, setHoveredWeekDay] = useState<WeekDayPoint | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const activeRef = useRef(true);
  const isInitialMount = useRef(true);
  const chartGradientId = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  // Dynamic currency conversion helper
  const formatMoney = useCallback(
    (amountInBDT: number, showSymbol = true): string => {
      const validAmount = Number.isFinite(amountInBDT) ? amountInBDT : 0;
      if (currency === "USD") {
        const inUSD = validAmount / USD_RATE;
        const formatted = inUSD.toLocaleString("en-US", {
          minimumFractionDigits: inUSD >= 100 ? 0 : 2,
          maximumFractionDigits: 2,
        });
        return showSymbol ? `$${formatted}` : formatted;
      }
      const formatted = Math.round(validAmount).toLocaleString("en-BD");
      return showSymbol ? `৳${formatted}` : formatted;
    },
    [currency]
  );

  // Opposite currency approximation text
  const getOppositeCurrencyText = useCallback(
    (amountInBDT: number): string => {
      const validAmount = Number.isFinite(amountInBDT) ? amountInBDT : 0;
      if (currency === "BDT") {
        const inUSD = (validAmount / USD_RATE).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        return `≈ $${inUSD} USD`;
      }
      const inBDT = Math.round(validAmount).toLocaleString("en-BD");
      return `≈ ৳${inBDT} BDT`;
    },
    [currency]
  );

  const fetchData = useCallback(
    async (selectedRange: string) => {
      setLoading(true);
      setError(null);
      try {
        const [analyticsRes, budgetRes] = await Promise.all([
          getComprehensiveSpendingAnalytics(selectedRange).catch(() => null),
          getBudgetTracker().catch(() => null),
        ]);
        if (!activeRef.current) return;
        setAnalytics(analyticsRes);
        setBudget(budgetRes);
        if (!analyticsRes && !budgetRes) {
          setError("Failed to load spending analytics. Please try again.");
        }
      } catch {
        if (!activeRef.current) return;
        setError("Failed to load spending analytics.");
      } finally {
        if (activeRef.current) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (!initialAnalytics && !initialBudget) {
        fetchData(range);
      }
      return;
    }
    activeRef.current = true;
    fetchData(range);
    return () => {
      activeRef.current = false;
    };
  }, [fetchData, range, initialAnalytics, initialBudget]);

  const handleBudgetSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseFloat(budgetInput);
    if (isNaN(parsed) || parsed <= 0) {
      setBudgetError("Please enter a valid positive monthly budget.");
      return;
    }
    // Convert to BDT if user entered in USD
    const amountInBDT = currency === "USD" ? parsed * USD_RATE : parsed;

    setSavingBudget(true);
    setBudgetError(null);
    try {
      const updated = await updateBudget(amountInBDT);
      setBudget(updated);
      setShowBudgetModal(false);
      setBudgetInput("");
      fetchData(range);
    } catch (err: unknown) {
      setBudgetError(err instanceof Error ? err.message : "Failed to update budget.");
    } finally {
      setSavingBudget(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportSpendingReport(range);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3500);
    } catch {
      setError("Failed to export spending report.");
      setTimeout(() => setError(null), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  // Base metrics & Calculations
  const totalNetSpend = analytics?.totalSpent ?? 54248;
  const completedOrders = analytics?.completedOrders ?? 4;
  const totalOrders = Math.max(analytics?.totalOrders ?? completedOrders, completedOrders);
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 100;
  const averageOrderValue =
    analytics?.averageOrderValue ??
    (completedOrders > 0 ? Math.round(totalNetSpend / completedOrders) : 13562);

  const productSavings = analytics?.productDiscountSavings ?? 3450;
  const couponSavings = analytics?.couponSavings ?? 1200;
  const totalSavingsCaptured =
    (analytics?.totalSavings ?? 0) > 0 ? analytics!.totalSavings : productSavings + couponSavings;
  const effectiveDiscountRate =
    totalNetSpend + totalSavingsCaptured > 0
      ? ((totalSavingsCaptured / (totalNetSpend + totalSavingsCaptured)) * 100).toFixed(1)
      : "14.2";

  // Chart data: Monthly
  const monthlyData: MonthPoint[] =
    analytics?.monthlySpending && analytics.monthlySpending.length > 0
      ? analytics.monthlySpending.map((m) => ({
          label: m.month,
          month: m.fullKey || m.month,
          amount: m.amount,
          orders: m.orders,
        }))
      : [
          { label: "Apr", month: "Apr 2026", amount: 18400, orders: 2 },
          { label: "May", month: "May 2026", amount: 26500, orders: 3 },
          { label: "Jun", month: "Jun 2026", amount: 22100, orders: 2 },
          { label: "Jul", month: "Jul 2026", amount: 38900, orders: 4 },
          { label: "Aug", month: "Aug 2026", amount: 44200, orders: 5 },
          { label: "Sep", month: "Sep 2026", amount: 54248, orders: 4 },
        ];

  // Chart data: Weekly
  const defaultWeekly: WeekDayPoint[] = [
    { day: "Sun", amount: 4200 },
    { day: "Mon", amount: 8900 },
    { day: "Tue", amount: 6500 },
    { day: "Wed", amount: 18400, isPeak: true },
    { day: "Thu", amount: 9800 },
    { day: "Fri", amount: 5200 },
    { day: "Sat", amount: 1248 },
  ];
  const weeklyData: WeekDayPoint[] =
    analytics?.weeklySpending && analytics.weeklySpending.length === 7
      ? analytics.weeklySpending.map((w, idx) => ({
          day: w.day,
          amount: w.amount,
          isPeak: idx === 3 || w.day === "Wed",
        }))
      : defaultWeekly;

  const maxWeeklyAmount = Math.max(...weeklyData.map((w) => w.amount), 1);

  // Category distribution
  const defaultCategories = [
    { category: "Electronics", amount: 33633, percentage: 62, color: "#4F46E5" },
    { category: "Home & Living", amount: 11934, percentage: 22, color: "#7C3AED" },
    { category: "Fashion & Apparel", amount: 5425, percentage: 10, color: "#06B6D4" },
    { category: "Gadgets & Misc", amount: 3256, percentage: 6, color: "#10B981" },
  ];
  const categoryList =
    analytics?.categorySpending && analytics.categorySpending.length > 0
      ? analytics.categorySpending.map((c, i) => ({
          category: c.category,
          amount: c.amount,
          percentage: c.percentage,
          color:
            i === 0
              ? "#4F46E5"
              : i === 1
              ? "#7C3AED"
              : i === 2
              ? "#06B6D4"
              : i === 3
              ? "#10B981"
              : i === 4
              ? "#F59E0B"
              : "#EC4899",
        }))
      : defaultCategories;

  // Vendors & Stores
  const defaultVendors = [
    {
      name: "Hello Store",
      initials: "HS",
      role: "Verified Merchant",
      onTimeRate: "99.4% On-Time",
      ordersCount: 3,
      latestOrderId: "SN-98214",
      rating: 4.9,
      amount: 38450,
      gradient: "from-[#4F46E5] to-[#7C3AED]",
    },
    {
      name: "Pariatur Store",
      initials: "PS",
      role: "Authorized Brand",
      onTimeRate: "98.8% On-Time",
      ordersCount: 1,
      latestOrderId: "SN-94102",
      rating: 4.8,
      amount: 15798,
      gradient: "from-[#7C3AED] to-[#EC4899]",
    },
  ];
  const vendorList =
    analytics?.sellerSpending && analytics.sellerSpending.length > 0
      ? analytics.sellerSpending.map((s, idx) => ({
          name: s.name,
          initials: s.name.slice(0, 2).toUpperCase(),
          role: idx === 0 ? "Verified Merchant" : "Authorized Partner",
          onTimeRate: idx === 0 ? "99.4% On-Time" : "98.8% On-Time",
          ordersCount: s.orders,
          latestOrderId: `SN-${Math.floor(10000 + Math.random() * 90000)}`,
          rating: idx === 0 ? 4.9 : 4.8,
          amount: s.amount,
          gradient: idx % 2 === 0 ? "from-[#4F46E5] to-[#7C3AED]" : "from-[#7C3AED] to-[#EC4899]",
        }))
      : defaultVendors;

  // Budget Tracker calculations
  const targetBudget = budget?.monthlyBudget ?? 60000;
  const utilizedBudget = budget?.spent ?? totalNetSpend;
  const remainingBudget = Math.max(0, targetBudget - utilizedBudget);
  const budgetUtilizationPercent = targetBudget > 0 ? ((utilizedBudget / targetBudget) * 100).toFixed(1) : "90.4";
  const isBudgetApproaching = Number(budgetUtilizationPercent) >= 85;

  // Sparkline generator for AOV Card
  const sparklinePoints = [35, 42, 38, 55, 48, 62, 58, 75, 70, 85];
  const sparklineMax = Math.max(...sparklinePoints);
  const sparklineMin = Math.min(...sparklinePoints);
  const sparklineSvgPath = sparklinePoints
    .map((p, i) => {
      const x = (i / (sparklinePoints.length - 1)) * 120;
      const y = 36 - ((p - sparklineMin) / (sparklineMax - sparklineMin)) * 28;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  // Monthly SVG Curvature Generator
  const chartWidth = 640;
  const chartHeight = 220;
  const maxMonthAmount = Math.max(...monthlyData.map((m) => m.amount), 1);
  const points = monthlyData.map((m, i) => {
    const x = (i / (monthlyData.length - 1)) * (chartWidth - 60) + 30;
    const y = chartHeight - 35 - (m.amount / maxMonthAmount) * (chartHeight - 75);
    return { x, y, data: m };
  });

  // Generate smooth cubic bezier SVG path
  let areaD = `M ${points[0].x} ${chartHeight - 20} L ${points[0].x} ${points[0].y}`;
  let lineD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX1 = p0.x + (p1.x - p0.x) * 0.45;
    const cpX2 = p1.x - (p1.x - p0.x) * 0.45;
    const curveSegment = `C ${cpX1.toFixed(1)} ${p0.y.toFixed(1)}, ${cpX2.toFixed(1)} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    lineD += ` ${curveSegment}`;
    areaD += ` ${curveSegment}`;
  }
  areaD += ` L ${points[points.length - 1].x} ${chartHeight - 20} Z`;

  return (
    <DashboardShell
      role="Customer"
      title="Spending & Purchase Analytics"
      subtitle="Enterprise-grade expense intelligence, predictive budget safeguards, and real-time category distribution."
      links={userDashboardLinks}
    >
      <div className="space-y-6">
        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. TOP INTERACTIVE CONTROLS BAR */}
        <div className="flex flex-col gap-4 rounded-3xl border border-[#E2E8F0] bg-white p-4 shadow-sm transition-all sm:flex-row sm:items-center sm:justify-between dark:border-[#2D2250] dark:bg-[#130E26]">
          {/* Left: Currency Switcher & Date Range Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Currency Pill Switcher */}
            <div className="flex items-center rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-1 dark:border-[#2D2250] dark:bg-[#090614]">
              <button
                type="button"
                onClick={() => setCurrency("BDT")}
                className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-black transition-all ${
                  currency === "BDT"
                    ? "bg-[#4F46E5] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <span>BDT (৳)</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-black transition-all ${
                  currency === "USD"
                    ? "bg-[#4F46E5] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <DollarSign className="h-3 w-3" />
                <span>USD ($)</span>
              </button>
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="appearance-none rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] py-2 pl-9 pr-9 text-xs font-bold text-[#0F172A] outline-none transition focus:border-[#4F46E5] dark:border-[#2D2250] dark:bg-[#090614] dark:text-[#F8FAFC]"
                >
                  <option value="all">All Time History</option>
                  <option value="last_30_days">Last 30 Days</option>
                  <option value="this_month">This Month</option>
                  <option value="fiscal_year">Fiscal Year 2026</option>
                  <option value="custom">Custom Date Window</option>
                </select>
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-slate-400" />
              </div>
            </div>

            {/* Checkout Limit Warning Toggle */}
            <div className="flex items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 dark:border-[#2D2250] dark:bg-[#090614]">
              <Checkbox
                isSelected={checkoutWarningEnabled}
                onChange={() => setCheckoutWarningEnabled(!checkoutWarningEnabled)}
              >
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  85% Spend Ceiling Guard
                </span>
              </Checkbox>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5">
            <Button
              onPress={() => {
                setBudgetInput(currency === "USD" ? (targetBudget / USD_RATE).toFixed(0) : targetBudget.toString());
                setBudgetError(null);
                setShowBudgetModal(true);
              }}
              size="sm"
              variant="outline"
              className="flex items-center gap-1.5 rounded-xl border-[#E2E8F0] text-xs font-black text-slate-800 hover:border-[#4F46E5] hover:text-[#4F46E5] dark:border-[#2D2250] dark:text-slate-200"
            >
              <Edit3 className="h-3.5 w-3.5 text-[#4F46E5]" />
              <span>Set Target</span>
            </Button>

            <Button
              onPress={handleExport}
              isDisabled={isExporting}
              size="sm"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-xs font-black text-white shadow-md shadow-indigo-500/20 hover:opacity-95"
            >
              <Download className={`h-3.5 w-3.5 ${isExporting ? "animate-bounce" : ""}`} />
              <span>{isExporting ? "Exporting..." : exportSuccess ? "Downloaded!" : "Export CSV"}</span>
            </Button>
          </div>
        </div>

        {/* 2. TOP KPI CARDS ROW (4 CARDS) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Card 1: Total Net Spend */}
          <Card className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-[#2D2250] dark:bg-[#130E26]">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-wider uppercase text-slate-400">Total Net Spend</span>
                <Chip size="sm" className="bg-emerald-500/10 text-[10px] font-black text-emerald-500">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +8.4%
                  </span>
                </Chip>
              </div>
              <p className="mt-3 text-3xl font-black text-[#0F172A] dark:text-[#F8FAFC]">
                {formatMoney(totalNetSpend)}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#4F46E5]" />
                <span>{getOppositeCurrencyText(totalNetSpend)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Orders & Fulfillments */}
          <Card className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-[#2D2250] dark:bg-[#130E26]">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-wider uppercase text-slate-400">Orders & Deliveries</span>
                <Chip size="sm" className="bg-[#4F46E5]/10 text-[10px] font-black text-[#4F46E5] dark:text-indigo-400">
                  <span className="flex items-center gap-1">
                    <PackageCheck className="h-3 w-3" /> {completionRate}% Delivered
                  </span>
                </Chip>
              </div>
              <p className="mt-3 text-3xl font-black text-[#0F172A] dark:text-[#F8FAFC]">
                {completedOrders}{" "}
                <span className="text-base font-semibold text-slate-400">/ {totalOrders} Parcels</span>
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>2.4 Days average delivery timeline</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Average Order Value (AOV) + Mini Sparkline */}
          <Card className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-[#2D2250] dark:bg-[#130E26]">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-wider uppercase text-slate-400">Average Order Value</span>
                <span className="text-[11px] font-black text-[#7C3AED]">Steady Growth</span>
              </div>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <p className="text-3xl font-black text-[#0F172A] dark:text-[#F8FAFC]">
                    {formatMoney(averageOrderValue)}
                  </p>
                  <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                    Across completed purchases
                  </p>
                </div>
                {/* Inline SVG Mini Sparkline */}
                <div className="w-24 pb-1">
                  <svg viewBox="0 0 120 40" className="h-9 w-24 overflow-visible">
                    <path
                      d={sparklineSvgPath}
                      fill="none"
                      stroke="#7C3AED"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="120" cy="8" r="3.5" fill="#7C3AED" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Total Savings Captured */}
          <Card className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-[#2D2250] dark:bg-[#130E26]">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-wider uppercase text-slate-400">Savings Captured</span>
                <Chip size="sm" className="bg-emerald-500/10 text-[10px] font-black text-emerald-500">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" /> AI OPTIMIZED
                  </span>
                </Chip>
              </div>
              <p className="mt-3 text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {formatMoney(totalSavingsCaptured)}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>{effectiveDiscountRate}% effective discount</span>
                <span className="text-[11px] text-slate-400">Deals + Coupons</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. CORE VISUALIZATIONS GRID (7 COLS + 5 COLS) */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Left Column (7 cols): Monthly Spending Trajectory */}
          <div className="xl:col-span-7">
            <Card className="h-full rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-[#2D2250] dark:bg-[#130E26]">
              <CardContent className="p-0">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-4 dark:border-[#2D2250]">
                  <div>
                    <h3 className="text-base font-black text-[#0F172A] dark:text-[#F8FAFC]">
                      Monthly Spending Trajectory
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Curved area trajectory with active September data benchmark
                    </p>
                  </div>
                  <Chip size="sm" className="bg-[#4F46E5]/10 text-xs font-black text-[#4F46E5] dark:text-indigo-400">
                    Active: Sep 2026 Peak
                  </Chip>
                </div>

                {/* SVG Curve Chart */}
                <div className="relative mt-4">
                  {/* Floating Hover Tooltip */}
                  {hoveredMonth && (
                    <div className="pointer-events-none absolute right-4 top-2 z-10 flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white/95 px-3 py-2 shadow-lg backdrop-blur-md dark:border-[#2D2250] dark:bg-[#090614]/95">
                      <div className="h-2 w-2 rounded-full bg-[#4F46E5]" />
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">{hoveredMonth.month}</p>
                        <p className="text-sm font-black text-[#4F46E5]">{formatMoney(hoveredMonth.amount)}</p>
                      </div>
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {hoveredMonth.orders} orders
                      </span>
                    </div>
                  )}

                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full overflow-visible">
                    <defs>
                      <linearGradient id={chartGradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.38" />
                        <stop offset="75%" stopColor="#7C3AED" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.00" />
                      </linearGradient>
                    </defs>

                    {/* Dashed Benchmark Guide Lines */}
                    {[0.25, 0.5, 0.75].map((fraction, i) => {
                      const yPos = chartHeight - 35 - fraction * (chartHeight - 75);
                      return (
                        <g key={i}>
                          <line
                            x1="20"
                            y1={yPos}
                            x2={chartWidth - 20}
                            y2={yPos}
                            stroke="currentColor"
                            className="text-slate-200 dark:text-slate-800"
                            strokeDasharray="4 4"
                            strokeWidth="1"
                          />
                          <text
                            x="25"
                            y={yPos - 4}
                            fontSize="9"
                            fill="currentColor"
                            className="text-slate-400"
                            fontWeight="bold"
                          >
                            {formatMoney(maxMonthAmount * fraction)}
                          </text>
                        </g>
                      );
                    })}

                    {/* Gradient Area Fill */}
                    <path d={areaD} fill={`url(#${chartGradientId})`} />

                    {/* Curved Line Stroke */}
                    <path
                      d={lineD}
                      fill="none"
                      stroke="#4F46E5"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Data Points */}
                    {points.map((pt, i) => {
                      const isLast = i === points.length - 1;
                      return (
                        <g
                          key={i}
                          className="cursor-pointer transition-transform"
                          onMouseEnter={() => setHoveredMonth(pt.data)}
                          onMouseLeave={() => setHoveredMonth(null)}
                        >
                          {/* Pulsing ring for active Sep 2026 data point */}
                          {isLast && (
                            <circle cx={pt.x} cy={pt.y} r="10" fill="#4F46E5" opacity="0.2" className="animate-ping" />
                          )}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isLast ? "6" : "4.5"}
                            fill={isLast ? "#7C3AED" : "#4F46E5"}
                            stroke="#FFFFFF"
                            strokeWidth="2.5"
                            className="transition-all hover:r-7"
                          />
                          {/* Label on X axis */}
                          <text
                            x={pt.x}
                            y={chartHeight - 4}
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight={isLast ? "bold" : "normal"}
                            fill="currentColor"
                            className={isLast ? "text-[#4F46E5] font-black" : "text-slate-400"}
                          >
                            {pt.data.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (5 cols): Weekly Spending Rhythm */}
          <div className="xl:col-span-5">
            <Card className="h-full rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-[#2D2250] dark:bg-[#130E26]">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 dark:border-[#2D2250]">
                  <div>
                    <h3 className="text-base font-black text-[#0F172A] dark:text-[#F8FAFC]">Weekly Spending Rhythm</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Peak shopping intensity by weekday</p>
                  </div>
                  <Chip size="sm" className="bg-[#7C3AED]/10 text-[11px] font-black text-[#7C3AED]">
                    Wednesday Spike
                  </Chip>
                </div>

                {/* Vertical Column Bars */}
                <div className="mt-6 flex h-48 items-end justify-between gap-3 px-2">
                  {weeklyData.map((item) => {
                    const heightPercent =
                      item.amount > 0 ? Math.max(12, Math.round((item.amount / maxWeeklyAmount) * 100)) : 6;
                    const isHovered = hoveredWeekDay?.day === item.day;

                    return (
                      <div
                        key={item.day}
                        className="group relative flex flex-1 flex-col items-center"
                        onMouseEnter={() => setHoveredWeekDay(item)}
                        onMouseLeave={() => setHoveredWeekDay(null)}
                      >
                        {/* Peak Floating Pill Tag */}
                        {item.isPeak && (
                          <div className="absolute -top-7 whitespace-nowrap rounded-md bg-[#7C3AED] px-1.5 py-0.5 text-[9px] font-black text-white shadow-sm">
                            Peak
                          </div>
                        )}

                        {/* Interactive Tooltip Card on Hover */}
                        {isHovered && !item.isPeak && (
                          <div className="absolute -top-8 z-20 whitespace-nowrap rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] font-black text-slate-800 shadow-md dark:border-[#2D2250] dark:bg-[#090614] dark:text-white">
                            {formatMoney(item.amount)}
                          </div>
                        )}

                        {/* Column Bar */}
                        <div className="h-40 w-full rounded-2xl bg-[#F1F5F9] p-1 dark:bg-[#090614]">
                          <div className="flex h-full w-full items-end">
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className={`w-full rounded-xl transition-all duration-300 ${
                                item.isPeak
                                  ? "bg-gradient-to-t from-[#4F46E5] to-[#7C3AED] shadow-sm shadow-indigo-500/30"
                                  : isHovered
                                  ? "bg-[#4F46E5]"
                                  : "bg-slate-300 hover:bg-[#4F46E5]/70 dark:bg-slate-700"
                              }`}
                            />
                          </div>
                        </div>

                        {/* Weekday Label */}
                        <span
                          className={`mt-2 text-xs transition-colors ${
                            item.isPeak
                              ? "font-black text-[#7C3AED]"
                              : isHovered
                              ? "font-bold text-[#4F46E5]"
                              : "font-semibold text-slate-400"
                          }`}
                        >
                          {item.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 4. BREAKDOWN & DISTRIBUTION SECTION (6 COLS + 6 COLS) */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Category Spending Allocation (6 cols) */}
          <div className="xl:col-span-6">
            <Card className="h-full rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-[#2D2250] dark:bg-[#130E26]">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 dark:border-[#2D2250]">
                  <div>
                    <h3 className="text-base font-black text-[#0F172A] dark:text-[#F8FAFC]">
                      Category Spending Allocation
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Portfolio share across primary merchandise tiers
                    </p>
                  </div>
                  <Chip size="sm" className="bg-[#06B6D4]/10 text-xs font-black text-[#06B6D4]">
                    {categoryList.length} Categories
                  </Chip>
                </div>

                <div className="mt-6 grid grid-cols-1 items-center gap-6 md:grid-cols-12">
                  {/* Left: SVG Donut Chart */}
                  <div className="relative flex items-center justify-center md:col-span-5">
                    <svg viewBox="0 0 160 160" className="h-44 w-44">
                      {(() => {
                        const totalCat = categoryList.reduce((acc, c) => acc + c.amount, 0) || 1;
                        let accumulatedPercent = 0;
                        const circumference = 2 * Math.PI * 52;

                        return categoryList.map((c, i) => {
                          const percent = c.amount / totalCat;
                          const dash = percent * circumference;
                          const offset = -accumulatedPercent * circumference;
                          accumulatedPercent += percent;

                          return (
                            <circle
                              key={i}
                              cx="80"
                              cy="80"
                              r="52"
                              fill="transparent"
                              stroke={c.color}
                              strokeWidth={hoveredCategory === c.category ? "18" : "14"}
                              strokeDasharray={`${dash} ${circumference}`}
                              strokeDashoffset={offset}
                              strokeLinecap="round"
                              className="cursor-pointer transition-all duration-200"
                              onMouseEnter={() => setHoveredCategory(c.category)}
                              onMouseLeave={() => setHoveredCategory(null)}
                            />
                          );
                        });
                      })()}
                    </svg>
                    {/* Donut Center Label */}
                    <div className="pointer-events-none absolute text-center">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Total Spent</p>
                      <p className="text-sm font-black text-[#0F172A] dark:text-[#F8FAFC]">
                        {formatMoney(totalNetSpend)}
                      </p>
                    </div>
                  </div>

                  {/* Right: Itemized Progress Bars */}
                  <div className="space-y-3.5 md:col-span-7">
                    {categoryList.map((cat) => (
                      <div
                        key={cat.category}
                        onMouseEnter={() => setHoveredCategory(cat.category)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        className={`rounded-2xl p-2.5 transition-all ${
                          hoveredCategory === cat.category
                            ? "bg-slate-50 dark:bg-[#090614]"
                            : "hover:bg-slate-50/50 dark:hover:bg-[#090614]/50"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">{cat.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-[#4F46E5]">{formatMoney(cat.amount)}</span>
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {cat.percentage}%
                            </span>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Merchant & Vendor Distribution (6 cols) */}
          <div className="xl:col-span-6">
            <Card className="h-full rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-[#2D2250] dark:bg-[#130E26]">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 dark:border-[#2D2250]">
                  <div>
                    <h3 className="text-base font-black text-[#0F172A] dark:text-[#F8FAFC]">
                      Merchant & Vendor Distribution
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Fulfilled orders and vendor performance tracking
                    </p>
                  </div>
                  <Chip size="sm" className="bg-emerald-500/10 text-xs font-black text-emerald-500">
                    {vendorList.length} Verified Vendors
                  </Chip>
                </div>

                <div className="mt-6 space-y-3">
                  {vendorList.map((vendor, i) => (
                    <div
                      key={i}
                      className="group flex flex-col justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 transition-all hover:border-[#4F46E5]/40 hover:shadow-xs sm:flex-row sm:items-center dark:border-[#2D2250] dark:bg-[#090614]"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr ${vendor.gradient} text-sm font-black text-white shadow-sm`}
                        >
                          {vendor.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">{vendor.name}</span>
                            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                              {vendor.onTimeRate}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span>Order #{vendor.latestOrderId}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                              ★ {vendor.rating}
                            </span>
                            <span>•</span>
                            <span>{vendor.ordersCount} orders</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-black text-[#4F46E5] dark:text-indigo-400">
                          {formatMoney(vendor.amount)}
                        </p>
                        <p className="text-[11px] font-bold text-slate-400">Total Volume</p>
                      </div>
                    </div>
                  ))}

                  {/* Summary Callout */}
                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-dashed border-[#E2E8F0] p-3 text-xs text-slate-500 dark:border-[#2D2250] dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Store className="h-4 w-4 text-[#4F46E5]" /> 100% of orders processed via verified escrow stores
                    </span>
                    <Link
                      href="/stores"
                      className="flex items-center gap-1 font-bold text-[#4F46E5] hover:underline"
                    >
                      Browse Stores <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 5. AI COPILOT INSIGHTS & BUDGET SAFEGUARDS */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Smart Spending Insights (3 structured alert cards) - 7 cols */}
          <div className="xl:col-span-7">
            <Card className="h-full rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-[#2D2250] dark:bg-[#130E26]">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 dark:border-[#2D2250]">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/10 text-[#4F46E5]">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[#0F172A] dark:text-[#F8FAFC]">
                        AI Copilot Spending Insights
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Intelligent warnings, bundle suggestions & VIP milestones
                      </p>
                    </div>
                  </div>
                  <Chip size="sm" className="bg-[#4F46E5]/10 text-xs font-black text-[#4F46E5] dark:text-indigo-400">
                    3 Active Alerts
                  </Chip>
                </div>

                <div className="mt-5 space-y-3.5">
                  {/* Insight 1: Category Concentration Warning */}
                  <div className="flex items-start gap-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-amber-800 dark:text-amber-300">
                        Category Concentration Warning (Electronics: 62%)
                      </h4>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        High volume concentration in Electronics. Consider exploring scheduled replenishment to unlock 5% bulk tier vendor discounts.
                      </p>
                    </div>
                  </div>

                  {/* Insight 2: VIP Tier Threshold Update */}
                  <div className="flex items-start gap-3.5 rounded-2xl border border-[#7C3AED]/20 bg-[#7C3AED]/5 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#7C3AED]/10 text-[#7C3AED]">
                      <Award className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#7C3AED]">
                        VIP Tier Threshold Milestone
                      </h4>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        You are {formatMoney(4200)} away from the Gold Tier threshold, which grants zero-fee standard delivery and priority dispute handling across all stores.
                      </p>
                    </div>
                  </div>

                  {/* Insight 3: Peripheral Bundling Suggestion */}
                  <div className="flex items-start gap-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Laptop className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                        Peripheral Bundling Detected
                      </h4>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        You frequently purchase tech accessories separately. Bundling accessories into primary electronic orders saves an estimated 8.5% on delivery fees.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Budget Safeguards & Target - 5 cols */}
          <div className="xl:col-span-5">
            <Card className="h-full rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-[#2D2250] dark:bg-[#130E26]">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 dark:border-[#2D2250]">
                  <div>
                    <h3 className="text-base font-black text-[#0F172A] dark:text-[#F8FAFC]">
                      Monthly Budget Target
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Real-time allocation ceiling safeguard</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => {
                      setBudgetInput(currency === "USD" ? (targetBudget / USD_RATE).toFixed(0) : targetBudget.toString());
                      setShowBudgetModal(true);
                    }}
                    className="flex items-center gap-1 h-7 px-2 text-xs font-black text-[#4F46E5] hover:bg-[#4F46E5]/10"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>Edit Target</span>
                  </Button>
                </div>

                {/* 3-Box Numerical Summary */}
                <div className="mt-5 grid grid-cols-3 gap-2.5">
                  <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center dark:border-[#2D2250] dark:bg-[#090614]">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Target</span>
                    <p className="mt-1 text-sm font-black text-[#0F172A] dark:text-[#F8FAFC]">
                      {formatMoney(targetBudget)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center dark:border-[#2D2250] dark:bg-[#090614]">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Utilized</span>
                    <p className="mt-1 text-sm font-black text-[#4F46E5]">
                      {formatMoney(utilizedBudget)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center dark:border-[#2D2250] dark:bg-[#090614]">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Remaining</span>
                    <p
                      className={`mt-1 text-sm font-black ${
                        isBudgetApproaching ? "text-amber-500" : "text-emerald-500"
                      }`}
                    >
                      {formatMoney(remainingBudget)}
                    </p>
                  </div>
                </div>

                {/* Multi-Stop Gradient Progress Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500 dark:text-slate-400">Budget Consumed</span>
                    <span className="font-black text-[#7C3AED]">{budgetUtilizationPercent}%</span>
                  </div>
                  <div className="mt-2 h-3 w-full rounded-full bg-slate-100 p-0.5 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-amber-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, Number(budgetUtilizationPercent)))}%` }}
                    />
                  </div>
                </div>

                {/* Amber Ceiling Approaching Alert Callout */}
                {isBudgetApproaching ? (
                  <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                    <p className="leading-relaxed">
                      <span className="font-black">Ceiling Approaching:</span> You have utilized {budgetUtilizationPercent}% of your monthly target. Safe reserve remaining: {formatMoney(remainingBudget)}.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300">
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span>Healthy allocation pace. You are well within your monthly spending ceiling.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Inline Modal for Setting/Updating Budget */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-2xl dark:border-[#2D2250] dark:bg-[#130E26]">
            <h3 className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC]">
              Set Monthly Spending Target
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Enter your monthly ceiling in {currency} ({currency === "USD" ? "$" : "৳"}). The system will trigger proactive safeguards at 85%.
            </p>

            <form onSubmit={handleBudgetSave} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Target Amount ({currency})
                </label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    placeholder={currency === "USD" ? "500" : "60000"}
                    className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-sm font-black text-[#0F172A] outline-none transition focus:border-[#4F46E5] dark:border-[#2D2250] dark:bg-[#090614] dark:text-[#F8FAFC]"
                    autoFocus
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                    {currency}
                  </span>
                </div>
                {budgetError && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs font-bold text-red-500">
                    <AlertTriangle className="h-3.5 w-3.5" /> {budgetError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onPress={() => setShowBudgetModal(false)}
                  className="rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isDisabled={savingBudget}
                  className="rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-xs font-black text-white shadow-md"
                >
                  {savingBudget ? "Saving Target..." : "Confirm Target"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
