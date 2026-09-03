"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getMyStore, MyStore } from "@/lib/api/sellers";
import { LoadingState } from "@/components/common/LoadingState";
import {
  SellerApprovedCard,
  SellerPendingView,
  SellerRejectedCard,
  SellerSuspendedCard,
  SellerBenefitsBar,
  SellerApplicationForm,
} from "@/components/seller";
import { FiZap } from "react-icons/fi";

export default function BecomeSellerPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [store, setStore] = useState<MyStore | null>(null);
  const [loadingStore, setLoadingStore] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const fetchStore = async () => {
    setLoadingStore(true);
    try {
      const data = await getMyStore();
      setStore((data as any)?.data ?? data);
    } catch {
      setStore(null);
    } finally {
      setLoadingStore(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchStore();
    } else if (!isPending && !session?.user) {
      setLoadingStore(false);
    }
  }, [session, isPending]);

  if (isPending || loadingStore) {
    return <LoadingState message="Loading your seller application status..." />;
  }

  if (!session?.user) {
    router.replace("/login?next=/become-seller");
    return <LoadingState message="Redirecting to login..." />;
  }

  // 1. APPROVED STORE: Shows "You Are Already a Seller" if store is approved or user role is seller
  const isApproved = store?.status === "approved" || (session?.user as any)?.role === "seller";
  if (isApproved) {
    const activeStore: MyStore = store ?? {
      id: "my-store",
      ownerId: session.user.id,
      storeName: (session.user as any)?.name ? `${(session.user as any).name}'s Store` : "Verified Store",
      slug: "seller",
      description: "Official Verified Seller Store",
      status: "approved",
      trustScore: 90,
      rating: 5,
      ratingCount: 0,
      followersCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return <SellerApprovedCard store={activeStore} />;
  }

  // 2. PENDING STORE: Immediately shown when user fills up the form or is awaiting review
  if (store && (store.status === "pending" || !store.status) && !isEditing) {
    return (
      <SellerPendingView
        store={store}
        onRefresh={fetchStore}
        onEdit={() => setIsEditing(true)}
      />
    );
  }

  // 3. REJECTED STORE
  if (store && store.status === "rejected" && !isEditing) {
    return <SellerRejectedCard store={store} onEdit={() => setIsEditing(true)} />;
  }

  // 4. SUSPENDED STORE
  if (store && store.status === "suspended") {
    return <SellerSuspendedCard store={store} />;
  }

  // 5. APPLICATION WIZARD (New or Editing/Resubmitting)
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-primary">
          <FiZap /> ShopNest Merchant Portal
        </span>
        <h1 className="text-3xl font-black text-text">
          {store ? "Update Seller Application" : "Become a ShopNest Seller"}
        </h1>
        <p className="text-xs text-muted max-w-lg mx-auto">
          {store
            ? "Modify your store details or KYC documentation to submit for admin review."
            : "Reach millions of active buyers with state-of-the-art seller tools, instant weekly payouts, and AI listing intelligence."}
        </p>
      </div>

      {!store && <SellerBenefitsBar />}

      <SellerApplicationForm
        initialData={store}
        isResubmission={Boolean(store)}
        onSuccess={(savedStore) => {
          const actualStore = (savedStore as any)?.data ?? savedStore;
          setStore({
            ...actualStore,
            status: "pending",
          });
          setIsEditing(false);
        }}
      />
    </div>
  );
}