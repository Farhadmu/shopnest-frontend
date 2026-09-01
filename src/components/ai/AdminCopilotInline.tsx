"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Panel } from "@/components/dashboard/DashboardUI";
import { askAdminCopilot } from "@/lib/api/ai-commerce";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isFallback?: boolean;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  { icon: "📊", text: "Give me today's marketplace health summary" },
  { icon: "💰", text: "How much revenue did we generate this month?" },
  { icon: "🚨", text: "Show me high-risk sellers" },
  { icon: "🛡️", text: "Give me a security summary" },
  { icon: "📦", text: "Show suspicious orders" },
  { icon: "📈", text: "Which category is performing best?" },
];

export default function AdminCopilotInline() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<"1d" | "7d" | "30d" | "90d">("30d");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (query?: string) => {
    const question = query || input.trim();
    if (!question || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await askAdminCopilot(question, range);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.answer,
        isFallback: response.isFallback,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm temporarily unable to process your request. Please try again later.",
        isFallback: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <Panel title="Time Range">
          <div className="grid grid-cols-2 gap-2">
            {(["1d", "7d", "30d", "90d"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                  range === r
                    ? "bg-primary text-white shadow-sm"
                    : "bg-muted-bg text-muted hover:text-text"
                }`}
              >
                {r === "1d" ? "Today" : r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "90 Days"}
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Suggested Questions">
          <div className="space-y-2">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSubmit(q.text)}
                disabled={loading}
                className="flex items-start gap-2 rounded-xl border border-border bg-surface p-3 text-left text-xs font-medium text-text transition hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50 w-full"
              >
                <span className="text-base">{q.icon}</span>
                <span className="leading-relaxed">{q.text}</span>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-3">
        <Panel title="AI Copilot Conversation" className="h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-3xl mb-4">🤖</div>
                <h3 className="text-base font-bold text-text mb-2">Welcome to Admin Copilot</h3>
                <p className="text-sm text-muted max-w-md mb-4">
                  I&apos;m your AI-powered marketplace intelligence assistant. Ask me about your platform data.
                </p>
                <div className="grid gap-2 w-full max-w-sm">
                  {SUGGESTED_QUESTIONS.slice(0, 3).map((q, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSubmit(q.text)}
                      className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2.5 text-left text-xs font-medium text-text transition hover:border-primary/40 hover:bg-primary/5"
                    >
                      <span>{q.icon}</span>
                      <span>{q.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 ${
                      msg.role === "user" ? "bg-primary text-white" : "border border-border bg-surface"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">🤖</span>
                        <span className="text-xs font-bold text-text">Admin Copilot</span>
                        {msg.isFallback && (
                          <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600">Data</span>
                        )}
                      </div>
                    )}
                    <div className={`text-sm whitespace-pre-wrap leading-relaxed ${msg.role === "user" ? "text-white" : "text-text"}`}>
                      {msg.content}
                    </div>
                    <p className={`mt-2 text-[10px] ${msg.role === "user" ? "text-white/60" : "text-muted"}`}>
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">🤖</span>
                    <span className="text-xs font-bold text-text">Admin Copilot</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                    <span className="text-xs text-muted ml-2">Analyzing marketplace data...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border pt-4">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about marketplace performance, seller risk, security, revenue..."
                rows={2}
                className="flex-1 resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!input.trim() || loading}
                className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed h-fit"
              >
                {loading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
