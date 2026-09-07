"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { syncGuestDataToServer } from "@/lib/guest-store";
import { LoadingState } from "@/components/common/LoadingState";

function SyncHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const next = searchParams.get("next") || "/";

  useEffect(() => {
    if (isPending) return;

    async function runSync() {
      if (session?.user) {
        await syncGuestDataToServer();
      }
      router.replace(next);
    }

    runSync();
  }, [isPending, session, next, router]);

  return <LoadingState message="Synchronizing your shopping cart and wishlist..." />;
}

export default function SyncPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading..." />}>
      <SyncHandler />
    </Suspense>
  );
}
