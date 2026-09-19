"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { askDeliveryCopilot, DeliveryCopilotResponse } from "@/lib/api/delivery";
import {
  FaRobot,
  FaTimes,
  FaPaperPlane,
  FaSyncAlt,
  FaLightbulb,
  FaExclamationTriangle,
  FaCompass,
  FaExternalLinkAlt,
  FaTrashAlt,
} from "react-icons/fa";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  responseMeta?: DeliveryCopilotResponse;
  timestamp: string;
}

const QUICK_PROMPTS = [
  { label: "📍 Customer phone dhorche na", text: "Customer phone dhorche na, 2 bar call disi. Ekhon amar ki kora uchit?" },
  { label: "⚡ Kon order age deliver korbo?", text: "Which delivery order should I deliver first?" },
  { label: "📦 Capacity status koto?", text: "Amader current vehicle capacity koto ache ar koto parcel nite parbo?" },
  { label: "🏪 Pickup er directions", text: "Ager order er store pickup directions and contact details ki?" },
  { label: "📊 Today's performance", text: "Ajke koyta delivery complete korechi ar total earnings koto?" },
];

export function DeliveryCopilotFloatingWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-greeting",
      role: "assistant",
      content:
        "Shobaike Shagotom! I am your AI Delivery Operations Copilot. You can talk to me in English, Bangla, or Banglish (e.g., 'Customer call dhorche na', 'Kon order age dibo?'). How can I assist your route right now?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery("");
    setIsLoading(true);

    try {
      // Build conversation history for multi-turn understanding (pronoun resolution)
      const conversationHistory = messages
        .filter((m) => m.id !== "initial-greeting")
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await askDeliveryCopilot(query, conversationHistory);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: res.answer || "I have analyzed your request. Here are the operational details.",
        responseMeta: res,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Maaf korben! I encountered an issue connecting to the logistics copilot. Please verify your connection or try again in a moment.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `initial-greeting-${Date.now()}`,
        role: "assistant",
        content: "Chat history cleared. How can I assist your route right now?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handleActionClick = (action: { label: string; action: string; targetUrl?: string }) => {
    if (action.targetUrl) {
      router.push(action.targetUrl);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* ─── Floating Top-Right Trigger Button ──────────────────────────────── */}
      <div className="fixed top-20 right-4 sm:right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-black text-xs shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
          aria-label="Open AI Delivery Copilot"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300" />
          </span>
          <FaRobot className="text-sm group-hover:rotate-12 transition-transform duration-200" />
          <span className="tracking-wide">AI Delivery Copilot</span>
          <span className="hidden sm:inline-block text-[10px] uppercase font-bold bg-white/20 px-1.5 py-0.5 rounded-full">
            LIVE
          </span>
        </button>
      </div>

      {/* ─── Backdrop Overlay ──────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ─── Slide-Over Drawer Panel ────────────────────────────────────────── */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md sm:max-w-lg bg-background border-l border-border z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <FaRobot className="text-base" />
            </div>
            <div>
              <h2 className="text-sm font-black text-foreground flex items-center gap-1.5">
                <span>AI Delivery Copilot</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                  Multilingual
                </span>
              </h2>
              <p className="text-[11px] text-muted">
                English • বাংলা • Banglish route assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleClearHistory}
              title="Clear chat"
              className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-muted-bg transition cursor-pointer"
            >
              <FaTrashAlt className="text-xs" />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-muted-bg transition cursor-pointer"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 bg-muted-bg/60 border-b border-border/50 overflow-x-auto flex gap-1.5 scrollbar-none">
          {QUICK_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(p.text)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-card border border-border/60 hover:border-primary text-muted hover:text-foreground transition whitespace-nowrap cursor-pointer shrink-0 disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            const meta = msg.responseMeta;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0 text-xs mt-1 border border-indigo-500/20">
                    <FaRobot />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-sm space-y-2 ${
                    isUser
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-card border border-border text-foreground rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                  {/* Operational Metrics (if provided) */}
                  {!isUser && meta?.metrics && meta.metrics.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
                      {meta.metrics.map((m, idx) => (
                        <div key={idx} className="bg-muted-bg/50 p-2 rounded-xl border border-border/30">
                          <span className="text-[10px] text-muted block">{m.label}</span>
                          <span className="text-xs font-black text-foreground">{m.formatted}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Insights (e.g., delays or urgent reminders) */}
                  {!isUser && meta?.insights && meta.insights.length > 0 && (
                    <div className="pt-2 border-t border-border/40 space-y-1.5">
                      {meta.insights.map((ins, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-xl text-[11px] flex items-start gap-1.5 ${
                            ins.severity === "critical" || ins.severity === "high"
                              ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                              : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          }`}
                        >
                          <FaLightbulb className="shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">{ins.title}: </span>
                            <span>{ins.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggested Navigation Actions (Safe Actions Only) */}
                  {!isUser && meta?.suggestedActions && meta.suggestedActions.length > 0 && (
                    <div className="pt-2 border-t border-border/40 flex flex-wrap gap-1.5">
                      {meta.suggestedActions.map((act, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleActionClick(act)}
                          className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>{act.label}</span>
                          <FaExternalLinkAlt className="text-[9px]" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] opacity-60 text-right">{msg.timestamp}</div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0 text-xs mt-1 border border-indigo-500/20">
                <FaRobot />
              </div>
              <div className="bg-card border border-border p-3 rounded-2xl rounded-bl-none text-xs text-muted flex items-center gap-2">
                <FaSyncAlt className="animate-spin text-primary" />
                <span>Thinking & analyzing route telemetry...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Drawer Footer Input Form */}
        <div className="p-4 border-t border-border bg-card/60 backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask in English or Banglish (e.g. 'Ager order ta kothay?')..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              {isLoading ? <FaSyncAlt className="animate-spin text-xs" /> : <FaPaperPlane className="text-xs" />}
            </button>
          </form>
          <p className="text-[10px] text-muted text-center mt-2">
            AI Copilot gives routing & dispatch advice. Actions require your confirmation.
          </p>
        </div>
      </div>
    </>
  );
}
