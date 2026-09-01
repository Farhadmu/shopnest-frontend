import type { DashboardLink } from "@/components/dashboard/DashboardUI";

/**
 * Single source of truth for each role's dashboard sidebar.
 * Add a new dashboard page? Add one line here — every page/layout
 * that renders <DashboardShell links={...} /> stays in sync.
 */
export const userDashboardLinks: DashboardLink[] = [
  { label: "Overview", href: "/dashboard/user", icon: "📊", description: "Shopping metrics & active status." },
  { label: "Spending Analytics", href: "/dashboard/user/analytics", icon: "📈", description: "Charts, spend insights & offers." },
  { label: "Shopping Journey", href: "/dashboard/user/journey", icon: "🚀", description: "Personalized exploration timeline." },
  { label: "Budget Planner", href: "/dashboard/user/budget", icon: "💰", description: "Allocate optimal cart combinations." },
  { label: "Shopping Goals", href: "/dashboard/user/goals", icon: "🎯", description: "Track target milestones." },
  { label: "Product Lifecycle", href: "/dashboard/user/lifecycle", icon: "🛡️", description: "Warranty & maintenance tracker." },
  { label: "Security Center", href: "/dashboard/user/security", icon: "🔐", description: "Active sessions & security score." },
  { label: "Notifications", href: "/dashboard/user/notifications", icon: "🔔", description: "Order updates & alerts." },
  { label: "My Orders", href: "/dashboard/user/orders", icon: "📦", description: "Order timeline & delivery status." },
  { label: "Smart Cart", href: "/cart", icon: "🛍️", description: "Live cart and checkout." },
  { label: "Wishlist", href: "/wishlist", icon: "❤️", description: "Saved favorite items." },
  { label: "AI Advisor", href: "/dashboard/user/ai-advisor", icon: "🤖", description: "AI commerce shopping assistant." },
  { label: "Profile & Settings", href: "/dashboard/user/profile", icon: "👤", description: "Account identity and settings." },
];

export const sellerDashboardLinks: DashboardLink[] = [
  { label: "Command Center", href: "/dashboard/seller/command-center", icon: "📊", description: "Real-time KPI dashboard." },
  { label: "Sales Analytics", href: "/dashboard/seller/analytics", icon: "📈", description: "Revenue & sales breakdown." },
  { label: "Product Performance", href: "/dashboard/seller/product-performance", icon: "🏆", description: "Product-wise sales & revenue." },
  { label: "Sales Forecast", href: "/dashboard/seller/forecast", icon: "🔮", description: "AI demand forecasting." },
  { label: "Smart Inventory", href: "/dashboard/seller/inventory", icon: "📦", description: "Stock levels & restock alerts." },
  { label: "Orders", href: "/dashboard/seller/orders", icon: "🚚", description: "Order fulfillment." },
  { label: "Customers", href: "/dashboard/seller/customers", icon: "👥", description: "Buyer behavior analytics." },
  { label: "Coupons", href: "/dashboard/seller/coupons", icon: "🏷️", description: "Discount campaigns." },
  { label: "Store Health", href: "/dashboard/seller/store-health", icon: "🩺", description: "Store performance diagnostics." },
  { label: "Trust Score", href: "/dashboard/seller/trust-score", icon: "⭐", description: "Seller reputation score." },
  { label: "Risk Indicators", href: "/dashboard/seller/risk-indicators", icon: "⚠️", description: "Fraud & anomaly detection." },
  { label: "Goals", href: "/dashboard/seller/goals", icon: "🎯", description: "Business targets & progress." },
  { label: "Products", href: "/dashboard/seller/products", icon: "🧾", description: "Manage product catalog." },
  { label: "Add Product", href: "/dashboard/seller/products/add", icon: "➕", description: "List a new product." },
  { label: "AI Seller Tools", href: "/dashboard/seller/ai-tools", icon: "🤖", description: "AI listing & pricing tools." },
  { label: "Security Center", href: "/dashboard/seller/security", icon: "🔐", description: "Sessions & security events." },
  { label: "Notifications", href: "/dashboard/seller/notifications", icon: "🔔", description: "Order & store alerts." },
  { label: "Store Settings", href: "/dashboard/seller/store-settings", icon: "⚙️", description: "Store profile & preferences." },
];

export const adminDashboardLinks: DashboardLink[] = [
  { label: "Command Center", href: "/dashboard/admin", icon: "🛡️", description: "Platform-wide overview." },
  { label: "Platform Analytics", href: "/dashboard/admin/analytics", icon: "📈", description: "Marketplace-wide metrics." },
  { label: "Security Center", href: "/dashboard/admin/security", icon: "🔐", description: "Platform security posture." },
  { label: "Risk & Fraud", href: "/dashboard/admin/risk", icon: "🚨", description: "Fraud & anomaly detection." },
  { label: "Incidents", href: "/dashboard/admin/incidents", icon: "📑", description: "Incident management." },
  { label: "Audit Logs", href: "/dashboard/admin/audit-logs", icon: "📜", description: "Governance audit trail." },
  { label: "Users", href: "/dashboard/admin/users", icon: "👤", description: "User management." },
  { label: "Sellers", href: "/dashboard/admin/sellers", icon: "🏬", description: "Seller verification." },
  { label: "Products", href: "/dashboard/admin/products", icon: "📦", description: "Product moderation." },
  { label: "Categories", href: "/dashboard/admin/categories", icon: "🗂️", description: "Category management." },
  { label: "Orders", href: "/dashboard/admin/orders", icon: "🧾", description: "Platform-wide orders." },
  { label: "Coupons", href: "/dashboard/admin/coupons", icon: "🏷️", description: "Platform coupon campaigns." },
  { label: "Reviews", href: "/dashboard/admin/reviews", icon: "⭐", description: "Review moderation." },
  { label: "Notifications", href: "/dashboard/admin/notifications", icon: "🔔", description: "System alerts." },
];
