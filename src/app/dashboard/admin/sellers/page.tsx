import { getAdminSellersServer } from "@/lib/api/sellers.server";
import { AdminSellersClient } from "@/components/dashboard/admin/sellers/AdminSellersClient";
import { Store, Sparkles } from "lucide-react";

// Admin sellers data must always reflect the latest DB state — never statically cached.
export const dynamic = "force-dynamic";

export default async function AdminSellersPage() {
  const initialStores = await getAdminSellersServer();

  return (
    <div className="space-y-6">
      {/* Header Section (Category-style modern header) */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Store className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">
              Seller Verification & Moderation
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" /> Live Control
            </span>
          </div>
          <p className="mt-1.5 text-sm text-muted">
            Verify merchant identities, inspect KYC documents, manage marketplace trust scores, and approve seller stores.
          </p>
        </div>
      </div>

      {/* Main Sellers Client Component */}
      <AdminSellersClient initialStores={initialStores} />
    </div>
  );
}
