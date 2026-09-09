import { Store, StoreData } from "@/types/store";

/* 
    STORE LISTING PAGE DATA
 */

export const stores: Store[] = [
  {
    id: "nova-tech",
    name: "Nova Tech",
    category: "Electronics & Gadgets",
    filterCategory: "Electronics",
    rating: "4.9",
    sales: "12.4k+",
    salesNumber: 12400,
    response: "< 1hr",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=300&q=80",
    desc: "Premium electronics, smart gadgets and accessories.",
    products: [
      {
        name: "Wireless Headphones",
        price: "$89",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80",
        rating: "4.9",
        sold: "1.2k sold",
      },
      {
        name: "Smart Watch",
        price: "$129",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80",
        rating: "4.8",
        sold: "850 sold",
      },
      {
        name: "Gaming Mouse",
        price: "$45",
        image: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=500&q=80",
        rating: "4.7",
        sold: "430 sold",
      },
    ],
  },
  {
    id: "urban-loom",
    name: "Urban Loom",
    category: "Fashion & Lifestyle",
    filterCategory: "Fashion",
    rating: "4.8",
    sales: "8.7k+",
    salesNumber: 8700,
    response: "< 2hrs",
    logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=300&q=80",
    desc: "Modern fashion, timeless styles and everyday essentials.",
    products: [
      {
        name: "Classic Jacket",
        price: "$75",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80",
        rating: "4.8",
        sold: "920 sold",
      },
      {
        name: "Casual Sneakers",
        price: "$65",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80",
        rating: "4.9",
        sold: "1.1k sold",
      },
      {
        name: "Minimal Backpack",
        price: "$49",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80",
        rating: "4.7",
        sold: "680 sold",
      },
    ],
  },
  {
    id: "home-aura",
    name: "HomeAura",
    category: "Home & Living",
    filterCategory: "Home & Living",
    rating: "4.9",
    sales: "6.2k+",
    salesNumber: 6200,
    response: "< 1hr",
    logo: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=300&q=80",
    desc: "Beautiful furniture and home essentials for modern living.",
    products: [
      {
        name: "Modern Chair",
        price: "$120",
        image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=500&q=80",
        rating: "4.9",
        sold: "540 sold",
      },
      {
        name: "Table Lamp",
        price: "$39",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=500&q=80",
        rating: "4.8",
        sold: "720 sold",
      },
      {
        name: "Decor Plant",
        price: "$29",
        image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=500&q=80",
        rating: "4.7",
        sold: "490 sold",
      },
    ],
  },
  {
    id: "aura-skincare",
    name: "Aura Skincare",
    category: "Beauty & Personal Care",
    filterCategory: "Beauty",
    rating: "4.8",
    sales: "5.4k+",
    salesNumber: 5400,
    response: "< 2hrs",
    logo: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=300&q=80",
    desc: "Skincare and beauty essentials made for your daily routine.",
    products: [
      {
        name: "Face Serum",
        price: "$35",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80",
        rating: "4.9",
        sold: "1.3k sold",
      },
      {
        name: "Skin Care Set",
        price: "$59",
        image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=500&q=80",
        rating: "4.8",
        sold: "890 sold",
      },
      {
        name: "Body Lotion",
        price: "$25",
        image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=500&q=80",
        rating: "4.7",
        sold: "620 sold",
      },
    ],
  },
  {
    id: "apex-velocity",
    name: "Apex Velocity",
    category: "Sports & Fitness",
    filterCategory: "Sports",
    rating: "4.7",
    sales: "4.9k+",
    salesNumber: 4900,
    response: "< 3hrs",
    logo: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=300&q=80",
    desc: "Quality sports gear and fitness essentials for active life.",
    products: [
      {
        name: "Running Shoes",
        price: "$95",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80",
        rating: "4.8",
        sold: "850 sold",
      },
      {
        name: "Fitness Watch",
        price: "$110",
        image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=500&q=80",
        rating: "4.7",
        sold: "630 sold",
      },
      {
        name: "Yoga Mat",
        price: "$32",
        image: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=500&q=80",
        rating: "4.9",
        sold: "520 sold",
      },
    ],
  },
  {
    id: "book-nest",
    name: "BookNest",
    category: "Books & Education",
    filterCategory: "Books",
    rating: "4.9",
    sales: "4.2k+",
    salesNumber: 4200,
    response: "< 1hr",
    logo: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=300&q=80",
    desc: "Books, learning materials and educational resources.",
    products: [
      {
        name: "Programming Book",
        price: "$42",
        image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=500&q=80",
        rating: "4.9",
        sold: "1.1k sold",
      },
      {
        name: "Design Handbook",
        price: "$35",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80",
        rating: "4.8",
        sold: "760 sold",
      },
      {
        name: "Business Guide",
        price: "$29",
        image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=500&q=80",
        rating: "4.7",
        sold: "540 sold",
      },
    ],
  },
];

/* 
    STORE CATEGORIES
*/

export const categories = [
  "All Stores",
  "Electronics",
  "Fashion",
  "Home & Living",
  "Beauty",
  "Sports",
  "Books",
];

/* 
    STORE DETAILS PAGE DATA
 */

export const storesDatabase: Record<string, StoreData> = {
  "nova-tech": {
    id: "nova-tech",
    name: "Nova Tech Official Store",
    tagline: "Pioneering high-precision acoustic audio, rapid charging arrays, and next-gen smart desk ecosystems.",
    rating: "4.9",
    reviewsCount: "2,842 ratings",
    dispatch: "99.4% On-Time Dispatch",
    partnerSince: "Partner since 2022",
    banner: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1600&auto=format&fit=crop",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=300&q=80",
    productsCount: "142",
    reviewsCountNum: "1,280",
    products: stores.find((store) => store.id === "nova-tech")?.products ?? [],
    trustScore: {
      itemAsDescribed: "4.0",
      communication: "5.0",
      packaging: "4.8",
    },
    merchantAssurance: [
      { title: "Direct Factory Authorized", desc: "Guaranteed original hardware with global coverage." },
      { title: "30-Day Hassle-Free Returns", desc: "Simplified escrow process for buyer trade-in satisfaction." },
      { title: "Live Chat Concierge", desc: "Nova Tech team operates direct 24/7 technical assistance." },
    ],
    storeVoucher: {
      discount: "15% OFF",
      validTill: "Valid till May. 31",
      code: "NOVASPRING15",
    },
    reviewsList: [
      {
        author: "Marcus Chen",
        date: "May 12, 2026",
        comment: "Outstanding seller experience. The order was dispatched within 3 hours of purchase on a Sunday!",
        item: "NovaSound Spatial One Wireless ANC Headphones",
        rating: 5,
        packaging: "5.0",
        speed: "Instant",
        dispatchTime: "< 24hr",
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=150&auto=format&fit=crop"],
      },
      {
        author: "Sarah Vance",
        date: "Apr 28, 2026",
        comment: "Had an issue where the braided cable in the box had a minor fray. I messaged Nova Tech through the ShopNext store chat, and within 4 minutes their support rep confirmed replacement.",
        item: "HyperVolt 140W GaN Charging Station (Titanium Gray)",
        rating: 5,
        packaging: "4.8",
        speed: "Fast",
        dispatchTime: "24h",
        reply: {
          text: "Thank you so much Sarah! Our 3-year warranty covers all accessories end-to-end.",
          date: "April 29, 2026",
        },
      },
    ],
  },

  "apex-gear": {
    id: "apex-gear",
    name: "Apex Gear Hub",
    tagline: "Your ultimate destination for professional gaming gear and high-performance peripherals.",
    rating: "4.8",
    reviewsCount: "1,950 ratings",
    dispatch: "98.9% On-Time Dispatch",
    partnerSince: "Partner since 2023",
    banner: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1600&auto=format&fit=crop",
    logo: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=300&q=80",
    productsCount: "98",
    reviewsCountNum: "850",
    products: stores.find((store) => store.id === "apex-gear")?.products ?? [],
    trustScore: {
      itemAsDescribed: "4.2",
      communication: "4.9",
      packaging: "4.7",
    },
    merchantAssurance: [
      { title: "Pro Gaming Certified", desc: "Tournament-grade hardware tested rigorously." },
      { title: "Rapid RMA Processing", desc: "Fast replacement guarantee on defective components." },
    ],
    storeVoucher: {
      discount: "$20 OFF",
      validTill: "Valid till Jun. 15",
      code: "APEXPRO20",
    },
    reviewsList: [
      {
        author: "Tanvir Ahmed",
        date: "June 2, 2026",
        comment: "Super-fast delivery and genuine product packaging. Very satisfied!",
        item: "Apex Pro Wireless Mouse",
        rating: 5,
        packaging: "4.9",
        speed: "Fast",
        dispatchTime: "12h",
      },
      {
        author: "Arman Hossain",
        date: "June 4, 2026",
        comment: "Smooth tracking and great build quality.",
        item: "Apex Pro Wireless Mouse",
        rating: 5,
        packaging: "5.0",
        speed: "Instant",
        dispatchTime: "< 24hr",
        reply: {
          text: "Thanks Arman! Game on!",
          date: "June 5, 2026",
         
        },
      },
    ],
  },

  "urban-loom": {
    id: "urban-loom",
    name: "Urban Loom Official Store",
    tagline: "Modern fashion, timeless styles and everyday essentials crafted with premium fabrics.",
    rating: "4.8",
    reviewsCount: "1,520 ratings",
    dispatch: "99.1% On-Time Dispatch",
    partnerSince: "Partner since 2022",
    banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop",
    logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=300&q=80",
    productsCount: "110",
    reviewsCountNum: "920",
    products: stores.find((store) => store.id === "urban-loom")?.products ?? [],
    trustScore: {
      itemAsDescribed: "4.7",
      communication: "4.8",
      packaging: "4.9",
    },
    merchantAssurance: [
      { title: "Fabric Quality Assured", desc: "100% genuine export quality materials." },
      { title: "Easy Size Exchange", desc: "Hassle-free 14-day exchange policy." },
    ],
    storeVoucher: {
      discount: "10% OFF",
      validTill: "Valid till Dec. 31",
      code: "LOOM10",
    },
    reviewsList: [
      {
        author: "Nusrat Jahan",
        date: "Jan 15, 2026",
        comment: "The fabric quality of the jacket is amazing. Fits perfectly!",
        item: "Classic Jacket",
        rating: 5,
        packaging: "5.0",
        speed: "Fast",
        dispatchTime: "24h",
      },
      {
        author: "Zahin Rahman",
        date: "Jan 18, 2026",
        comment: "Very comfortable shoes for daily use.",
        item: "Casual Sneakers",
        rating: 5,
        packaging: "4.8",
        speed: "Fast",
        dispatchTime: "24h",
        reply: {
          text: "Thank you Nusrat and Zahin for choosing Urban Loom!",
          date: "Jan 19, 2026",
          
        },
      },
    ],
  },

  "home-aura": {
    id: "home-aura",
    name: "HomeAura Living",
    tagline: "Beautiful furniture and home essentials designed for modern living spaces.",
    rating: "4.9",
    reviewsCount: "2,100 ratings",
    dispatch: "99.5% On-Time Dispatch",
    partnerSince: "Partner since 2021",
    banner: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1600&auto=format&fit=crop",
    logo: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=300&q=80",
    productsCount: "75",
    reviewsCountNum: "1,100",
    products: stores.find((store) => store.id === "home-aura")?.products ?? [],
    trustScore: {
      itemAsDescribed: "4.9",
      communication: "4.9",
      packaging: "4.8",
    },
    merchantAssurance: [
      { title: "Safe Transit Guarantee", desc: "Special bubble and wooden framing for fragile decor items." },
      { title: "1-Year Structural Warranty", desc: "Covering any manufacturing defects." },
    ],
    storeVoucher: {
      discount: "$15 OFF",
      validTill: "Valid till Nov. 30",
      code: "HOMEAURA15",
    },
    reviewsList: [
      {
        author: "Rahim Uddin",
        date: "Feb 10, 2026",
        comment: "Modern chair looks gorgeous in my study room. Very sturdy build.",
        item: "Modern Chair",
        rating: 5,
        packaging: "5.0",
        speed: "Instant",
        dispatchTime: "< 24hr",
      },
      {
        author: "Mehnaz Chowdhury",
        date: "Feb 12, 2026",
        comment: "Table lamp brightness is soothing and aesthetic.",
        item: "Table Lamp",
        rating: 5,
        packaging: "4.9",
        speed: "Fast",
        dispatchTime: "24h",
      },
    ],
  },

  "aura-skincare": {
    id: "aura-skincare",
    name: "Aura Skincare Lab",
    tagline: "Dermatologically tested skincare and beauty essentials made for your daily glow.",
    rating: "4.8",
    reviewsCount: "1,430 ratings",
    dispatch: "98.8% On-Time Dispatch",
    partnerSince: "Partner since 2023",
    banner: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=1600&auto=format&fit=crop",
    logo: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=300&q=80",
    productsCount: "60",
    reviewsCountNum: "780",
    products: stores.find((store) => store.id === "aura-skincare")?.products ?? [],
    trustScore: {
      itemAsDescribed: "4.8",
      communication: "4.7",
      packaging: "5.0",
    },
    merchantAssurance: [
      { title: "100% Authentic Formula", desc: "Directly imported from certified laboratories." },
      { title: "Sealed Fresh Packaging", desc: "Temperature controlled warehouse storage." },
    ],
    storeVoucher: {
      discount: "20% OFF",
      validTill: "Valid till Oct. 31",
      code: "GLOW20",
    },
    reviewsList: [
      {
        author: "Farhana Akter",
        date: "Mar 05, 2026",
        comment: "The face serum works wonders on my skin. Original product received.",
        item: "Face Serum",
        rating: 5,
        packaging: "5.0",
        speed: "Fast",
        dispatchTime: "12h",
      },
      {
        author: "Lamia Islam",
        date: "Mar 08, 2026",
        comment: "Skin care set packaging was lovely and protected.",
        item: "Skin Care Set",
        rating: 5,
        packaging: "5.0",
        speed: "Instant",
        dispatchTime: "< 24hr",
      },
    ],
  },

  "apex-velocity": {
    id: "apex-velocity",
    name: "Apex Velocity Sports",
    tagline: "Quality sports gear and fitness essentials designed for an active lifestyle.",
    rating: "4.7",
    reviewsCount: "1,200 ratings",
    dispatch: "98.0% On-Time Dispatch",
    partnerSince: "Partner since 2022",
    banner: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop",
    logo: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=300&q=80",
    productsCount: "85",
    reviewsCountNum: "650",
    products: stores.find((store) => store.id === "apex-velocity")?.products ?? [],
    trustScore: {
      itemAsDescribed: "4.7",
      communication: "4.8",
      packaging: "4.6",
    },
    merchantAssurance: [
      { title: "Fitness Equipment Certified", desc: "High endurance stress-tested gear." },
      { title: "Easy Return Policy", desc: "Simple return process for wrong sizes." },
    ],
    storeVoucher: {
      discount: "$10 OFF",
      validTill: "Valid till Sep. 30",
      code: "FITNESS10",
    },
    reviewsList: [
      {
        author: "Imran Khan",
        date: "Apr. 11, 2026",
        comment: "Running shoes are super comfortable for morning jogging.",
        item: "Running Shoes",
        rating: 5,
        packaging: "4.8",
        speed: "Fast",
        dispatchTime: "24h",
      },
      {
        author: "Sabbir Ahmed",
        date: "Apr. 14, 2026",
        comment: "Fitness watch tracks everything accurately.",
        item: "Fitness Watch",
        rating: 5,
        packaging: "4.7",
        speed: "Instant",
        dispatchTime: "< 24hr",
      },
    ],
  },

  "book-nest": {
    id: "book-nest",
    name: "BookNest Educational",
    tagline: "Books, learning materials and educational resources for lifelong learners.",
    rating: "4.9",
    reviewsCount: "980 ratings",
    dispatch: "99.8% On-Time Dispatch",
    partnerSince: "Partner since 2021",
    banner: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1600&auto=format&fit=crop",
    logo: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=300&q=80",
    productsCount: "230",
    reviewsCountNum: "510",
    products: stores.find((store) => store.id === "book-nest")?.products ?? [],
    trustScore: {
      itemAsDescribed: "5.0",
      communication: "4.9",
      packaging: "4.9",
    },
    merchantAssurance: [
      { title: "Original Print Quality", desc: "Uncompromised publisher direct prints." },
      { title: "Corner Protection Packaging", desc: "No folded pages or damaged book spines." },
    ],
    storeVoucher: {
      discount: "5% OFF",
      validTill: "Valid till Dec. 31",
      code: "BOOKS5",
    },
    reviewsList: [
      {
        author: "Sadia Afrin",
        date: "May 01, 2026",
        comment: "Book arrived in pristine condition with corner protectors. Loved it!",
        item: "Programming Book",
        rating: 5,
        packaging: "5.0",
        speed: "Instant",
        dispatchTime: "< 24hr",
      },
      {
        author: "Tanvir Hossain",
        date: "May 03, 2026",
        comment: "Very helpful guide for beginners. The packaging was top-notch.",
        item: "Design Handbook",
        rating: 5,
        packaging: "4.9",
        speed: "Fast",
        dispatchTime: "24h",
        reply: {
          text: "Thank you so much Tanvir! Happy learning with BookNest.",
          date: "May 04, 2026",
        },
      },
    ],
  },
};

/* 
    FALLBACK STORE GENERATOR 
 */

export function getFallbackStore(rawId: string): StoreData {
  const formattedName = rawId
    ? rawId.charAt(0).toUpperCase() + rawId.slice(1).replace("-", " ")
    : "Store";

  return {
    id: rawId || "store",
    name: `${formattedName} Official Store`,
    tagline: "Discover quality products from this trusted store.",
    rating: "4.8",
    reviewsCount: "0 ratings",
    dispatch: "Fast Dispatch",
    partnerSince: "Partner since 2024",
    banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=300&q=80",
    productsCount: "0",
    reviewsCountNum: "0",
    products: [],
    trustScore: {
      itemAsDescribed: "4.8",
      communication: "4.8",
      packaging: "4.8",
    },
    merchantAssurance: [],
    storeVoucher: {
      discount: "10% OFF",
      validTill: "Valid soon",
      code: "STORE10",
    },
    reviewsList: [],
  };
}


export async function getAllStores(): Promise<Store[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return stores;
}

export async function getStoreDetails(id: string): Promise<StoreData> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return storesDatabase[id] || getFallbackStore(id);
}