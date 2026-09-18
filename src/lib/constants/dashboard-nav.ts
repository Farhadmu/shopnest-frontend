import type { DashboardLink } from "@/components/dashboard/DashboardUI";

/**
 * Single source of truth for each role's dashboard sidebar.
 * Add a new dashboard page? Add one line here — every page/layout
 * that renders <DashboardShell links={...} /> stays in sync.
 */
export const userDashboardLinks: DashboardLink[] = [
  { label: "Overview", href: "/dashboard/user", icon: "📊", description: "Shopping metrics & active status.", group: "SHOP" },
  { label: "My Orders", href: "/dashboard/user/orders", icon: "📦", description: "Order timeline & delivery status.", group: "SHOP" },
  { label: "Returns & Refunds", href: "/dashboard/user/returns", icon: "🔄", description: "Track return requests and refunds.", group: "SHOP" },
  { label: "Wishlist", href: "/wishlist", icon: "❤️", description: "Saved favorite items.", group: "SHOP" },
  { label: "Smart Cart", href: "/cart", icon: "🛍️", description: "Live cart and checkout.", group: "SHOP" },

  // ACTIVITY & PLANNING
  { label: "Spending Analytics", href: "/dashboard/user/analytics", icon: "📈", description: "Charts, spend insights & offers.", group: "ACTIVITY" },
  { label: "Shopping Journey", href: "/dashboard/user/journey", icon: "🚀", description: "Personalized exploration timeline.", group: "ACTIVITY" },
  { label: "Budget Planner", href: "/dashboard/user/budget", icon: "💰", description: "Allocate optimal cart combinations.", group: "ACTIVITY" },
  { label: "Shopping Goals", href: "/dashboard/user/goals", icon: "🎯", description: "Track target milestones.", group: "ACTIVITY" },
  { label: "Product Lifecycle", href: "/dashboard/user/lifecycle", icon: "🛡️", description: "Warranty & maintenance tracker.", group: "ACTIVITY" },

  // INSIGHTS & AI
  { label: "AI Copilot / Advisor", href: "/dashboard/user/ai-advisor", icon: "🤖", description: "AI commerce shopping assistant.", group: "INSIGHTS", highlight: true },
  { label: "Notifications", href: "/dashboard/user/notifications", icon: "🔔", description: "Order updates & alerts.", group: "INSIGHTS" },

  // ACCOUNT
  { label: "Profile & Settings", href: "/dashboard/user/profile", icon: "👤", description: "Account identity and settings.", group: "ACCOUNT" },
  { label: "Security Center", href: "/dashboard/user/security", icon: "🔐", description: "Active sessions & security score.", group: "ACCOUNT" },
  { label: "My Complaints", href: "/dashboard/user/complaints", icon: "📝", description: "Submit and track your complaints.", group: "ACCOUNT" },
];

export const sellerDashboardLinks: DashboardLink[] = [
  // STORE OVERVIEW
  { label: "Dashboard", href: "/dashboard/seller", icon: "🏠", description: "Seller Growth & Intelligence Hub — Store Overview.", group: "OVERVIEW" },
  { label: "Command Center", href: "/dashboard/seller/command-center", icon: "📊", description: "Real-time KPI dashboard.", group: "OVERVIEW" },
  { label: "Sales Analytics", href: "/dashboard/seller/analytics", icon: "📈", description: "Revenue & sales breakdown.", group: "OVERVIEW" },
  { label: "Store Health", href: "/dashboard/seller/store-health", icon: "🩺", description: "Store performance diagnostics.", group: "OVERVIEW" },
  { label: "Trust Score", href: "/dashboard/seller/trust-score", icon: "⭐", description: "Seller reputation score.", group: "OVERVIEW" },

  // CATALOG & INVENTORY
  { label: "Products", href: "/dashboard/seller/products", icon: "🧾", description: "Manage product catalog.", group: "CATALOG" },
  { label: "Add Product", href: "/dashboard/seller/products/add", icon: "➕", description: "List a new product manually or with AI.", group: "CATALOG" },
  { label: "AI Product Studio", href: "/dashboard/seller/ai-tools", icon: "🤖", description: "Create listings from product images with AI.", group: "CATALOG", highlight: true },
  { label: "Smart Inventory", href: "/dashboard/seller/inventory", icon: "📦", description: "Stock levels & restock alerts.", group: "CATALOG" },

  // ORDERS & FULFILLMENT
  { label: "Orders", href: "/dashboard/seller/orders", icon: "🚚", description: "Order fulfillment.", group: "ORDERS" },
  { label: "Returns & Refunds", href: "/dashboard/seller/returns", icon: "🔄", description: "Manage customer returns and refunds.", group: "ORDERS" },
  { label: "Sales Forecast", href: "/dashboard/seller/forecast", icon: "🔮", description: "AI demand forecasting.", group: "ORDERS" },

  // CUSTOMERS & GROWTH
  { label: "Customers", href: "/dashboard/seller/customers", icon: "👥", description: "Buyer behavior analytics.", group: "GROWTH" },
  { label: "Coupons", href: "/dashboard/seller/coupons", icon: "🏷️", description: "Discount campaigns.", group: "GROWTH" },
  { label: "Goals", href: "/dashboard/seller/goals", icon: "🎯", description: "Business targets & progress.", group: "GROWTH" },
  { label: "Risk Indicators", href: "/dashboard/seller/risk-indicators", icon: "⚠️", description: "Fraud & anomaly detection.", group: "GROWTH" },

  // STORE & ACCOUNT
  { label: "Store Settings", href: "/dashboard/seller/store-settings", icon: "⚙️", description: "Store profile & preferences.", group: "ACCOUNT" },
  { label: "Security Center", href: "/dashboard/seller/security", icon: "🔐", description: "Sessions & security events.", group: "ACCOUNT" },
  { label: "My Complaints", href: "/dashboard/seller/complaints", icon: "📝", description: "Submit and track seller complaints.", group: "ACCOUNT" },
  { label: "Notifications", href: "/dashboard/seller/notifications", icon: "🔔", description: "Order & store alerts.", group: "ACCOUNT" },
];

export const adminDashboardLinks: DashboardLink[] = [
  // COMMAND & ANALYTICS
  { label: "Command Center", href: "/dashboard/admin", icon: "🛡️", description: "Platform-wide overview.", group: "OVERVIEW" },
  { label: "Platform Analytics", href: "/dashboard/admin/analytics", icon: "📈", description: "Marketplace-wide metrics.", group: "OVERVIEW" },

  // SECURITY & GOVERNANCE
  { label: "Security Center", href: "/dashboard/admin/security", icon: "🔐", description: "Platform security posture.", group: "SECURITY" },
  { label: "Risk & Fraud", href: "/dashboard/admin/risk", icon: "🚨", description: "Fraud & anomaly detection.", group: "SECURITY" },
  { label: "Incidents", href: "/dashboard/admin/incidents", icon: "📑", description: "Incident management.", group: "SECURITY" },
  { label: "Audit Logs", href: "/dashboard/admin/audit-logs", icon: "📜", description: "Governance audit trail.", group: "SECURITY" },

  // USER MANAGEMENT
  { label: "Users", href: "/dashboard/admin/users", icon: "👤", description: "User management.", group: "PEOPLE" },
  { label: "Sellers", href: "/dashboard/admin/sellers", icon: "🏬", description: "Seller verification.", group: "PEOPLE" },
  { label: "Delivery Men", href: "/dashboard/admin/delivery-men", icon: "🚚", description: "Delivery man management & verification.", group: "PEOPLE" },

  // CATALOG & CONTENT
  { label: "Products", href: "/dashboard/admin/products", icon: "📦", description: "Product moderation.", group: "CATALOG" },
  { label: "Categories", href: "/dashboard/admin/categories", icon: "🗂️", description: "Category management.", group: "CATALOG" },
  { label: "Hero Banners", href: "/dashboard/admin/hero-banners", icon: "🖼️", description: "Category hero campaigns.", group: "CATALOG" },

  // OPERATIONS & SALES
  { label: "Orders", href: "/dashboard/admin/orders", icon: "🧾", description: "Platform-wide orders.", group: "OPERATIONS" },
  { label: "Returns & Refunds", href: "/dashboard/admin/returns", icon: "↩️", description: "Platform-wide return and refund management.", group: "OPERATIONS" },
  { label: "Coupons", href: "/dashboard/admin/coupons", icon: "🏷️", description: "Platform coupon campaigns.", group: "OPERATIONS" },
  { label: "Reviews", href: "/dashboard/admin/reviews", icon: "⭐", description: "Review moderation.", group: "OPERATIONS" },

  // SYSTEM
  { label: "Notifications", href: "/dashboard/admin/notifications", icon: "🔔", description: "System alerts.", group: "SYSTEM" },
];

export const deliveryManDashboardLinks: DashboardLink[] = [
  // MISSIONS
  { label: "Dashboard", href: "/dashboard/delivery", icon: "🏠", description: "Delivery overview & live cockpit.", group: "MISSIONS" },
  { label: "Available Deliveries", href: "/dashboard/delivery/available", icon: "📍", description: "Browse and accept open delivery requests.", group: "MISSIONS" },
  { label: "Reverse Deliveries", href: "/dashboard/delivery/returns", icon: "🔄", description: "Pick up returned items from customers.", group: "MISSIONS" },
  { label: "My Deliveries", href: "/dashboard/delivery/my-deliveries", icon: "🚚", description: "Active & completed delivery missions.", group: "MISSIONS" },

  // SMART TOOLS
  { label: "AI Copilot", href: "/dashboard/delivery/copilot", icon: "🤖", description: "AI route, workload & earnings advisor.", group: "ASSIST", highlight: true },
  { label: "Incidents & Issues", href: "/dashboard/delivery/incidents", icon: "⚠️", description: "Report and track delivery incidents.", group: "ASSIST" },

  // ACCOUNT & UPDATES
  { label: "My Complaints", href: "/dashboard/delivery/complaints", icon: "📝", description: "Submit and track delivery complaints.", group: "ACCOUNT" },
  { label: "Notifications", href: "/dashboard/delivery/notifications", icon: "🔔", description: "Delivery alerts & updates.", group: "ACCOUNT" },
  { label: "My Profile", href: "/dashboard/delivery/profile", icon: "👤", description: "Profile, documents & vehicle info.", group: "ACCOUNT" },
];
