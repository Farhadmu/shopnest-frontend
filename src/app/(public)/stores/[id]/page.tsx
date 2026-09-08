import StoreBanner from "@/components/store/StoreBanner";
import StoreProfileHeader from "@/components/store/StoreProfileHeader";
import StoreTabs from "@/components/store/StoreTabs";
import StoreTrustCard from "@/components/store/StoreTrustCard";
import ReviewFilters from "@/components/store/ReviewFilters";
import ReviewsList from "@/components/store/ReviewsList";
import MerchantAssurance from "@/components/store/MerchantAssurance";
import TopSellerProducts from "@/components/store/TopSellerProducts";
import StoreVoucher from "@/components/store/StoreVoucher";

import {
  stores,
  storesDatabase,
  getFallbackStore,
} from "@/data/stores";

interface StorePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  return Object.keys(storesDatabase).map((id) => ({
    id,
  }));
}

export default async function StorePage({ params }: StorePageProps) {
  const resolvedParams = await params;
  const rawId = resolvedParams.id?.toLowerCase().trim();

 
  let store = storesDatabase[rawId];


  if (!store) {
    const listingStore = stores.find((item) => item.id === rawId);

    if (listingStore) {
      store = {
        id: listingStore.id,
        name: `${listingStore.name} Official Store`,
        tagline: listingStore.desc,
        rating: String(listingStore.rating),
        reviewsCount: `${listingStore.sales} ratings`,
        dispatch: `${listingStore.response} response`,
        partnerSince: "Partner since 2024",
        banner: listingStore.logo,
        logo: listingStore.logo,
        productsCount: String(listingStore.products.length),
        reviewsCountNum: "0",
        products: listingStore.products,
        trustScore: {
          itemAsDescribed: String(listingStore.rating),
          communication: String(listingStore.rating),
          packaging: String(listingStore.rating),
        },
        merchantAssurance: [],
        storeVoucher: {
          discount: "10% OFF",
          validTill: "Valid soon",
          code: "STORE10",
        },
        reviewsList: [],
      };
    } else {
  
      store = getFallbackStore(rawId);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-16 font-sans text-slate-900 dark:bg-slate-950 dark:text-white">
      <StoreBanner banner={store.banner} storeName={store.name} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <StoreProfileHeader store={store} />
        <StoreTabs store={store} />

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-8">
            <StoreTrustCard store={store} />
            <ReviewFilters reviewsCount={store.reviewsCountNum} />
            <ReviewsList reviews={store.reviewsList} storeName={store.name} />
          </div>

          <div className="space-y-5 lg:col-span-4">
            <MerchantAssurance items={store.merchantAssurance} />
            <TopSellerProducts
              products={store.products}
              productsCount={store.productsCount}
            />
            <StoreVoucher voucher={store.storeVoucher} />
          </div>
        </div>
      </div>
    </div>
  );
}