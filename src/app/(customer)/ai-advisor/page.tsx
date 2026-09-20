"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AiAdvisorView } from "@/components/ai/AiAdvisorView";
import { LoadingState } from "@/components/common/LoadingState";

export default function AiAdvisorPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/login?redirect=/dashboard/user/ai-advisor");
    }
  }, [isPending, session, router]);

  if (isPending || !session?.user) {
    return <LoadingState message="Checking authentication..." />;
  }

  return <AiAdvisorView isDashboard={false} />;
}
