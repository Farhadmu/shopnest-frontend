"use client";

import React, { useState, useEffect } from "react";
import { FiHelpCircle, FiMessageSquare, FiSend, FiCheckCircle, FiCpu, FiUser } from "react-icons/fi";
import { getProductQuestions, askProductQuestion, ProductQuestionItem } from "@/lib/api/customer-intelligence-features";

export function ProductQASection({ productId }: { productId: string }) {
  const [questions, setQuestions] = useState<ProductQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadQuestions = () => {
    setLoading(true);
    getProductQuestions(productId)
      .then((res) => setQuestions(res || []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (productId) loadQuestions();
  }, [productId]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setIsSubmitting(true);
    try {
      await askProductQuestion(productId, newQuestion.trim());
      setNewQuestion("");
      setToastMsg("Your question was submitted! Verified sellers and buyers will answer shortly.");
      loadQuestions();
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err: any) {
      alert(err?.message || "Failed to post question");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg">
            <FiHelpCircle />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-foreground">Questions & Answers ({questions.length})</h3>
            <p className="text-[11px] text-muted">Have a question about this item? Ask the seller or community</p>
          </div>
        </div>
      </div>

      {/* Ask Question Box */}
      <form onSubmit={handleAsk} className="flex gap-2.5">
        <input
          type="text"
          placeholder="Ask a question about size, warranty, battery, or specs..."
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-2xl bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={isSubmitting || !newQuestion.trim()}
          className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-primary/20 flex items-center gap-1.5 disabled:opacity-50"
        >
          <FiSend /> {isSubmitting ? "Posting..." : "Ask"}
        </button>
      </form>

      {toastMsg && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-medium">
          {toastMsg}
        </div>
      )}

      {/* Question List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-muted-bg rounded-2xl" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-surface border border-dashed border-border text-muted text-xs">
          <FiMessageSquare className="mx-auto text-xl mb-1.5" />
          No questions asked about this product yet. Be the first to ask!
        </div>
      ) : (
        <div className="space-y-4 divide-y divide-border/60">
          {questions.map((q) => (
            <div key={q.id} className="pt-4 first:pt-0 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-primary/15 text-primary text-[11px] font-black flex items-center justify-center shrink-0">
                  Q
                </span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground">{q.question}</p>
                  <span className="text-[10px] text-muted">
                    Asked by {q.userName} • {new Date(q.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Answers */}
              {q.answers.length > 0 ? (
                <div className="ml-7 space-y-2">
                  {q.answers.map((ans, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-surface border border-border/70 text-xs space-y-1">
                      <div className="flex items-center gap-1.5">
                        {ans.authorRole === "seller" ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 text-[10px] font-extrabold flex items-center gap-1">
                            <FiCheckCircle /> Verified Seller
                          </span>
                        ) : ans.authorRole === "ai_assistant" ? (
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-600 text-[10px] font-extrabold flex items-center gap-1">
                            <FiCpu /> AI Spec Assistant
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-muted flex items-center gap-1">
                            <FiUser /> {ans.authorName}
                          </span>
                        )}
                        <span className="text-[10px] text-muted">
                          {new Date(ans.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/90 leading-relaxed">{ans.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="ml-7 text-[11px] text-muted italic">Waiting for seller or community answer...</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
