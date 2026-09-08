// "use client";

// import { useMemo, useState } from "react";
// import Link from "next/link";
// import {
//   FaArrowRight,
//   FaCheckCircle,
//   FaClock,
//   FaComments,
//   FaFilter,
//   FaLock,
//   FaSearch,
//   FaShieldAlt,
//   FaShoppingBag,
//   FaStar,
//   FaStore,
//   FaTimes,
//   FaTrophy,
//   FaUserCheck,
//   FaUsers,
// } from "react-icons/fa";

// type Product = {
//   name: string;
//   price: string;
//   image: string;
// };

// type Store = {
//   id: string;
//   name: string;
//   category: string;
//   filterCategory: string;
//   rating: string;
//   sales: string;
//   salesNumber: number;
//   response: string;
//   logo: string;
//   desc: string;
//   products: Product[];
// };

// const stores: Store[] = [
//   {
//     id: "nova-tech",
//     name: "Nova Tech",
//     category: "Electronics & Gadgets",
//     filterCategory: "Electronics",
//     rating: "4.9",
//     sales: "12.4k+",
//     salesNumber: 12400,
//     response: "< 1hr",
//     logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=300&q=80",
//     desc: "Premium electronics, smart gadgets and accessories.",
//     products: [
//       {
//         name: "Wireless Headphones",
//         price: "$89",
//         image:
//           "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80",
//       },
//       {
//         name: "Smart Watch",
//         price: "$129",
//         image:
//           "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80",
//       },
//       {
//         name: "Gaming Mouse",
//         price: "$45",
//         image:
//           "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=500&q=80",
//       },
//     ],
//   },
//   {
//     id: "urban-loom",
//     name: "Urban Loom",
//     category: "Fashion & Lifestyle",
//     filterCategory: "Fashion",
//     rating: "4.8",
//     sales: "8.7k+",
//     salesNumber: 8700,
//     response: "< 2hrs",
//     logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=300&q=80",
//     desc: "Modern fashion, timeless styles and everyday essentials.",
//     products: [
//       {
//         name: "Classic Jacket",
//         price: "$75",
//         image:
//           "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80",
//       },
//       {
//         name: "Casual Sneakers",
//         price: "$65",
//         image:
//           "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80",
//       },
//       {
//         name: "Minimal Backpack",
//         price: "$49",
//         image:
//           "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80",
//       },
//     ],
//   },
//   {
//     id: "home-aura",
//     name: "HomeAura",
//     category: "Home & Living",
//     filterCategory: "Home & Living",
//     rating: "4.9",
//     sales: "6.2k+",
//     salesNumber: 6200,
//     response: "< 1hr",
//     logo: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=300&q=80",
//     desc: "Beautiful furniture and home essentials for modern living.",
//     products: [
//       {
//         name: "Modern Chair",
//         price: "$120",
//         image:
//           "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=500&q=80",
//       },
//       {
//         name: "Table Lamp",
//         price: "$39",
//         image:
//           "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=500&q=80",
//       },
//       {
//         name: "Decor Plant",
//         price: "$29",
//         image:
//           "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=500&q=80",
//       },
//     ],
//   },
//   {
//     id: "aura-skincare",
//     name: "Aura Skincare",
//     category: "Beauty & Personal Care",
//     filterCategory: "Beauty",
//     rating: "4.8",
//     sales: "5.4k+",
//     salesNumber: 5400,
//     response: "< 2hrs",
//     logo: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=300&q=80",
//     desc: "Skincare and beauty essentials made for your daily routine.",
//     products: [
//       {
//         name: "Face Serum",
//         price: "$35",
//         image:
//           "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80",
//       },
//       {
//         name: "Skin Care Set",
//         price: "$59",
//         image:
//           "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=500&q=80",
//       },
//       {
//         name: "Body Lotion",
//         price: "$25",
//         image:
//           "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=500&q=80",
//       },
//     ],
//   },
//   {
//     id: "apex-velocity",
//     name: "Apex Velocity",
//     category: "Sports & Fitness",
//     filterCategory: "Sports",
//     rating: "4.7",
//     sales: "4.9k+",
//     salesNumber: 4900,
//     response: "< 3hrs",
//     logo: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=300&q=80",
//     desc: "Quality sports gear and fitness essentials for active life.",
//     products: [
//       {
//         name: "Running Shoes",
//         price: "$95",
//         image:
//           "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80",
//       },
//       {
//         name: "Fitness Watch",
//         price: "$110",
//         image:
//           "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=500&q=80",
//       },
//       {
//         name: "Yoga Mat",
//         price: "$32",
//         image:
//           "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=500&q=80",
//       },
//     ],
//   },
//   {
//     id: "book-nest",
//     name: "BookNest",
//     category: "Books & Education",
//     filterCategory: "Books",
//     rating: "4.9",
//     sales: "4.2k+",
//     salesNumber: 4200,
//     response: "< 1hr",
//     logo: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=300&q=80",
//     desc: "Books, learning materials and educational resources.",
//     products: [
//       {
//         name: "Programming Book",
//         price: "$42",
//         image:
//           "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=500&q=80",
//       },
//       {
//         name: "Design Handbook",
//         price: "$35",
//         image:
//           "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80",
//       },
//       {
//         name: "Business Guide",
//         price: "$29",
//         image:
//           "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=500&q=80",
//       },
//     ],
//   },
// ];

// const categories = [
//   "All Stores",
//   "Electronics",
//   "Fashion",
//   "Home & Living",
//   "Beauty",
//   "Sports",
//   "Books",
// ];

// export default function StoresPage() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("All Stores");
//   const [sortOption, setSortOption] = useState("Highest Rated");

//   const [monthlyOrders, setMonthlyOrders] = useState(500);
//   const [aov, setAov] = useState(75);

//   const grossRevenue = monthlyOrders * aov;
//   const platformFee = grossRevenue * 0.04;
//   const netPayout = grossRevenue - platformFee;

//   const filteredStores = useMemo(() => {
//     const search = searchTerm.trim().toLowerCase();

//     const result = stores.filter((store) => {
//       const matchesCategory =
//         selectedCategory === "All Stores" ||
//         store.filterCategory === selectedCategory;

//       const matchesSearch =
//         search === "" ||
//         store.name.toLowerCase().includes(search) ||
//         store.category.toLowerCase().includes(search) ||
//         store.desc.toLowerCase().includes(search) ||
//         store.products.some((product) =>
//           product.name.toLowerCase().includes(search)
//         );

//       return matchesCategory && matchesSearch;
//     });

//     return [...result].sort((a, b) => {
//       if (sortOption === "Highest Rated") {
//         return Number(b.rating) - Number(a.rating);
//       }

//       if (sortOption === "Most Popular") {
//         return b.salesNumber - a.salesNumber;
//       }

//       if (sortOption === "Newest") {
//         return stores.indexOf(b) - stores.indexOf(a);
//       }

//       return 0;
//     });
//   }, [searchTerm, selectedCategory, sortOption]);

//   const handleClearFilters = () => {
//     setSearchTerm("");
//     setSelectedCategory("All Stores");
//     setSortOption("Highest Rated");
//   };

//   return (
//     <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#050816] dark:text-white">
//       {/* =====================================================
//           HERO
//       ====================================================== */}
//       <section className="relative -mt-px overflow-hidden border-b border-slate-200 bg-gradient-to-br from-white via-slate-50 to-indigo-50 px-4 pb-4 pt-0 text-slate-900 transition-colors duration-300 dark:border-slate-800 dark:from-[#070b20] dark:via-[#080b1d] dark:to-[#0b1028] dark:text-white sm:px-6 lg:px-8">
//         {/* Background Effects */}
//         <div className="pointer-events-none absolute inset-0 overflow-hidden">
//           <div className="absolute left-[15%] top-[-100px] h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-600/20" />
//           <div className="absolute right-[10%] bottom-[-120px] h-72 w-72 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/20" />

//           <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(99,102,241,0.10),transparent_35%)] dark:bg-[radial-gradient(circle_at_70%_45%,rgba(99,102,241,0.14),transparent_35%)]" />
//         </div>

//         <div className="relative mx-auto max-w-7xl">
//           <div className="grid items-center gap-4 lg:grid-cols-[1.15fr_0.85fr]">
//             {/* LEFT */}
//             <div className="relative z-10 pt-1">
//               {/* Badge */}
//               <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 dark:border-indigo-400/20 dark:bg-indigo-500/10">
//                 <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20">
//                   <FaCheckCircle className="text-[8px] text-indigo-600 dark:text-indigo-300" />
//                 </span>

//                 <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-200 sm:text-[9px]">
//                   Shop with confidence
//                 </span>
//               </div>

//               {/* Heading */}
//               <h1 className="max-w-2xl text-2xl font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl">
//                 Trusted ShopNest{" "}
//                 <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent dark:from-indigo-300 dark:via-blue-300 dark:to-cyan-300">
//                   stores
//                 </span>
//               </h1>

//               <p className="mt-1.5 max-w-xl text-[10px] leading-relaxed text-slate-600 dark:text-slate-400 sm:text-[11px]">
//                 Explore sellers with transparent ratings, sales history and
//                 trusted marketplace signals.
//               </p>

//               {/* Search */}
//               <div className="mt-3 flex max-w-xl items-center rounded-xl border border-slate-200 bg-white p-1 shadow-lg shadow-slate-200/50 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-2xl">
//                 <div className="relative flex-1">
//                   <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 dark:text-slate-500" />

//                   <input
//                     type="text"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     placeholder="Search stores or products..."
//                     className="h-8 w-full bg-transparent pl-7 pr-8 text-[10px] text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
//                   />

//                   {searchTerm && (
//                     <button
//                       onClick={() => setSearchTerm("")}
//                       className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 dark:text-slate-500 dark:hover:text-white"
//                       aria-label="Clear search"
//                     >
//                       <FaTimes className="text-[8px]" />
//                     </button>
//                   )}
//                 </div>

//                 <button
//                   onClick={() => {
//                     const input = document.querySelector(
//                       'input[placeholder="Search stores or products..."]'
//                     ) as HTMLInputElement | null;

//                     input?.focus();
//                   }}
//                   className="flex h-8 items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 text-[9px] font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500 dark:bg-white dark:text-slate-900 dark:hover:bg-indigo-50"
//                 >
//                   <FaSearch className="text-[8px]" />
//                   Search
//                 </button>
//               </div>

//               {/* Categories */}
//               <div className="mt-2.5 flex max-w-3xl gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
//                 {categories.map((category) => {
//                   const active = selectedCategory === category;

//                   return (
//                     <button
//                       key={category}
//                       onClick={() => setSelectedCategory(category)}
//                       className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[8px] font-semibold transition sm:text-[9px] ${
//                         active
//                           ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 dark:bg-white dark:text-slate-950"
//                           : "border border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:bg-white/[0.1] dark:hover:text-white"
//                       }`}
//                     >
//                       {category}
//                     </button>
//                   );
//                 })}
//               </div>

//               {/* Result */}
//               <div className="mt-2 flex items-center gap-2 text-[9px] text-slate-500 dark:text-slate-500 sm:text-[10px]">
//                 <FaStore className="text-indigo-500 dark:text-indigo-400" />

//                 <span>
//                   <strong className="text-slate-800 dark:text-slate-200">
//                     {filteredStores.length}
//                   </strong>{" "}
//                   verified stores available
//                 </span>
//               </div>
//             </div>

//             {/* RIGHT SIDE */}
//             <div className="relative hidden min-h-[155px] lg:block">
//               {/* Main Glass Card */}
//               <div className="absolute right-0 top-1 w-[300px] overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-xl shadow-slate-200/60 backdrop-blur-xl dark:border-white/10 dark:bg-gradient-to-br dark:from-white/[0.10] dark:to-white/[0.03] dark:shadow-2xl">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-[8px] font-medium text-slate-500 dark:text-slate-400">
//                       Marketplace
//                     </p>

//                     <p className="mt-0.5 text-sm font-black text-slate-900 dark:text-white">
//                       Shop with Confidence
//                     </p>
//                   </div>

//                   <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
//                     <FaShieldAlt className="text-xs text-emerald-600 dark:text-emerald-400" />
//                   </div>
//                 </div>

//                 {/* Mini Stores */}
//                 <div className="mt-3 grid grid-cols-3 gap-2">
//                   {stores.slice(0, 3).map((store) => (
//                     <div
//                       key={store.id}
//                       className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-white/10 dark:bg-white/[0.06]"
//                     >
//                       <div className="flex items-center gap-1.5">
//                         <div className="h-7 w-7 shrink-0 overflow-hidden rounded-md">
//                           <img
//                             src={store.logo}
//                             alt={store.name}
//                             className="h-full w-full object-cover"
//                           />
//                         </div>

//                         <div className="min-w-0">
//                           <p className="truncate text-[7px] font-bold text-slate-800 dark:text-white">
//                             {store.name}
//                           </p>

//                           <div className="flex items-center gap-0.5">
//                             <FaStar className="text-[6px] text-amber-400" />

//                             <span className="text-[6px] text-slate-500 dark:text-slate-400">
//                               {store.rating}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Trust Line */}
//                 <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2.5 dark:border-white/10">
//                   <div className="flex items-center gap-1.5">
//                     <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
//                       <FaCheckCircle className="text-[7px] text-emerald-500" />
//                     </div>

//                     <div>
//                       <p className="text-[7px] font-bold text-slate-800 dark:text-white">
//                         Verified Sellers
//                       </p>

//                       <p className="text-[6px] text-slate-500">
//                         Quality checked
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-1 text-[7px] font-bold text-indigo-600 dark:text-indigo-300">
//                     Explore
//                     <FaArrowRight className="text-[6px]" />
//                   </div>
//                 </div>
//               </div>

//               {/* Top Rated Badge */}
//               <div className="absolute -left-2 top-7 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90">
//                 <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/15">
//                   <FaTrophy className="text-[9px] text-indigo-600 dark:text-indigo-300" />
//                 </div>

//                 <div>
//                   <p className="text-[7px] font-bold text-slate-800 dark:text-white">
//                     Top Rated
//                   </p>

//                   <p className="text-[6px] text-slate-500">
//                     4.8+ average
//                   </p>
//                 </div>
//               </div>

//               {/* Floating Stats */}
//               <div className="absolute -right-2 bottom-0 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90">
//                 <div className="flex items-center gap-2">
//                   <FaUsers className="text-[9px] text-blue-500 dark:text-blue-400" />

//                   <div>
//                     <p className="text-[9px] font-black text-slate-900 dark:text-white">
//                       250+
//                     </p>

//                     <p className="text-[6px] text-slate-500">
//                       Trusted Stores
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Hero Stats */}
//           <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
//             <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04]">
//               <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
//                 <FaStore className="text-[9px] text-indigo-600 dark:text-indigo-300" />
//               </div>

//               <div>
//                 <p className="text-[11px] font-black text-slate-900 dark:text-white">
//                   250+
//                 </p>

//                 <p className="text-[7px] text-slate-500">
//                   Verified Stores
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04]">
//               <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
//                 <FaShieldAlt className="text-[9px] text-emerald-600 dark:text-emerald-300" />
//               </div>

//               <div>
//                 <p className="text-[11px] font-black text-slate-900 dark:text-white">
//                   98.5%
//                 </p>

//                 <p className="text-[7px] text-slate-500">
//                   Trust Score
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04]">
//               <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
//                 <FaStar className="text-[9px] text-amber-500 dark:text-amber-300" />
//               </div>

//               <div>
//                 <p className="text-[11px] font-black text-slate-900 dark:text-white">
//                   4.8/5
//                 </p>

//                 <p className="text-[7px] text-slate-500">
//                   Average Rating
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04]">
//               <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-50 dark:bg-cyan-500/10">
//                 <FaClock className="text-[9px] text-cyan-600 dark:text-cyan-300" />
//               </div>

//               <div>
//                 <p className="text-[11px] font-black text-slate-900 dark:text-white">
//                   24h
//                 </p>

//                 <p className="text-[7px] text-slate-500">
//                   Support
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* =====================================================
//           ALL VERIFIED STORES
//       ====================================================== */}
//       <section className="bg-slate-50 px-4 py-7 transition-colors duration-300 dark:bg-[#050816] sm:px-6 lg:px-8">
//         <div className="mx-auto max-w-7xl">
//           {/* Section Header */}
//           <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
//             <div>
//               <div className="mb-1.5 flex items-center gap-2">
//                 <span className="h-5 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-blue-500" />

//                 <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
//                   Marketplace
//                 </span>
//               </div>

//               <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
//                 All Verified Stores
//               </h2>

//               <p className="mt-1 max-w-2xl text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 sm:text-[11px]">
//                 Explore trusted sellers and discover products from stores you
//                 can shop with confidence.
//               </p>
//             </div>

//             {/* Sort */}
//             <div className="flex items-center gap-2">
//               <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
//                 <FaFilter className="text-[9px]" />
//                 Sort by
//               </div>

//               <select
//                 value={sortOption}
//                 onChange={(e) => setSortOption(e.target.value)}
//                 className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
//               >
//                 <option>Highest Rated</option>
//                 <option>Most Popular</option>
//                 <option>Newest</option>
//               </select>
//             </div>
//           </div>

//           {/* Store Cards */}
//           {filteredStores.length > 0 ? (
//             <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
//               {filteredStores.map((store) => (
//                 <article
//                   key={store.id}
//                   className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-indigo-500/30 dark:hover:shadow-indigo-950/30"
//                 >
//                   {/* Store Info */}
//                   <div className="p-4">
//                     <div className="flex items-start justify-between gap-3">
//                       <div className="flex min-w-0 items-center gap-3">
//                         {/* Logo */}
//                         <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-800">
//                           <img
//                             src={store.logo}
//                             alt={store.name}
//                             className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
//                           />

//                           <div className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900">
//                             <FaCheckCircle className="text-[7px] text-white" />
//                           </div>
//                         </div>

//                         {/* Store Name */}
//                         <div className="min-w-0">
//                           <h3 className="truncate text-sm font-black text-slate-900 dark:text-white">
//                             {store.name}
//                           </h3>

//                           <p className="mt-0.5 truncate text-[9px] text-slate-500 dark:text-slate-400">
//                             {store.category}
//                           </p>

//                           <div className="mt-1 flex items-center gap-1">
//                             <FaStar className="text-[8px] text-amber-400" />

//                             <span className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
//                               {store.rating}
//                             </span>

//                             <span className="text-[8px] text-slate-300 dark:text-slate-600">
//                               •
//                             </span>

//                             <span className="text-[8px] text-slate-500 dark:text-slate-400">
//                               {store.sales} sales
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[8px] font-bold text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
//                         Verified
//                       </span>
//                     </div>

//                     {/* Description */}
//                     <p className="mt-3 line-clamp-2 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
//                       {store.desc}
//                     </p>

//                     {/* Stats */}
//                     <div className="mt-3 grid grid-cols-2 gap-2">
//                       <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/60">
//                         <div className="flex items-center gap-1.5">
//                           <FaShoppingBag className="text-[8px] text-indigo-500" />

//                           <span className="text-[8px] text-slate-500 dark:text-slate-400">
//                             Sales
//                           </span>
//                         </div>

//                         <p className="mt-0.5 text-[10px] font-black text-slate-900 dark:text-white">
//                           {store.sales}
//                         </p>
//                       </div>

//                       <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/60">
//                         <div className="flex items-center gap-1.5">
//                           <FaClock className="text-[8px] text-emerald-500" />

//                           <span className="text-[8px] text-slate-500 dark:text-slate-400">
//                             Response
//                           </span>
//                         </div>

//                         <p className="mt-0.5 text-[10px] font-black text-slate-900 dark:text-white">
//                           {store.response}
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Products */}
//                   <div className="border-t border-slate-100 px-4 py-3.5 dark:border-slate-800">
//                     <div className="mb-2.5 flex items-center justify-between">
//                       <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
//                         Popular Products
//                       </span>

//                       <span className="text-[8px] text-slate-400">
//                         {store.products.length} items
//                       </span>
//                     </div>

//                     <div className="grid grid-cols-3 gap-2.5">
//                       {store.products.map((product) => (
//                         <div
//                           key={product.name}
//                           className="group/product min-w-0"
//                         >
//                           <div className="aspect-square overflow-hidden rounded-xl border border-slate-100 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
//                             <img
//                               src={product.image}
//                               alt={product.name}
//                               className="h-full w-full object-cover transition duration-500 group-hover/product:scale-110"
//                             />
//                           </div>

//                           <p className="mt-1.5 truncate text-[8px] font-semibold text-slate-700 dark:text-slate-300">
//                             {product.name}
//                           </p>

//                           <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400">
//                             {product.price}
//                           </p>
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Footer */}
//                   <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 dark:border-slate-800">
//                     <div className="flex items-center gap-1.5 text-[8px] text-slate-500 dark:text-slate-400">
//                       <FaUserCheck className="text-emerald-500" />
//                       Trusted Seller
//                     </div>

//                     <Link
//                       href={`/stores/${store.id}`}
//                       className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[9px] font-bold text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
//                     >
//                       Visit Store

//                       <FaArrowRight className="text-[7px] transition-transform group-hover:translate-x-0.5" />
//                     </Link>
//                   </div>
//                 </article>
//               ))}
//             </div>
//           ) : (
//             <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
//               <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
//                 <FaSearch className="text-slate-400" />
//               </div>

//               <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
//                 No stores found
//               </h3>

//               <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
//                 Try a different search term or category.
//               </p>

//               <button
//                 onClick={handleClearFilters}
//                 className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-[10px] font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500"
//               >
//                 Clear Filters
//               </button>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* =====================================================
//           TRUST STANDARD
//       ====================================================== */}
//       <section className="border-y border-slate-200 bg-white px-4 py-8 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/40 sm:px-6 lg:px-8">
//         <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/70 sm:p-10">
//           {/* Heading */}
//           <div className="mx-auto max-w-2xl text-center">
//             <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 sm:text-[10px]">
//               Safe Multi-Vendor Commerce
//             </span>

//             <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
//               The ShopNest Trust Standard
//             </h2>

//             <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">
//               We combine decentralized store individuality with centralized
//               protection policies to give you total peace of mind.
//             </p>
//           </div>

//           {/* Features */}
//           <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
//             {/* Card 1 */}
//             <div className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:bg-white hover:shadow-lg dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-indigo-500/30 dark:hover:bg-slate-800">
//               <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
//                 <FaShieldAlt className="text-lg" />
//               </div>

//               <h3 className="text-sm font-bold text-slate-900 dark:text-white">
//                 Strict Merchant Vetting
//               </h3>

//               <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
//                 Every vendor undergoes business registration authentication,
//                 inventory authenticity audit, and proof of origin verification.
//               </p>
//             </div>

//             {/* Card 2 */}
//             <div className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:bg-white hover:shadow-lg dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-purple-500/30 dark:hover:bg-slate-800">
//               <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
//                 <FaLock className="text-lg" />
//               </div>

//               <h3 className="text-sm font-bold text-slate-900 dark:text-white">
//                 Escrow Protection
//               </h3>

//               <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
//                 Funds are held securely in smart escrow and only released to
//                 the store after you confirm delivery and inspect the items.
//               </p>
//             </div>

//             {/* Card 3 */}
//             <div className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-lg dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-blue-500/30 dark:hover:bg-slate-800">
//               <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
//                 <FaComments className="text-lg" />
//               </div>

//               <h3 className="text-sm font-bold text-slate-900 dark:text-white">
//                 Direct Store Dialogue
//               </h3>

//               <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
//                 Chat directly with store founders for bespoke customization,
//                 bulk corporate quotes, and accurate sizing consultations.
//               </p>
//             </div>

//             {/* Card 4 */}
//             <div className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:bg-white hover:shadow-lg dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-sky-500/30 dark:hover:bg-slate-800">
//               <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
//                 <FaUserCheck className="text-lg" />
//               </div>

//               <h3 className="text-sm font-bold text-slate-900 dark:text-white">
//                 Verified Buyer Reviews
//               </h3>

//               <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
//                 Only confirmed customers who completed transactions can
//                 publish product ratings and merchant performance scores.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* =====================================================
//           SELLER CTA + REVENUE CALCULATOR
//       ====================================================== */}
//       <section className="bg-slate-50 px-4 py-8 transition-colors duration-300 dark:bg-[#050816] sm:px-6 lg:px-8">
//         <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-indigo-50 p-6 shadow-xl dark:border-slate-800 dark:from-[#070a20] dark:via-slate-950 dark:to-indigo-950/30 sm:p-10 lg:p-12">
//           {/* Background */}
//           <div className="pointer-events-none absolute inset-0 overflow-hidden">
//             <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-600/20" />

//             <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/20" />

//             <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(99,102,241,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_50%,rgba(99,102,241,0.12),transparent_50%)]" />
//           </div>

//           <div className="relative z-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
//             {/* LEFT */}
//             <div className="space-y-4">
//               <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 dark:border-indigo-500/20 dark:bg-indigo-500/10">
//                 <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
//                   Merchant Accelerator
//                 </span>
//               </div>

//               <h2 className="max-w-2xl text-2xl font-black leading-tight tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
//                 Ready to sell to millions of high-intent shoppers?
//               </h2>

//               <p className="max-w-xl text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
//                 Launch your branded digital storefront in under 48 hours.
//                 Enjoy automated payouts, multi-currency checkout, integrated
//                 carrier labels, and zero platform listing fees.
//               </p>

//               <div className="flex flex-wrap items-center gap-3 pt-2">
//                 <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[10px] font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 sm:text-xs">
//                   Open Your Storefront
//                   <FaArrowRight className="text-[9px]" />
//                 </button>

//                 <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[10px] font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:text-xs">
//                   Explore Seller Handbook
//                 </button>
//               </div>
//             </div>

//             {/* CALCULATOR */}
//             <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
//               {/* Calculator Header */}
//               <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-white/10">
//                 <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
//                   Revenue Calculator
//                 </span>

//                 <span className="rounded-md bg-indigo-50 px-2 py-1 text-[9px] font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
//                   Live Estimate
//                 </span>
//               </div>

//               <div className="mt-5 space-y-5">
//                 {/* Monthly Orders */}
//                 <div className="space-y-2">
//                   <div className="flex justify-between text-[10px] sm:text-xs">
//                     <span className="text-slate-500 dark:text-slate-400">
//                       Estimated Monthly Orders
//                     </span>

//                     <span className="font-bold text-slate-900 dark:text-white">
//                       {monthlyOrders} units
//                     </span>
//                   </div>

//                   <input
//                     type="range"
//                     min="50"
//                     max="2000"
//                     step="25"
//                     value={monthlyOrders}
//                     onChange={(e) =>
//                       setMonthlyOrders(Number(e.target.value))
//                     }
//                     className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-500 dark:bg-slate-700"
//                   />

//                   <div className="flex justify-between text-[8px] text-slate-400 dark:text-slate-600">
//                     <span>50</span>
//                     <span>2,000</span>
//                   </div>
//                 </div>

//                 {/* AOV */}
//                 <div className="space-y-2">
//                   <div className="flex justify-between text-[10px] sm:text-xs">
//                     <span className="text-slate-500 dark:text-slate-400">
//                       Average Order Value (AOV)
//                     </span>

//                     <span className="font-bold text-slate-900 dark:text-white">
//                       ${aov}
//                     </span>
//                   </div>

//                   <input
//                     type="range"
//                     min="20"
//                     max="300"
//                     step="5"
//                     value={aov}
//                     onChange={(e) => setAov(Number(e.target.value))}
//                     className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-500 dark:bg-slate-700"
//                   />

//                   <div className="flex justify-between text-[8px] text-slate-400 dark:text-slate-600">
//                     <span>$20</span>
//                     <span>$300</span>
//                   </div>
//                 </div>

//                 {/* Breakdown */}
//                 <div className="grid grid-cols-2 gap-2">
//                   <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/5 dark:bg-white/[0.03]">
//                     <p className="text-[8px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
//                       Gross Revenue
//                     </p>

//                     <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
//                       ${grossRevenue.toLocaleString()}
//                     </p>
//                   </div>

//                   <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/5 dark:bg-white/[0.03]">
//                     <p className="text-[8px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
//                       Platform Fee
//                     </p>

//                     <p className="mt-1 text-sm font-black text-slate-700 dark:text-slate-300">
//                       ${platformFee.toLocaleString()}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Net Result */}
//                 <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 dark:border-white/10 dark:from-slate-900 dark:to-slate-950">
//                   <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
//                     Net Merchant Payout (Est.)
//                   </p>

//                   <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
//                     ${netPayout.toLocaleString()}
//                     <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
//                       {" "}
//                       /mo
//                     </span>
//                   </p>

//                   <p className="mt-1 text-[9px] leading-relaxed text-slate-400 dark:text-slate-500">
//                     After ShopNest&apos;s estimated 4% gateway and escrow
//                     coverage.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }



import StoresContent from "@/components/stores/StoresContent";
import { categories, stores } from "@/data/stores";

export default function StoresPage() {
  return (
    <StoresContent
      stores={stores}
      categories={categories}
    />
  );
}