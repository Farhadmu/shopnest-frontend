import { DashboardShell } from "@/components/dashboard/DashboardUI";
import { adminDashboardLinks } from "@/lib/constants/dashboard-nav";
import { getAdminSellersServer } from "@/lib/api/sellers.server";
import { AdminSellersClient } from "@/components/dashboard/admin/sellers/AdminSellersClient";

export const dynamic = "force-dynamic";

export default async function AdminSellersPage() {
  const initialStores = await getAdminSellersServer();

  return (
    <DashboardShell
      title="Seller Verification & Moderation"
      subtitle="Verify merchant identities, inspect KYC documents, manage marketplace trust scores, and approve seller stores."
      role="Administrator"
      links={adminDashboardLinks}
      showContinueShopping={false}
    >
      <AdminSellersClient initialStores={initialStores} />
    </DashboardShell>
  );
}
