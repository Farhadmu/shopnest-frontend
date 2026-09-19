"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { askDeliveryCopilot, DeliveryCopilotResponse } from "@/lib/api/delivery";
import { askUnifiedAiCore, AIEvidenceItem, AIActionItem } from "@/lib/api/ai-core";
import { AiActionConfirmationModal } from "../ai/AiActionConfirmationModal";
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
  FaShieldAlt,
  FaDatabase,
  FaCheckCircle,
} from "react-icons/fa";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  responseMeta?: DeliveryCopilotResponse;
  evidence?: AIEvidenceItem[];
  actions?: AIActionItem[];
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
  const [selectedAction, setSelectedAction] = useState<AIActionItem | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [typingPhase, setTypingPhase] = useState(0);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-greeting",
      role: "assistant",
      content:
        "Shobaike Shagotom! I am your AI Logistics Radar & Operations Copilot. You can talk to me in English, Bangla, or Banglish (e.g., 'Customer call dhorche na', 'Kon order age dibo?'). How can I assist your route right now?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const TYPING_PHASES = [
    "Analyzing GPS location & route telemetry...",
    "Verifying courier mission & dispatch state...",
    "Synthesizing optimal route & incident advice...",
  ];

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setTypingPhase((p) => (p + 1) % TYPING_PHASES.length);
    }, 1600);
    return () => clearInterval(interval);
  }, [isLoading]);

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
      // First attempt: Call Unified AI Intelligence Core for real-time logistics telemetry & Anti-IDOR ground truth
      try {
        const unifiedRes = await askUnifiedAiCore({
          prompt: query,
          aiType: "DELIVERY_COPILOT",
        });

        if (unifiedRes && unifiedRes.answer) {
          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: unifiedRes.answer,
            evidence: unifiedRes.evidence,
            actions: unifiedRes.actions,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          return;
        }
      } catch (unifiedErr) {
        console.warn("[DeliveryCopilot] Unified core fallback to dedicated delivery copilot endpoint:", unifiedErr);
      }

      // Fallback to existing delivery copilot endpoint
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

  const handleActionClick = (action: any) => {
    const actionItem: AIActionItem = {
      id: action.action || `action-${Date.now()}`,
      riskLevel: "LOW_RISK_WRITE",
      requiresConfirmation: true,
      action: action.action || "NAVIGATE",
      label: action.label || "Execute Navigation",
      description: `Delivery Copilot suggests navigating to: ${action.targetUrl || action.label}`,
      targetUrl: action.targetUrl || action.payload?.url,
      payload: action.payload || {},
    };
    setSelectedAction(actionItem);
    setIsActionModalOpen(true);
  };

  const handleConfirmAction = async (action: AIActionItem) => {
    const url = action.targetUrl || (action.payload?.url as string);
    if (url) {
      router.push(url);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* ─── Floating Top-Right Trigger Button ──────────────────────────────── */}
      <div className="fixed top-20 right-3 sm:right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 sm:gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-black text-xs shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20 backdrop-blur-md"
          aria-label="Open AI Delivery Copilot"
        >
          <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-white" />
          </span>
          <FaCompass className="text-xs sm:text-sm group-hover:rotate-45 transition-transform duration-200 text-cyan-200" />
          <span className="tracking-wide text-[11px] sm:text-xs">Logistics Copilot</span>
          <span className="hidden sm:inline-block text-[10px] uppercase font-bold bg-white/20 px-1.5 py-0.5 rounded-full border border-white/20">
            GPS RADAR
          </span>
        </button>
      </div>

      {/* ─── Backdrop Overlay ──────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ─── Slide-Over Drawer Panel (Ultra-Glassmorphic) ────────────────────── */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-full sm:max-w-md md:max-w-lg bg-slate-950/90 text-slate-100 border-l border-cyan-500/30 backdrop-blur-2xl z-50 flex flex-col shadow-[0_25px_80px_rgba(0,0,0,0.8)] transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Ambient Mesh Glow Orbs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-transparent blur-3xl opacity-50" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-tr from-indigo-500/20 via-cyan-500/10 to-transparent blur-3xl opacity-40" />

        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-900/40 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <FaCompass className="text-base" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>AI Logistics Copilot</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30">
                  Multilingual
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Live GPS • Route Optimization • Incidents
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

                  {/* Unified AI Evidence (Verified DB Telemetry) */}
                  {!isUser && msg.evidence && msg.evidence.length > 0 && (
                    <div className="pt-2 border-t border-border/40 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <FaShieldAlt className="text-xs" />
                        <span>VERIFIED DISPATCH & ROUTE TELEMETRY</span>
                      </div>
                      <div className="space-y-1">
                        {msg.evidence.map((ev, idx) => (
                          <div
                            key={idx}
                            className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2 text-[11px] leading-relaxed"
                          >
                            <div className="font-semibold text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
                              <span>{ev.fact}</span>
                              <span className="text-[9px] opacity-75 uppercase font-mono px-1 rounded bg-emerald-500/10">
                                {ev.type}
                              </span>
                            </div>
                            <div className="text-muted text-[10.5px] mt-0.5">
                              Value: <strong className="text-foreground">{String(ev.value)}</strong> &bull; Source: {ev.source}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unified Actions */}
                  {!isUser && msg.actions && msg.actions.length > 0 && (
                    <div className="pt-2 border-t border-border/40 flex flex-wrap gap-1.5">
                      {msg.actions.map((act, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            const url = act.targetUrl || (act.payload?.url as string);
                            if (url) {
                              router.push(url);
                              setIsOpen(false);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>{act.label}</span>
                          <FaExternalLinkAlt className="text-[9px]" />
                        </button>
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

                  {/* Kinetic Waveform Typing State */}
                  {isLoading && (
                    <div className="flex gap-3 justify-start items-start">
                      <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shrink-0 text-xs mt-1 shadow-md animate-pulse">
                        <FaCompass />
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-2xl p-3.5 shadow-xl space-y-2 max-w-[85%]">
                        <div className="flex items-center gap-2.5">
                          <div className="flex gap-1.5 items-center">
                            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-slate-200 via-white to-slate-400 bg-clip-text text-transparent">
                            {TYPING_PHASES[typingPhase]}
                          </span>
                        </div>
                        <div className="h-1.5 w-44 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 animate-pulse w-full" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Drawer Footer Input Form */}
                <div className="p-4 border-t border-white/10 bg-slate-900/50 backdrop-blur-md relative z-10">
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
                      className="flex-1 px-4 py-2.5 rounded-2xl border border-white/15 bg-black/40 text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400/40 disabled:opacity-50 placeholder:text-slate-400 backdrop-blur-sm"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !inputQuery.trim()}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white text-xs font-black hover:scale-105 active:scale-95 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
                    >
                      {isLoading ? <FaSyncAlt className="animate-spin text-xs" /> : <FaPaperPlane className="text-xs" />}
                    </button>
                  </form>
                  <p className="text-[10px] text-slate-400 text-center mt-2 font-mono">
                    Verified Dispatch Telemetry &bull; Safe Action Confirmation Active
                  </p>
                </div>
              </div>

      {/* Action Confirmation Modal for Courier Actions */}
      <AiActionConfirmationModal
        isOpen={isActionModalOpen}
        action={selectedAction}
        roleTheme="delivery"
        onClose={() => setIsActionModalOpen(false)}
        onConfirm={handleConfirmAction}
      />
    </>
  );
}

// Logistics telemetry refresh rate for active courier missions
export const DELIVERY_RADAR_TELEMETRY_INTERVAL_MS = 5000;

// Threshold for emergency route incident guidance
export const DELIVERY_INCIDENT_ESCALATION_CALLS = 2;
