"use client";
import { useState } from "react";
import { clientMutation } from "@/lib/core/client";
export default function AiAdvisorPage() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const send = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const r: any = await clientMutation("/ai/chat", "POST", { message });
      const d = r.data ?? r;
      setReply(d.reply || "No response");
      setProducts(d.suggestedProducts || []);
      setMessage("");
    } catch (e) {
      setReply(e instanceof Error ? e.message : "AI service is unavailable");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mx-auto grid max-w-5xl gap-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">
          ShopNest Intelligence
        </p>
        <h1 className="mt-1 text-3xl font-black">AI Product Advisor</h1>
        <p className="mt-2 text-sm text-muted">
          Describe what you need and get product-aware guidance from the marketplace.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_.8fr]">
        <section className="rounded-2xl border border-border bg-surface p-6">
          <div className="min-h-64 rounded-2xl bg-slate-950 p-5 text-sm text-slate-200">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              AI assistant
            </div>
            {reply ? (
              <p className="mt-5 whitespace-pre-wrap leading-7">{reply}</p>
            ) : (
              <p className="mt-5 text-slate-400">
                Try: “I need a programming laptop under ৳80,000 with good battery life.”
              </p>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder="Tell AI what you want to buy..."
              className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm"
            />
            <button
              disabled={loading}
              onClick={send}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {loading ? "Thinking…" : "Ask"}
            </button>
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-black">Suggested products</h2>
          <div className="mt-4 grid gap-3">
            {products.length === 0 ? (
              <p className="text-sm text-muted">
                AI suggestions will appear here after your question.
              </p>
            ) : (
              products.map((p) => (
                <a
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="rounded-xl border border-border p-4 transition hover:border-primary/40"
                >
                  <p className="font-bold">{p.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    ৳{p.price} · {p.category}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Rating {p.ratingAvg ?? "—"} · Stock {p.stock}
                  </p>
                </a>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
