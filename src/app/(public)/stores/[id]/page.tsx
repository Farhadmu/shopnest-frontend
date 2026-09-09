import StoreDetailsClient from "@/components/store/StoreDetailsClient";
import { notFound } from "next/navigation";
import { getPublicStoreDetails } from "@/lib/api/stores.server";

interface StorePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StorePage({ params }: StorePageProps) {
  const resolvedParams = await params;
  const rawId = resolvedParams.id?.toLowerCase().trim();
  if (!rawId) notFound();

  let store;
  try {
    store = await getPublicStoreDetails(rawId);
  } catch {
    notFound();
  }

  return <StoreDetailsClient store={store} />;
}