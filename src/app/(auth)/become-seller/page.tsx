"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getMyStore, MyStore } from "@/lib/api/sellers";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import {
  SellerApprovedCard,
  SellerPendingView,
  SellerRejectedCard,
  SellerSuspendedCard,
  SellerBenefitsBar,
} from "@/components/seller";
import { FiZap } from "react-icons/fi";
import { SellerApplicationForm } from "@/components/seller/form";

type SessionUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: "customer" | "seller" | "admin";
  image?: string;
};

type ApiResponse<T> = T | { data: T };

export default function BecomeSellerPage() {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();

  const [store, setStore] = useState<MyStore | null>(null);
  const [loadingStore, setLoadingStore] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  // Guards against re-fetching in a loop when no store record is found.
  const refetchAttempted = useRef(false);

  const fetchStore = async () => {
    setLoadingStore(true);
    try {
      const data = (await getMyStore()) as ApiResponse<MyStore>;
      setStore("data" in data ? data.data : data);
    } catch {
      setStore(null);
    } finally {
      setLoadingStore(false);
      // Revalidate the session so a role updated by an admin (e.g. a store
      // suspension) is reflected without a hard reload.
      await refetch?.();
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (isPending) return;

    if (!session?.user) {
      Promise.resolve().then(() => {
        if (isMounted) setLoadingStore(false);
      });
      return;
    }

    const loadInitialStore = async () => {
      try {
        const data = (await getMyStore()) as ApiResponse<MyStore>;
        if (isMounted) {
          setStore("data" in data ? data.data : data);
        }
      } catch {
        if (isMounted) {
          setStore(null);
        }
      } finally {
        if (isMounted) {
          setLoadingStore(false);
        }
      }
    };

    loadInitialStore();

    return () => {
      isMounted = false;
    };
  }, [session, isPending]);

  // When the session says the user is a seller but no store record was found,
  // re-fetch once before giving up — the store may exist but the initial load
  // raced with the session becoming available. Uses a ref guard (not setState
  // in the effect body) to avoid cascading renders and refetch loops.
  useEffect(() => {
    if (isPending || loadingStore) return;
    if (!session?.user) return;
    if (store !== null) return;

    const user = session.user as SessionUser;
    if (user.role !== "seller") return;
    if (refetchAttempted.current) return;
    refetchAttempted.current = true;

    let isMounted = true;
    (async () => {
      try {
        const data = (await getMyStore()) as ApiResponse<MyStore>;
        if (isMounted) {
          setStore("data" in data ? data.data : data);
        }
      } catch {
        if (isMounted) {
          setStore(null);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [session, isPending, loadingStore, store]);

  if (isPending || loadingStore) {
    return <LoadingState message="Loading your seller application status..." />;
  }

  if (!session?.user) {
    router.replace("/login?next=/become-seller");
    return <LoadingState message="Redirecting to login..." />;
  }

  const user = session.user as SessionUser;

  // 1. APPROVED STORE: Shows "You Are Already a Seller" when the store is
  //    approved. When store data is available, store.status is the source of
  //    truth and takes priority over the session role; user.role is only
  //    consulted as a fallback when no store record is loaded.
  const isApproved = store ? store.status === "approved" : user.role === "seller";
  if (isApproved) {
    if (store) {
      return <SellerApprovedCard store={store} />;
    }
    // store is null but role is seller — handled by the empty state below
  }

  // 1b. Role says seller but no store record exists after re-fetch — friendly empty state
  if (user.role === "seller" && !store) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <EmptyState
          title="No store record found"
          description="Your account is marked as a seller, but we couldn't find an active store. This may happen if the store was removed or the session is out of date."
          actionLabel="Refresh store data"
          onAction={fetchStore}
        />
      </div>
    );
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
    <div className="mx-auto max-w-4xl px-4 py-6 min-h-[calc(100vh-5rem)] flex flex-col justify-center">
      <div className="mb-4 text-center space-y-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-primary">
          <FiZap /> ShopNest Merchant Portal
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight">
          {store ? "Update Seller Application" : "Become a ShopNest Seller"}
        </h1>
        <p className="text-xs text-muted max-w-lg mx-auto">
          {store
            ? "Modify your store details or KYC documentation to submit for admin review."
            : "Reach millions of buyers with state-of-the-art seller tools & instant weekly payouts."}
        </p>
      </div>

      {!store && <SellerBenefitsBar />}

      <SellerApplicationForm
        initialData={store}
        isResubmission={Boolean(store)}
        onSuccess={(savedStore) => {
          const actualStore = ("data" in savedStore ? savedStore.data : savedStore) as MyStore;
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
