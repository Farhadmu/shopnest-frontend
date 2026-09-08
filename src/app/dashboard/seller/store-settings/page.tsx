import { DashboardShell } from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import { getMyStoreServer } from "@/lib/api/sellers.server";
import { StoreSettingsClient } from "@/components/dashboard/seller/store-settings/StoreSettingsClient";

export const dynamic = "force-dynamic";

export default async function StoreSettingsPage() {
  const initialStore = await getMyStoreServer();

  return (
    <DashboardShell
      role="Seller"
      title="Store Settings & Branding"
      subtitle="Manage your merchant profile, logo, banner, legal KYC information, and financial payout channels."
      links={sellerDashboardLinks}
    >
      <StoreSettingsClient initialStore={initialStore} />
    </DashboardShell>
  );
}
