"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { shoppingAgentChat, ShoppingAgentResponse } from "@/lib/api/customer-features";

interface Message {
  role: "user" | "assistant";
  content: string;
  products?: ShoppingAgentResponse["suggestedProducts"];
}

export default function ShoppingAgentPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your AI Shopping Assistant. I can help you find products, compare options, suggest budgets, and answer shopping questions. What are you looking for today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPending && !session?.user) router.push("/login");
  }, [session, isPending]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await shoppingAgentChat(userMessage);
      setMessages((prev) => [...prev, { role: "assistant", content: response.response, products: response.suggestedProducts }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "I'm having trouble connecting right now. Please try again in a moment." }]);
    }
    setLoading(false);
  }

  const quickPrompts = [
    "I need a laptop for programming under ৳80,000",
    "Best gaming headphone under ৳5,000",
    "What should I buy for my brother's birthday?",
    "Compare phones between ৳20,000-৳30,000",
  ];

  const links = [
    { label: "AI Search", href: "/customer/search", icon: "🔍", description: "Intelligent product search" },
    { label: "Shopping Agent", href: "/customer/shopping-agent", icon: "🤖", description: "AI shopping assistant" },
    { label: "Deal Finder", href: "/customer/deal-finder", icon: "🏷️", description: "Find best deals" },
    { label: "Gift Finder", href: "/customer/gift-finder", icon: "🎁", description: "AI gift recommendations" },
  ];

  return (
    <DashboardShell title="AI Shopping Agent" subtitle="Your personal shopping assistant powered by AI" role="Customer" links={links}>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Panel title="🤖 Chat with AI Assistant">
            <div className="flex h-[500px] flex-col">
              {/* Messages */}
              <div className="flex-1 space-y-4 overflow-y-auto p-1">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === "user" ? "bg-primary text-white" : "bg-muted-bg text-text"}`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      {msg.products && msg.products.length > 0 && (
                        <div className="mt-3 grid gap-2">
                          {msg.products.map((p) => (
                            <div key={p.id} className="flex items-center gap-3 rounded-lg bg-surface/10 p-2">
                              <div className="h-10 w-10 rounded-lg bg-white/20" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-bold">{p.title}</p>
                                <p className="text-xs opacity-80">৳{p.price.toLocaleString()} • ⭐ {p.ratingAvg.toFixed(1)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-muted-bg px-4 py-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:0.1s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:0.2s]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about products, budgets, comparisons..."
                  className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text placeholder:text-muted focus:border-primary focus:outline-none"
                />
                <button type="submit" disabled={loading} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover disabled:opacity-50">
                  Send
                </button>
              </form>
            </div>
          </Panel>
        </div>

        {/* Quick Prompts */}
        <div className="space-y-4">
          <Panel title="Quick Prompts">
            <div className="space-y-2">
              {quickPrompts.map((prompt, i) => (
                <button key={i} onClick={() => setInput(prompt)} className="w-full rounded-lg border border-border bg-surface p-3 text-left text-xs font-medium text-text transition hover:border-primary/40 hover:bg-primary/5">
                  {prompt}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="What I Can Help With">
            <ul className="space-y-2 text-xs text-muted">
              <li className="flex items-start gap-2"><span className="text-primary">✓</span> Product discovery & recommendations</li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span> Budget-based suggestions</li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span> Product comparisons</li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span> Specification explanations</li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span> Shopping guidance</li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span> Order-related questions</li>
            </ul>
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}
