"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useCartDrawer } from "@/context/CartDrawerContext";
import { followStore, getStoreFollowStatus, sendSellerMessage, unfollowStore } from "@/lib/api/messages";
import { getStoreCoupons } from "@/lib/api/coupons";
import type { Coupon } from "@/types/coupon";
import type { StoreData } from "@/types/store";
import { toast } from "@/context/ToastContext";
import StoreBanner from "./StoreBanner";
import StoreProfileHeader from "./StoreProfileHeader";
import StoreTabs from "./StoreTabs";
import StoreTrustCard from "./StoreTrustCard";
import ReviewFilters from "./ReviewFilters";
import ReviewsList from "./ReviewsList";
import MerchantAssurance from "./MerchantAssurance";
import TopSellerProducts from "./TopSellerProducts";
import StoreVoucher from "./StoreVoucher";
import StoreCouponsGrid from "./StoreCouponsGrid";

export default function StoreDetailsClient({ store }: { store: StoreData }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem } = useCartDrawer();
  const [activeTab, setActiveTab] = useState("All Products");
  const [reviewFilter, setReviewFilter] = useState("All Reviews");
  const [followed, setFollowed] = useState(() =>
    typeof window !== "undefined" && window.localStorage.getItem(`shopnest-follow-${store.id}`) === "true"
  );
  const [messageOpen, setMessageOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messageStatus, setMessageStatus] = useState<string | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (session?.user) {
      getStoreFollowStatus(store.id)
        .then((result) => setFollowed(result.followed))
        .catch(() => setFollowed(false));
    }
    const targetSellerId = store.ownerId || store.storeId || store._id || store.id;
    if (targetSellerId) {
      getStoreCoupons(targetSellerId).then(setCoupons).catch(() => setCoupons([]));
    }
  }, [session?.user, store.id, store.ownerId, store.storeId, store._id]);

  const filteredReviews = useMemo(() => {
    if (reviewFilter === "5 Stars") return store.reviewsList.filter((review) => review.rating === 5);
    if (reviewFilter === "With Photos") return store.reviewsList.filter((review) => review.images?.length);
    if (reviewFilter === "Packaging Quality") return store.reviewsList.filter((review) => Number(review.packaging) >= 4.5);
    return store.reviewsList;
  }, [reviewFilter, store.reviewsList]);

  const bestCoupon = useMemo(() => {
    if (coupons.length === 0) return null;
    return [...coupons].sort((a, b) => {
      const aVal = a.type === "percentage" ? a.value * 10 : a.value;
      const bVal = b.type === "percentage" ? b.value * 10 : b.value;
      return bVal - aVal;
    })[0];
  }, [coupons]);

  const voucher = bestCoupon
    ? {
        discount:
          bestCoupon.type === "percentage"
            ? `${bestCoupon.value}% OFF`
            : bestCoupon.type === "free-shipping"
            ? "FREE DELIVERY"
            : `৳${bestCoupon.value} OFF`,
        terms:
          bestCoupon.scope === "all-products"
            ? "Applicable on: All store items"
            : bestCoupon.scope === "specific-category" && (bestCoupon.category || bestCoupon.categories?.length)
            ? `Applicable on: ${bestCoupon.categories?.join(", ") || bestCoupon.category}`
            : "Special store promotion",
        validTill: bestCoupon.expiresAt
          ? `Valid till ${new Date(bestCoupon.expiresAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}`
          : "Limited time offer",
        code: bestCoupon.code,
      }
    : store.storeVoucher;

  const toggleFollow = async () => {
    if (!session?.user) {
      router.push(`/login?next=${encodeURIComponent(`/stores/${store.id}`)}`);
      return;
    }
    const next = !followed;
    setFollowed(next);
    if (next) {
      toast.wishlist(`Now following ${store.name}!`, {
        description: "You will receive updates on new products and offers",
      });
    } else {
      toast.info(`Unfollowed ${store.name}`);
    }
    try {
      await (next ? followStore(store.id) : unfollowStore(store.id));
    } catch {
      setFollowed(!next);
      toast.error("Could not update follow status");
    }
  };

  const handleMessage = async () => {
    if (!session?.user) {
      router.push(`/login?next=${encodeURIComponent(`/stores/${store.id}`)}`);
      return;
    }
    if (!store.ownerId) {
      setMessageStatus("This store is not connected to a seller account yet.");
      return;
    }
    setIsSendingMessage(true);
    setMessageStatus("Sending message...");
    try {
      await sendSellerMessage({ receiverId: store.ownerId, subject: `Message about ${store.name}`, message: message.trim() || `Hello ${store.name}, I would like to know more about your store.` });
      setMessageStatus("Message sent successfully");
      setMessage("");
      toast.success("Message sent to seller!");
    } catch (error) {
      setMessageStatus(error instanceof Error ? error.message : "Unable to send message");
      toast.error("Unable to send message");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleAddToCart = async (product: StoreData["products"][number]) => {
    const productId = product.id || product._id;
    if (!productId) return;
    const numericPrice = Number(String(product.price).replace(/[^0-9.]/g, ""));
    await addItem({ productId, price: numericPrice, title: product.name, image: product.image, images: [product.image] });
  };

  const handleCopy = async () => {
    if (!voucher.code) return;
    await navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    toast.success(`Voucher "${voucher.code}" copied!`, {
      description: "Paste it at checkout to claim your discount",
    });
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16 font-sans text-slate-900 dark:bg-slate-950 dark:text-white">
      <StoreBanner banner={store.banner} storeName={store.name} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <StoreProfileHeader
          store={store}
          followed={followed}
          onFollow={toggleFollow}
        />
        <StoreTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {messageOpen && (
          <div className="mb-6 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Message {store.name}</h2>
              <button type="button" onClick={() => { setMessageOpen(false); setMessageStatus(null); }} className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer">Close</button>
            </div>
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write your message..." className="mt-4 min-h-24 w-full rounded-xl border border-slate-200/90 bg-white p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-950" />
            <button type="button" onClick={handleMessage} disabled={isSendingMessage} className="mt-3 rounded-xl bg-primary hover:bg-primary/90 px-4 py-2.5 text-sm font-semibold text-white shadow-xs shadow-primary/25 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer transition">
              {isSendingMessage ? "Sending..." : "Send Message"}
            </button>
            {messageStatus && (
              <p className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${
                messageStatus === "Message sent successfully"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : messageStatus === "Sending message..."
                    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                    : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
              }`} role="status">
                {messageStatus}
              </p>
            )}
          </div>
        )}

        {activeTab === "All Products" && (
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-8">
              <StoreTrustCard store={store} />
              <ReviewFilters reviewsCount={String(store.reviewsList.length)} activeFilter={reviewFilter} onFilterChange={setReviewFilter} />
              <ReviewsList reviews={filteredReviews} storeName={store.name} />
            </div>
            <div className="space-y-5 lg:col-span-4">
              <TopSellerProducts
                products={store.products}
                productsCount={store.productsCount}
                onAddToCart={handleAddToCart}
                catalogUrl={`/products?seller=${encodeURIComponent(store.storeId || store._id || store.slug || store.id)}`}
              />
              <StoreVoucher
                voucher={voucher}
                copied={copied}
                onCopy={handleCopy}
                totalCoupons={coupons.length}
                onViewAllCoupons={() => setActiveTab("Vouchers & Deals")}
              />
            </div>
          </div>
        )}

        {activeTab === "Store Reviews" && (
          <div className="max-w-4xl space-y-5">
            <StoreTrustCard store={store} />
            <ReviewFilters reviewsCount={String(store.reviewsList.length)} activeFilter={reviewFilter} onFilterChange={setReviewFilter} />
            <ReviewsList reviews={filteredReviews} storeName={store.name} />
          </div>
        )}

        {activeTab === "Vouchers & Deals" && (
          <div className="max-w-5xl">
            <StoreCouponsGrid
              coupons={coupons}
              storeName={store.name}
              sellerId={store.storeId || store._id || store.slug || store.ownerId || store.id}
            />
          </div>
        )}

        {activeTab === "About Merchant & Policies" && (
          <div className="max-w-2xl">
            <MerchantAssurance items={store.merchantAssurance} onInquire={() => setMessageOpen(true)} />
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">About this merchant</h2>
              <p className="mt-2 leading-6">{store.tagline}</p>
              <p className="mt-3">Products listed: {store.productsCount}</p>
              <p className="mt-1">Customer ratings: {store.reviewsCount}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
