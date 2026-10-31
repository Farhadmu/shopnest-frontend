"use client";

import { useState, useRef, useEffect } from "react";
import {
  askProcurementAnalyst,
  ProcurementChatResponse,
} from "@/lib/api/demandiq";
import {
  Bot,
  Send,
  User,
  Sparkles,
  ArrowRight,
  TrendingDown,
  AlertTriangle,
  FileSpreadsheet,
  PackageCheck,
  RefreshCw,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  responseObj?: ProcurementChatResponse;
  timestamp: string;
}

interface Props {
  onTriggerAction?: (actionType: string, payload?: any) => void;
}

export function ProcurementChatWidget({ onTriggerAction }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am **DemandIQ Procurement Analyst**. I continuously monitor your catalog velocity, stockout horizons, and supply chain lead times. Ask me any question about SKU risk, replenishment quantities, or disruption mitigation.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Which SKUs are at highest risk of stocking out this week?",
    "Calculate reorder quantities to maintain 98% service level",
    "How would a 7-day supplier delay impact our revenue?",
    "What is our total 30-day lost revenue if no reorders are placed?",
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await askProcurementAnalyst(textToSend, history);

      const botMsg: Message = {
        role: "assistant",
        content: response.answer,
        responseObj: response,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Procurement chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I encountered a temporary connection issue. However, your store inventory data remains intact. Please try again or select one of the quick prompts below.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[620px] flex-col rounded-2xl border border-border/60 bg-gradient-to-b from-card/95 via-card/80 to-card/50 shadow-md backdrop-blur-md overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border/40 bg-card/60 px-5 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
              DemandIQ RAG Procurement Analyst
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </h4>
            <p className="text-[10px] text-muted-foreground">
              Grounded in live inventory, burn rates & 98% service level EOQ calculations
            </p>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Bot className="h-3.5 w-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                m.role === "user"
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium"
                  : "border border-border/60 bg-card/80 text-foreground backdrop-blur-sm"
              }`}
            >
              {/* Message text with basic markdown rendering */}
              <div className="whitespace-pre-wrap space-y-1">
                {m.content.split("\n").map((line, lIdx) => {
                  if (line.startsWith("- ")) {
                    return (
                      <div key={lIdx} className="flex items-start gap-1.5 pl-1 my-0.5">
                        <span className="text-indigo-400 font-bold">&bull;</span>
                        <span>{line.replace("- ", "")}</span>
                      </div>
                    );
                  }
                  return <p key={lIdx}>{line}</p>;
                })}
              </div>

              {/* Summary Pills from AI */}
              {m.responseObj?.summaryPills && m.responseObj.summaryPills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-border/40 pt-2.5">
                  {m.responseObj.summaryPills.map((pill, pIdx) => (
                    <span
                      key={pIdx}
                      className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-500"
                    >
                      {pill.label}: <strong className="text-foreground">{pill.value}</strong>
                    </span>
                  ))}
                </div>
              )}

              {/* Data Citations from AI */}
              {m.responseObj?.citations && m.responseObj.citations.length > 0 && (
                <div className="mt-3 space-y-1.5 border-t border-border/40 pt-2.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Referenced SKUs</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {m.responseObj.citations.map((c, cIdx) => (
                      <div
                        key={cIdx}
                        className="rounded-lg border border-border/40 bg-card/40 p-2 text-[10px]"
                      >
                        <div className="flex items-center justify-between font-mono font-bold text-indigo-500">
                          <span>{c.sku}</span>
                          <span className="text-rose-500">{c.daysRemaining}d left</span>
                        </div>
                        <p className="font-medium text-foreground truncate mt-0.5">{c.title}</p>
                        <p className="text-muted-foreground mt-0.5">
                          Reorder: <strong className="text-foreground">+{c.recommendedReorderQty}</strong> units
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons from AI */}
              {m.responseObj?.suggestedActions && m.responseObj.suggestedActions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-border/40 pt-2.5">
                  {m.responseObj.suggestedActions.map((act, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => onTriggerAction?.(act.actionType, act.payload)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-semibold text-indigo-500 hover:bg-indigo-500/20 transition-colors"
                    >
                      <Sparkles className="h-3 w-3" />
                      {act.title}
                    </button>
                  ))}
                </div>
              )}

              <span className="mt-1 block text-right text-[9px] text-muted-foreground/70">
                {m.timestamp}
              </span>
            </div>

            {m.role === "user" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start items-center text-xs text-muted-foreground">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/60 px-4 py-2.5 shadow-sm backdrop-blur-sm">
              <span className="font-mono text-[11px] animate-pulse">
                Analyzing SKU burn rates & simulating replenishment horizons...
              </span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="border-t border-border/40 bg-card/30 p-2.5">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickPrompts.map((qp, qIdx) => (
            <button
              key={qIdx}
              onClick={() => handleSend(qp)}
              disabled={loading}
              className="shrink-0 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-[10px] font-medium text-muted-foreground hover:border-indigo-500/40 hover:text-indigo-500 hover:bg-indigo-500/5 transition-all disabled:opacity-50"
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 border-t border-border/40 bg-card/60 p-3 backdrop-blur-md"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about SKU velocity, stockout horizon, reorder calculation..."
          disabled={loading}
          className="flex-1 rounded-xl border border-border/60 bg-card px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
