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
  FaTimes,
  FaBars,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { askConversationalAdvisor, CommerceCompanionOrder, CommerceCompanionWishlistItem, CommerceCompanionCartItem, CommerceCompanionAction } from "@/lib/api/commerce-companion";

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
  "💻 laptop lagbe programming er jonno",
  "🎧 wireless headphones under 5k",
  "📱 best phone for camera",
  "📦 Where is my order?",
  "❤️ Show my wishlist",
  "🛒 What's in my cart?",
];

export function AiAdvisorView({ isDashboard = false }: AiAdvisorViewProps) {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content:
        "Hey! 👋 I'm your ShopNest AI Advisor. I can help you find products, track orders, manage your cart and wishlist, explain how ShopNest works, and assist with returns, delivery, and more. What are you looking for today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [activeProducts, setActiveProducts] = useState<SuggestedProduct[]>([]);
  const [showContextPanel, setShowContextPanel] = useState(false);
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
      const data = await askConversationalAdvisor(query, conversationId || undefined);
      
      // Store conversation ID for multi-turn context
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }
      
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
        className="group block rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 animate-fadeInUp"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-bold text-text group-hover:text-primary transition line-clamp-2 flex-1">
            {product.title}
          </h4>
          <span className="shrink-0 text-base font-black text-primary">
            ৳{product.price.toLocaleString()}
          </span>
        </div>

        {product.discountPrice && product.discountPrice < product.price && (
          <span className="inline-block text-xs font-bold text-red-500 line-through mb-2">
            ৳{product.price.toLocaleString()}
          </span>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-lg bg-muted px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">
            {product.category}
          </span>
          {product.ratingAvg !== undefined && (
            <span className="flex items-center gap-1 text-amber-500 font-semibold">
              <FaStar size={10} /> {product.ratingAvg.toFixed(1)}
            </span>
          )}
          {product.stock !== undefined && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {product.stock} in stock
            </span>
          )}
          {product.freeDelivery && (
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
              Free delivery
            </span>
          )}
        </div>
      </Link>
    );
  };

  const renderOrderCard = (order: CommerceCompanionOrder) => {
    return (
      <Link
        key={order.id}
        href={`/orders/${order.id}`}
        className="block rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary hover:shadow-md animate-fadeInUp"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FaBox className="text-primary" size={14} />
            <span className="text-sm font-bold text-text">Order #{order.id.slice(-6)}</span>
          </div>
          <span className="rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
            {order.status}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          <p>Total: <span className="font-bold text-text">৳{order.totalAmount.toLocaleString()}</span></p>
          <p>{order.items.length} items • {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      </Link>
    );
  };

  const renderWishlistCard = (item: CommerceCompanionWishlistItem) => {
    return (
      <Link
        key={item.productId}
        href={`/products/${item.productId}`}
        className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-all duration-300 hover:border-primary hover:shadow-md animate-fadeInUp"
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
      <div key={item.productId} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 animate-fadeInUp">
        {item.image && (
          <img src={item.image} alt={item.title} className="h-12 w-12 rounded-xl object-cover" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text truncate">{item.title}</p>
          <p className="text-xs text-muted-foreground">Qty: {item.quantity} • ৳{item.price.toLocaleString()} each</p>
        </div>
      </div>
    );
  };

  return (
    <div className={`mx-auto w-full ${isDashboard ? "max-w-7xl" : "max-w-7xl py-4 sm:py-6 px-3 sm:px-4"}`}>
      {/* Animated Header */}
      <div className="mb-4 sm:mb-6 animate-fadeInDown">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold text-primary mb-2 animate-pulse">
              <HiSparkles className="animate-spin-slow" /> ShopNest AI Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-text bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              AI Commerce Companion
            </h1>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground max-w-2xl">
              Your intelligent shopping assistant. Ask me anything about products, orders, delivery, returns, or how ShopNest works.
            </p>
          </div>

          {!isAuthenticated && (
            <div className="flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 sm:px-4 py-2.5 text-xs backdrop-blur-sm sm:self-start animate-fadeInRight">
              <FaUserLock className="shrink-0 text-base text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-bold text-amber-700 dark:text-amber-300">Guest Mode</p>
                <p className="text-[11px] text-muted-foreground hidden sm:block">
                  Sign in for personalized help
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid - Responsive Layout */}
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-[1fr_400px]">
        {/* Chat Area */}
        <div className="flex flex-col rounded-2xl sm:rounded-3xl border border-border bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden animate-fadeIn" style={{ height: 'calc(100vh - 200px)', minHeight: '500px', maxHeight: '800px' }}>
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-border px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25 animate-float">
                  <FaRobot size={16} className="text-white sm:text-lg" />
                </div>
                <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card animate-pulse" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-text">ShopNest AI</p>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-emerald-500 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </div>
              </div>
            </div>
            
            {/* Mobile Context Panel Toggle */}
            <button
              onClick={() => setShowContextPanel(!showContextPanel)}
              className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors"
            >
              {showContextPanel ? <FaTimes size={18} /> : <FaBars size={18} />}
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 scroll-smooth">
            {messages.map((msg, idx) => {
              const isAi = msg.role === "assistant";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 sm:gap-3 ${isAi ? "justify-start" : "justify-end"} animate-fadeInUp`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {isAi && (
                    <div className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mt-1">
                      <FaRobot size={14} className="text-primary" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-2xl sm:rounded-3xl p-3 sm:p-4 text-sm transition-all duration-300 ${
                      isAi
                        ? "border border-border bg-gradient-to-br from-card to-muted/30 text-text shadow-md backdrop-blur-sm"
                        : "bg-gradient-to-br from-primary to-primary/90 text-white shadow-lg shadow-primary/25"
                    }`}
                  >
                    {msg.thinking && (
                      <p className="mb-2 text-[10px] sm:text-xs text-muted-foreground italic flex items-center gap-1">
                        <FaSpinner className="animate-spin" size={10} /> {msg.thinking}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">{msg.content}</p>
                    <span
                      className={`mt-2 block text-[9px] sm:text-[10px] ${
                        isAi ? "text-muted-foreground" : "text-white/70"
                      } text-right`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-3 justify-start animate-fadeInUp">
                <div className="h-8 w-8 shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mt-1">
                  <FaSpinner size={14} className="animate-spin text-primary" />
                </div>
                <div className="flex items-center gap-2 rounded-3xl border border-border bg-gradient-to-br from-card to-muted/30 px-4 py-3 text-xs font-medium text-muted-foreground shadow-md">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  Thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="border-t border-border/50 px-3 sm:px-4 py-2 bg-muted/30 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 pb-1">
              {SAMPLE_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                  className="shrink-0 rounded-xl border border-border bg-card px-3 py-1.5 text-[11px] sm:text-xs text-muted-foreground transition-all duration-300 hover:border-primary hover:text-primary hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-3 sm:p-4 bg-card/80 backdrop-blur-sm">
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
                placeholder="Ask me anything about ShopNest..."
                disabled={loading}
                className="flex-1 rounded-xl sm:rounded-2xl border border-border bg-background px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary/90 text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {loading ? <FaSpinner className="animate-spin text-sm sm:text-base" /> : <FaPaperPlane size={14} className="sm:text-base" />}
              </button>
            </form>
          </div>
        </div>

        {/* Context Panel - Desktop Always Visible, Mobile as Overlay */}
        <div
          className={`
            ${showContextPanel ? 'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:relative lg:bg-transparent' : 'hidden'}
            lg:block
          `}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowContextPanel(false);
          }}
        >
          <div
            className={`
              ${showContextPanel ? 'fixed right-0 top-0 h-full w-[85%] max-w-sm' : ''}
              lg:static lg:w-full lg:max-w-none
              flex flex-col rounded-2xl sm:rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-4 sm:p-6 shadow-2xl animate-slideInRight
            `}
            style={{ height: showContextPanel ? '100vh' : 'calc(100vh - 200px)', minHeight: '500px', maxHeight: '800px' }}
          >
            {/* Mobile Close Button */}
            <button
              onClick={() => setShowContextPanel(false)}
              className="lg:hidden absolute top-4 right-4 p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            >
              <FaTimes size={16} />
            </button>

            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div className="flex items-center gap-2">
                <FaShoppingBag className="text-primary" />
                <h2 className="text-sm sm:text-base font-black text-text">Context & Results</h2>
              </div>
              {(activeProducts.length > 0 || messages[messages.length - 1]?.orders?.length) && (
                <span className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-bold text-primary animate-pulse">
                  Live Data
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 scroll-smooth">
              {(() => {
                const lastAiMsg = [...messages].reverse().find(m => m.role === "assistant");
                if (!lastAiMsg) {
                  return (
                    <div className="flex h-full flex-col items-center justify-center text-center p-6 animate-fadeIn">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-2xl mb-4 animate-float">
                        <FaQuestionCircle className="text-primary" />
                      </div>
                      <h3 className="text-sm font-bold text-text mb-2">Ready to help</h3>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Ask about products, orders, delivery, returns, or how to use ShopNest.
                      </p>
                    </div>
                  );
                }

                return (
                  <>
                    {lastAiMsg.products && lastAiMsg.products.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                          Products ({lastAiMsg.products.length})
                        </h3>
                        <div className="space-y-3">
                          {lastAiMsg.products.map((p) => renderProductCard(p))}
                        </div>
                      </div>
                    )}

                    {lastAiMsg.orders && lastAiMsg.orders.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Orders</h3>
                        <div className="space-y-3">
                          {lastAiMsg.orders.map((o) => renderOrderCard(o))}
                        </div>
                      </div>
                    )}

                    {lastAiMsg.wishlistItems && lastAiMsg.wishlistItems.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Wishlist</h3>
                        <div className="space-y-3">
                          {lastAiMsg.wishlistItems.map((item) => renderWishlistCard(item))}
                        </div>
                      </div>
                    )}

                    {lastAiMsg.cartItems && lastAiMsg.cartItems.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Cart</h3>
                        <div className="space-y-3">
                          {lastAiMsg.cartItems.map((item) => renderCartCard(item))}
                        </div>
                        {lastAiMsg.cartSummary && (
                          <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-4 animate-fadeInUp">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-text text-sm">Cart Total</span>
                              <span className="font-black text-primary text-lg">৳{lastAiMsg.cartSummary.subtotal.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{lastAiMsg.cartSummary.itemCount} items</p>
                          </div>
                        )}
                      </div>
                    )}

                    {lastAiMsg.navigation && lastAiMsg.navigation.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Quick Actions</h3>
                        <div className="space-y-2">
                          {lastAiMsg.navigation.map((nav, i) => (
                            <a
                              key={i}
                              href={nav.targetUrl}
                              className="flex items-center justify-between rounded-xl border border-border bg-card p-3 transition-all duration-300 hover:border-primary hover:shadow-md hover:-translate-y-0.5 group"
                            >
                              <span className="text-sm font-bold text-text group-hover:text-primary transition">{nav.label}</span>
                              <FaArrowRight className="text-muted-foreground group-hover:text-primary transition" size={12} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {!lastAiMsg.products && !lastAiMsg.orders && !lastAiMsg.wishlistItems && !lastAiMsg.cartItems && !lastAiMsg.navigation && (
                      <div className="flex h-full flex-col items-center justify-center text-center p-6 animate-fadeIn">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-2xl mb-4 animate-float">
                          <FaShoppingBag className="text-primary" />
                        </div>
                        <h3 className="text-sm font-bold text-text mb-2">No data yet</h3>
                        <p className="text-xs text-muted-foreground max-w-xs">
                          Ask me to find products, check orders, or explain ShopNest.
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

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.5s ease-out;
        }

        .animate-fadeInRight {
          animation: fadeInRight 0.5s ease-out;
        }

        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scroll-smooth {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
