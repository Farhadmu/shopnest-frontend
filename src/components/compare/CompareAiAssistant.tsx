// AI Assistant: Priority Chips and Decision Verdict
"use client";

import React, { useState } from "react";
import {
  FiZap,
  FiSliders,
  FiSend,
  FiAward,
  FiCheckCircle,
  FiAlertTriangle,
  FiHelpCircle,
  FiRefreshCw,
  FiTrendingUp,
} from "react-icons/fi";
import { CompareProductData } from "@/lib/api/products";
import { compareProductsAI, CompareResult } from "@/lib/api/ai-commerce";
import { calculateWeightedScores } from "@/lib/utils/compare-normalization";
import { toast } from "@/context/ToastContext";

interface CompareAiAssistantProps {
  products: CompareProductData[];
  aiResult: CompareResult | null;
  onAiResultUpdate: (result: CompareResult | null) => void;
}

const PRESET_PRIORITIES = [
  { label: "Best for Programming", key: "programming" },
  { label: "Best Overall Value", key: "value" },
  { label: "Best Battery Life", key: "battery" },
  { label: "Best for Gaming", key: "gaming" },
  { label: "Best Camera / Media", key: "camera" },
  { label: "Best Budget Option", key: "budget" },
];

export function CompareAiAssistant({
  products,
  aiResult,
  onAiResultUpdate,
}: CompareAiAssistantProps) {
  const [activePriority, setActivePriority] = useState<string>("value");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWeightedSystem, setShowWeightedSystem] = useState(false);

  // Weights for weighted scoring model
  const [weights, setWeights] = useState({
    price: 30,
    rating: 20,
    performance: 30,
    battery: 15,
    warranty: 5,
  });

  const productIds = products.map((p) => p.id);

  const runAiAnalysis = async (priorityToUse?: string, promptToUse?: string) => {
    if (productIds.length < 2) {
      toast.error("Please compare at least 2 products for AI decision support.");
      return;
    }

    setIsLoading(true);
    try {
      const selectedPriority = priorityToUse ?? activePriority;
      const selectedPrompt = promptToUse ?? customPrompt;

      const res = await compareProductsAI({
        productIds,
        priority: selectedPriority,
        userPrompt: selectedPrompt.trim() || undefined,
        weights,
      });

      onAiResultUpdate(res);
      toast.success("AI Decision Analysis generated!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate AI analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriorityClick = (key: string) => {
    setActivePriority(key);
    runAiAnalysis(key, customPrompt);
  };

  const handleSubmitCustomQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    runAiAnalysis(activePriority, customPrompt);
  };

  // Calculate local transparent normalized scores when weighted system is open
  const weightedScores = showWeightedSystem
    ? calculateWeightedScores(products, weights)
    : {};

  if (products.length < 2) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-card via-card to-primary/10 border border-primary/25 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-black uppercase tracking-wider mb-2">
            <FiZap className="w-3.5 h-3.5" />
            AI Decision Assistant
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Which one should you choose?
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">
            ShopNest AI evaluates verified specifications, pricing, seller credibility, and customer ratings without invented data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWeightedSystem(!showWeightedSystem)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              showWeightedSystem
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-card text-foreground border-border hover:bg-muted-bg"
            }`}
          >
            <FiSliders className="w-3.5 h-3.5" />
            {showWeightedSystem ? "Hide Weighted Model" : "Weighted Priority Model"}
          </button>

          <button
            onClick={() => runAiAnalysis()}
            disabled={isLoading}
            className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-md shadow-primary/20 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Analyzing..." : "Analyze with AI"}
          </button>
        </div>
      </div>

      {/* Interactive Priority Chips */}
      <div>
        <label className="block text-xs font-bold text-foreground mb-2.5">
          Tell ShopNest what matters most to your purchase:
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_PRIORITIES.map((p) => {
            const isSelected = activePriority === p.key;
            return (
              <button
                key={p.key}
                onClick={() => handlePriorityClick(p.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? "bg-primary text-white border-primary shadow-sm scale-102"
                    : "bg-card text-muted hover:text-foreground border-border hover:border-primary/40 hover:bg-muted-bg"
                }`}
              >
                {isSelected && <FiCheckCircle className="w-3.5 h-3.5 text-white" />}
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Free Text Input: Ask AI about these products */}
      <form onSubmit={handleSubmitCustomQuery} className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Ask AI about these products (e.g., 'Which is better for college and battery life under 80k?')..."
            className="w-full bg-card border border-border rounded-2xl py-3 pl-4 pr-28 text-xs sm:text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
          />
          <button
            type="submit"
            disabled={isLoading || !customPrompt.trim()}
            className="absolute right-2 px-3.5 py-1.5 bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <FiSend className="w-3 h-3" /> Ask
          </button>
        </div>
      </form>

      {/* Weighted Priority Model Drawer (Collapsible) */}
      {showWeightedSystem && (
        <div className="bg-card/90 border border-primary/20 rounded-2xl p-5 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
              <FiSliders className="w-3.5 h-3.5" />
              Custom Decision Weighting Model
            </h4>
            <span className="text-[11px] text-muted">
              Normalized score based on real product specs
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(weights).map(([key, val]) => (
              <div key={key} className="space-y-1 bg-muted-bg/40 p-3 rounded-xl border border-border/60">
                <div className="flex justify-between text-xs font-bold capitalize">
                  <span className="text-foreground">{key}</span>
                  <span className="text-primary">{val}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={val}
                  onChange={(e) =>
                    setWeights((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                  }
                  className="w-full accent-primary h-1.5 bg-border rounded-lg cursor-pointer"
                />
              </div>
            ))}
          </div>

          {/* Transparent Score Rankings */}
          <div className="pt-2">
            <p className="text-xs font-bold text-foreground mb-2">
              Personalized Ranking for Your Weights:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {products.map((p) => {
                const scoreInfo = weightedScores[p.id] || { score: 75, rank: 1 };
                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-card border border-border flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-foreground truncate">{p.title}</p>
                      <p className="text-[11px] text-muted">Rank #{scoreInfo.rank}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-base font-black text-primary">
                        {scoreInfo.score}
                      </span>
                      <span className="text-[10px] text-muted block">/ 100</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* AI Decision Output */}
      {aiResult && (
        <div className="space-y-4 pt-2">
          {/* Main Verdict Banner */}
          <div className="bg-card border border-primary/30 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-wider">
                <FiAward className="w-4 h-4 text-amber-500" />
                ShopNest AI Decision Verdict
              </div>
              {aiResult.winnerByValue && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-[11px] flex items-center gap-1">
                  <FiTrendingUp className="w-3 h-3" /> Best Value Pick
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-foreground leading-relaxed">
              {aiResult.verdict || aiResult.summary}
            </p>

            {aiResult.summary && aiResult.verdict && aiResult.summary !== aiResult.verdict && (
              <p className="text-xs text-muted leading-relaxed pt-2 border-t border-border/60">
                {aiResult.summary}
              </p>
            )}

            {/* Winner by Priority if present */}
            {aiResult.winnerByPriority && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-start gap-2">
                <FiCheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    Recommended for {aiResult.winnerByPriority.criterion}:
                  </span>{" "}
                  <span className="text-foreground">{aiResult.winnerByPriority.reason}</span>
                </div>
              </div>
            )}
          </div>

          {/* Product Trade-Offs Matrix (Pros & Cons) */}
          {aiResult.tradeoffs && aiResult.tradeoffs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {aiResult.tradeoffs.map((item) => {
                const matchedProduct = products.find((p) => p.id === item.productId);
                return (
                  <div
                    key={item.productId}
                    className="p-4 rounded-xl bg-card border border-border space-y-2.5 text-xs shadow-sm"
                  >
                    <h5 className="font-black text-foreground line-clamp-1">
                      {matchedProduct ? matchedProduct.title : "Product"}
                    </h5>

                    {/* Advantages */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        Advantages
                      </span>
                      {item.advantages.map((adv, aIdx) => (
                        <div key={aIdx} className="flex items-start gap-1.5 text-foreground">
                          <FiCheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="leading-tight">{adv}</span>
                        </div>
                      ))}
                    </div>

                    {/* Trade-offs / Drawbacks */}
                    <div className="space-y-1 pt-2 border-t border-border/50">
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                        Trade-Offs
                      </span>
                      {item.disadvantages.map((dis, dIdx) => (
                        <div key={dIdx} className="flex items-start gap-1.5 text-muted">
                          <FiAlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span className="leading-tight">{dis}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Smart Follow-Up Chips */}
          {aiResult.suggestedQuestions && aiResult.suggestedQuestions.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-bold text-muted mb-2 flex items-center gap-1.5">
                <FiHelpCircle className="w-3.5 h-3.5 text-primary" />
                Suggested follow-up questions:
              </p>
              <div className="flex flex-wrap gap-2">
                {aiResult.suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCustomPrompt(q);
                      runAiAnalysis(activePriority, q);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-card hover:bg-muted-bg border border-border text-xs text-foreground transition-all hover:border-primary/40 text-left"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
