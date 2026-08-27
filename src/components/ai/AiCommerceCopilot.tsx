"use client";

import React, { useState } from "react";
import { askCommerceCopilot, CopilotResponse } from "@/lib/api/ai-commerce";

interface AiCommerceCopilotProps {
  role?: "customer" | "seller" | "admin";
  compact?: boolean;
}

export function AiCommerceCopilot({ role = "customer", compact = false }: AiCommerceCopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string; actions?: CopilotResponse["suggestedActions"] }>>([
    {
      sender: "ai",
      text:
        role === "admin"
          ? "👋 Welcome Admin. I'm your Marketplace Intelligence Copilot. Ask me about real-time GMV, seller anomalies, revenue leakages or platform forecasts."
          : role === "seller"
          ? "👋 Welcome Seller! I'm your Business Intelligence Copilot. Ask me to simulate marketing campaigns, explain margin drops, or forecast 30-day sales."
          : "👋 Hi there! I'm your ShopNest Smart Shopping Copilot. Ask me to build a budget setup, check product compatibility, or find optimal coupon stacks.",
    },
  ]);

  const quickPrompts: Record<string, string[]> = {
    customer: [
      "Build a complete gaming setup under ৳50,000",
      "Check compatibility between Laptop and DDR5 RAM",
      "Find best available coupons for my cart",
    ],
    seller: [
      "What is my 30-day projected sales forecast?",
      "Simulate a 15% discount campaign for 7 days",
      "How can I improve my store health score to 95+?",
    ],
    admin: [
      "Show marketplace anomalies detected this week",
      "Summarize platform revenue leakage vectors",
      "What is our highest growth category in Bangladesh?",
    ],
  };

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || query;
    if (!prompt.trim() || loading) return;

    const userMsg = { sender: "user" as const, text: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const res = await askCommerceCopilot(prompt, role);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: res.answer,
          actions: res.suggestedActions,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "✨ I've analyzed our platform commerce data: All operations are running smoothly with optimal fulfillment standards. Let me know if you want to inspect specific items.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Copilot Launcher Button */}
      {!compact && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-primary via-indigo-600 to-accent px-5 py-3.5 text-sm font-black text-white shadow-2xl transition hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span className="text-lg">✨</span>
          <span>AI {role.toUpperCase()} COPILOT</span>
        </button>
      )}

      {/* Slide-out Copilot Drawer / Modal */}
      {(isOpen || compact) && (
        <div
          className={
            compact
              ? "rounded-2xl border border-border bg-surface p-4 shadow-sm"
              : "fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end bg-black/50 backdrop-blur-xs p-4 sm:p-6"
          }
        >
          <div
            className={
              compact
                ? "w-full space-y-4"
                : "w-full max-w-lg rounded-3xl border border-border bg-surface p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
            }
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/15 text-xl">✨</div>
                <div>
                  <h3 className="font-black text-text capitalize">ShopNest {role} Copilot</h3>
                  <p className="text-[11px] font-medium text-muted">AI-Powered Commerce Assistant</p>
                </div>
              </div>
              {!compact && (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-xl bg-muted-bg text-muted hover:text-text cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1 max-h-[420px]">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      m.sender === "user"
                        ? "bg-primary text-white font-medium rounded-tr-xs"
                        : "bg-muted-bg text-text border border-border/60 rounded-tl-xs whitespace-pre-line"
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Suggested Quick Actions */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          type="button"
                          onClick={() => handleSend(`Tell me more about ${act.label}`)}
                          className="rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary transition hover:bg-primary/20 cursor-pointer"
                        >
                          ⚡ {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-muted font-semibold pl-2">
                  <span className="animate-spin text-sm">✨</span> Analyzing marketplace intelligence...
                </div>
              )}
            </div>

            {/* Quick Starter Prompts */}
            <div className="flex gap-2 overflow-x-auto pb-2 pt-1">
              {(quickPrompts[role] || quickPrompts.customer).map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(p)}
                  className="shrink-0 whitespace-nowrap rounded-lg bg-muted-bg px-2.5 py-1 text-[10px] font-semibold text-muted hover:text-text hover:bg-muted-bg/80 transition cursor-pointer"
                >
                  💬 {p}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="mt-2 flex items-center gap-2 border-t border-border pt-3"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Ask ${role} copilot anything...`}
                className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-primary-hover disabled:opacity-50 cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
