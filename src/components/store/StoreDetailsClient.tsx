"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useCartDrawer } from "@/context/CartDrawerContext";
import { followStore, getStoreFollowStatus, sendSellerMessage, unfollowStore } from "@/lib/api/messages";
import { getStoreCoupons } from "@/lib/api/coupons";
import type { Coupon } from "@/types/coupon";
import type { StoreData } from "@/types/store";
import StoreBanner from "./StoreBanner";
import StoreProfileHeader from "./StoreProfileHeader";
import StoreTabs from "./StoreTabs";
import StoreTrustCard from "./StoreTrustCard";
import ReviewFilters from "./ReviewFilters";
import ReviewsList from "./ReviewsList";
import MerchantAssurance from "./MerchantAssurance";
import TopSellerProducts from "./TopSellerProducts";
import StoreVoucher from "./StoreVoucher";

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
    if (store.ownerId) getStoreCoupons(store.ownerId).then(setCoupons).catch(() => setCoupons([]));
  }, [session?.user, store.id, store.ownerId]);

  const filteredReviews = useMemo(() => {
    if (reviewFilter === "5 Stars") return store.reviewsList.filter((review) => review.rating === 5);
    if (reviewFilter === "With Photos") return store.reviewsList.filter((review) => review.images?.length);
    if (reviewFilter === "Packaging Quality") return store.reviewsList.filter((review) => Number(review.packaging) >= 4.5);
    return store.reviewsList;
  }, [reviewFilter, store.reviewsList]);

  const voucher = coupons[0]
    ? {
        discount: coupons[0].type === "percentage" ? `${coupons[0].value}% OFF` : `৳${coupons[0].value} OFF`,
        validTill: coupons[0].expiresAt ? `Valid till ${new Date(coupons[0].expiresAt).toLocaleDateString()}` : "No expiry date",
        code: coupons[0].code,
      }
    : store.storeVoucher;

  const toggleFollow = async () => {
    if (!session?.user) {
      router.push(`/login?next=${encodeURIComponent(`/stores/${store.id}`)}`);
      return;
    }
    const next = !followed;
    setFollowed(next);
    try {
      await (next ? followStore(store.id) : unfollowStore(store.id));
    } catch {
      setFollowed(!next);
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
    } catch (error) {
      setMessageStatus(error instanceof Error ? error.message : "Unable to send message");
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
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-16 font-sans text-slate-900 dark:bg-slate-950 dark:text-white">
      <StoreBanner banner={store.banner} storeName={store.name} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <StoreProfileHeader
          store={store}
          followed={followed}
          onFollow={toggleFollow}
        />
        <StoreTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {messageOpen && (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-white p-5 shadow-sm dark:border-blue-500/30 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Message {store.name}</h2>
              <button type="button" onClick={() => { setMessageOpen(false); setMessageStatus(null); }} className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white">Close</button>
            </div>
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write your message..." className="mt-4 min-h-24 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" />
            <button type="button" onClick={handleMessage} disabled={isSendingMessage} className="mt-3 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
              {isSendingMessage ? "Sending..." : "Send Message"}
            </button>
            {messageStatus && (
              <p className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${
                messageStatus === "Message sent successfully"
                  ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                  : messageStatus === "Sending message..."
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
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
              <TopSellerProducts products={store.products} productsCount={store.productsCount} onAddToCart={handleAddToCart} />
              <StoreVoucher voucher={voucher} copied={copied} onCopy={handleCopy} />
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
          <div className="max-w-xl space-y-5">
            <StoreVoucher voucher={voucher} copied={copied} onCopy={handleCopy} />
            {coupons.length === 0 && <p className="text-sm text-slate-500">No active voucher is available for this store.</p>}
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
