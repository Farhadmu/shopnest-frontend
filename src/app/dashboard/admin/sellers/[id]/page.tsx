import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardUI";
import { adminDashboardLinks } from "@/lib/constants/dashboard-nav";
import { getAdminSellerDetailsServer } from "@/lib/api/sellers.server";
import { SellerFullDossier } from "@/components/dashboard/admin/sellers/SellerFullDossier";
import { FiArrowLeft } from "react-icons/fi";

export const dynamic = "force-dynamic";

export default async function AdminSellerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const seller = await getAdminSellerDetailsServer(id);

  if (!seller) {
    notFound();
  }

  return (
    <DashboardShell
      title={`Seller Dossier: ${seller.storeName}`}
      subtitle={`Complete KYC documentation, owner identity, payout methods, and metrics for store ${seller.storeName}.`}
      role="Administrator"
      links={adminDashboardLinks}
      showContinueShopping={false}
    >
      <div className="mb-6">
        <Link
          href="/dashboard/admin/sellers"
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-2 text-xs font-bold text-muted hover:text-text hover:bg-muted-bg transition shadow-xs"
        >
          <FiArrowLeft size={13} /> Back to Seller Verification List
        </Link>
      </div>

      <SellerFullDossier seller={seller} isStandalonePage={true} />
    </DashboardShell>
  );
}
