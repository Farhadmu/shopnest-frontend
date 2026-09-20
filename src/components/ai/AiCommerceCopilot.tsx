"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  X,
  Minus,
  Trash2,
  Sparkles,
  TrendingUp,
  TrendingDown,
  MinusIcon,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Database,
  Shield,
  Activity,
  ChevronRight,
  Bot,
  User,
  Loader2,
  BarChart3,
  DollarSign,
  Users,
  Store,
  Package,
  AlertOctagon,
  MapPin,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { askAdminCopilot, CopilotResponse, CopilotMetric, CopilotInsight } from "@/lib/api/admin-copilot";
import { askCustomerCopilot, CustomerCopilotResponse } from "@/lib/api/customer-copilot";
import { askSellerCopilot, SellerCopilotResponse } from "@/lib/api/seller-copilot";
import { askUnifiedAiCore, consumeHandoffToken, AIExperience, AIEvidenceItem, AIActionItem } from "@/lib/api/ai-core";
import { useSession } from "@/lib/auth-client";
import { AiActionConfirmationModal } from "./AiActionConfirmationModal";

// Types
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  data?: CopilotResponse;
  basicData?: CustomerCopilotResponse | SellerCopilotResponse;
  evidence?: AIEvidenceItem[];
  actions?: AIActionItem[];
  provider?: string;
  referencedProducts?: any[];
  referencedOrders?: any[];
  isLoading?: boolean;
  error?: string;
  timestamp: Date;
}

interface AiCommerceCopilotProps {
  role?: "customer" | "seller" | "admin" | "advisor";
  compact?: boolean;
  positionClass?: string;
}

// Pro-Level Role Theme Matrix
const ROLE_THEMES = {
  admin: {
    themeKey: "admin" as const,
    roleName: "Admin Intelligence & Brain",
    subtitle: "Real-time Telemetry, Risk & Marketplace Control",
    iconBg: "from-amber-500 via-orange-500 to-yellow-500",
    glowOrb: "from-amber-500/20 via-orange-500/10 to-transparent",
    borderGlow: "border-amber-500/35 shadow-[0_0_50px_rgba(245,158,11,0.18)]",
    pillBadge: "bg-amber-500/15 text-amber-300 border-amber-500/35",
    userBubble: "bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-lg shadow-amber-500/20 border border-amber-400/30",
    assistantBubble: "bg-slate-900/85 border border-amber-500/25 text-slate-100 shadow-xl backdrop-blur-xl",
    dotColor: "bg-amber-400",
    actionBtn: "bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500 hover:text-black",
    launcherBg: "bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 shadow-amber-500/30",
  },
  seller: {
    themeKey: "seller" as const,
    roleName: "Seller Business Copilot",
    subtitle: "Store Analytics, Stock Tracking & Margin Intelligence",
    iconBg: "from-emerald-500 via-teal-500 to-cyan-500",
    glowOrb: "from-emerald-500/20 via-teal-500/10 to-transparent",
    borderGlow: "border-emerald-500/35 shadow-[0_0_50px_rgba(16,185,129,0.18)]",
    pillBadge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/35",
    userBubble: "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/20 border border-emerald-400/30",
    assistantBubble: "bg-slate-900/85 border border-emerald-500/25 text-slate-100 shadow-xl backdrop-blur-xl",
    dotColor: "bg-emerald-400",
    actionBtn: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500 hover:text-white",
    launcherBg: "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-emerald-500/30",
  },
  customer: {
    themeKey: "customer" as const,
    roleName: "Personal Customer Copilot",
    subtitle: "Orders, Live Dispatch Tracking, Wishlist & Vouchers",
    iconBg: "from-indigo-600 via-purple-600 to-pink-500",
    glowOrb: "from-indigo-500/20 via-purple-500/10 to-transparent",
    borderGlow: "border-indigo-500/35 shadow-[0_0_50px_rgba(99,102,241,0.18)]",
    pillBadge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/35",
    userBubble: "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-500/20 border border-indigo-400/30",
    assistantBubble: "bg-slate-900/85 border border-indigo-500/25 text-slate-100 shadow-xl backdrop-blur-xl",
    dotColor: "bg-indigo-400",
    actionBtn: "bg-indigo-500/15 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600 hover:text-white",
    launcherBg: "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-indigo-500/30",
  },
  advisor: {
    themeKey: "advisor" as const,
    roleName: "ShopNest AI Advisor",
    subtitle: "Product Discovery, Instant Answers & Live Recommendations",
    iconBg: "from-indigo-600 via-violet-600 to-purple-600",
    glowOrb: "from-violet-500/20 via-indigo-500/10 to-transparent",
    borderGlow: "border-violet-500/35 shadow-[0_0_50px_rgba(139,92,246,0.22)]",
    pillBadge: "bg-violet-500/15 text-violet-300 border-violet-500/35",
    userBubble: "bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 border border-violet-400/30",
    assistantBubble: "bg-slate-900/85 border border-violet-500/25 text-slate-100 shadow-xl backdrop-blur-xl",
    dotColor: "bg-amber-400",
    actionBtn: "bg-violet-500/15 text-violet-300 border-violet-500/40 hover:bg-violet-600 hover:text-white",
    launcherBg: "bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 shadow-violet-500/35",
  },
};

// Quick admin actions
const ADMIN_QUICK_ACTIONS = [
  { label: "Today's Briefing", query: "Give me today's executive briefing.", icon: BarChart3 },
  { label: "Revenue Analysis", query: "How is our revenue performing? Show trends and insights.", icon: DollarSign },
  { label: "Seller Risk", query: "Which sellers are most risky? Show risk scores and evidence.", icon: Shield },
  { label: "Revenue Leakage", query: "Show revenue leakage. Where are we losing money?", icon: AlertOctagon },
  { label: "Critical Anomalies", query: "Show critical anomalies detected recently.", icon: AlertTriangle },
  { label: "Platform Health", query: "Is the platform healthy? Check system telemetry and security.", icon: Activity },
  { label: "Forecast", query: "Forecast next month's GMV and orders.", icon: TrendingUp },
  { label: "What Should I Do?", query: "What should I investigate first? What needs my attention?", icon: Sparkles },
];

// Follow-up suggestions based on intent
const FOLLOW_UP_SUGGESTIONS: Record<string, string[]> = {
  REVENUE_ANALYSIS: ["Which sellers caused the change?", "Which category was affected most?", "Show revenue leakage"],
  SELLER_RISK: ["Which risky sellers cause revenue leakage?", "Show their recent orders", "Compare with last month"],
  REVENUE_LEAKAGE: ["Which sellers are most affected?", "Show affected orders", "Analyze cancellation trends"],
  ANOMALY_ANALYSIS: ["Why was this flagged?", "Show related orders", "Mark as reviewed"],
  SECURITY_ANALYSIS: ["Show recent audit logs", "Check affected users", "View security telemetry"],
  SYSTEM_HEALTH: ["Which API is slowest?", "Show error rates", "Check historical uptime"],
  FORECAST_ANALYSIS: ["What drives this forecast?", "Compare with last quarter", "Show category forecasts"],
  CATEGORY_ANALYSIS: ["Which sellers dominate this category?", "Show category trends", "Compare categories"],
  EXECUTIVE_SUMMARY: ["Dive into revenue", "Check seller risk", "Show anomalies"],
  MARKETPLACE_OVERVIEW: ["Why is revenue changing?", "Who needs attention?", "Check system health"],
};

// Lightweight markdown renderer — transforms headers, bold, lists, line breaks
function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let listType: "ul" | "ol" | null = null;
  let keyCounter = 0;

  function flushList() {
    if (listItems.length === 0) return;
    if (listType === "ol") {
      elements.push(<ol key={`ol-${keyCounter++}`} className="list-decimal list-inside space-y-0.5 my-1 pl-1 text-xs">{listItems}</ol>);
    } else {
      elements.push(<ul key={`ul-${keyCounter++}`} className="list-disc list-inside space-y-0.5 my-1 pl-1 text-xs">{listItems}</ul>);
    }
    listItems = [];
    listType = null;
  }

  function parseInline(text: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    const boldRegex = /\*\*(.+?)\*\*/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = boldRegex.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      parts.push(<strong key={`b-${m.index}`} className="font-semibold">{m[1]}</strong>);
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();

    // Headings
    const h3 = line.match(/^###\s+(.+)$/);
    const h2 = line.match(/^##\s+(.+)$/);
    const h1 = line.match(/^#\s+(.+)$/);
    // Ordered list
    const ol = line.match(/^\d+\.\s+(.+)$/);
    // Unordered list (handles -, •, *)
    const ul = line.match(/^[-•*]\s+(.+)$/);

    if (h3 || h2 || h1) {
      flushList();
      const text = (h3 || h2 || h1)![1];
      const cls = h1
        ? "text-sm font-bold text-text mt-3 mb-1"
        : h2
        ? "text-xs font-bold text-text mt-2.5 mb-0.5 uppercase tracking-wide"
        : "text-xs font-semibold text-text mt-2 mb-0.5";
      elements.push(<p key={`h-${keyCounter++}`} className={cls}>{parseInline(text)}</p>);
    } else if (ol) {
      if (listType !== "ol") { flushList(); listType = "ol"; }
      listItems.push(<li key={`li-${keyCounter++}`}>{parseInline(ol[1])}</li>);
    } else if (ul) {
      if (listType !== "ul") { flushList(); listType = "ul"; }
      listItems.push(<li key={`li-${keyCounter++}`}>{parseInline(ul[1])}</li>);
    } else if (line.trim() === "") {
      flushList();
      elements.push(<br key={`br-${keyCounter++}`} />);
    } else {
      flushList();
      elements.push(<p key={`p-${keyCounter++}`} className="leading-relaxed">{parseInline(line)}</p>);
    }
  }
  flushList();

  return <div className="space-y-0.5 text-xs">{elements}</div>;
}

// Metric Card Component
function MetricCard({ metric }: { metric: CopilotMetric }) {
  const TrendIcon = metric.trend === "up" ? TrendingUp : metric.trend === "down" ? TrendingDown : MinusIcon;
  const trendColor =
    metric.trend === "up"
      ? "text-emerald-400"
      : metric.trend === "down"
        ? "text-rose-400"
        : "text-slate-400";

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-2.5 sm:p-3 min-w-[125px] shadow-md backdrop-blur-md">
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] sm:text-[10.5px] font-bold text-slate-400 truncate">{metric.label}</span>
        {metric.trend && <TrendIcon className={"h-3 w-3 shrink-0 " + trendColor} />}
      </div>
      <div className="mt-1 text-sm sm:text-base font-black text-white truncate">{metric.formatted}</div>
      {metric.changePercent !== undefined && (
        <div className={"text-[10px] font-bold " + (metric.changePercent >= 0 ? "text-emerald-400" : "text-rose-400")}>
          {metric.changePercent >= 0 ? "+" : ""}{metric.changePercent}%
        </div>
      )}
    </div>
  );
}

// Insight Card Component
function InsightCard({ insight }: { insight: CopilotInsight }) {
  const severityConfig: Record<string, { icon: typeof Info; color: string; bg: string; border: string }> = {
    info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/5", border: "border-blue-500/20" },
    low: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/5", border: "border-green-500/20" },
    medium: { icon: AlertCircle, color: "text-yellow-500", bg: "bg-yellow-500/5", border: "border-yellow-500/20" },
    high: { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/5", border: "border-orange-500/20" },
    critical: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/5", border: "border-red-500/20" },
  };

  const config = severityConfig[insight.severity] || severityConfig.info;
  const Icon = config.icon;

  return (
    <div className={"rounded-xl border p-3 " + config.bg + " " + config.border}>
      <div className="flex items-start gap-2">
        <Icon className={"h-4 w-4 mt-0.5 shrink-0 " + config.color} />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-text">{insight.title}</div>
          <div className="text-[11px] text-muted mt-0.5 leading-relaxed">{insight.description}</div>
          {insight.evidence && insight.evidence.length > 0 && (
            <div className="mt-2 space-y-1">
              {insight.evidence.map((ev, i) => (
                <div key={i} className="text-[10px] text-muted flex justify-between gap-2">
                  <span>{ev.fact}</span>
                  <span className="font-semibold text-text">{ev.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Source Badge Component
function SourceBadge({ source }: { source: { name: string; type: string } }) {
  const typeIcons: Record<string, typeof Database> = {
    database: Database,
    analytics: Activity,
    security: Shield,
    telemetry: Activity,
    forecast: TrendingUp,
  };
  const Icon = source.type ? typeIcons[source.type] || Database : Database;
  const typeLabel = source.type ? source.type.toUpperCase() : "DATA";

  return (
    <div className="inline-flex items-center gap-1 rounded-md bg-muted-bg px-2 py-0.5 text-[9px] font-bold text-muted border border-border">
      <Icon className="h-2.5 w-2.5" />
      <span>{source.name || typeLabel}</span>
    </div>
  );
}

// Verified Database Evidence Component (Pro-Level Glassmorphic Badge)
function EvidenceList({ evidence }: { evidence: AIEvidenceItem[] }) {
  const [expanded, setExpanded] = useState(false);
  if (!evidence || evidence.length === 0) return null;

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-md p-3 text-xs shadow-lg">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between font-black text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <Shield className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[11px] uppercase tracking-wider">
            Verified Ground-Truth Evidence ({evidence.length} facts)
          </span>
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
          {expanded ? "Collapse ▲" : "Inspect Facts ▼"}
        </span>
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2.5 space-y-2 pt-2 border-t border-emerald-500/20"
        >
          {evidence.map((ev, i) => (
            <div
              key={i}
              className="rounded-xl border border-emerald-500/20 bg-slate-900/60 p-2.5 text-[11px] backdrop-blur-sm space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 text-[9px] font-mono uppercase font-black">
                  {ev.type}
                </span>
                <span className="text-[9.5px] font-mono text-slate-400">{ev.source}</span>
              </div>
              <div className="text-slate-200 font-medium">{ev.fact}</div>
              <div className="text-[10.5px] text-emerald-400 font-mono flex items-center gap-1 font-bold">
                <span className="text-slate-400 font-normal">Verified Value:</span>
                <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {String(ev.value)}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// Executive Briefing Component
function ExecutiveBriefing({ data }: { data: CopilotResponse }) {
  const healthStatus = data.insights?.find(i => i.title.toLowerCase().includes("health") || i.title.toLowerCase().includes("status"));
  const criticalIssues = data.insights?.filter(i => i.severity === "critical" || i.severity === "high") || [];

  return (
    <div className="space-y-3">
      {/* Health Status Banner */}
      <div className="rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-text">Marketplace Health: {healthStatus?.title || "Stable"}</span>
        </div>
        <p className="text-[11px] text-muted">{healthStatus?.description || "All systems operational"}</p>
      </div>

      {/* Key Metrics Grid */}
      {data.metrics && data.metrics.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {data.metrics.slice(0, 6).map((metric, i) => (
            <MetricCard key={i} metric={metric} />
          ))}
        </div>
      )}

      {/* Critical Issues */}
      {criticalIssues.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-muted uppercase tracking-wider">Critical Issues ({criticalIssues.length})</div>
          {criticalIssues.slice(0, 3).map((insight, i) => (
            <InsightCard key={i} insight={insight} />
          ))}
        </div>
      )}

      {/* Sources */}
      {data.sources && data.sources.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {data.sources.map((source, i) => (
            <SourceBadge key={i} source={source} />
          ))}
        </div>
      )}
    </div>
  );
}

// Main Component
export function AiCommerceCopilot({
  role = "customer",
  compact = false,
  positionClass,
}: AiCommerceCopilotProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const sessionRole = (session?.user as any)?.role as "customer" | "seller" | "admin" | undefined;
  const effectiveRole = role === "advisor" ? "advisor" : (sessionRole || role);
  const theme = ROLE_THEMES[effectiveRole] || ROLE_THEMES.customer;

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showBriefing, setShowBriefing] = useState(true);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [selectedAction, setSelectedAction] = useState<AIActionItem | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [typingPhase, setTypingPhase] = useState(0);

  const chatBodyRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUp = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const TYPING_PHASES = [
    effectiveRole === "admin"
      ? "Querying marketplace schema & risk radar..."
      : effectiveRole === "seller"
      ? "Analyzing store sales & inventory velocity..."
      : effectiveRole === "advisor"
      ? "Scanning 10,000+ verified products & live deals..."
      : "Verifying live prices, reviews & stock...",
    effectiveRole === "advisor"
      ? "Auditing merchant quality, stock & customer ratings..."
      : "Auditing Anti-IDOR role constraints...",
    "Synthesizing verified AI recommendations...",
  ];

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setTypingPhase((p) => (p + 1) % TYPING_PHASES.length);
    }, 1600);
    return () => clearInterval(interval);
  }, [loading]);

  const handleActionClick = (action: AIActionItem) => {
    setSelectedAction(action);
    setIsActionModalOpen(true);
  };

  const handleConfirmAction = async (action: AIActionItem) => {
    const url = action.targetUrl || (action.payload?.url as string);
    if (url) {
      router.push(url);
      setIsOpen(false);
    }
  };

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg: Message = {
        id: "welcome",
        role: "assistant",
        content: effectiveRole === "admin"
          ? "Good day, Admin. I'm your Marketplace Intelligence Copilot with direct, secure access to your marketplace schema, anomalies, and store audits.\n\nHere is your real-time operations console."
          : effectiveRole === "seller"
          ? "Welcome! I'm your AI Business Intelligence Copilot. I can analyze your sales velocity, low-stock hazards, and customer order statuses in real time."
          : effectiveRole === "advisor"
          ? "Hello! 👋 I'm your ShopNest AI Advisor. I can help you find products, discover deals, compare options, and answer any questions about shopping with ShopNest. What are you looking for today?"
          : "Hello! I'm your Personal Shopping Copilot. I have live access to verified products, your active orders, wishlist, and cart. How can I help you today?",
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
    }
  }, [effectiveRole]);

  const handleChatScroll = () => {
    if (!chatBodyRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.current;
    isUserScrolledUp.current = scrollHeight - scrollTop - clientHeight > 60;
  };

  // Safe inner container scroll — never scrolls parent backdrop or window
  const scrollToBottom = useCallback((force = false) => {
    if (!chatBodyRef.current) return;
    if (force || !isUserScrolledUp.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages, scrollToBottom]);

  // Reset backdrop scrollTop and focus input on open without jumping
  useEffect(() => {
    if (isOpen) {
      if (backdropRef.current) {
        backdropRef.current.scrollTop = 0;
      }
      if (!isMinimized) {
        setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 100);
      }
    }
  }, [isOpen, isMinimized]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  // Handle URL handoff token from AI Advisor
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const handoffToken = params.get("handoff") || params.get("handoffToken");
    const shouldOpen = params.get("copilot") === "open";

    if (shouldOpen || handoffToken) {
      setIsOpen(true);
    }

    if (handoffToken) {
      consumeHandoffToken(handoffToken)
        .then((data) => {
          if (data) {
            setMessages((prev) => [
              ...prev,
              {
                id: `handoff-${Date.now()}`,
                role: "assistant",
                content: `🤝 **Context Transferred from Shopping Advisor!**\n\n${
                  data.conversationSummary
                    ? `*Recent browsing context:*\n> ${data.conversationSummary.split("\n").join("\n> ")}\n\n`
                    : ""
                }I have loaded your context into your private Customer Copilot. How would you like me to help you proceed with your order, voucher, or delivery tracking?`,
                timestamp: new Date(),
              },
            ]);
          }
        })
        .catch((err) => {
          console.warn("[AiCommerceCopilot] Error consuming handoff token:", err);
        });
    }
  }, []);

  // Send message handler
  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || query;
    if (!prompt.trim() || loading) return;

    const userMessage: Message = {
      id: "user-" + Date.now(),
      role: "user",
      content: prompt.trim(),
      timestamp: new Date(),
    };

    const loadingMessage: Message = {
      id: "loading-" + Date.now(),
      role: "assistant",
      content: "",
      isLoading: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setQuery("");
    setLoading(true);
    setShowBriefing(false);
    isUserScrolledUp.current = false;
    setTimeout(() => scrollToBottom(true), 60);

    try {
      const experience: AIExperience =
        effectiveRole === "admin"
          ? "ADMIN_COPILOT"
          : effectiveRole === "seller"
          ? "SELLER_COPILOT"
          : effectiveRole === "advisor"
          ? "ADVISOR"
          : "CUSTOMER_COPILOT";

      try {
        const unifiedRes = await askUnifiedAiCore({
          prompt: prompt.trim(),
          aiType: experience,
          conversationId,
        });

        if (unifiedRes.conversationId) {
          setConversationId(unifiedRes.conversationId);
        }

        const assistantMessage: Message = {
          id: "assistant-" + Date.now(),
          role: "assistant",
          content: unifiedRes.answer,
          evidence: unifiedRes.evidence,
          actions: unifiedRes.actions,
          provider: unifiedRes.provider,
          referencedProducts: unifiedRes.referencedEntities?.products,
          referencedOrders: unifiedRes.referencedEntities?.orders,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev.slice(0, -1), assistantMessage]);
      } catch (coreErr) {
        // Fallback to role-specific copilot
        if (effectiveRole === "admin") {
          const response = await askAdminCopilot(prompt.trim());
          const assistantMessage: Message = {
            id: "assistant-" + Date.now(),
            role: "assistant",
            content: response.answer,
            data: response,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev.slice(0, -1), assistantMessage]);
        } else {
          const response =
            effectiveRole === "seller"
              ? await askSellerCopilot(prompt.trim(), conversationId)
              : await askCustomerCopilot(prompt.trim(), conversationId);

          if (response.conversationId) {
            setConversationId(response.conversationId);
          }

          const assistantMessage: Message = {
            id: "assistant-" + Date.now(),
            role: "assistant",
            content: response.answer,
            basicData: response,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev.slice(0, -1), assistantMessage]);
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: "error-" + Date.now(),
        role: "assistant",
        content: "I encountered an error processing your request. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Clear conversation
  const clearConversation = () => {
    setMessages([{
      id: "welcome-reset",
      role: "assistant",
      content: "Conversation cleared. How can I help you?",
      timestamp: new Date(),
    }]);
    setShowBriefing(false);
    setConversationId(undefined);
  };

  // Get follow-up suggestions
  const getFollowUps = (intent: string): string[] => {
    return FOLLOW_UP_SUGGESTIONS[intent] || ["Tell me more", "Show details", "What else?"];
  };

  // Render message bubble
  const renderMessage = (m: Message) => {
    const isUser = m.role === "user";

    return (
      <motion.div
        key={m.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={"flex gap-2.5 " + (isUser ? "flex-row-reverse" : "flex-row")}
      >
        {/* Avatar */}
        <div className={
          `flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl shadow-md ${
            isUser ? "bg-slate-700 text-white" : `bg-gradient-to-br ${theme.iconBg} text-white`
          }`
        }>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>

        {/* Content */}
        <div className={"flex-1 max-w-[90%] " + (isUser ? "flex flex-col items-end" : "")}>
          {m.isLoading ? (
            <div className="flex items-center gap-2 rounded-2xl bg-slate-900/80 border border-white/10 p-3.5 text-slate-300 backdrop-blur-xl">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
              <span className="text-xs font-semibold">{TYPING_PHASES[typingPhase]}</span>
            </div>
          ) : (
            <>
              {/* Message bubble */}
              <div className={
                "rounded-2xl p-4 text-xs leading-relaxed shadow-lg backdrop-blur-xl " +
                (isUser
                  ? `${theme.userBubble}`
                  : `${theme.assistantBubble}`)
              }>
                {isUser ? (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                ) : (
                  <MarkdownContent content={m.content} />
                )}
              </div>

              {/* Error */}
              {m.error && (
                <div className="mt-1.5 rounded-xl bg-red-500/10 p-2.5 text-[10px] text-red-400 border border-red-500/25">
                  {m.error}
                </div>
              )}

              {/* Verified Database Evidence (Unified AI Core) */}
              {m.evidence && m.evidence.length > 0 && (
                <EvidenceList evidence={m.evidence} />
              )}

              {/* Referenced Catalog Products */}
              {m.referencedProducts && m.referencedProducts.length > 0 && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Referenced Verified Products
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {m.referencedProducts.map((p: any, i: number) => (
                      <a
                        key={i}
                        href={`/products/${p.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-slate-900/70 p-2.5 hover:border-white/25 transition-all shadow-sm backdrop-blur-sm group"
                      >
                        {p.image && (
                          <img src={p.image} alt={p.title} className="h-11 w-11 rounded-xl object-cover" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-white group-hover:text-primary transition-colors">{p.title}</p>
                          <p className="text-[11px] font-black text-emerald-400">৳{p.price}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Core Suggested Actions with Interactive Modal */}
              {m.actions && m.actions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {m.actions.map((act, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleActionClick(act)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition-all duration-200 cursor-pointer shadow-md hover:scale-105 active:scale-95 border ${theme.actionBtn}`}
                    >
                      <span>{act.label}</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              )}

              {/* Data-rich response for admin */}
              {m.data && effectiveRole === "admin" && (
                <div className="mt-2 space-y-3">
                  {/* Executive briefing style for overview/briefing intents */}
                  {(m.data.intent === "EXECUTIVE_SUMMARY" || m.data.intent === "MARKETPLACE_OVERVIEW") && showBriefing ? (
                    <ExecutiveBriefing data={m.data} />
                  ) : (
                    <>
                      {/* Metrics */}
                      {m.data.metrics && m.data.metrics.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                          {m.data.metrics.slice(0, 6).map((metric, i) => (
                            <MetricCard key={i} metric={metric} />
                          ))}
                        </div>
                      )}

                      {/* Insights */}
                      {m.data.insights && m.data.insights.length > 0 && (
                        <div className="space-y-2">
                          {m.data.insights.slice(0, 4).map((insight, i) => (
                            <InsightCard key={i} insight={insight} />
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Sources */}
                  {m.data.sources && m.data.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {m.data.sources.map((source, i) => (
                        <SourceBadge key={i} source={source} />
                      ))}
                    </div>
                  )}

                  {/* Suggested Actions */}
                  {m.data.suggestedActions && m.data.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {m.data.suggestedActions.map((action, i) =>
                        action.targetUrl ? (
                          <a
                            key={i}
                            href={action.targetUrl}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                          >
                            {action.label}
                            <ChevronRight className="h-2.5 w-2.5" />
                          </a>
                        ) : (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {}}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-colors border border-primary/20 cursor-pointer"
                          >
                            {action.label}
                            <ChevronRight className="h-2.5 w-2.5" />
                          </button>
                        )
                      )}
                    </div>
                  )}

                  {/* Confidence & Time Range */}
                  <div className="flex items-center gap-2 text-[9px] text-muted">
                    <span className="font-medium">{m.data.intent}</span>
                    <span>·</span>
                    <span>{Math.round((m.data.confidence || 0) * 100)}% confidence</span>
                    <span>·</span>
                    <span>{m.data.timeRange?.label || "all time"}</span>
                    {m.data.isFallback && (
                      <>
                        <span>·</span>
                        <span className="text-yellow-500">fallback mode</span>
                      </>
                    )}
                  </div>

                  {/* Follow-up suggestions */}
                  {m.data.intent && FOLLOW_UP_SUGGESTIONS[m.data.intent] && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {getFollowUps(m.data.intent).slice(0, 3).map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(suggestion)}
                          className="rounded-lg border border-border bg-surface px-2.5 py-1 text-[10px] font-medium text-muted hover:text-text hover:border-primary/40 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Data-rich response for seller/customer */}
              {m.basicData && role !== "admin" && (
                <div className="mt-2 space-y-3">
                  {/* Metrics */}
                  {m.basicData.metrics && m.basicData.metrics.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                      {m.basicData.metrics.slice(0, 6).map((metric, i) => (
                        <MetricCard key={i} metric={metric} />
                      ))}
                    </div>
                  )}

                  {/* Insights */}
                  {m.basicData.insights && m.basicData.insights.length > 0 && (
                    <div className="space-y-2">
                      {m.basicData.insights.slice(0, 4).map((insight, i) => (
                        <InsightCard key={i} insight={insight} />
                      ))}
                    </div>
                  )}

                  {/* Sources */}
                  {m.basicData.sources && m.basicData.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {m.basicData.sources.map((source, i) => (
                        <SourceBadge key={i} source={source} />
                      ))}
                    </div>
                  )}

                  {/* Suggested Actions */}
                  {m.basicData.suggestedActions && m.basicData.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {m.basicData.suggestedActions.map((action, i) =>
                        action.targetUrl ? (
                          <a
                            key={i}
                            href={action.targetUrl}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                          >
                            {action.label}
                            <ChevronRight className="h-2.5 w-2.5" />
                          </a>
                        ) : (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {}}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-colors border border-primary/20 cursor-pointer"
                          >
                            {action.label}
                            <ChevronRight className="h-2.5 w-2.5" />
                          </button>
                        )
                      )}
                    </div>
                  )}

                  {/* Confidence & Time Range */}
                  <div className="flex items-center gap-2 text-[9px] text-muted">
                    <span className="font-medium">{m.basicData.intent || "COPILOT"}</span>
                    <span>·</span>
                    <span>{Math.round((m.basicData.confidence || 0) * 100)}% confidence</span>
                    <span>·</span>
                    <span>{m.basicData.timeRange?.label || "all time"}</span>
                    {m.basicData.isFallback && (
                      <>
                        <span>·</span>
                        <span className="text-yellow-500">fallback mode</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    );
  };

  // Quick prompts for different roles
  const quickPrompts: Record<string, Array<{ label: string; query: string; icon?: typeof Sparkles }>> = {
    customer: [
      { label: "📦 Track Delivery", query: "Where is my latest order and delivery status?" },
      { label: "📈 Spending Analytics", query: "How much did I spend this month and what's my category breakdown?" },
      { label: "❤️ Wishlist Check", query: "Show my saved wishlist items and any price drops" },
      { label: "🛒 Cart Optimization", query: "What's in my cart and are there any coupons available?" },
      { label: "🔄 Return Eligibility", query: "Can I return any of my recent orders?" },
      { label: "🎯 Shopping Goals", query: "What is my shopping goals progress?" },
      { label: "🛡️ Warranty & Lifecycle", query: "Show my product warranties and maintenance status" },
      { label: "🛍️ Budget Shopping", query: "Find me high-rated products under ৳5,000" },
    ],
    seller: [
      { label: "Sales forecast", query: "What is my 30-day projected sales forecast?" },
      { label: "Campaign sim", query: "Simulate a 15% discount campaign for 7 days" },
      { label: "Store health", query: "How can I improve my store health score to 95+?" },
      { label: "Store overview", query: "How is my store doing this month?" },
      { label: "Top products", query: "Which products are performing best?" },
      { label: "Low stock", query: "Which products are running low on stock?" },
      { label: "Pending orders", query: "Show my pending orders" },
      { label: "Review summary", query: "Summarize my recent reviews" },
    ],
    admin: ADMIN_QUICK_ACTIONS,
    advisor: [
      { label: "🔥 Trending Products", query: "What are the most popular and trending products right now?" },
      { label: "🏷️ Best Deals Today", query: "Show me the top discount offers and deals today" },
      { label: "⚡ Smart Gadgets", query: "Recommend best-rated electronic gadgets and smartphones" },
      { label: "🚚 Shipping & Delivery", query: "How does shipping, payment, and delivery work on ShopNest?" },
      { label: "🔍 Under ৳3,000", query: "Find me high-rated products under ৳3,000" },
      { label: "🛡️ Return & Warranty", query: "What is ShopNest's return and replacement policy?" },
    ],
  };

  return (
    <>
      {/* Pro-Level Floating Copilot Launcher Button */}
      {!compact && (
        <button
          type="button"
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className={`group fixed ${positionClass || "bottom-4 right-4 sm:bottom-6 sm:right-6"} z-40 flex items-center justify-center gap-2 sm:gap-3 rounded-full ${theme.launcherBg} p-3 sm:px-5 sm:py-3.5 text-xs font-black tracking-wide text-white shadow-2xl hover:shadow-[0_0_35px_rgba(139,92,246,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-white/30 backdrop-blur-xl ring-2 ring-white/20`}
          aria-label={`Open ${theme.roleName}`}
          title={theme.roleName}
        >
          {/* Subtle Outer Glow Ring on Hover */}
          <span className="pointer-events-none absolute -inset-0.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-80" />

          <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-85" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-white" />
          </span>
          <Sparkles className="relative h-4 w-4 sm:h-4.5 sm:w-4.5 text-amber-300 fill-amber-300/80 group-hover:rotate-12 transition-transform duration-200 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)] shrink-0" />
          <span className="hidden sm:inline uppercase font-black tracking-wider text-xs relative truncate max-w-[180px]">
            {theme.roleName}
          </span>
          <span className="hidden sm:inline-block text-[9.5px] font-extrabold bg-white/25 px-2 py-0.5 rounded-full uppercase border border-white/25 tracking-widest relative shrink-0">
            PRO AI
          </span>
        </button>
      )}

      {/* Ultra-Glassmorphic Copilot Drawer */}
      {(isOpen || compact) && (
        <div
          ref={backdropRef}
          onScroll={(e) => { e.currentTarget.scrollTop = 0; }}
          className={
            compact
              ? "rounded-3xl border border-white/10 bg-slate-950/80 backdrop-blur-2xl p-4 shadow-2xl"
              : "fixed inset-0 z-[60] flex flex-col justify-end items-center sm:items-end bg-black/70 backdrop-blur-sm p-0 sm:p-3 md:p-5 overflow-hidden"
          }
          onClick={(e) => {
            if (!compact && e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className={
              compact
                ? "w-full space-y-4"
                : `relative w-full sm:max-w-xl md:max-w-2xl overflow-hidden rounded-t-3xl sm:rounded-3xl border ${theme.borderGlow} bg-slate-950/95 text-slate-100 shadow-[0_25px_80px_rgba(0,0,0,0.85)] backdrop-blur-2xl flex flex-col ` +
                  (isMinimized
                    ? "h-auto"
                    : "h-[88dvh] sm:h-[min(640px,calc(100dvh-2.5rem))] max-h-[calc(100dvh-0.5rem)] sm:max-h-[calc(100dvh-2rem)]")
            }
          >
            {/* Ambient Background Mesh Glow Orbs */}
            <div className={`pointer-events-none absolute -top-28 -right-28 h-72 w-72 rounded-full bg-gradient-to-br ${theme.glowOrb} blur-3xl opacity-50`} />
            <div className={`pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-gradient-to-tr ${theme.glowOrb} blur-3xl opacity-40`} />

            {/* Mobile Pull Handle */}
            <div className="sm:hidden pt-2 pb-0.5 flex justify-center w-full relative z-10 shrink-0">
              <div className="w-12 h-1 rounded-full bg-white/25" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-3 sm:px-5 sm:py-3.5 relative z-10 bg-slate-900/60 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className={`grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-2xl bg-gradient-to-br ${theme.iconBg} text-white shadow-lg text-lg shrink-0`}>
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-xs sm:text-sm text-white flex items-center gap-2">
                    {theme.roleName}
                  </h3>
                  <p className="text-[10px] sm:text-[10.5px] font-medium text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    <span className="truncate max-w-[200px] sm:max-w-none">{theme.subtitle}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                {!compact && (
                  <>
                    <button
                      onClick={() => setIsMinimized(!isMinimized)}
                      className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
                      title="Minimize"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={clearConversation}
                      className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
                      title="Clear conversation"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-rose-500/20 hover:text-rose-300 transition cursor-pointer"
                      title="Close (Esc)"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Chat Body - Hidden when minimized */}
            {!isMinimized && (
              <>
                <div
                  ref={chatBodyRef}
                  onScroll={handleChatScroll}
                  className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-4 p-3 sm:p-4 relative z-10"
                >
                  <AnimatePresence mode="popLayout">
                    {messages.map((m) => renderMessage(m))}
                  </AnimatePresence>

                  {/* Animated Streaming & Kinetic Waveform Typing Indicator */}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 pl-1"
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.iconBg} text-white shadow-lg animate-pulse`}
                      >
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-2xl p-3.5 shadow-2xl space-y-2 max-w-[85%]">
                        <div className="flex items-center gap-2.5">
                          <div className="flex gap-1.5 items-center">
                            <span className={`h-2 w-2 rounded-full ${theme.dotColor} animate-bounce`} style={{ animationDelay: "0ms" }} />
                            <span className={`h-2 w-2 rounded-full ${theme.dotColor} animate-bounce`} style={{ animationDelay: "150ms" }} />
                            <span className={`h-2 w-2 rounded-full ${theme.dotColor} animate-bounce`} style={{ animationDelay: "300ms" }} />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-slate-200 via-white to-slate-400 bg-clip-text text-transparent">
                            {TYPING_PHASES[typingPhase]}
                          </span>
                        </div>
                        <div className="h-1.5 w-48 rounded-full bg-white/10 overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${theme.iconBg} animate-pulse w-full`} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Quick Actions / Starter Prompts */}
                {messages.length <= 2 && (
                  <div className="px-4 pb-2 relative z-10">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {effectiveRole === "admin" ? "Quick Intelligence" : "Quick Prompts"}
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                      {(quickPrompts[role] || quickPrompts.customer).map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSend(p.query)}
                          className="shrink-0 flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-slate-300 hover:text-white hover:border-white/30 transition cursor-pointer backdrop-blur-sm"
                        >
                          {p.icon && <p.icon className="h-3 w-3" />}
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Form */}
                <div className="border-t border-white/10 p-3 sm:p-4 relative z-10 bg-slate-900/60 backdrop-blur-md shrink-0">
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex items-center gap-2"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        effectiveRole === "admin"
                          ? "Ask about revenue, sellers, risks, anomalies..."
                          : `Ask ${effectiveRole} copilot anything...`
                      }
                      className="flex-1 rounded-2xl border border-white/15 bg-black/40 px-4 py-2.5 text-xs text-white placeholder:text-slate-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/10 backdrop-blur-sm"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || !query.trim()}
                      className={`rounded-2xl bg-gradient-to-r ${theme.iconBg} px-4 py-2.5 text-xs font-black text-white shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5`}
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </form>
                  <div className="mt-2 flex items-center justify-between text-[9px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Shield className="h-2.5 w-2.5 text-emerald-400" />
                      {effectiveRole === "admin" ? "Admin Audit Mode · 100% Anti-IDOR Protected" : "Verified Real-time Ground Truth"}
                    </span>
                    <span className="font-mono text-[8.5px] uppercase text-slate-400">
                      Unified AI Core Active
                    </span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      <AiActionConfirmationModal
        isOpen={isActionModalOpen}
        action={selectedAction}
        roleTheme={theme.themeKey}
        onClose={() => setIsActionModalOpen(false)}
        onConfirm={handleConfirmAction}
      />
    </>
  );
}

// Theme token metadata: Admin Cyber Amber theme identifier
export const ADMIN_THEME_KEY = "admin";

// Theme token metadata: Seller Neon Emerald theme identifier
export const SELLER_THEME_KEY = "seller";

// Theme token metadata: Customer Electric Indigo theme identifier
export const CUSTOMER_THEME_KEY = "customer";

// Kinetic sound-wave bounce frequency token
export const TYPING_WAVEFORM_BOUNCE_DELAY_MS = 150;

// Interval duration for multi-phase processing status updates
export const STREAMING_PHASE_INTERVAL_MS = 1600;

// Ground-truth verification badge pulse animation active token
export const EVIDENCE_BADGE_PULSE_ENABLED = true;

// Query parameter key for deep-link handoff token consumption
export const HANDOFF_URL_PARAM_KEY = "handoff";

// Mobile bottom sheet viewport height percentage
export const MOBILE_DRAWER_HEIGHT_PERCENT = "90vh";
