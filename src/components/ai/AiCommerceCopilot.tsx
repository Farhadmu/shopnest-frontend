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
import { askAdminCopilot, CopilotResponse, CopilotMetric, CopilotInsight } from "@/lib/api/admin-copilot";
import { askCommerceCopilot, CopilotResponse as BasicCopilotResponse } from "@/lib/api/ai-commerce";

// Types
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  data?: CopilotResponse;
  isLoading?: boolean;
  error?: string;
  timestamp: Date;
}

interface AiCommerceCopilotProps {
  role?: "customer" | "seller" | "admin";
  compact?: boolean;
}

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

// Metric Card Component
function MetricCard({ metric }: { metric: CopilotMetric }) {
  const TrendIcon = metric.trend === "up" ? TrendingUp : metric.trend === "down" ? TrendingDown : MinusIcon;
  const trendColor =
    metric.trend === "up"
      ? "text-green-500"
      : metric.trend === "down"
        ? "text-red-500"
        : "text-gray-400";

  return (
    <div className="rounded-xl border border-border bg-card p-3 min-w-[120px]">
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] text-muted truncate">{metric.label}</span>
        {metric.trend && <TrendIcon className={"h-3 w-3 shrink-0 " + trendColor} />}
      </div>
      <div className="mt-1 text-base font-bold text-text truncate">{metric.formatted}</div>
      {metric.changePercent !== undefined && (
        <div className={"text-[10px] font-medium " + (metric.changePercent >= 0 ? "text-green-500" : "text-red-500")}>
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
export function AiCommerceCopilot({ role = "customer", compact = false }: AiCommerceCopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showBriefing, setShowBriefing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg: Message = {
        id: "welcome",
        role: "assistant",
        content: role === "admin"
          ? "Good morning, Admin. I'm your Marketplace Intelligence Copilot. I have live access to your marketplace data.\n\nHere's what needs your attention today."
          : role === "seller"
          ? "Welcome Seller! I'm your Business Intelligence Copilot. Ask me about sales, forecasts, or store health."
          : "Hi there! I'm your ShopNest Smart Shopping Copilot. I can help you find products, compare items, or build a budget setup.",
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
    }
  }, [role]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

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

    try {
      let response: CopilotResponse | BasicCopilotResponse;

      if (role === "admin") {
        response = await askAdminCopilot(prompt.trim());
      } else {
        const basicRes = await askCommerceCopilot(prompt.trim(), role);
        response = {
          answer: basicRes.answer,
          summary: basicRes.answer.substring(0, 100),
          intent: "GENERAL",
          confidence: 0.8,
          timeRange: { field: "created_at", from: "", to: "", label: "all time" },
          metrics: [],
          insights: [],
          sources: [],
          suggestedActions: basicRes.suggestedActions || [],
          isFallback: false,
        };
      }

      const assistantMessage: Message = {
        id: "assistant-" + Date.now(),
        role: "assistant",
        content: response.answer,
        data: response as CopilotResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev.slice(0, -1), assistantMessage]);
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
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full " +
          (isUser ? "bg-primary text-white" : "bg-accent text-white")
        }>
          {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
        </div>

        {/* Content */}
        <div className={"flex-1 max-w-[90%] " + (isUser ? "flex flex-col items-end" : "")}>
          {m.isLoading ? (
            <div className="flex items-center gap-2 rounded-xl bg-muted-bg p-3 text-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span className="text-xs">Analyzing marketplace data...</span>
            </div>
          ) : (
            <>
              {/* Message bubble */}
              <div className={
                "rounded-xl p-3 text-xs leading-relaxed " +
                (isUser
                  ? "bg-primary text-white font-medium"
                  : "bg-muted-bg text-text border border-border/60")
              }>
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>

              {/* Error */}
              {m.error && (
                <div className="mt-1.5 rounded-lg bg-red-500/10 p-2 text-[10px] text-red-500 border border-red-500/20">
                  {m.error}
                </div>
              )}

              {/* Data-rich response for admin */}
              {m.data && role === "admin" && (
                <div className="mt-2 space-y-3">
                  {/* Executive briefing style for overview/briefing intents */}
                  {(m.data.intent === "EXECUTIVE_SUMMARY" || m.data.intent === "MARKETPLACE_OVERVIEW") && showBriefing ? (
                    <ExecutiveBriefing data={m.data} />
                  ) : (
                    <>
                      {/* Metrics */}
                      {m.data.metrics && m.data.metrics.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
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
                      {m.data.suggestedActions.map((action, i) => (
                        <a
                          key={i}
                          href={action.targetUrl || "#"}
                          className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                        >
                          {action.label}
                          <ChevronRight className="h-2.5 w-2.5" />
                        </a>
                      ))}
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

              {/* Basic copilot actions for non-admin */}
              {m.data?.suggestedActions && m.data.suggestedActions.length > 0 && role !== "admin" && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.data.suggestedActions.map((act, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend("Tell me more about " + act.label)}
                      className="rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary hover:bg-primary/20 transition-colors"
                    >
                      {act.label}
                    </button>
                  ))}
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
      { label: "Build gaming setup", query: "Build a complete gaming setup under ৳50,000" },
      { label: "Check compatibility", query: "Check compatibility between Laptop and DDR5 RAM" },
      { label: "Find coupons", query: "Find best available coupons for my cart" },
    ],
    seller: [
      { label: "Sales forecast", query: "What is my 30-day projected sales forecast?" },
      { label: "Campaign sim", query: "Simulate a 15% discount campaign for 7 days" },
      { label: "Store health", query: "How can I improve my store health score to 95+?" },
    ],
    admin: ADMIN_QUICK_ACTIONS,
  };

  return (
    <>
      {/* Floating Copilot Launcher Button */}
      {!compact && (
        <button
          type="button"
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-primary via-indigo-600 to-accent px-5 py-3.5 text-sm font-black text-white shadow-2xl transition hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Open AI Admin Copilot"
        >
          <span className="text-lg">✨</span>
          <span>AI {role.toUpperCase()} COPILOT</span>
        </button>
      )}

      {/* Slide-out Copilot Drawer */}
      {(isOpen || compact) && (
        <div
          className={
            compact
              ? "rounded-2xl border border-border bg-surface p-4 shadow-sm"
              : "fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end bg-black/50 backdrop-blur-xs p-4 sm:p-6"
          }
          onClick={(e) => {
            if (!compact && e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={
              compact
                ? "w-full space-y-4"
                : "w-full max-w-2xl rounded-3xl border border-border bg-surface shadow-2xl flex flex-col " +
                  (isMinimized ? "h-auto" : "h-[90vh] max-h-[700px]")
            }
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-xl">
                  ✨
                </div>
                <div>
                  <h3 className="font-bold text-text flex items-center gap-2">
                    ShopNest {role === "admin" ? "Admin" : role === "seller" ? "Seller" : "Shopping"} Copilot
                  </h3>
                  <p className="text-[10px] font-medium text-muted flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    {role === "admin" ? "Live marketplace context" : "AI-Powered Assistant"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {!compact && (
                  <>
                    <button
                      onClick={() => setIsMinimized(!isMinimized)}
                      className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-muted-bg hover:text-text transition cursor-pointer"
                      title="Minimize"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={clearConversation}
                      className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-muted-bg hover:text-text transition cursor-pointer"
                      title="Clear conversation"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-muted-bg hover:text-text transition cursor-pointer"
                      title="Close"
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
                <div className="flex-1 overflow-y-auto space-y-4 p-4">
                  <AnimatePresence mode="popLayout">
                    {messages.map((m) => renderMessage(m))}
                  </AnimatePresence>

                  {loading && (
                    <div className="flex items-center gap-2 text-xs text-muted font-semibold pl-2">
                      <span className="animate-spin text-sm">✨</span>
                      <span>
                        {role === "admin" ? "Analyzing marketplace intelligence..." : "Thinking..."}
                      </span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions / Starter Prompts */}
                {messages.length <= 2 && (
                  <div className="px-4 pb-2">
                    <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">
                      {role === "admin" ? "Quick Intelligence" : "Quick Prompts"}
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {(quickPrompts[role] || quickPrompts.customer).map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSend(p.query)}
                          className="shrink-0 flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-muted-bg border border-border px-3 py-1.5 text-[10px] font-semibold text-muted hover:text-text hover:border-primary/40 transition cursor-pointer"
                        >
                          {p.icon && <p.icon className="h-3 w-3" />}
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Form */}
                <div className="border-t border-border p-4">
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
                        role === "admin"
                          ? "Ask about revenue, sellers, risks, anomalies..."
                          : `Ask ${role} copilot anything...`
                      }
                      className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || !query.trim()}
                      className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-primary/90 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </form>
                  <div className="mt-2 flex items-center justify-between text-[9px] text-muted">
                    <span className="flex items-center gap-1">
                      <Shield className="h-2.5 w-2.5" />
                      {role === "admin" ? "Admin-only access · Secured" : "AI-powered assistance"}
                    </span>
                    <span>
                      {role === "admin" ? "Real-time database queries" : "Conversational AI"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
}
