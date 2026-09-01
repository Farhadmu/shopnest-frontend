"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { BanglaSmartSearch } from "@/components/search/BanglaSmartSearch";

export default function AdvancedSearchPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session?.user) router.push("/login");
  }, [session, isPending, router]);

  const links = [
    { label: "AI Search", href: "/customer/search", icon: "🔍", description: "Intelligent product search" },
    { label: "Shopping Agent", href: "/customer/shopping-agent", icon: "🤖", description: "AI shopping assistant" },
    { label: "Gift Finder", href: "/customer/gift-finder", icon: "🎁", description: "Find gifts with AI" },
    { label: "Deal Finder", href: "/customer/deal-finder", icon: "🏷️", description: "Discover smart deals" },
  ];

  return (
    <DashboardShell
      role="Customer"
      title="Bangla & English Smart Commerce Search"
      subtitle="AI-powered multi-lingual product search with budget extraction and category detection."
      links={links}
    >
      <div className="space-y-6">
        <Panel title="🔍 Multi-Lingual Smart Search Engine">
          <BanglaSmartSearch />
        </Panel>
      </div>
    </DashboardShell>
  );
}
