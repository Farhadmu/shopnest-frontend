"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Bot,
  Send,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Headphones,
  Laptop,
  Flame,
  Star,
  ExternalLink,
  ShoppingBag,
  Zap,
  SlidersHorizontal,
  ShieldCheck,
  Cpu,
  ChevronRight,
  Compass,
} from "lucide-react";

interface Product {
  name: string;
  category: string;
  price: string;
  originalPrice?: string;
  rating: number;
  reviews: number;
  matchScore: number;
  specs: string[];
  why: string;
  badge?: string;
}

interface Scenario {
  title: string;
  icon: React.ReactNode;
  userPrompt: string;
  aiReply: string;
  userFollowup: string;
  product: Product;
}

const SCENARIOS: Scenario[] = [
  {
    title: "ANC Headphones",
    icon: <Headphones className="w-3.5 h-3.5" />,
    userPrompt: "I need wireless ANC headphones for work under $150.",
    aiReply: "Found 12 verified models. Prioritizing mic isolation, ANC, and 40h+ battery.",
    userFollowup: "Prioritize multipoint pairing and top-tier noise cancelling.",
    product: {
      name: "Soundcore Space Q45 ANC",
      category: "Audio",
      price: "$129.99",
      originalPrice: "$149.99",
      rating: 4.8,
      reviews: 1420,
      matchScore: 98,
      specs: ["Adaptive ANC", "50h Battery", "Dual-Beam Mics", "LDAC Hi-Res"],
      why: "98% noise reduction with 50-hour stamina under the $150 budget limit.",
      badge: "Best Value",
    },
  },
  {
    title: "Creator Laptop",
    icon: <Laptop className="w-3.5 h-3.5" />,
    userPrompt: "Need a lightweight laptop for coding & 4K editing under $1,100.",
    aiReply: "Analyzing 18 models. Filtering for 16GB+ RAM, OLED, and high efficiency.",
    userFollowup: "Needs 100% DCI-P3 color accuracy and weight under 3 lbs.",
    product: {
      name: "ZenBook 14 OLED Evo Pro",
      category: "Laptops",
      price: "$999.00",
      originalPrice: "$1,199.00",
      rating: 4.9,
      reviews: 890,
      matchScore: 99,
      specs: ["Intel Core Ultra 7", "16GB LPDDR5X", "14\" 2.8K OLED", "2.82 lbs"],
      why: "100% DCI-P3 color gamut, aluminum chassis, and 15hr battery life.",
      badge: "Top Match",
    },
  },
  {
    title: "Trail Shoes",
    icon: <Flame className="w-3.5 h-3.5" />,
    userPrompt: "Need waterproof trail running shoes with max cushioning for muddy 10k.",
    aiReply: "Cross-referencing 24 tests. Filtering for GORE-TEX and high-traction lugs.",
    userFollowup: "Must have wide toe-box and breathable waterproof membrane.",
    product: {
      name: "CloudMonster All-Weather GTX",
      category: "Footwear",
      price: "$169.00",
      originalPrice: "$185.00",
      rating: 4.8,
      reviews: 650,
      matchScore: 96,
      specs: ["GORE-TEX Waterproof", "4mm Missiongrip", "Dual CloudTec", "Wide Fit"],
      why: "Unrivaled wet-rock grip and plush energy return designed for trail runs.",
      badge: "Editor's Pick",
    },
  },
];

const HIGHLIGHTS = [
  { icon: <Zap className="w-3.5 h-3.5 text-amber-500" />, label: "Sub-second Matching" },
  { icon: <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />, label: "Spec-Level Tradeoff Analysis" },
  { icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />, label: "Verified Seller & Price Check" },
];

export default function AiIntelligenceSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isAuto, setIsAuto] = useState(true);
  const [messages, setMessages] = useState<Array<{ id: string; sender: "user" | "ai"; text: string; product?: Product; confirmed?: boolean }>>([]);
  const [step, setStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const chatRef = useRef<HTMLDivElement | null>(null);

  const scenario = SCENARIOS[activeIdx];

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isAuto) return;
    let t: NodeJS.Timeout;
    const seq = [
      () => { setMessages([{ id: "1", sender: "user", text: scenario.userPrompt }]); setStep(1); },
      () => {
        setIsTyping(true);
        t = setTimeout(() => {
          setIsTyping(false);
          setMessages(m => [...m, { id: "2", sender: "ai", text: scenario.aiReply }]);
          setStep(2);
        }, 1000);
      },
      () => { t = setTimeout(() => { setMessages(m => [...m, { id: "3", sender: "user", text: scenario.userFollowup }]); setStep(3); }, 800); },
      () => {
        setIsTyping(true);
        t = setTimeout(() => {
          setIsTyping(false);
          setMessages(m => [...m, { id: "4", sender: "ai", text: `Top recommendation (${scenario.product.matchScore}% Match Score):`, product: scenario.product }]);
          setStep(4);
        }, 1200);
      },
      () => {
        t = setTimeout(() => {
          setMessages(m => [...m, { id: "5", sender: "ai", text: `✅ ${scenario.product.name} confirmed.`, confirmed: true }]);
          t = setTimeout(() => { setActiveIdx(i => (i + 1) % SCENARIOS.length); setMessages([]); setStep(0); }, 4000);
        }, 1200);
      },
    ];
    if (step < seq.length) t = setTimeout(seq[step], step === 0 ? 300 : 600);
    return () => clearTimeout(t);
  }, [step, activeIdx, isAuto, scenario]);

  const selectScenario = (i: number) => {
    setActiveIdx(i);
    setMessages([]);
    setStep(0);
    setIsTyping(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    setIsAuto(false);
    const q = customInput.trim();
    setCustomInput("");
    setMessages(m => [...m, { id: Date.now().toString(), sender: "user", text: q }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const low = q.toLowerCase();
      const prod = low.includes("laptop") || low.includes("pc") ? SCENARIOS[1].product : low.includes("shoe") || low.includes("run") ? SCENARIOS[2].product : low.includes("audio") || low.includes("headphone") ? SCENARIOS[0].product : {
        name: `Custom Match: ${q.slice(0, 24)}`,
        category: "Personalized Match",
        price: "$89.99",
        originalPrice: "$119.00",
        rating: 4.9,
        reviews: 420,
        matchScore: 98,
        specs: ["Direct Stock", "Top Rated", "Fast 2-Day Delivery", "Buyer Protection"],
        why: `Matched directly for "${q}" with verified seller credentials.`,
        badge: "AI Selected",
      };
      setMessages(m => [...m, { id: (Date.now() + 1).toString(), sender: "ai", text: `Found optimal product for "${q}":`, product: prod }]);
    }, 1000);
  };

  return (
    <section className="py-6 sm:py-10">
      <div className="group relative overflow-hidden rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl transition-all duration-500 hover:shadow-2xl">
        {/* Conic Glow & Surface Backgrounds */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none p-[2px]">
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 7, repeat: Infinity, ease: "linear" }} style={{ background: "conic-gradient(from 0deg at 50% 50%, transparent 0%, transparent 60%, var(--color-primary) 85%, var(--color-accent) 95%, var(--color-primary) 100%)" }} className="absolute -inset-[60%] opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        <div className="absolute inset-[1.5px] rounded-[22px] bg-surface/95 dark:bg-surface/95 backdrop-blur-xl z-0" />
        <div className="absolute inset-0 rounded-3xl pointer-events-none z-[1] opacity-40 bg-[radial-gradient(circle_at_20%_20%,var(--color-primary)_0%,transparent_60%)]" />

        {/* Two-Column Grid */}
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_1.2fr] lg:gap-12 items-center">
          {/* Left Column: Information & CTAs */}
          <div className="flex flex-col space-y-6">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary shadow-xs">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>ShopNest AI Advisor</span>
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
              </span>
              <span className="rounded-full bg-muted-bg px-2.5 py-1 text-[11px] font-semibold text-muted">v2.4 Neural Matcher</span>
            </div>

            <div>
              <h2 className="text-3xl font-black tracking-tight text-text sm:text-4xl lg:text-5xl leading-[1.15]">
                Tell us what you need.{" "}
                <span className="block mt-1 bg-gradient-to-r from-primary via-accent to-warm bg-clip-text text-transparent">
                  Let AI narrow it down.
                </span>
              </h2>
              <p className="mt-4 text-base text-muted leading-relaxed max-w-xl">
                No more opening 30 tabs to compare specs. Speak naturally, set constraints, and let our neural shopping engine find the exact best match in seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {HIGHLIGHTS.map((h, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-border/80 bg-surface/80 p-2.5 shadow-xs">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted-bg">{h.icon}</div>
                  <span className="text-xs font-semibold text-text leading-snug">{h.label}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted">
                <span className="flex items-center gap-1.5"><Compass className="w-3.5 h-3.5 text-primary" /> Try a sample prompt</span>
                <span className="text-[11px] font-medium text-primary">Click to simulate</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SCENARIOS.map((sc, i) => (
                  <button
                    key={i}
                    onClick={() => selectScenario(i)}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                      activeIdx === i ? "border border-primary bg-primary text-surface shadow-md scale-[1.02]" : "border border-border bg-muted-bg/60 text-text hover:border-primary/50"
                    }`}
                  >
                    {sc.icon}<span>{sc.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Advisor Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <Link
                href="/ai-advisor"
                className="group/btn inline-flex items-center gap-2.5 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-surface shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-primary/35"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Try AI Advisor</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>
              <Link href="/products" className="inline-flex items-center gap-2 rounded-xl border border-border/90 bg-muted-bg/60 px-5 py-3.5 text-sm font-bold text-text hover:border-primary/50 hover:bg-surface hover:text-primary transition-all">
                <span>Browse Products</span>
              </Link>
              <div className="flex items-center gap-2 text-xs text-muted font-medium ml-auto sm:ml-0">
                <div className="flex items-center gap-1 text-amber-500"><Star className="w-4 h-4 fill-amber-500" /><span className="font-bold text-text">4.9/5</span></div>
                <span>•</span><span>50K+ matches</span>
              </div>
            </div>
          </div>

          {/* Right Column: AI Assistant Chat Interface */}
          <div className="relative flex h-[500px] sm:h-[520px] flex-col rounded-2xl border border-border bg-surface/90 shadow-2xl backdrop-blur-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/80 bg-muted-bg/40 px-4 sm:px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-accent text-surface shadow-md">
                  <Bot className="w-5 h-5" />
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-surface" />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2"><h3 className="text-sm font-bold text-text">ShopNest AI Assistant</h3><span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">Live</span></div>
                  <p className="text-[11px] text-muted">{isAuto ? "Auto Simulation" : "Interactive Mode"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/ai-advisor" className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-surface transition-all">
                  <span>Full Screen</span><ExternalLink className="w-3 h-3" />
                </Link>
                <button type="button" onClick={() => { setIsAuto(true); setMessages([]); setStep(0); }} title="Restart" className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted hover:text-text">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 text-sm">
              <AnimatePresence mode="popLayout" initial={false}>
                {messages.map((m) => (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
                    <div className={`max-w-[88%] rounded-2xl p-3 text-xs sm:text-sm font-medium leading-relaxed ${m.sender === "user" ? "rounded-br-xs bg-primary text-surface" : "rounded-bl-xs border border-border bg-muted-bg/80 text-text"}`}>
                      {m.text}
                    </div>
                    {m.product && (
                      <div className="mt-2 w-full max-w-[92%] rounded-2xl border border-primary/30 bg-surface p-3.5 shadow-md">
                        <div className="flex items-center justify-between gap-2 border-b border-border/70 pb-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <Zap className="w-3 h-3" /> {m.product.matchScore}% Match
                          </span>
                          <span className="text-[11px] font-bold text-primary">{m.product.badge}</span>
                        </div>
                        <div className="mt-2 flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-text text-sm">{m.product.name}</h4>
                            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span className="font-bold text-text">{m.product.rating}</span>
                              <span>({m.product.reviews} reviews)</span>
                            </div>
                          </div>
                          <div className="text-right font-black text-primary text-base">{m.product.price}</div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {m.product.specs.map((s, idx) => <span key={idx} className="rounded-md border border-border bg-muted-bg/60 px-2 py-0.5 text-[10px] font-medium">{s}</span>)}
                        </div>
                        <p className="mt-2 rounded-lg bg-primary/5 p-2 text-[11px] text-muted border border-primary/10"><strong className="text-primary font-bold">Why it wins: </strong>{m.product.why}</p>
                        <div className="mt-2.5 flex items-center gap-2">
                          <Link href="/products" className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-bold text-surface hover:bg-primary-hover"><ShoppingBag className="w-3.5 h-3.5" /> Select</Link>
                          <Link href="/ai-advisor" className="inline-flex items-center justify-center gap-1 rounded-xl border border-border bg-muted-bg px-3 py-2 text-xs font-bold text-text hover:border-primary/40">Details <ExternalLink className="w-3 h-3" /></Link>
                        </div>
                      </div>
                    )}
                    {m.confirmed && (
                      <div className="mt-2 flex w-full items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Item verified & selected</span>
                        <Link href="/products" className="inline-flex items-center text-[11px] underline">Shop now <ChevronRight className="w-3 h-3" /></Link>
                      </div>
                    )}
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 rounded-2xl rounded-bl-xs border border-border bg-muted-bg/80 px-3.5 py-2 text-xs text-muted self-start">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                    <span className="text-[11px] font-medium ml-1">Analyzing specs...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Chat Input */}
            <div className="border-t border-border/80 bg-surface/95 p-3 backdrop-blur-md">
              <form onSubmit={handleCustomSubmit} className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Ask AI anything (e.g. 'ANC headphones under $150')..."
                  className="w-full rounded-xl border border-border bg-muted-bg/50 px-3.5 py-2 text-xs sm:text-sm text-text placeholder:text-muted focus:border-primary focus:outline-none"
                />
                <button type="submit" disabled={!customInput.trim()} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-surface hover:bg-primary-hover disabled:opacity-40">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted px-1">
                <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-primary" /> Neural shopping active</span>
                <span>{isAuto ? "Auto-Play Demo" : "Interactive Mode"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}