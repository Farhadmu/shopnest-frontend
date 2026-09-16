"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { deliveryManDashboardLinks } from "@/lib/constants/dashboard-nav";
import { askDeliveryCopilot, type DeliveryCopilotResponse } from "@/lib/api/delivery";
import {
  FaRobot,
  FaPaperPlane,
  FaLightbulb,
  FaChartLine,
  FaShieldAlt,
  FaCompass,
  FaSyncAlt,
  FaUser,
  FaMotorcycle,
  FaInfoCircle,
} from "react-icons/fa";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  copilotData?: DeliveryCopilotResponse;
  timestamp: string;
}

const SUGGESTED_PROMPTS = [
  "How many deliveries can I accept with my current vehicle capacity?",
  "Summarize my earnings and completed deliveries for today.",
  "Which service zones have the highest order volume right now?",
  "What safety guidelines should I follow during rain or heavy traffic?",
  "What is my current customer trust rating and delivery speed?",
];

export default function DeliveryCopilotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your AI Delivery Copilot. I can analyze your active deliveries, vehicle capacity limits, earnings metrics, and high-demand route zones. How can I help you today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const text = (queryText || inputQuery).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await askDeliveryCopilot(text, history);

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: response.answer,
        copilotData: response,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error?.message ||
            "I encountered an issue processing your query with the delivery database. Please try again.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell
      role="Delivery Man"
      title="AI Delivery Copilot"
      subtitle="Intelligent advisory assistant for workload optimization, route guidance, and earnings insights."
      links={deliveryManDashboardLinks}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Chat Window */}
        <div className="flex flex-col h-[700px] rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-border p-4 bg-surface/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white text-base shadow-sm">
                <FaRobot />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <span>AI Copilot Engine</span>
                  <span className="rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-black">
                    ONLINE
                  </span>
                </h3>
                <p className="text-[11px] text-muted">ShopNest Real-Time Logistics Telemetry</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setMessages([
                  {
                    role: "assistant",
                    content:
                      "Chat reset. How can I assist your delivery routes or performance metrics?",
                    timestamp: new Date().toLocaleTimeString(),
                  },
                ])
              }
              className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-muted hover:text-foreground transition cursor-pointer"
            >
              Reset Chat
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              const copilotData = msg.copilotData;

              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs shrink-0 ${
                      isUser
                        ? "bg-primary text-white"
                        : "bg-surface border border-border text-primary"
                    }`}
                  >
                    {isUser ? <FaUser size={10} /> : <FaRobot size={12} />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs space-y-2.5 ${
                      isUser
                        ? "bg-primary text-white shadow-sm"
                        : "bg-surface border border-border text-foreground"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-line font-medium">{msg.content}</p>

                    {/* Copilot Metrics Cards if present */}
                    {copilotData?.metrics && copilotData.metrics.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                        {copilotData.metrics.map((metric, mIdx) => (
                          <div
                            key={mIdx}
                            className="rounded-xl bg-card border border-border/80 p-2.5 text-foreground"
                          >
                            <span className="text-[10px] text-muted block font-bold uppercase truncate">
                              {metric.label}
                            </span>
                            <span className="text-sm font-black text-primary">{metric.formatted}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Copilot Insights if present */}
                    {copilotData?.insights && copilotData.insights.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-border/60">
                        {copilotData.insights.map((insight, inIdx) => (
                          <div
                            key={inIdx}
                            className={`rounded-xl p-2.5 text-[11px] border ${
                              insight.severity === "high"
                                ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                                : insight.severity === "medium"
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                                : "bg-primary/5 border-primary/20 text-primary"
                            }`}
                          >
                            <span className="font-bold block">{insight.title}</span>
                            <span className="text-muted">{insight.description}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suggested Actions if present */}
                    {copilotData?.suggestedActions && copilotData.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/60">
                        {copilotData.suggestedActions.map((action, actIdx) => (
                          <Link
                            key={actIdx}
                            href={action.targetUrl || "/dashboard/delivery"}
                            className="rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-[10px] font-bold text-primary hover:bg-primary/20 transition"
                          >
                            {action.label} →
                          </Link>
                        ))}
                      </div>
                    )}

                    <span className="block text-[9px] text-muted/80 text-right">{msg.timestamp}</span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface border border-border text-primary text-xs">
                  <FaRobot size={12} />
                </div>
                <div className="rounded-2xl border border-border bg-surface p-4 text-xs text-muted flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] font-bold ml-1">Analyzing database telemetry...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <div className="border-t border-border p-3 bg-surface/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask AI Copilot about routes, capacity, or earnings..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={loading}
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-foreground focus:border-primary outline-none"
              />
              <button
                type="submit"
                disabled={loading || !inputQuery.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-white hover:bg-primary-hover shadow-md shadow-primary/20 transition cursor-pointer disabled:opacity-50"
              >
                <FaPaperPlane size={10} />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Prompts & Advisory Principles */}
        <div className="space-y-6">
          <Panel title="💡 Suggested Inquiries">
            <div className="space-y-2">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                  className="w-full text-left rounded-xl border border-border bg-surface/50 p-2.5 text-xs font-medium text-foreground hover:border-primary hover:bg-primary/5 transition cursor-pointer disabled:opacity-50"
                >
                  &quot;{prompt}&quot;
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="🛡️ Copilot Operational Rules">
            <div className="space-y-3 text-xs text-muted leading-relaxed">
              <div className="flex items-start gap-2">
                <FaInfoCircle className="text-primary shrink-0 mt-0.5" />
                <p>
                  <strong>Advisory Only:</strong> AI Copilot gives recommendations but never auto-assigns orders or alters live state without your action.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <FaMotorcycle className="text-amber-500 shrink-0 mt-0.5" />
                <p>
                  <strong>Vehicle Limits:</strong> Motorcycle (3), Bicycle (1), Car (5), Van (10) active orders max.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <FaShieldAlt className="text-emerald-500 shrink-0 mt-0.5" />
                <p>
                  <strong>Customer Privacy:</strong> Live GPS is only exposed to customers during active transit.
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}
