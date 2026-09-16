"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  FaRobot,
  FaPaperPlane,
  FaSpinner,
  FaShoppingBag,
  FaStar,
  FaUserLock,
  FaBox,
  FaHeart,
  FaArrowRight,
  FaQuestionCircle,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { askCommerceCompanion, CommerceCompanionOrder, CommerceCompanionWishlistItem, CommerceCompanionCartItem, CommerceCompanionAction } from "@/lib/api/commerce-companion";

export interface SuggestedProduct {
  id: string;
  title: string;
  price: number;
  category: string;
  ratingAvg?: number;
  stock?: number;
  images?: string[];
  discountPrice?: number;
  specifications?: Record<string, string>;
  freeDelivery?: boolean;
  warrantyMonths?: number;
  seller?: { storeName: string; trustScore: number };
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  products?: SuggestedProduct[];
  orders?: CommerceCompanionOrder[];
  wishlistItems?: CommerceCompanionWishlistItem[];
  cartItems?: CommerceCompanionCartItem[];
  cartSummary?: { subtotal: number; itemCount: number };
  navigation?: CommerceCompanionAction[];
  actions?: CommerceCompanionAction[];
  thinking?: string;
}

interface AiAdvisorViewProps {
  isDashboard?: boolean;
}

const SAMPLE_PROMPTS = [
  "💻 Best programming laptop under ৳80,000 with good battery life",
  "🎧 Wireless headphones for gaming under ৳5,000",
  "📱 Compare Samsung vs iPhone for camera",
  "📦 Where is my latest order?",
  "❤️ Show my wishlist",
];

export function AiAdvisorView({ isDashboard = false }: AiAdvisorViewProps) {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content:
        "Hey! I'm your ShopNest AI Commerce Companion. I can help you find products, track orders, manage your cart and wishlist, explain how ShopNest works, and assist with returns, delivery, and more. What are you shopping for today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [activeProducts, setActiveProducts] = useState<SuggestedProduct[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const idCounterRef = useRef(0);

  const generateId = useCallback((prefix: string) => `${prefix}-${++idCounterRef.current}`, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsgId = generateId("user");
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const data = await askCommerceCompanion(query, undefined, { route: "/ai-advisor" });
      const replyText = data.reply || "I couldn't process that. Could you try rephrasing?";
      const thinkingText = data.thinking;

      if (data?.products && data.products.length > 0) {
        setActiveProducts(data.products);
      } else if (data?.orders && data.orders.length > 0) {
        setActiveProducts([]);
      } else if (data?.wishlistItems && data.wishlistItems.length > 0) {
        setActiveProducts([]);
      } else if (data?.cartItems && data.cartItems.length > 0) {
        setActiveProducts([]);
      } else {
        setActiveProducts([]);
      }

      const aiMsg: ChatMessage = {
        id: generateId("ai"),
        role: "assistant",
        content: replyText,
        products: data?.products,
        orders: data?.orders,
        wishlistItems: data?.wishlistItems,
        cartItems: data?.cartItems,
        cartSummary: data?.cartSummary,
        navigation: data?.navigation,
        actions: data?.actions,
        thinking: thinkingText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: generateId("err"),
        role: "assistant",
        content: err instanceof Error ? err.message : "I'm having trouble connecting right now. Please try again shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderProductCard = (product: SuggestedProduct) => {
    const pid = product.id;
    return (
      <Link
        key={pid}
        href={`/products/${pid}`}
        className="group block rounded-2xl border border-border bg-muted-bg/30 p-4 transition duration-200 hover:border-primary/50 hover:bg-surface hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold text-text group-hover:text-primary transition line-clamp-1">
            {product.title}
          </h4>
          <span className="shrink-0 text-sm font-black text-primary">
            ৳{product.price.toLocaleString()}
          </span>
        </div>

        {product.discountPrice && product.discountPrice < product.price && (
          <span className="mt-1 inline-block text-[10px] font-bold text-red-500 line-through">
            ৳{product.price.toLocaleString()}
          </span>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="rounded-md bg-muted-bg px-2 py-0.5 text-[10px] font-bold uppercase text-muted">
            {product.category}
          </span>
          {product.ratingAvg !== undefined && (
            <span className="flex items-center gap-1 text-amber-500 font-semibold text-[11px]">
              <FaStar size={10} /> {product.ratingAvg}
            </span>
          )}
          {product.stock !== undefined && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {product.stock} in stock
            </span>
          )}
          {product.freeDelivery && (
            <span className="text-[10px] font-bold text-primary">Free delivery</span>
          )}
        </div>

        {product.seller && (
          <p className="mt-1.5 text-[10px] text-muted">Seller: {product.seller.storeName} (Trust: {product.seller.trustScore})</p>
        )}
      </Link>
    );
  };

  const renderOrderCard = (order: CommerceCompanionOrder) => {
    return (
      <Link
        key={order.id}
        href={`/orders/${order.id}`}
        className="block rounded-2xl border border-border bg-muted-bg/30 p-4 transition hover:border-primary/50 hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaBox className="text-primary" size={14} />
            <span className="text-sm font-bold text-text">Order #{order.id.slice(-6)}</span>
          </div>
          <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            {order.status}
          </span>
        </div>
        <div className="mt-2 text-xs text-muted">
          <p>Total: <span className="font-bold text-text">৳{order.totalAmount.toLocaleString()}</span></p>
          <p>Items: {order.items.length} | {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      </Link>
    );
  };

  const renderWishlistCard = (item: CommerceCompanionWishlistItem) => {
    return (
      <Link
        key={item.productId}
        href={`/products/${item.productId}`}
        className="flex items-center gap-3 rounded-2xl border border-border bg-muted-bg/30 p-3 transition hover:border-primary/50 hover:shadow-md"
      >
        {item.images?.[0] && (
          <img src={item.images[0]} alt={item.title} className="h-12 w-12 rounded-xl object-cover" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text truncate">{item.title}</p>
          <p className="text-xs text-primary font-bold">৳{item.price.toLocaleString()}</p>
        </div>
        <FaHeart className="text-red-500" size={12} />
      </Link>
    );
  };

  const renderCartCard = (item: CommerceCompanionCartItem) => {
    return (
      <div key={item.productId} className="flex items-center gap-3 rounded-2xl border border-border bg-muted-bg/30 p-3">
        {item.image && (
          <img src={item.image} alt={item.title} className="h-12 w-12 rounded-xl object-cover" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text truncate">{item.title}</p>
          <p className="text-xs text-muted">Qty: {item.quantity} | ৳{item.price.toLocaleString()} each</p>
        </div>
      </div>
    );
  };

  return (
    <div className={`mx-auto w-full ${isDashboard ? "max-w-7xl" : "max-w-6xl py-6"}`}>
      {/* Header Banner */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-black text-primary">
            <HiSparkles className="animate-spin-slow text-xs" /> ShopNest AI Intelligence
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-text sm:text-3xl">
            AI Commerce Companion
          </h1>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            Your intelligent shopping assistant. Ask me anything about products, orders, delivery, returns, or how ShopNest works.
          </p>
        </div>

        {!isAuthenticated && (
          <div className="flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-300 sm:self-start">
            <FaUserLock className="shrink-0 text-base" />
            <div>
              <p className="font-bold">Guest Mode</p>
              <p className="text-[11px] text-muted">
                Sign in for personalized help with your orders, wishlist, and cart.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Chat Area + Recommendations Panel */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Left Column: Chat Conversation */}
        <div className="flex min-h-[400px] h-[60vh] md:h-[600px] flex-col rounded-3xl border border-border bg-surface shadow-xl shadow-black/5">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted-bg/30">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
                <FaRobot size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-text">ShopNest Commerce Companion</p>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Catalog + Platform Assistant
                </div>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => {
              const isAi = msg.role === "assistant";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAi ? "justify-start" : "justify-end"}`}
                >
                  {isAi && (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary mt-1">
                      <FaRobot size={14} />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-sm sm:max-w-[75%] ${
                      isAi
                        ? "border border-border bg-muted-bg/60 text-text shadow-sm"
                        : "bg-primary font-medium text-white shadow-md shadow-primary/20"
                    }`}
                  >
                    {msg.thinking && (
                      <p className="mb-2 text-[11px] text-muted italic">{msg.thinking}</p>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    <span
                      className={`mt-2 block text-[10px] ${
                        isAi ? "text-muted" : "text-white/70"
                      } text-right`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-3 justify-start">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary mt-1">
                  <FaSpinner size={14} className="animate-spin" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted-bg/60 p-4 text-xs font-semibold text-muted">
                  <FaSpinner className="animate-spin text-primary" /> Checking ShopNest catalog & data...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="border-t border-border/50 px-4 py-2 bg-muted-bg/10 overflow-x-auto no-scrollbar flex gap-2">
            {SAMPLE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="shrink-0 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-muted transition hover:border-primary hover:text-primary disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="border-t border-border p-4 bg-surface rounded-b-3xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about ShopNest, products, orders, delivery, returns..."
                disabled={loading}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-text outline-none focus:border-primary placeholder:text-muted transition disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="grid h-11 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-md shadow-primary/25 transition hover:bg-primary-hover disabled:opacity-50"
              >
                {loading ? <FaSpinner className="animate-spin text-sm" /> : <FaPaperPlane size={14} />}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Context Panel */}
        <div className="flex min-h-[400px] h-[60vh] md:h-[600px] flex-col rounded-3xl border border-border bg-surface p-6 shadow-xl shadow-black/5">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <FaShoppingBag className="text-primary" />
              <h2 className="text-base font-black text-text">Context & Results</h2>
            </div>
            {(activeProducts.length > 0 || messages[messages.length - 1]?.orders?.length) && (
              <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                Live Data
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pt-4 space-y-4">
            {(() => {
              const lastAiMsg = [...messages].reverse().find(m => m.role === "assistant");
              if (!lastAiMsg) {
                return (
                  <div className="flex h-full flex-col items-center justify-center text-center p-6">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-muted-bg text-muted text-xl">
                      <FaQuestionCircle />
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-text">Ready to help</h3>
                    <p className="mt-1 text-xs text-muted max-w-xs">
                      Ask about products, orders, delivery, returns, or how to use ShopNest. I&apos;ll pull real data and help you out.
                    </p>
                  </div>
                );
              }

              return (
                <>
                  {lastAiMsg.products && lastAiMsg.products.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Products</h3>
                      {lastAiMsg.products.map((p) => renderProductCard(p))}
                    </div>
                  )}

                  {lastAiMsg.orders && lastAiMsg.orders.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Your Orders</h3>
                      {lastAiMsg.orders.map((o) => renderOrderCard(o))}
                    </div>
                  )}

                  {lastAiMsg.wishlistItems && lastAiMsg.wishlistItems.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Your Wishlist</h3>
                      {lastAiMsg.wishlistItems.map((item) => renderWishlistCard(item))}
                    </div>
                  )}

                  {lastAiMsg.cartItems && lastAiMsg.cartItems.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Your Cart</h3>
                      {lastAiMsg.cartItems.map((item) => renderCartCard(item))}
                      {lastAiMsg.cartSummary && (
                        <div className="rounded-xl border border-border bg-muted-bg/30 p-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-bold text-text">Cart Total</span>
                            <span className="font-black text-primary">৳{lastAiMsg.cartSummary.subtotal.toLocaleString()}</span>
                          </div>
                          <p className="text-[11px] text-muted mt-1">{lastAiMsg.cartSummary.itemCount} items</p>
                        </div>
                      )}
                    </div>
                  )}

                  {lastAiMsg.navigation && lastAiMsg.navigation.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Quick Actions</h3>
                      <div className="flex flex-col gap-2">
                        {lastAiMsg.navigation.map((nav, i) => (
                          <a
                            key={i}
                            href={nav.targetUrl}
                            className="flex items-center justify-between rounded-xl border border-border bg-muted-bg/30 p-3 transition hover:border-primary/50"
                          >
                            <span className="text-sm font-bold text-text">{nav.label}</span>
                            <FaArrowRight className="text-muted" size={12} />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {lastAiMsg.actions && lastAiMsg.actions.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Actions</h3>
                      <div className="flex flex-col gap-2">
                        {lastAiMsg.actions.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => {}}
                            className="flex items-center justify-between rounded-xl border border-border bg-muted-bg/30 p-3 transition hover:border-primary/50"
                          >
                            <span className="text-sm font-bold text-text">{action.label}</span>
                            <FaArrowRight className="text-muted" size={12} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!lastAiMsg.products && !lastAiMsg.orders && !lastAiMsg.wishlistItems && !lastAiMsg.cartItems && !lastAiMsg.navigation && (
                    <div className="flex h-full flex-col items-center justify-center text-center p-6">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-muted-bg text-muted text-xl">
                        <FaShoppingBag />
                      </div>
                      <h3 className="mt-3 text-sm font-bold text-text">No structured data yet</h3>
                      <p className="mt-1 text-xs text-muted max-w-xs">
                        Ask me to find products, check your orders, view wishlist, or explain how ShopNest works.
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
