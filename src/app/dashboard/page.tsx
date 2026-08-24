"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getOrders } from "@/lib/api/orders";
import { getCart } from "@/lib/api/cart";
import { getWishlist } from "@/lib/api/wishlist";
import { getUnreadCount } from "@/lib/api/notifications";
import { DashboardShell, FeatureGrid, Panel, StatCard, DashboardLink } from "@/components/dashboard/DashboardUI";

const links: DashboardLink[] = [
 {label:"Orders & Tracking",href:"/orders",icon:"📦",description:"Review orders, status and delivery progress."},
 {label:"Smart Cart",href:"/cart",icon:"🛒",description:"Manage quantities, stock and checkout."},
 {label:"Wishlist",href:"/wishlist",icon:"♡",description:"Save products for later and revisit them."},
 {label:"AI Shopping Advisor",href:"/ai-advisor",icon:"✨",description:"Ask AI to compare and discover products."},
 {label:"Product Discovery",href:"/products",icon:"🔎",description:"Search, filter and explore the marketplace."},
 {label:"Stores & Sellers",href:"/stores",icon:"🏪",description:"Explore verified seller storefronts."},
 {label:"Profile & Security",href:"/profile",icon:"👤",description:"Manage account details and preferences."},
 {label:"Support Center",href:"/support",icon:"🎧",description:"Get help with orders, payments and products."},
 {label:"Notifications",href:"/notifications",icon:"🔔",description:"See order, promotion and seller updates."},
];
export default function CustomerDashboard(){
 const {data:session,isPending}=useSession(); const router=useRouter(); const [stats,setStats]=useState({orders:0,cart:0,wishlist:0,notifications:0,total:0});
 useEffect(()=>{if(!isPending&&!session?.user){router.replace('/login');return;} if((session?.user as {role?:string}|undefined)?.role==='seller'){router.replace('/seller/dashboard');return;} if((session?.user as {role?:string}|undefined)?.role==='admin'){router.replace('/admin/dashboard');return;} if(session?.user){Promise.all([getOrders(),getCart(),getWishlist(),getUnreadCount()]).then(([orders,cart,wish,notes])=>setStats({orders:orders.length,cart:cart.items?.reduce((s,i)=>s+i.quantity,0)||0,wishlist:wish.length,notifications:notes.count,total:orders.reduce((s,o)=>s+Number(o.totalAmount||0),0)})).catch(()=>undefined)}},[isPending,session,router]);
 return <DashboardShell role="Customer" title="Your Commerce Command Center" subtitle="Everything you need to discover products, manage purchases, get AI guidance and stay on top of your ShopNest account." links={links}><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon="📦" label="Orders" value={String(stats.orders)} note="Total orders placed"/><StatCard icon="🛒" label="Cart items" value={String(stats.cart)} note="Ready for checkout"/><StatCard icon="♡" label="Wishlist" value={String(stats.wishlist)} note="Saved products"/><StatCard icon="🔔" label="Unread" value={String(stats.notifications)} note="New notifications"/></div><div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_.7fr]"><Panel title="Shopping snapshot"><div className="grid gap-4 sm:grid-cols-3"><div className="rounded-xl bg-muted-bg p-4"><p className="text-xs text-muted">Lifetime order value</p><p className="mt-1 text-xl font-black">৳{stats.total.toLocaleString()}</p></div><div className="rounded-xl bg-muted-bg p-4"><p className="text-xs text-muted">AI guidance</p><p className="mt-1 text-xl font-black">Ready</p></div><div className="rounded-xl bg-muted-bg p-4"><p className="text-xs text-muted">Marketplace</p><p className="mt-1 text-xl font-black">Live</p></div></div></Panel><Panel title="Quick action"><div className="grid gap-2"><a className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-white" href="/products">Find products</a><a className="rounded-xl border border-border px-4 py-3 text-center text-sm font-bold" href="/ai-advisor">Ask AI advisor</a></div></Panel></div><div className="mt-5"><Panel title="Your 9 customer features"><FeatureGrid links={links}/></Panel></div></DashboardShell>;
}
