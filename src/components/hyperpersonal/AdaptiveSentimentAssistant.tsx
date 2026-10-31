"use client";

import { useState } from "react";
import { sendSentimentChat, SentimentAdaptiveResponse } from "@/lib/api/hyperpersonal";
import {
  Bot,
  Send,
  User,
  Sparkles,
  Heart,
  Smile,
  Frown,
  Meh,
  Tag,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/context/ToastContext";

interface ChatItem {
  role: "user" | "assistant";
  content: string;
  sentimentMeta?: SentimentAdaptiveResponse;
  timestamp: string;
}

export function AdaptiveSentimentAssistant() {
  const [messages, setMessages] = useState<ChatItem[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your **HyperPersonal Shopping Companion**. I adapt in real-time to your preferences and sentiment. How can I help you find the perfect product today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    "I'm hesitating because shipping is too expensive...",
    "Why are these headphones so expensive compared to others?",
    "Can you recommend the top rated audio gadget in stock?",
    "I am frustrated my previous discount code did not work!",
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatItem = {
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await sendSentimentChat(text);
      const botMsg: ChatItem = {
        role: "assistant",
        content: res.replyMessage,
        sentimentMeta: res,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);

      if (res.specialIncentiveOffered) {
        toast.success(`Exclusive ${res.specialIncentiveOffered.discountPercent}% courtesy discount unlocked!`);
      }
    } catch (err) {
      console.error("Sentiment chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I am right here to help make your shopping experience seamless. What can I find for you?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    if (sentiment === "frustrated") return <Frown className="h-3.5 w-3.5 text-rose-500" />;
    if (sentiment === "hesitant") return <Meh className="h-3.5 w-3.5 text-amber-500" />;
    if (sentiment === "delighted") return <Smile className="h-3.5 w-3.5 text-emerald-500" />;
    return <Sparkles className="h-3.5 w-3.5 text-indigo-500" />;
  };

  return (
    <div className="flex h-[560px] flex-col rounded-3xl border border-border/60 bg-gradient-to-b from-card/95 via-card/80 to-card/50 shadow-md backdrop-blur-md overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border/40 bg-card/60 px-5 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm">
            <Heart className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
              Frustration-Aware Emotion & Sentiment Assistant
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </h4>
            <p className="text-[10px] text-muted-foreground">
              Real-time emotion detection, adaptive de-escalation tone & automated retention credits
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
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
              <div className="whitespace-pre-wrap">{m.content}</div>

              {/* Sentiment Meta Tag Pill if provided */}
              {m.sentimentMeta && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/40 pt-2 text-[10px]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-card border border-border/60 px-2 py-0.5 font-bold capitalize">
                    {getSentimentIcon(m.sentimentMeta.detectedSentiment)}
                    Detected: {m.sentimentMeta.detectedSentiment}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 font-bold text-indigo-500 capitalize">
                    Tone: {m.sentimentMeta.adaptedTone.replace("_", " ")}
                  </span>
                </div>
              )}

              {/* Courtesy Incentive Box */}
              {m.sentimentMeta?.specialIncentiveOffered && (
                <div className="mt-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-500">
                    <Tag className="h-3.5 w-3.5" />
                    Automatic Courtesy Credit Unlocked:
                  </div>
                  <p className="mt-0.5 text-foreground font-semibold">
                    Use Code: <strong className="font-mono text-amber-500">{m.sentimentMeta.specialIncentiveOffered.code}</strong> (
                    {m.sentimentMeta.specialIncentiveOffered.discountPercent}% OFF)
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {m.sentimentMeta.specialIncentiveOffered.message}
                  </p>
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
            <span className="font-mono text-[11px] animate-pulse">
              Analyzing sentiment vectors & preparing adaptive tone response...
            </span>
          </div>
        )}
      </div>

      {/* Sample Quick Sentiment Triggers */}
      <div className="border-t border-border/40 bg-card/30 p-2.5">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {samplePrompts.map((sp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sp)}
              disabled={loading}
              className="shrink-0 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-[10px] font-medium text-muted-foreground hover:border-indigo-500/40 hover:text-indigo-500 hover:bg-indigo-500/5 transition-all disabled:opacity-50"
            >
              {sp}
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
          placeholder="Type how you feel or ask about any product or policy..."
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
