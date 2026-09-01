"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { clientMutation } from "@/lib/core/client";
import { useSession } from "@/lib/auth-client";
import {
  FaRobot,
  FaPaperPlane,
  FaSpinner,
  FaLightbulb,
  FaShoppingBag,
  FaStar,
  FaUserLock,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

export interface SuggestedProduct {
  id: string;
  _id?: string;
  title: string;
  price: number;
  category: string;
  ratingAvg?: number;
  stock?: number;
  images?: string[];
  imageUrl?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: SuggestedProduct[];
  timestamp: string;
}

interface AiAdvisorViewProps {
  isDashboard?: boolean;
}

const SAMPLE_PROMPTS = [
  "💻 Best programming laptop under ৳80,000 with good battery life",
  "🎧 Noise-cancelling wireless headphones for work and travel",
  "⌨️ Mechanical keyboard with tactile switches",
  "🎁 Best skincare and beauty gift sets under ৳5,000",
  "📱 Top trending smartphones with high refresh rate display",
];

export function AiAdvisorView({ isDashboard = false }: AiAdvisorViewProps) {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content:
        "Hello! I am your ShopNest AI Shopping Advisor. Tell me what you're looking for, your budget, or specific requirements, and I'll match the best products from our catalog for you.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [activeProducts, setActiveProducts] = useState<SuggestedProduct[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res: any = await clientMutation("/ai/chat", "POST", { message: query });
      const data = res?.data ?? res;
      const replyText = data?.reply || "I couldn't find exact matches, but please feel free to refine your query!";
      const suggested: SuggestedProduct[] = data?.suggestedProducts || [];

      if (suggested.length > 0) {
        setActiveProducts(suggested);
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: replyText,
        products: suggested,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: err?.message || "AI Advisor service is temporarily unavailable. Please try again shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`mx-auto w-full ${isDashboard ? "max-w-7xl" : "max-w-6xl py-6"}`}>
      {/* Header Banner */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-black text-primary">
            <HiSparkles className="animate-spin-slow text-xs" /> ShopNest AI Intelligence
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-text sm:text-3xl">
            AI Shopping Advisor
          </h1>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            Chat with AI to discover verified products, compare specs, and find the best deals across the marketplace.
          </p>
        </div>

        {!isAuthenticated && (
          <div className="flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-300 sm:self-start">
            <FaUserLock className="shrink-0 text-base" />
            <div>
              <p className="font-bold">Guest Mode Active</p>
              <p className="text-[11px] text-muted">
                Free to chat!{" "}
                <Link href="/login?next=/ai-advisor" className="font-bold text-primary underline">
                  Sign in
                </Link>{" "}
                to save conversations across devices.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Chat Area + Recommendations Panel */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Left Column: Chat Conversation */}
        <div className="flex h-[600px] flex-col rounded-3xl border border-border bg-surface shadow-xl shadow-black/5">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted-bg/30">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
                <FaRobot size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-text">ShopNest Assistant</p>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Catalog Search
                </div>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => {
              const isAi = msg.role === "assistant";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAi ? "justify-start" : "justify-end"}`}
                >
                  {isAi && (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary mt-1">
                      <FaRobot size={14} />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-sm sm:max-w-[75%] ${
                      isAi
                        ? "border border-border bg-muted-bg/60 text-text shadow-sm"
                        : "bg-primary font-medium text-white shadow-md shadow-primary/20"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    <span
                      className={`mt-2 block text-[10px] ${
                        isAi ? "text-muted" : "text-white/70"
                      } text-right`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-3 justify-start">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary mt-1">
                  <FaRobot size={14} />
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted-bg/60 p-4 text-xs font-semibold text-muted">
                  <FaSpinner className="animate-spin text-primary" /> Searching product catalog & analyzing query...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="border-t border-border/50 px-4 py-2 bg-muted-bg/10 overflow-x-auto no-scrollbar flex gap-2">
            {SAMPLE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="shrink-0 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-muted transition hover:border-primary hover:text-primary disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="border-t border-border p-4 bg-surface rounded-b-3xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything (e.g. recommend a 4K gaming monitor under ৳40,000)..."
                disabled={loading}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-text outline-none focus:border-primary placeholder:text-muted transition disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="grid h-11 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-md shadow-primary/25 transition hover:bg-primary-hover disabled:opacity-50"
              >
                {loading ? <FaSpinner className="animate-spin text-sm" /> : <FaPaperPlane size={14} />}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Suggested Products */}
        <div className="flex h-[600px] flex-col rounded-3xl border border-border bg-surface p-6 shadow-xl shadow-black/5">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <FaShoppingBag className="text-primary" />
              <h2 className="text-base font-black text-text">Recommended Products</h2>
            </div>
            {activeProducts.length > 0 && (
              <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                {activeProducts.length} Found
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pt-4 space-y-3">
            {activeProducts.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-6">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-muted-bg text-muted text-xl">
                  <FaLightbulb />
                </div>
                <h3 className="mt-3 text-sm font-bold text-text">No recommendations yet</h3>
                <p className="mt-1 text-xs text-muted max-w-xs">
                  Ask a question or click one of the prompt chips to get live matched items from our catalog.
                </p>
              </div>
            ) : (
              activeProducts.map((p) => {
                const pid = p.id || p._id;
                return (
                  <Link
                    key={pid}
                    href={`/products/${pid}`}
                    className="group block rounded-2xl border border-border bg-muted-bg/30 p-4 transition duration-200 hover:border-primary/50 hover:bg-surface hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-text group-hover:text-primary transition line-clamp-1">
                        {p.title}
                      </h4>
                      <span className="shrink-0 text-sm font-black text-primary">
                        ৳{p.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span className="rounded-md bg-muted-bg px-2 py-0.5 text-[10px] font-bold uppercase text-muted">
                        {p.category}
                      </span>
                      {p.ratingAvg !== undefined && (
                        <span className="flex items-center gap-1 text-amber-500 font-semibold text-[11px]">
                          <FaStar size={10} /> {p.ratingAvg}
                        </span>
                      )}
                      {p.stock !== undefined && (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          {p.stock} in stock
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
