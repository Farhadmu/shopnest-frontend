// frontend/src/lib/constants/seller-application.ts
export const CATEGORIES = [
  "Electronics & Gadgets",
  "Fashion & Apparel",
  "Home & Living",
  "Health & Beauty",
  "Groceries & Essentials",
  "Sports & Outdoors",
  "Books & Stationery",
  "Automotive & Tools",
  "Toys & Baby Care",
  "Other / Multi-Category",
];

export const PAYOUT_METHODS = [
  { id: "bank", label: "Bank Account Transfer", icon: "🏦", desc: "Direct BEFTN / NPSB transfer to your commercial bank" },
  { id: "bkash", label: "bKash Merchant / Personal", icon: "📱", desc: "Instant mobile wallet disbursement" },
  { id: "nagad", label: "Nagad Wallet", icon: "💳", desc: "Postal service digital financial payout" },
  { id: "rocket", label: "DBBL Rocket", icon: "🚀", desc: "Direct Rocket wallet settlement" },
];