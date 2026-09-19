"use client";

import React, { useState } from "react";
import { FiZap, FiInfo, FiCheck, FiX, FiHelpCircle } from "react-icons/fi";
import { CompareProductData } from "@/lib/api/products";
import { detectKeyDifferences, SpecDifference } from "@/lib/utils/compare-normalization";

interface CompareKeyDifferencesProps {
  products: CompareProductData[];
  differencesOnly: boolean;
  onToggleDifferencesOnly: (val: boolean) => void;
}

export function CompareKeyDifferences({
  products,
  differencesOnly,
  onToggleDifferencesOnly,
}: CompareKeyDifferencesProps) {
  const [activeExplainDiff, setActiveExplainDiff] = useState<SpecDifference | null>(null);

  if (!products || products.length < 2) return null;

  const differences = detectKeyDifferences(products);

  if (differences.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm">
        <FiCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
        <h4 className="font-bold text-sm text-foreground">Identical Specifications</h4>
        <p className="text-xs text-muted mt-1">
          These products share matching core configurations across available verified specifications.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm space-y-4">
      {/* Header with Mode Toggle */}
      <div className="px-6 py-4 bg-muted-bg/50 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <FiZap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider">
              Key Differences ({differences.length} detected)
            </h3>
            <p className="text-xs text-muted">
              Meaningful variations across configurations and features
            </p>
          </div>
        </div>

        {/* Show All vs Differences Only Toggle */}
        <div className="inline-flex rounded-xl bg-card border border-border p-1 text-xs font-bold shadow-sm">
          <button
            onClick={() => onToggleDifferencesOnly(false)}
            className={`px-3 py-1 rounded-lg transition-all ${
              !differencesOnly
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            Show All Specs
          </button>
          <button
            onClick={() => onToggleDifferencesOnly(true)}
            className={`px-3 py-1 rounded-lg transition-all ${
              differencesOnly
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            Differences Only
          </button>
        </div>
      </div>

      {/* Differences Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted-bg/30 text-muted font-bold border-b border-border/60">
            <tr>
              <th className="p-4 w-52">Feature / Attribute</th>
              {products.map((p) => (
                <th key={p.id} className="p-4 font-extrabold text-foreground min-w-[200px]">
                  <span className="line-clamp-1">{p.title}</span>
                </th>
              ))}
              <th className="p-4 w-24 text-right">Insight</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {differences.map((diff) => {
              const isHighImportance = diff.importance === "high";
              return (
                <tr
                  key={diff.key}
                  className={`hover:bg-muted-bg/30 transition-colors ${
                    isHighImportance ? "bg-amber-500/[0.02]" : ""
                  }`}
                >
                  <td className="p-4 font-bold text-foreground">
                    <div className="flex items-center gap-1.5">
                      <span>{diff.label}</span>
                      {isHighImportance && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-primary/10 text-primary border border-primary/20">
                          Major
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted block font-normal mt-0.5">
                      {diff.category}
                    </span>
                  </td>

                  {products.map((p) => {
                    const val = diff.values[p.id] || "Not specified";
                    const isMissing = val === "Not specified";
                    return (
                      <td key={p.id} className="p-4 font-semibold text-foreground">
                        <span
                          className={`inline-block px-2 py-1 rounded-lg ${
                            isMissing
                              ? "text-muted bg-muted-bg/50 italic text-[11px]"
                              : isHighImportance
                              ? "bg-primary/5 text-primary font-bold"
                              : "text-foreground"
                          }`}
                        >
                          {val}
                        </span>
                      </td>
                    );
                  })}

                  <td className="p-4 text-right">
                    <button
                      onClick={() => setActiveExplainDiff(diff)}
                      className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Explain this difference"
                    >
                      <FiHelpCircle className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Difference Explanation Modal */}
      {activeExplainDiff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FiInfo className="w-5 h-5 text-primary" />
                <h4 className="font-extrabold text-sm text-foreground">
                  Difference Analysis: {activeExplainDiff.label}
                </h4>
              </div>
              <button
                onClick={() => setActiveExplainDiff(null)}
                className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-muted-bg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-muted">
              <p className="leading-relaxed">
                Products in this comparison feature different configurations for{" "}
                <strong className="text-foreground">{activeExplainDiff.label}</strong>:
              </p>

              <div className="space-y-2 bg-muted-bg/50 p-3 rounded-xl border border-border">
                {products.map((p) => (
                  <div key={p.id} className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground truncate max-w-[180px]">
                      {p.title}
                    </span>
                    <span className="font-black text-primary">
                      {activeExplainDiff.values[p.id] || "Not specified"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-foreground text-xs leading-relaxed">
                💡 <strong>Practical Shopping Advice:</strong> If your workflow requires heavy
                multitasking or future-proofing, prioritize the higher specification. If this
                attribute is secondary for your daily needs, you can save money by opting for the more
                affordable model.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveExplainDiff(null)}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
