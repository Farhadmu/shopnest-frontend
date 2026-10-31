"use client";

import { useState } from "react";
import { GeneratedCampaign, orchestrateCampaign } from "@/lib/api/growthpilot";
import {
  Sparkles,
  Copy,
  Check,
  Video,
  Share2,
  Briefcase,
  FileText,
  Mail,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Target,
  Hash,
} from "lucide-react";
import { toast } from "@/context/ToastContext";

interface Props {
  products: Array<{
    id: string;
    title: string;
    category: string;
    price: number;
    image?: string;
  }>;
}

export function MultiChannelOrchestrator({ products }: Props) {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || "");
  const [targetAudience, setTargetAudience] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [campaigns, setCampaigns] = useState<GeneratedCampaign[] | null>(null);
  const [activeChannel, setActiveChannel] = useState<string>("instagram_reels");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!selectedProductId) return;
    try {
      setLoading(true);
      const res = await orchestrateCampaign(selectedProductId, targetAudience.trim() || undefined);
      setCampaigns(res);
      if (res.length > 0) {
        setActiveChannel(res[0].channel);
      }
      toast.success("5-Channel Growth Campaigns Generated!");
    } catch (err) {
      console.error("Orchestrator error:", err);
      toast.error("Failed to orchestrate marketing campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const channelIcons: Record<string, any> = {
    instagram_reels: Video,
    facebook_ads: Share2,
    linkedin_b2b: Briefcase,
    seo_blog: FileText,
    email_drip: Mail,
  };

  const selectedCampaign = campaigns?.find((c) => c.channel === activeChannel);

  return (
    <div className="space-y-6">
      {/* Control Box */}
      <div className="rounded-3xl border border-border/60 bg-gradient-to-b from-card/90 via-card/60 to-card/40 p-6 shadow-sm backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                <Sparkles className="h-4 w-4" />
              </span>
              <h3 className="font-extrabold text-foreground text-base tracking-tight">
                Cross-Platform Content & Ad Orchestrator
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Select any catalog product. GrowthPilot will autonomously construct 5 tailored, high-converting marketing campaigns.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !selectedProductId}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {loading ? "Orchestrating AI Copy..." : "Orchestrate 5 Channels"}
          </button>
        </div>

        {/* Product Picker & Audience Config */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1.5">
              Select Source Product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-card px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (${p.price}) — {p.category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1.5">
              Target Audience / Market Angle (Optional)
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Gen-Z remote workers, corporate gifting, tech enthusiasts..."
              className="w-full rounded-xl border border-border/60 bg-card px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
        </div>
      </div>

      {/* Generated Campaigns Output Tabs */}
      {campaigns && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Channel Selector Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {campaigns.map((c) => {
              const Icon = channelIcons[c.channel] || Sparkles;
              const isSelected = activeChannel === c.channel;
              return (
                <button
                  key={c.channel}
                  onClick={() => setActiveChannel(c.channel)}
                  className={`inline-flex items-center gap-2 shrink-0 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : "border border-border/60 bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {c.channelLabel}
                </button>
              );
            })}
          </div>

          {/* Active Campaign Card */}
          {selectedCampaign && (
            <div className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur-md space-y-5">
              {/* Card Header & Projected Metrics */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">
                    {selectedCampaign.channelLabel}
                  </span>
                  <h4 className="text-base font-bold text-foreground mt-0.5">{selectedCampaign.headline}</h4>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-indigo-400" />
                    Target: {selectedCampaign.targetAudience}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-emerald-500 font-semibold flex items-center gap-1.5">
                    <TrendingDown className="h-3.5 w-3.5" />
                    Est. CAC: {selectedCampaign.projectedMetrics.estimatedCac}
                  </div>
                  <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 text-indigo-500 font-semibold flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Lift: {selectedCampaign.projectedMetrics.conversionLift}
                  </div>
                </div>
              </div>

              {/* Hook Script (If Video/Reels) */}
              {selectedCampaign.hookScript && (
                <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-4 space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    🎬 Viral Video Storyboard & 3-Second Hook
                  </span>
                  <div className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-foreground/90">
                    {selectedCampaign.hookScript}
                  </div>
                </div>
              )}

              {/* Primary Copy / Body */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Ad Copy / Body Text</span>
                  <button
                    onClick={() => handleCopyText(selectedCampaign.primaryText, "body")}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-500 hover:text-indigo-400 transition"
                  >
                    {copiedKey === "body" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    {copiedKey === "body" ? "Copied" : "Copy Copywriting"}
                  </button>
                </div>
                <div className="rounded-2xl border border-border/40 bg-card p-4 text-foreground text-xs leading-relaxed whitespace-pre-wrap">
                  {selectedCampaign.primaryText}
                </div>
              </div>

              {/* Call to Action Button Preview */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-medium">Recommended Button CTA:</span>
                  <span className="rounded-xl bg-indigo-600 px-3.5 py-1.5 font-bold text-white shadow-sm">
                    {selectedCampaign.callToAction}
                  </span>
                </div>

                {selectedCampaign.hashtags && selectedCampaign.hashtags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Hash className="h-3.5 w-3.5 text-indigo-400" />
                    {selectedCampaign.hashtags.join(" ")}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
