export interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number | string;
  image: string;
  rating?: string;
  sold?: string;
}

export interface Store {
  _id?: string;
  id: string;
  name: string;
  category: string;
  filterCategory: string;
  rating: number | string;
  sales: string;
  salesNumber: number;
  response: string;
  logo: string;
  desc: string;
  products: Product[];
}

export interface ReviewReply {
  text: string;
  date: string;
}

export interface ReviewItem {
  author: string;
  date: string;
  comment: string;
  item: string;
  rating: number;
  packaging: string;
  speed: string;
  dispatchTime: string;
  images?: string[];
  reply?: ReviewReply;
}

export interface TrustScore {
  itemAsDescribed: string;
  communication: string;
  packaging: string;
}

export interface MerchantAssuranceItem {
  title: string;
  desc: string;
}

export interface StoreVoucher {
  discount: string;
  validTill: string;
  code: string;
}

export interface StoreData {
  id: string;
  ownerId?: string;
  name: string;
  tagline: string;
  rating: string;
  reviewsCount: string;
  dispatch: string;
  partnerSince: string;

  banner: string;

  // Store card-logo
  logo: string;

  productsCount: string;
  reviewsCountNum: string;

  // Store card- products
  products: Product[];

  trustScore: TrustScore;

  merchantAssurance: MerchantAssuranceItem[];

  storeVoucher: StoreVoucher;

  reviewsList: ReviewItem[];
}