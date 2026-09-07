"use client";

import React, { useState } from "react";
import { FiCpu, FiSend, FiUser, FiZap, FiX, FiHelpCircle } from "react-icons/fi";
import { askPersonalCommerceAssistant } from "@/lib/api/customer-intelligence-features";
import { AiBadge } from "@/components/dashboard/DashboardStates";

interface Message {
  role: "user" | "assistant";
  content: string;
  isFallback?: boolean;
}

const QUICK_PROMPTS = [
  "What products are in my wishlist?",
  "What did I order recently?",
  "What is my configured shopping budget?",
  "Can you recommend gift ideas for my budget?",
];

export function PersonalCommerceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your ShopNest Personal Commerce Copilot. I have authorized access to your private orders, wishlist, and budget tracking. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await askPersonalCommerceAssistant(userMsg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.answer, isFallback: res.isFallback },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I am having trouble connecting right now, but your orders and wishlist are safe and accessible in your dashboard tabs!",
          isFallback: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 z-40 px-4 py-3 bg-gradient-to-r from-primary via-indigo-600 to-accent text-white font-bold rounded-2xl shadow-xl shadow-primary/30 hover:scale-105 transition-all flex items-center gap-2 text-xs"
      >
        <FiZap className="animate-spin text-amber-300" />
        <span>Ask Personal AI</span>
      </button>

      {/* Assistant Modal/Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-lg bg-card border border-border sm:rounded-3xl rounded-t-3xl h-[85vh] sm:h-[600px] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border/80 flex items-center justify-between bg-primary/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center text-lg shadow-md shadow-primary/25">
                  <FiCpu />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-text">Personal Commerce Assistant</h4>
                    <AiBadge />
                  </div>
                  <span className="text-[10px] text-success font-semibold flex items-center gap-1">
                    ● Authorized Scoped Access
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-muted hover:text-foreground p-1.5 rounded-xl hover:bg-muted-bg"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 text-sm">
                      <FiCpu />
                    </div>
                  )}
                  <div
                    className={`p-3.5 rounded-2xl max-w-[82%] leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-white shadow-md shadow-primary/20 rounded-br-none"
                        : "bg-surface border border-border/80 text-text rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    {m.isFallback && (
                      <span className="text-[9px] text-warning block mt-1.5 italic">
                        ⚡ Verified offline response
                      </span>
                    )}
                  </div>
                  {m.role === "user" && (
                    <div className="w-7 h-7 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 text-xs">
                      <FiUser />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-muted text-xs p-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing your account context...</span>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="p-2 border-t border-border/40 bg-surface/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {QUICK_PROMPTS.map((qp, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(qp)}
                  className="px-2.5 py-1 rounded-xl bg-card border border-border hover:border-primary/40 text-[11px] text-muted hover:text-foreground whitespace-nowrap transition-colors"
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-border bg-card flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about your orders, wishlist, spending..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend(input);
                }}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => handleSend(input)}
                disabled={isLoading || !input.trim()}
                className="p-3 rounded-2xl bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/20 transition-all disabled:opacity-50"
              >
                <FiSend size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
