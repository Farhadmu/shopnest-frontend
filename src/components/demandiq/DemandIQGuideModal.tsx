"use client";

import { useState } from "react";
import {
  X,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Ship,
  Bot,
  FileSpreadsheet,
  Camera,
  ShieldCheck,
  Zap,
  HelpCircle,
  Sliders,
  Sparkles,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function DemandIQGuideModal({ isOpen, onClose }: Props) {
  const [guideTab, setGuideTab] = useState<
    "quickstart" | "features" | "glossary" | "playbook"
  >("quickstart");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-indigo-500/30 bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/60 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-card p-5 sm:p-6 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <BookOpen className="h-4 w-4" />
              </span>
              <span className="font-mono text-xs font-bold text-indigo-400 uppercase tracking-wider">
                DemandIQ Pro Seller Knowledge Base
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              DemandIQ কীভাবে কাজ করে & প্রতিটি অপশনের আসল ব্যবহার
            </h3>
            <p className="text-xs text-slate-300">
              Master the AI tools, formulas, and strategies that keep your bestsellers in stock and eliminate lost revenue.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-card/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-border/40 bg-muted/20 px-4 sm:px-6 pt-2 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: "quickstart", label: "🚀 Quickstart (শুরু করার নিয়ম)", icon: Zap },
            { id: "features", label: "🛠️ All 6 Features Explained", icon: Sliders },
            { id: "glossary", label: "📖 Glossary & Terms (পরিভাষা)", icon: HelpCircle },
            { id: "playbook", label: "📈 Profit & Stockout Playbook", icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = guideTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() =>
                  setGuideTab(
                    tab.id as "quickstart" | "features" | "glossary" | "playbook"
                  )
                }
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                  isActive
                    ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs leading-relaxed">
          {/* TAB 1: QUICKSTART */}
          {guideTab === "quickstart" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-4 sm:p-5">
                <h4 className="font-extrabold text-sm sm:text-base text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  DemandIQ কী এবং কেন এটি আপনার দোকানের জন্য অপরিহার্য?
                </h4>
                <p className="mt-2 text-muted-foreground text-xs leading-relaxed">
                  ই-কমার্সে বিক্রেতাদের সবচেয়ে বড় ক্ষতি হয় দুটি কারণে: <br />
                  <strong className="text-foreground">১. পণ্য স্টক আউট হয়ে যাওয়া</strong> (কাস্টমার কিনতে এসে খালি হাতে ফেরত যায়, প্রতিযোগী অন্য শপ থেকে কিনে নেয়)। <br />
                  <strong className="text-foreground">২. বেশি পরিমাণ স্লো পণ্য মজুত করে টাকা আটকে রাখা</strong> (Overstocking / Capital Lock)。 <br />
                  DemandIQ আপনার বিক্রির ইতিহাস, দৈনন্দিন গতি (velocity), সরবরাহকারীর শিপিং টাইম এবং কনজিউমার সার্চ ডেটা বিশ্লেষণ করে স্বয়ংক্রিয়ভাবে স্টক আউট ঠেকাতে সাহায্য করে।
                </p>
              </div>

              <h4 className="font-bold text-sm text-foreground pt-1">
                4-Step Pro Seller Daily Routine (দৈনন্দিন ৪ ধাপের রুটিন)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/10 text-xs">
                      1
                    </span>
                    <span>Check Risk Matrix (স্টকআউট ঝুকি দেখুন)</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    প্রতিদিন সকালে <strong>Stockout Prevention</strong> ট্যাবে আসুন। যেসব পণ্যে <strong>Critical (&lt; 3.5d)</strong> লেবেল আছে, সেগুলো ৩ দিনের মধ্যে শেষ হয়ে যাবে।
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-xs">
                      2
                    </span>
                    <span>Inspect Forecast (ভবিষ্যত বিক্রির গ্রাফ)</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    <strong>Demand Forecasting</strong> ট্যাবে গিয়ে পণ্যের আগামী ১৪ দিনের সেলস প্রোজেকশন ও 95% কনফিডেন্স রেঞ্জ দেখে নিশ্চিত হোন ঠিক কত পিস রিয়্যালিস্টিক ডিমান্ড আছে।
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-xs">
                      3
                    </span>
                    <span>Test Shocks (শিপিং বা সাপ্লাই বিলম্ব সিমুলেট)</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    <strong>Shock Simulator</strong> দিয়ে পরীক্ষা করুন: যদি পোর্ট বা কাস্টমস ৭ দিন দেরি করে বা ঈদ ক্যাম্পেইনে ২ গুণ সেলস বাড়ে, তবে আপনার স্টকে কুলাবে কিনা।
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-xs">
                      4
                    </span>
                    <span>Generate PO (সরাসরি পারচেজ অর্ডার তৈরি)</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    <strong>Generate Replenishment PO</strong> বাটনে এক ক্লিকে ৯৮% সার্ভিস লেভেলে সাজানো অফিশিয়াল পারচেজ অর্ডার এক্সপোর্ট করে সাপ্লায়ারের কাছে পাঠিয়ে দিন!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FEATURES */}
          {guideTab === "features" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <TrendingUp className="h-4 w-4 text-indigo-400" />
                    <span>1. Demand Forecasting & Time-Series (ডিমান্ড ফোরকাস্টিং গ্রাফ)</span>
                  </div>
                  <span className="rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2 py-0.5">
                    Holt-Winters ML
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  <strong>কাজ কী:</strong> গত ১৪ দিনের রিয়েল সেলস হিস্ট্রি দেখে আগামী ১৪ দিনের সম্ভাব্য বিক্রি প্রেডিক্ট করে। <br />
                  <strong>গ্রাফ কীভাবে পড়বেন:</strong> সলিড গ্রে লাইন হলো অতীত সেলস, ডটেড ইন্ডিগো লাইন হলো ভবিষ্যত প্রেডিকশন, আর হালকা ব্লু শেইডেড এরিয়া হলো 95% Confidence Interval (সর্বনিম্ন ও সর্বোচ্চ বিক্রির রেঞ্জ)।
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    <span>2. Stockout Prevention & Risk Matrix (স্টকআউট ম্যাট্রিক্স)</span>
                  </div>
                  <span className="rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-bold px-2 py-0.5">
                    Daily Velocity Tracking
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  <strong>কাজ কী:</strong> প্রতিটি SKU-এর বর্তমান স্টক শেষ হতে আর কত দিন বাকি (Days of Supply) এবং কত ডলারের বিক্রি নষ্ট হওয়ার ঝুঁকিতে আছে তা হিসেব করে। <br />
                  <strong>ফিল্টার অপশন:</strong> <br />
                  • <em>Critical (&lt; 3.5d):</em> ৩.৫ দিনের মধ্যে স্টক ০ হবে! সাথে সাথে নতুন অর্ডার দিন। <br />
                  • <em>Warning (3.5 - 8d):</em> আগামী সপ্তাহে স্টক শেষ হবে। অর্ডার রেডি করুন। <br />
                  • <em>Healthy:</em> পরিমিত সেফ স্টক আছে, এখন অর্ডার দেওয়ার প্রয়োজন নেই। <br />
                  • <em>Overstocked:</em> প্রয়োজন চেয়ে বেশি মজুত আছে, অতিরিক্ত মূলধন আটকে আছে।
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <Ship className="h-4 w-4 text-blue-400" />
                    <span>3. Supply Chain Shock Simulator (সাপ্লাই চেইন শক সিমুলেটর)</span>
                  </div>
                  <span className="rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-0.5">
                    Scenario Modeling
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  <strong>কাজ কী:</strong> বাস্তব জীবনের বিভিন্ন ব্যাঘাত ঘটার আগে স্টোরের সহনশীলতা পরীক্ষা করা। যেমন চট্টগ্রাম পোর্ট বা কাস্টমসে জাহাজ আটকে গেলে (Port Delay), অথবা টিকটক বা ফেসবুকে ভাইরাল অর্ডারের ঢল নামলে (Demand Surge)। <br />
                  <strong>ব্যবহার:</strong> স্লাইডার দিয়ে দিন ও গুণিতক পরিবর্তন করে <em>Run Shock Simulation</em> চাপলে সাথে সাথে রেজাল্ট ও স্বয়ংক্রিয় এআই অ্যাকশন প্ল্যান (Mitigation Playbook) পাবেন।
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <Bot className="h-4 w-4 text-emerald-400" />
                    <span>4. Ask DemandIQ (RAG AI Procurement Analyst)</span>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5">
                    Live Catalog Grounded
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  <strong>কাজ কী:</strong> আপনার ব্যক্তিগত ইনভেন্টরি কনসালট্যান্ট। এটি কোনো সাধারণ চ্যাটবট নয়—আপনার বর্তমান রিয়েল টাইম স্টক সংখ্যা, প্রতিদিনের সেলস ভেলোসিটি এবং রিঅর্ডার পয়েন্ট দেখে প্রশ্নোত্তরের সঠিক ডেটাভিত্তিক পরামর্শ দেয়।
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <FileSpreadsheet className="h-4 w-4 text-indigo-400" />
                    <span>5. Smart Purchase Orders (অটোমেটেড পারচেজ অর্ডার)</span>
                  </div>
                  <span className="rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2 py-0.5">
                    EOQ Formula
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  <strong>কাজ কী:</strong> নিজে ক্যালকুলেটরে হিসেব করার ঝামেলা ছাড়া এক ক্লিকে সাপ্লায়ারকে দেওয়ার মতো অফিশিয়াল PO তৈরি করে। এটি সাজানো হয় Economic Order Quantity (EOQ) নীতিতে, যেন ক্যারিং কস্ট এবং শিপিং কস্টের পারফেক্ট ভারসাম্য থাকে।
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <Camera className="h-4 w-4 text-teal-400" />
                    <span>6. Collective Market Demands (ভিজ্যুয়াল সার্চ মার্কেট গ্যাপ)</span>
                  </div>
                  <span className="rounded-full bg-teal-500/10 text-teal-400 text-[10px] font-bold px-2 py-0.5">
                    Unmet Customer Searches
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  <strong>কাজ কী:</strong> ক্রেতারা ছবি আপলোড করে যে পণ্যগুলো খুঁজছেন কিন্তু সাইটে কোনো সেলারের কাছে খুঁজে পাচ্ছেন না (Unmet Demand: 0 in stock), সেই তথ্যগুলো এখানে জমা হয়। আপনি যদি এই পণ্যটি প্রথম আমদানি বা স্টক করেন, আপনি সরাসরি শতভাগ আগ্রহী কাস্টমার পেয়ে যাবেন!
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: GLOSSARY */}
          {guideTab === "glossary" && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              <p className="text-muted-foreground text-[11px]">
                DemandIQ পেজের বিভিন্ন টেকনিক্যাল টার্মের সহজ বাংলা অর্থ ও ব্যবসায়িক তাৎপর্য:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/40 bg-card/50 p-3.5 space-y-1">
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span>Daily Velocity (u/d)</span>
                    <span className="font-mono text-indigo-400 text-[11px]">Units / Day</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    প্রতিদিন গড়ে এই প্রডাক্টটি কত পিস বিক্রি হচ্ছে। যেমন ৫.২ u/d মানে প্রতিদিন গড়ে ৫ থেকে ৬ পিস বিক্রি হচ্ছে।
                  </p>
                </div>

                <div className="rounded-xl border border-border/40 bg-card/50 p-3.5 space-y-1">
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span>Days of Supply (Runway)</span>
                    <span className="font-mono text-indigo-400 text-[11px]">মজুতের স্থায়িত্বকাল</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    বর্তমান স্টক নিয়ে আপনার দোকান আর কত দিন বিক্রি চালিয়ে যেতে পারবে। (Current Stock &divide; Daily Velocity).
                  </p>
                </div>

                <div className="rounded-xl border border-border/40 bg-card/50 p-3.5 space-y-1">
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span>Reorder Point (ROP)</span>
                    <span className="font-mono text-indigo-400 text-[11px]">পুনরায় অর্ডারের সীমা</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    স্টক এই সংখ্যায় নামলেই আজই নতুন সাপ্লাই অর্ডার দিতে হবে। তা না হলে সরবরাহকারী মাল ডেলিভারি দেওয়ার আগেই আপনার স্টক শেষ হয়ে যাবে।
                  </p>
                </div>

                <div className="rounded-xl border border-border/40 bg-card/50 p-3.5 space-y-1">
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span>Recommended EOQ</span>
                    <span className="font-mono text-indigo-400 text-[11px]">Economic Order Qty</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    সবচেয়ে লাভজনক অর্ডারের পরিমাণ। বেশি অর্ডার করলে গোডাউন খরচ বাড়ে, কম অর্ডার করলে বারবার শিপিং চার্জ দিতে হয়। EOQ সেই পারফেক্ট সংখ্যা নির্ধারণ করে।
                  </p>
                </div>

                <div className="rounded-xl border border-border/40 bg-card/50 p-3.5 space-y-1">
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span>Safety Stock Buffer</span>
                    <span className="font-mono text-indigo-400 text-[11px]">জরুরি সেফটি স্টক</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    জরুরি রিজার্ভ বা কুশন ইউনিট। যদি সাপ্লায়ার হঠাৎ ডেলিভারি দিতে ৩ দিন লেট করে, এই সেফটি স্টক তখন ক্রেতাদের চাহিদা পূরণ রাখবে।
                  </p>
                </div>

                <div className="rounded-xl border border-border/40 bg-card/50 p-3.5 space-y-1">
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span>Target SLA (98.0%)</span>
                    <span className="font-mono text-indigo-400 text-[11px]">Service Level</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    টার্গেট সার্ভিস লেভেল। ৯৮% মানে প্রতি ১০০ জন ক্রেতার মধ্যে অন্তত ৯৮ জন এসে আপনার প্রডাক্টটি ইনস্ট্যান্ট রেডি স্টকে পাবে।
                  </p>
                </div>

                <div className="rounded-xl border border-border/40 bg-card/50 p-3.5 space-y-1">
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span>Revenue at Risk ($)</span>
                    <span className="font-mono text-rose-400 text-[11px]">সম্ভাব্য আর্থিক ক্ষতি</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    যদি সময়মতো রিঅর্ডার না করেন, তবে আউট অফ স্টক থাকার কারণে কত টাকার সম্ভাব্য বিক্রয় ও মুনাফা আপনি হারাবেন।
                  </p>
                </div>

                <div className="rounded-xl border border-border/40 bg-card/50 p-3.5 space-y-1">
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span>Gaussian Z-Score (Z=2.05)</span>
                    <span className="font-mono text-indigo-400 text-[11px]">স্ট্যাটিস্টিকাল বাফার</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    গণিত ও সম্ভাব্যতা তত্ত্বের স্ট্যান্ডার্ড নরমাল ডিস্ট্রিবিউশন স্কোর, যা ৯৮% নিশ্চিত ফুলফিলমেন্ট নিশ্চয়তা দেয়।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PLAYBOOK */}
          {guideTab === "playbook" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  সফল সেলারদের স্টক ম্যানেজমেন্টের ৩টি গোল্ডেন রুল
                </h4>
                <ul className="space-y-2 text-muted-foreground text-[11px] list-disc list-inside">
                  <li>
                    <strong className="text-foreground">কখনোই Days of Supply ৩ দিনের নিচে নামতে দেবেন না:</strong>{" "}
                    সরবরাহকারীর পৌঁছাতে সাধারণত ২ থেকে ৬ দিন লাগে। ৩ দিনের নিচে নামা মানেই আপনি নিশ্চিত স্টকআউটের শিকার হবেন।
                  </li>
                  <li>
                    <strong className="text-foreground">উচ্চ ভেলোসিটি আইটেমে সেফটি স্টক বাড়িয়ে রাখুন:</strong>{" "}
                    যেসব SKU প্রতিদিন ৫টির বেশি বিক্রি হয়, সেগুলোতে সেফটি বাফার অন্তত ৫ দিনের সেলস সমান রাখুন।
                  </li>
                  <li>
                    <strong className="text-foreground">সপ্তাহে একবার PO জেনারেট করে সাপ্লায়ারের শিডিউল বুক করুন:</strong>{" "}
                    DemandIQ-এর PO ব্যবহার করে সাপ্লায়ারকে আগে থেকেই অর্ডারের পূর্বাভাস দিলে পিক সিজনেও দ্রুত ডেলিভারি পাওয়া যায়।
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-5 py-3 shrink-0">
          <span className="text-[11px] text-muted-foreground">
            DemandIQ v2.4 SME Inventory Intelligence
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition shadow"
          >
            বুঝেছি, পেজে ফিরে যান
          </button>
        </div>
      </div>
    </div>
  );
}
