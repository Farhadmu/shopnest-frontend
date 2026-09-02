"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Database,
  Shield,
  Activity,
  Bot,
  User,
  Loader2,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { askAdminCopilot, CopilotResponse, CopilotMetric, CopilotInsight } from "@/lib/api/admin-copilot";
import { AiBadge } from "@/components/dashboard/DashboardUI";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  data?: CopilotResponse;
  isLoading?: boolean;
  error?: string;
}

const QUICK_QUESTIONS = [
  "What is our current GMV and revenue?",
  "Show me the top risk sellers",
  "Any security incidents today?",
  "Analyze category performance",
  "What anomalies were detected?",
  "Show marketplace health overview",
];

function MetricCard({ metric }: { metric: CopilotMetric }) {
  const TrendIcon = metric.trend === "up" ? TrendingUp : metric.trend === "down" ? TrendingDown : Minus;
  const trendColor =
    metric.trend === "up"
      ? "text-green-500"
      : metric.trend === "down"
        ? "text-red-500"
        : "text-gray-400";

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{metric.label}</span>
        <TrendIcon className={"h-3 w-3 " + trendColor} />
      </div>
      <div className="mt-1 text-lg font-semibold text-text">{metric.formatted}</div>
      {metric.changePercent !== undefined && (
        <div className={"text-xs " + (metric.changePercent >= 0 ? "text-green-500" : "text-red-500")}>
          {metric.changePercent >= 0 ? "+" : ""}
          {metric.changePercent}%
        </div>
      )}
    </div>
  );
}

function InsightCard({ insight }: { insight: CopilotInsight }) {
  const severityConfig: Record<string, { icon: typeof Info; color: string; bg: string }> = {
    info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10" },
    low: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
    medium: { icon: AlertCircle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    high: { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10" },
    critical: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
  };

  const config = severityConfig[insight.severity] || severityConfig.info;
  const Icon = config.icon;

  return (
    <div className={"rounded-lg border border-border p-3 " + config.bg}>
      <div className="flex items-start gap-2">
        <Icon className={"h-4 w-4 mt-0.5 " + config.color} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-text">{insight.title}</div>
          <div className="text-xs text-muted mt-1">{insight.description}</div>
          {insight.evidence && insight.evidence.length > 0 && (
            <div className="mt-2 space-y-1">
              {insight.evidence.map((ev, i) => (
                <div key={i} className="text-xs text-muted flex justify-between">
                  <span>{ev.fact}</span>
                  <span className="font-medium text-text">{ev.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SourceBadge({ source }: { source: { name: string; type: string; recordCount?: number } }) {
  const typeIcons: Record<string, typeof Database> = {
    database: Database,
    analytics: Activity,
    security: Shield,
    telemetry: Activity,
  };
  const Icon = typeIcons[source.type] || Database;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs text-muted">
      <Icon className="h-3 w-3" />
      <span>{source.name}</span>
      {source.recordCount !== undefined && (
        <span className="text-text font-medium">({"(" + source.recordCount + ")"})</span>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const bubbleClass = isUser
    ? "rounded-xl p-3 text-sm bg-primary text-white"
    : "rounded-xl p-3 text-sm bg-surface border border-border text-text";
  const containerClass = isUser
    ? "flex-1 max-w-[85%] flex flex-col items-end"
    : "flex-1 max-w-[85%]";
  const avatarClass = isUser
    ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white"
    : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={"flex gap-3 " + (isUser ? "flex-row-reverse" : "flex-row")}
    >
      <div className={avatarClass}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={containerClass}>
        {message.isLoading ? (
          <div className="flex items-center gap-2 rounded-xl bg-surface p-3 text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Analyzing marketplace data...</span>
          </div>
        ) : (
          <>
            <div className={bubbleClass}>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>

            {message.error && (
              <div className="mt-2 rounded-lg bg-red-500/10 p-2 text-xs text-red-500">
                {message.error}
              </div>
            )}

            {message.data && !message.data.isFallback && (
              <div className="mt-1">
                <AiBadge isFallback={false} />
              </div>
            )}

            {message.data?.isFallback && (
              <div className="mt-1">
                <AiBadge isFallback={true} />
              </div>
            )}

            {message.data && (
              <div className="mt-3 space-y-4">
                {message.data.metrics.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted mb-2">Key Metrics</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {message.data.metrics.slice(0, 8).map((m, i) => (
                        <MetricCard key={i} metric={m} />
                      ))}
                    </div>
                  </div>
                )}

                {message.data.insights.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted mb-2">Insights</div>
                    <div className="space-y-2">
                      {message.data.insights.slice(0, 5).map((insight, i) => (
                        <InsightCard key={i} insight={insight} />
                      ))}
                    </div>
                  </div>
                )}

                {message.data.sources.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted mb-2">Data Sources</div>
                    <div className="flex flex-wrap gap-2">
                      {message.data.sources.map((source, i) => (
                        <SourceBadge key={i} source={source} />
                      ))}
                    </div>
                  </div>
                )}

                {message.data.suggestedActions.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted mb-2">Suggested Actions</div>
                    <div className="flex flex-wrap gap-2">
                      {message.data.suggestedActions.map((action, i) => (
                        <a
                          key={i}
                          href={action.targetUrl || "#"}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                        >
                          {action.label}
                          <ChevronRight className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted">
                  Intent: <span className="font-medium">{message.data.intent}</span> · Confidence:{" "}
                  <span className="font-medium">{Math.round(message.data.confidence * 100)}%</span> ·
                  Period: <span className="font-medium">{message.data.timeRange.label}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function AdminCopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "I'm your ShopNest Marketplace Intelligence Copilot. I analyze real-time marketplace data to help you make informed decisions.\n\nTry asking about revenue, seller performance, security incidents, anomalies, or category analytics.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (query: string) => {
    if (!query.trim() || isLoading) return;

    const userMessage: Message = {
      id: "user-" + Date.now(),
      role: "user",
      content: query.trim(),
    };

    const loadingMessage: Message = {
      id: "loading-" + Date.now(),
      role: "assistant",
      content: "",
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await askAdminCopilot(query.trim());

      const assistantMessage: Message = {
        id: "assistant-" + Date.now(),
        role: "assistant",
        content: response.answer,
        data: response,
      };

      setMessages((prev) => [...prev.slice(0, -1), assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: "error-" + Date.now(),
        role: "assistant",
        content: "I encountered an error while processing your request. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };

      setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(input);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text">Marketplace Intelligence Copilot</h2>
          <p className="text-xs text-muted">AI-powered analysis of real marketplace data</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 2 && (
        <div className="border-t border-border px-4 py-3">
          <div className="text-xs font-medium text-muted mb-2">Quick Questions</div>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSubmit(q)}
                className="rounded-full bg-surface px-3 py-1.5 text-xs text-text hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about marketplace performance, revenue, risks..."
            className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSubmit(input)}
            disabled={!input.trim() || isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted">
          <Shield className="h-3 w-3" />
          <span>Secured admin access · Data is never stored or shared</span>
        </div>
      </div>
    </div>
  );
}
