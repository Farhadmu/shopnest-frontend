# ShopNest — AI-Powered Multi-Vendor Commerce & Seller Platform

![Next.js](https://img.shields.io/badge/Next.js-16.3.1-black)
![React](https://img.shields.io/badge/React-19.2.8-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8)
![Better Auth](https://img.shields.io/badge/Better_Auth-1.7.1-green)

**ShopNest** is a modern, AI-powered multi-vendor commerce platform that combines a marketplace shopping experience with powerful seller and administrator tooling. The frontend delivers role-aware experiences for **Customers**, **Sellers**, and **Administrators**, backed by real-time AI assistance, responsive design, and dark mode support.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [User Roles](#user-roles)
3. [Key Features](#key-features)
4. [AI Commerce Experience](#ai-commerce-experience)
5. [Application Architecture](#application-architecture)
6. [Technology Stack](#technology-stack)
7. [Project Structure](#project-structure)
8. [Routing & Pages](#routing--pages)
9. [Authentication & Authorization](#authentication--authorization)
10. [API Integration](#api-integration)
11. [State Management](#state-management)
12. [UI/UX & Design System](#uiux--design-system)
13. [Responsive Design](#responsive-design)
14. [Dark Mode](#dark-mode)
15. [Installation](#installation)
16. [Environment Variables](#environment-variables)
17. [Development](#development)
18. [Build & Deployment](#build--deployment)
19. [Testing](#testing)
20. [Security](#security)
21. [Performance](#performance)
22. [Accessibility](#accessibility)
23. [Git Workflow](#git-workflow)
24. [Troubleshooting](#troubleshooting)
25. [Future Improvements](#future-improvements)

---

## Project Overview

ShopNest is designed as a full-featured commerce platform where three distinct user types interact with the same marketplace:

- **Customers** discover products, manage carts and wishlists, place orders, write reviews, and receive AI-powered shopping assistance.
- **Sellers** manage storefronts, products, inventory, orders, analytics, and receive AI-driven business insights.
- **Administrators** oversee the marketplace, manage users, sellers, products, orders, coupons, security incidents, and platform analytics.

The frontend is built with **Next.js 16** (App Router), **React 19**, **TypeScript**, and **Tailwind CSS v4**. It uses **Better Auth** for authentication, **HeroUI** for component primitives, **Framer Motion** for animations, and **Lucide** / **React Icons** for iconography.

### What This Repository Contains

This repository is the **frontend-only** codebase. It communicates with the [ShopNest Backend](https://github.com/Farhadmu/shopnest-backend) via a REST API. It does **not** contain:

- Backend server code
- Database schemas or migrations
- AI model training code
- Payment processor integrations (payment UI is present; processing is backend-managed)

---

## User Roles

### Customer

Customers interact with the marketplace as buyers. Their experience includes:

- Product discovery, search, and filtering
- Product detail pages with specifications, reviews, and trust indicators
- Shopping cart and checkout flow
- Order tracking and history
- Wishlist management
- Review submission and photo uploads
- Coupon application
- AI Shopping Advisor for personalized recommendations
- AI Commerce Copilot for shopping assistance
- Profile and address management
- Spending analytics and shopping journey tracking

### Seller

Sellers operate their own storefronts within the marketplace. Their experience includes:

- Seller onboarding and application
- Store profile and settings management
- Product creation, editing, and performance tracking
- Inventory management
- Order fulfillment and tracking
- Revenue and sales analytics
- Coupon creation and management
- Customer insights
- Store health and trust score monitoring
- AI Seller Copilot for business intelligence
- AI-powered product tools (image analysis, description generation, pricing suggestions)
- Risk indicators and security center

### Administrator

Administrators manage the entire marketplace. Their experience includes:

- Platform-wide user, seller, and product management
- Order oversight and moderation
- Coupon administration
- Category management
- Hero banner management
- Review moderation
- Security incident monitoring
- Risk assessment tools
- AI Admin Copilot for marketplace intelligence
- Analytics dashboards

---

## Key Features

| Area | Feature | Status |
|------|---------|--------|
| **Customer** | Product listing with search, filter, and category navigation | Implemented |
| **Customer** | Product detail with specs, reviews, trust section | Implemented |
| **Customer** | Shopping cart with drawer UI | Implemented |
| **Customer** | Checkout with delivery address and payment method selection | Implemented |
| **Customer** | Order history and tracking | Implemented |
| **Customer** | Wishlist with collection grouping | Implemented |
| **Customer** | Review submission with photo upload | Implemented |
| **Customer** | Coupon discovery and application | Implemented |
| **Customer** | Store browsing and search | Implemented |
| **Customer** | AI Shopping Advisor | Implemented |
| **Customer** | AI Commerce Copilot | Implemented |
| **Seller** | Seller application and onboarding | Implemented |
| **Seller** | Store profile and settings | Implemented |
| **Seller** | Product management (CRUD) | Implemented |
| **Seller** | Inventory management | Implemented |
| **Seller** | Order management | Implemented |
| **Seller** | Sales analytics and performance | Implemented |
| **Seller** | Coupon creation and management | Implemented |
| **Seller** | Customer insights | Implemented |
| **Seller** | Store health and trust score | Implemented |
| **Seller** | AI Seller Copilot | Implemented |
| **Seller** | AI product tools (image analysis, pricing, descriptions) | Implemented |
| **Admin** | User management | Implemented |
| **Admin** | Seller management | Implemented |
| **Admin** | Product moderation | Implemented |
| **Admin** | Order oversight | Implemented |
| **Admin** | Coupon administration | Implemented |
| **Admin** | Category management | Implemented |
| **Admin** | Hero banner management | Implemented |
| **Admin** | Review moderation | Implemented |
| **Admin** | Security incident monitoring | Implemented |
| **Admin** | Risk assessment | Implemented |
| **Admin** | Analytics dashboards | Implemented |
| **Admin** | AI Admin Copilot | Implemented |
| **Platform** | Responsive design (mobile, tablet, desktop) | Implemented |
| **Platform** | Dark mode / light mode | Implemented |
| **Platform** | Authentication (email/password, Google OAuth) | Implemented |
| **Platform** | Password reset via email | Implemented |
| **Platform** | Role-based navigation and dashboards | Implemented |

---

## AI Commerce Experience

ShopNest integrates AI throughout the platform to assist customers, sellers, and administrators. All AI features communicate with the backend AI layer, which uses provider-aware fallbacks (Gemini primary, Anthropic fallback, local limited mode).

### AI Shopping Advisor

**Location:** `/ai-advisor`, `/dashboard/user/ai-advisor`

The AI Shopping Advisor is a conversational product recommendation engine. Customers can ask natural-language questions such as:

- "Best programming laptop under ৳80,000 with good battery"
- "Gaming phone under ৳40,000"
- "Cheapest laptop under 80k"
- "Give me a cheaper option"

The advisor:

- Detects user intent and constraints (budget, category, use case)
- Retrieves real products from the database
- Ranks products using category-specific multi-dimensional scoring
- Returns structured recommendations with match scores, strengths, weaknesses, and trade-offs
- Handles no-match scenarios with closest alternatives and constraint relaxation explanations
- Supports multi-turn conversation context

**Frontend components:** `src/components/ai/AiAdvisorView.tsx`

### AI Commerce Copilot

**Location:** Dashboard sidebar (customer, seller, admin variants)

The AI Commerce Copilot is a role-aware conversational assistant accessible from the dashboard. It provides:

- **Customer Copilot:** Shopping assistance, order queries, wishlist help, cart advice, return/refund guidance, spending insights
- **Seller Copilot:** Sales analysis, inventory insights, restock recommendations, product performance, forecasting, daily business briefs
- **Admin Copilot:** Marketplace overview, platform analytics, security incidents, risk assessment

The copilot:

- Derives the user's role from the authenticated session (never trusts frontend-provided role)
- Builds real-time context from the user's own data
- Uses role-specific system prompts
- Returns structured responses with metrics, insights, sources, and suggested actions
- Maintains conversation history via `conversationId`
- Falls back to honest limited-mode responses when the AI provider is unavailable

**Frontend components:** `src/components/ai/AiCommerceCopilot.tsx`  
**API clients:** `src/lib/api/customer-copilot.ts`, `src/lib/api/seller-copilot.ts`, `src/lib/api/admin-copilot.ts`

### AI Product Tools (Seller)

Sellers have access to AI-powered product tools:

- **Product Image Analysis:** Upload product images for AI-generated descriptions, tags, and highlights
- **AI Description Generation:** Generate product descriptions from title, category, and features
- **AI Pricing Suggestions:** Get competitive pricing recommendations based on category averages
- **Review Summarization:** AI-generated review summaries with sentiment analysis

**API client:** `src/lib/api/ai-commerce.ts`

### Visual Search

The homepage features a visual search section that allows users to search for products by uploading an image. The frontend provides the upload UI; the matching logic and image processing are handled by the backend AI services.

**Frontend component:** `src/components/home/VisualSearchSection.tsx`  
**API client:** `src/lib/api/ai-commerce.ts` (`visualSearchAI`)

### AI Intelligence Section (Homepage)

The homepage includes an AI Intelligence Section that showcases AI-powered product recommendations and shopping intelligence to visitors.

**Frontend component:** `src/components/home/AiIntelligenceSection.tsx`

---

## Application Architecture

```mermaid
flowchart TD
    User[User Browser]
    Next[Next.js 16 Frontend]
    Auth[Better Auth]
    APILayer[API Layer /lib/api]
    Backend[ShopNest Backend]
    DB[(MongoDB)]
    AI[AI Services]

    User --> Next
    Next --> Auth
    Next --> APILayer
    APILayer --> Backend
    Backend --> DB
    Backend --> AI

    subgraph Frontend
        Next
        Auth
        APILayer
    end

    subgraph Backend
        Backend
        DB
        AI
    end
```

### Request Flow

1. **User Interaction** — User interacts with a React component in the App Router.
2. **Authentication** — `useSession` from `better-auth` provides the authenticated user context.
3. **API Call** — Components call typed API functions in `src/lib/api/*.ts`.
4. **HTTP Request** — API functions use `clientFetch` / `clientMutation` to call the backend via Next.js rewrites.
5. **Backend Processing** — Backend handles auth, business logic, database queries, and AI processing.
6. **Response** — Structured JSON is returned to the frontend and rendered in the UI.

### Role-Based Routing

```mermaid
flowchart TD
    Root[Root Layout]
    Auth{Auth Route?}
    Dashboard{/dashboard/*}
    Customer[/dashboard/user]
    Seller[/dashboard/seller]
    Admin[/dashboard/admin]
    Public[Public Pages]

    Root --> Auth
    Root --> Dashboard
    Root --> Public

    Auth --> LoginRegister[Login / Register / Forgot Password]
    Dashboard --> Customer
    Dashboard --> Seller
    Dashboard --> Admin

    Public --> Home[Home]
    Public --> Products[Products]
    Public --> Stores[Stores]
    Public --> Compare[Compare]
    Public --> FlashSale[Flash Sale]
    Public --> Support[Support]
```

---

## Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Next.js | 16.3.1 |
| **UI Library** | React | 19.2.8 |
| **Language** | TypeScript | 5 |
| **Styling** | Tailwind CSS | v4 |
| **Component Library** | HeroUI | 3.2.4 |
| **Authentication** | Better Auth | 1.7.1 |
| **Database Adapter** | @better-auth/mongo-adapter | 1.7.1 |
| **Animations** | Framer Motion | 13.1.1 |
| **Icons** | Lucide React | 1.34.0 |
| **Icons** | React Icons | 5.7.0 |
| **Form Validation** | Zod | 4.4.3 |
| **Email** | Nodemailer | 9.0.6 |
| **MongoDB Driver** | mongodb | 7.5.0 |
| **Linting** | ESLint | 9 |
| **Formatting** | Prettier | 3.9.6 |

---

## Project Structure

```
shopnest-frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Authentication pages
│   │   │   ├── become-seller/
│   │   │   ├── forgot-password/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── reset-password/
│   │   │   └── template.tsx
│   │   ├── (customer)/               # Customer-specific pages
│   │   │   ├── ai-advisor/
│   │   │   ├── checkout/
│   │   │   ├── confirm-payment/
│   │   │   ├── orders/
│   │   │   └── payment/
│   │   ├── (public)/                 # Public pages
│   │   │   ├── compare/
│   │   │   ├── flash-sale/
│   │   │   ├── products/
│   │   │   └── stores/
│   │   ├── dashboard/                # Role-based dashboards
│   │   │   ├── admin/                # Admin dashboard pages
│   │   │   │   ├── analytics/
│   │   │   │   ├── audit-logs/
│   │   │   │   ├── categories/
│   │   │   │   ├── coupons/
│   │   │   │   ├── hero-banners/
│   │   │   │   ├── incidents/
│   │   │   │   ├── notifications/
│   │   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── products/
│   │   │   │   ├── profile/
│   │   │   │   ├── reviews/
│   │   │   │   ├── risk/
│   │   │   │   ├── security/
│   │   │   │   ├── sellers/
│   │   │   │   └── users/
│   │   │   ├── seller/               # Seller dashboard pages
│   │   │   │   ├── ai-tools/
│   │   │   │   ├── analytics/
│   │   │   │   ├── command-center/
│   │   │   │   ├── coupons/
│   │   │   │   ├── customers/
│   │   │   │   ├── forecast/
│   │   │   │   ├── goals/
│   │   │   │   ├── inventory/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── notifications/
│   │   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── product-performance/
│   │   │   │   ├── products/
│   │   │   │   ├── profile/
│   │   │   │   ├── risk-indicators/
│   │   │   │   ├── security/
│   │   │   │   ├── store-health/
│   │   │   │   ├── store-settings/
│   │   │   │   └── trust-score/
│   │   │   └── user/                 # Customer dashboard pages
│   │   │       ├── ai-advisor/
│   │   │       ├── analytics/
│   │   │       ├── budget/
│   │   │       ├── goals/
│   │   │       ├── journey/
│   │   │       ├── layout.tsx
│   │   │       ├── lifecycle/
│   │   │       ├── notifications/
│   │   │       ├── orders/
│   │   │       ├── page.tsx
│   │   │       ├── profile/
│   │   │       └── security/
│   │   ├── about/
│   │   ├── api/                      # API routes (auth)
│   │   ├── cart/
│   │   ├── notifications/
│   │   ├── privacy/
│   │   ├── support/
│   │   ├── sync/
│   │   ├── terms/
│   │   ├── wishlist/
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Homepage
│   │   ├── globals.css               # Global styles
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ai/                       # AI components
│   │   │   ├── AiAdvisorView.tsx
│   │   │   └── AiCommerceCopilot.tsx
│   │   ├── analytics/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── common/
│   │   ├── coupons/
│   │   ├── customer/
│   │   ├── dashboard/
│   │   │   ├── admin/
│   │   │   ├── seller/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── DashboardUI.tsx
│   │   │   └── sidebar/
│   │   ├── home/
│   │   │   ├── AiIntelligenceSection.tsx
│   │   │   ├── Banner.tsx
│   │   │   ├── CouponSection.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── JustForYouSection.tsx
│   │   │   ├── ProofSection.tsx
│   │   │   ├── SellersSection.tsx
│   │   │   ├── ShopByCategory.tsx
│   │   │   ├── TrustFeatures.tsx
│   │   │   ├── VisualSearchSection.tsx
│   │   │   ├── WhyShopNest.tsx
│   │   │   └── Trending/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MobileBottomNav.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── ThemeBootstrap.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── orders/
│   │   ├── products/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductsClient.tsx
│   │   │   ├── category-filter/
│   │   │   ├── detail/
│   │   │   ├── listing/
│   │   │   └── PriceHistoryChart.tsx
│   │   ├── profile/
│   │   ├── reviews/
│   │   ├── search/
│   │   ├── seller/
│   │   ├── store/
│   │   ├── stores/
│   │   └── wishlist/
│   ├── context/
│   │   ├── CartDrawerContext.tsx
│   │   └── ConfirmDialogContext.tsx
│   ├── data/
│   ├── features/
│   │   └── products/
│   ├── hooks/
│   │   ├── dashboard/
│   │   ├── useCategories.ts
│   │   ├── useDebounce.ts
│   │   ├── useGuestStore.ts
│   │   ├── useMediaQuery.ts
│   │   └── useOutsideClick.ts
│   ├── lib/
│   │   ├── api/                      # API client modules
│   │   │   ├── admin-copilot.ts
│   │   │   ├── ai-commerce.ts
│   │   │   ├── cart.ts
│   │   │   ├── categories.ts
│   │   │   ├── coupons.ts
│   │   │   ├── customer-copilot.ts
│   │   │   ├── customer-features.ts
│   │   │   ├── customer-intelligence.ts
│   │   │   ├── orders.ts
│   │   │   ├── payments.ts
│   │   │   ├── products.ts
│   │   │   ├── reviews.ts
│   │   │   ├── seller-copilot.ts
│   │   │   ├── seller-intelligence.ts
│   │   │   ├── sellers.ts
│   │   │   ├── stores.server.ts
│   │   │   ├── support.ts
│   │   │   ├── users.ts
│   │   │   └── wishlist.ts
│   │   ├── auth-client.ts           # Better Auth client
│   │   ├── auth.ts                  # Better Auth server instance
│   │   ├── auth-redirect.ts
│   │   ├── banner/
│   │   ├── bd-address.ts
│   │   ├── commerce-events.ts
│   │   ├── constants/
│   │   ├── core/
│   │   ├── guest-store.ts
│   │   ├── utils.ts
│   │   └── utils/
│   ├── providers/
│   │   └── HeroUIProvider.tsx
│   ├── schemas/
│   ├── types/
│   │   ├── category.ts
│   │   ├── coupon.ts
│   │   ├── index.ts
│   │   ├── product-form.ts
│   │   ├── seller-application.ts
│   │   └── store.ts
│   ├── proxy.ts
│   └── app/
│       ├── (auth)/
│       ├── (customer)/
│       ├── (public)/
│       ├── dashboard/
│       ├── about/
│       ├── api/
│       ├── cart/
│       ├── notifications/
│       ├── privacy/
│       ├── support/
│       ├── sync/
│       ├── terms/
│       ├── wishlist/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── globals.css
│       └── not-found.tsx
├── public/
├── .env.example
├── .eslintrc.json
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## Routing & Pages

### Public Routes

| Route | Purpose |
|-------|---------|
| `/` | Homepage with hero, categories, trending products, coupons, AI section |
| `/products` | Product listing with search and filters |
| `/products/[id]` | Product detail page |
| `/stores` | Store directory |
| `/stores/[id]` | Individual store page |
| `/compare` | Product comparison |
| `/flash-sale` | Flash sale listings |
| `/about` | About page |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/support` | Support page |
| `/sync` | Data sync page |

### Authentication Routes

| Route | Purpose |
|-------|---------|
| `/login` | User login |
| `/register` | User registration |
| `/forgot-password` | Password reset request |
| `/reset-password` | Password reset completion |
| `/become-seller` | Seller application |

### Customer Routes

| Route | Purpose |
|-------|---------|
| `/ai-advisor` | AI Shopping Advisor |
| `/checkout` | Checkout flow |
| `/confirm-payment` | Payment confirmation |
| `/orders` | Order history |
| `/orders/[id]` | Order detail |
| `/payment/cancel` | Payment cancellation |
| `/payment/success` | Payment success |
| `/wishlist` | Wishlist management |
| `/cart` | Shopping cart |
| `/notifications` | Customer notifications |

### Dashboard Routes

| Route | Role | Purpose |
|-------|------|---------|
| `/dashboard` | All | Role-based redirect |
| `/dashboard/user` | Customer | Customer dashboard home |
| `/dashboard/user/ai-advisor` | Customer | AI Advisor in dashboard |
| `/dashboard/user/analytics` | Customer | Customer analytics |
| `/dashboard/user/budget` | Customer | Budget planner |
| `/dashboard/user/goals` | Customer | Shopping goals |
| `/dashboard/user/journey` | Customer | Shopping journey |
| `/dashboard/user/lifecycle` | Customer | Product lifecycle |
| `/dashboard/user/notifications` | Customer | Notifications |
| `/dashboard/user/orders` | Customer | Order management |
| `/dashboard/user/profile` | Customer | Profile settings |
| `/dashboard/user/security` | Customer | Security settings |
| `/dashboard/seller` | Seller | Seller dashboard home |
| `/dashboard/seller/ai-tools` | Seller | AI product tools |
| `/dashboard/seller/analytics` | Seller | Sales analytics |
| `/dashboard/seller/command-center` | Seller | Command center |
| `/dashboard/seller/coupons` | Seller | Coupon management |
| `/dashboard/seller/customers` | Seller | Customer insights |
| `/dashboard/seller/forecast` | Seller | Sales forecast |
| `/dashboard/seller/goals` | Seller | Seller goals/KPIs |
| `/dashboard/seller/inventory` | Seller | Inventory management |
| `/dashboard/seller/notifications` | Seller | Seller notifications |
| `/dashboard/seller/orders` | Seller | Order management |
| `/dashboard/seller/product-performance` | Seller | Product performance |
| `/dashboard/seller/products` | Seller | Product management |
| `/dashboard/seller/products/add` | Seller | Add new product |
| `/dashboard/seller/profile` | Seller | Seller profile |
| `/dashboard/seller/risk-indicators` | Seller | Risk indicators |
| `/dashboard/seller/security` | Seller | Security center |
| `/dashboard/seller/store-health` | Seller | Store health score |
| `/dashboard/seller/store-settings` | Seller | Store settings |
| `/dashboard/seller/trust-score` | Seller | Trust score details |
| `/dashboard/admin` | Admin | Admin dashboard home |
| `/dashboard/admin/analytics` | Admin | Platform analytics |
| `/dashboard/admin/audit-logs` | Admin | Audit logs |
| `/dashboard/admin/categories` | Admin | Category management |
| `/dashboard/admin/coupons` | Admin | Coupon administration |
| `/dashboard/admin/hero-banners` | Admin | Banner management |
| `/dashboard/admin/incidents` | Admin | Security incidents |
| `/dashboard/admin/notifications` | Admin | Admin notifications |
| `/dashboard/admin/orders` | Admin | Order oversight |
| `/dashboard/admin/products` | Admin | Product moderation |
| `/dashboard/admin/profile` | Admin | Admin profile |
| `/dashboard/admin/reviews` | Admin | Review moderation |
| `/dashboard/admin/risk` | Admin | Risk assessment |
| `/dashboard/admin/security` | Admin | Security center |
| `/dashboard/admin/sellers` | Admin | Seller management |
| `/dashboard/admin/sellers/[id]` | Admin | Individual seller details |
| `/dashboard/admin/users` | Admin | User management |

---

## Authentication & Authorization

### Authentication System

ShopNest uses **Better Auth** (`better-auth` v1.7.1) with MongoDB adapter for authentication. The authentication system supports:

- **Email/Password** registration and login
- **Google OAuth** social login
- **Password reset** via email (using Nodemailer)
- **Session management** with server-side and client-side session hooks

### Authentication Flow

1. User registers or logs in via `/login` or `/register`
2. Better Auth creates a session stored in MongoDB
3. Client-side `useSession` hook provides real-time session state
4. Protected routes check session status before rendering
5. API calls include session cookies automatically

### Role-Based Access

The platform enforces three roles:

| Role | Identifier | Dashboard Path |
|------|-----------|----------------|
| Customer | `customer` / `user` | `/dashboard/user` |
| Seller | `seller` | `/dashboard/seller` |
| Administrator | `admin` | `/dashboard/admin` |

The backend enforces role-based access control. The frontend derives the active role from `session.user.role` and renders role-appropriate navigation, dashboards, and AI experiences.

### Authorization Guards

- Dashboard routes redirect unauthenticated users to `/login`
- Role-specific dashboard layouts render only after session confirmation
- The AI Commerce Copilot derives its role exclusively from the authenticated session, never from frontend props alone

---

## API Integration

### API Client Architecture

All API communication is centralized in `src/lib/api/`. Each module exports typed functions for specific resource domains:

| Module | Purpose |
|--------|---------|
| `products.ts` | Product CRUD, store/seller options, product search |
| `categories.ts` | Category management |
| `cart.ts` | Cart operations |
| `orders.ts` | Order management |
| `wishlist.ts` | Wishlist operations |
| `reviews.ts` | Review submission and retrieval |
| `coupons.ts` | Coupon operations |
| `sellers.ts` | Seller profile and applications |
| `stores.server.ts` | Store data fetching |
| `users.ts` | User profile operations |
| `payments.ts` | Payment processing |
| `support.ts` | Support tickets |
| `notifications.ts` | Notification management |
| `addresses.ts` | Address book management |
| `admin-intelligence.ts` | Admin analytics data |
| `admin-settings.ts` | Admin settings |
| `security-center.ts` | Security features |
| `security-intelligence.ts` | Security analytics |
| `customer-intelligence.ts` | Customer analytics |
| `customer-intelligence-features.ts` | Customer AI features |
| `customer-features.ts` | Customer feature endpoints |
| `seller-intelligence.ts` | Seller analytics |
| `hero-banners.ts` | Banner management |

### AI API Clients

| Module | Endpoint | Purpose |
|--------|----------|---------|
| `ai-commerce.ts` | `/ai/detect-intent` | Intent detection |
| `ai-commerce.ts` | `/ai/negotiate` | Deal negotiation |
| `ai-commerce.ts` | `/ai/memory` | Commerce memory |
| `ai-commerce.ts` | `/ai/compare` | AI product comparison |
| `ai-commerce.ts` | `/ai/visual-search` | Visual search |
| `ai-commerce.ts` | `/ai/review-summary` | Review summarization |
| `customer-copilot.ts` | `/ai/customer-copilot` | Customer AI assistant |
| `seller-copilot.ts` | `/ai/seller-copilot` | Seller AI assistant |
| `admin-copilot.ts` | `/ai/admin-copilot` | Admin AI assistant |

### API Configuration

The frontend uses Next.js rewrites to proxy API requests:

```typescript
// next.config.ts
{
  rewrites: [
    { source: "/api/v1/:path*", destination: "<backend-url>/api/v1/:path*" },
    { source: "/uploads/:path*", destination: "<backend-url>/uploads/:path*" },
  ];
}
```

The backend URL is configurable via `API_URL` or `NEXT_PUBLIC_API_URL` environment variables.

---

## State Management

ShopNest uses a lightweight state management approach:

- **React Context** for global state:
  - `CartDrawerContext` — manages shopping cart drawer visibility and state
  - `ConfirmDialogContext` — manages confirmation dialog state
- **Server State** via API calls with manual caching in components
- **Session State** via Better Auth's `useSession` hook
- **Local State** via React `useState` / `useReducer` for component-level state

There is no global state management library (Redux, Zustand, etc.) in use.

---

## UI/UX & Design System

### Design System

ShopNest uses a custom design system built on Tailwind CSS v4 with CSS custom properties:

- **Primary color:** Indigo (`#5b5cf0`)
- **Accent color:** Purple (`#8b5cf6`)
- **Success:** Emerald (`#10b981`)
- **Warning:** Amber (`#f59e0b`)
- **Error:** Rose (`#f43f5e`)
- **Font:** Inter (Google Fonts)
- **Border radius:** Consistent use of `rounded-xl`, `rounded-2xl`, `rounded-3xl`
- **Shadows:** Custom shadow utilities for depth

### Component Library

- **HeroUI** (`@heroui/react`) — provides accessible, themeable UI primitives
- **Lucide React** — consistent icon set for UI elements
- **React Icons** — additional icon coverage (Font Awesome, etc.)

### Animations

- **Framer Motion** — page transitions, list animations, drawer animations, micro-interactions
- **Motion** — newer animation primitives
- Custom CSS animations for marquee, spin, and scrollbar hiding

### Key UI Components

| Component | Purpose |
|-----------|---------|
| `AppShell` | Root layout wrapper with navbar, footer, mobile bottom nav |
| `Navbar` | Top navigation with search, user menu, cart trigger |
| `MobileBottomNav` | Mobile-specific bottom navigation |
| `Footer` | Site footer with links |
| `DashboardSidebarLayout` | Persistent sidebar + topbar for dashboard pages |
| `CartDrawer` | Slide-out cart panel |
| `ConfirmDialogProvider` | Global confirmation dialog |
| `AiAdvisorView` | AI Shopping Advisor chat interface |
| `AiCommerceCopilot` | Role-aware AI copilot chat interface |

---

## Responsive Design

ShopNest is built mobile-first with responsive breakpoints:

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, bottom navigation, stacked panels |
| Tablet | 640px - 1024px | Adaptive grids, expanded navigation |
| Desktop | > 1024px | Full sidebar navigation, multi-column layouts |

### Responsive Features

- **Mobile Bottom Navigation:** Fixed bottom nav for mobile users with icon + label tabs
- **Adaptive Dashboard Sidebar:** Collapsible sidebar on smaller screens
- **Fluid Product Grids:** Grid columns adjust based on viewport
- **Responsive AI Chat:** Chat interface adapts height and layout for mobile keyboards
- **Touch-friendly Targets:** Minimum touch target sizes for mobile interactions
- **Responsive Typography:** Font sizes scale appropriately across devices

---

## Dark Mode

ShopNest supports system-aware dark mode with manual toggle:

- **Theme Detection:** Checks `localStorage` for saved preference, then falls back to `prefers-color-scheme`
- **Theme Persistence:** User preference is saved to `localStorage`
- **CSS Variables:** All colors are defined as CSS custom properties, enabling instant theme switching
- **Component Compatibility:** All components use theme-aware color classes (`bg-background`, `text-text`, `border-border`, etc.)

**Implementation:** `src/components/layout/ThemeBootstrap.tsx`

---

## Installation

```bash
# Clone the repository
git clone https://github.com/Farhadmu/shopnest-frontend.git
cd shopnest-frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Backend API URL
API_URL=http://127.0.0.1:5000
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000

# Better Auth Configuration
BETTER_AUTH_SECRET=your_auth_secret_here
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email (Nodemailer)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=ShopNest <noreply@shopnest.com>

# MongoDB
MONGODB_URI=mongodb://localhost:27017/shopnest

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note:** Never commit `.env` files containing secrets. Use `.env.local` for local overrides.

---

## Development

### Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server with webpack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

### Development Conventions

- **File Structure:** Next.js App Router with route groups `(auth)`, `(customer)`, `(public)` for layout separation
- **Client Components:** Marked with `"use client"` directive
- **Server Components:** Default for pages without client interactivity
- **API Calls:** Centralized in `src/lib/api/` with typed responses
- **Components:** Organized by feature domain under `src/components/`
- **Types:** Shared TypeScript interfaces in `src/types/` and module-specific types alongside API clients
- **Icons:** Prefer `lucide-react` for new components; `react-icons` used in existing components

---

## Build & Deployment

### Build Process

```bash
npm run build
```

The build process:

1. Compiles TypeScript
2. Runs ESLint checks
3. Optimizes assets with Next.js
4. Generates static pages where possible
5. Creates server-side rendered pages for dynamic content

### Deployment

The application is configured for deployment on Vercel or similar Next.js-compatible platforms:

- **Vercel:** Connect the GitHub repository; set environment variables in Vercel dashboard
- **Self-hosted:** Run `npm run build` followed by `npm run start`

### Configuration

- **Next.js Config:** `next.config.ts` — API rewrites, image optimization
- **TypeScript Config:** `tsconfig.json` — strict mode enabled
- **ESLint Config:** `.eslintrc.json` — Next.js recommended rules
- **Tailwind Config:** Configured via `globals.css` with custom theme variables

---

## Testing

### Current Test Coverage

The frontend test suite is minimal. Backend tests are located in the [backend repository](https://github.com/Farhadmu/shopnest-backend).

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Role-based dashboard redirect
- [ ] Product listing and search
- [ ] Cart operations (add, remove, update quantity)
- [ ] Checkout flow
- [ ] Order placement and tracking
- [ ] Wishlist management
- [ ] Review submission
- [ ] Seller onboarding
- [ ] Seller product management
- [ ] AI Advisor responses
- [ ] AI Copilot responses (all roles)
- [ ] Dark mode toggle
- [ ] Responsive layout at 320px, 768px, 1024px, 1440px

---

## Security

### Frontend Security Measures

- **Authentication:** Better Auth handles session management, password hashing, and CSRF protection
- **Authorization:** Role-based route guards and dashboard access controls
- **API Security:** API routes proxy through Next.js rewrites; backend enforces ownership validation
- **XSS Prevention:** React's built-in JSX escaping, Content Security Policy compatible
- **Secrets Management:** Environment variables for all sensitive configuration; `.env` files are gitignored
- **Input Validation:** Zod schemas for form validation; backend performs additional validation

### Known Security Considerations

- The frontend trusts the backend for all authorization decisions
- Session cookies are used for authentication; ensure HTTPS in production
- Email credentials require app-specific passwords for Gmail

---

## Performance

### Optimization Strategies

- **Next.js App Router:** Enables React Server Components for reduced client bundle size
- **Image Optimization:** Next.js `Image` component with remote patterns for product images
- **Code Splitting:** Automatic route-based code splitting
- **Lazy Loading:** Dashboard components and heavy UI elements are lazy-loaded
- **CSS Variables:** Instant theme switching without re-renders
- **Debounced Search:** Search inputs use debouncing to reduce API calls
- **Responsive Images:** Product images use optimized loading with quality settings

### Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 2.5s |
| Largest Contentful Paint | < 3.0s |
| Cumulative Layout Shift | < 0.1 |
| First Input Delay | < 100ms |

---

## Accessibility

ShopNest aims for WCAG 2.1 AA compliance:

- **Semantic HTML:** Proper heading hierarchy and landmark elements
- **Keyboard Navigation:** All interactive elements are keyboard accessible
- **Focus Management:** Visible focus indicators on all interactive elements
- **Color Contrast:** Text meets WCAG AA contrast ratios in both light and dark modes
- **Screen Reader Support:** ARIA labels on icon-only buttons
- **Form Labels:** All form inputs have associated labels
- **Error Messages:** Accessible error announcements

---

## Git Workflow

### Branching Strategy

- `main` — production-ready code
- `development` — integration branch for features
- `feature/*` — individual feature branches

### Commit Convention

Commits follow a structured format:

```
[TYPE]: Short description

- Optional bullet points
- References to issues/PRs
```

**Types:** `ADDED`, `UPDATED`, `FIXED`, `SECURITY`, `DOCS`, `REFACTOR`, `TESTED`, `PERFORMANCE`

### Pull Request Process

1. Create a feature branch from `development`
2. Implement changes with clear, atomic commits
3. Ensure `npm run build` and `npm run lint` pass
4. Push branch and open PR targeting `development`
5. After review and CI, merge to `development`
6. Periodically merge `development` → `main` for releases

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|--------|----------|
| `dns.setServers` error | This is intentional DNS configuration for MongoDB connection reliability |
| `better-auth` session not persisting | Check `BETTER_AUTH_SECRET` is set and consistent |
| Images not loading | Verify `NEXT_PUBLIC_API_URL` and backend `/uploads` route |
| Dark mode not applying | Check `ThemeBootstrap` is rendered in root layout |
| Mobile layout broken | Ensure viewport meta tag is present in `layout.tsx` |
| ESLint errors in `globals.css` | Tailwind v4 uses CSS-based configuration; some ESLint rules may need adjustment |

### Debug Mode

Enable debug logging:

```env
NEXT_PUBLIC_DEBUG=true
```

---

## Future Improvements

The following improvements are identified but not yet implemented in the current codebase:

- [ ] Comprehensive frontend test suite (unit, integration, E2E)
- [ ] Internationalization (i18n) support beyond English
- [ ] Advanced product filtering with saved filter presets
- [ ] Real-time order tracking with map integration
- [ ] Push notifications for order updates
- [ ] Progressive Web App (PWA) capabilities
- [ ] Advanced analytics charts for seller/admin dashboards
- [ ] Product recommendation carousels with A/B testing
- [ ] Seller mobile app companion
- [ ] Advanced search with autocomplete and suggestions
- [ ] Multi-currency and multi-language support
- [ ] Advanced coupon targeting and personalization
- [ ] Social sharing and referral program UI
- [ ] Live chat between buyers and sellers
- [ ] AR product preview integration

---

## License

[Add your license here]

---

## Contact

For questions or support regarding the ShopNest frontend:

- **Repository:** https://github.com/Farhadmu/shopnest-frontend
- **Backend:** https://github.com/Farhadmu/shopnest-backend

---

*Last updated: 2026-09-15*
