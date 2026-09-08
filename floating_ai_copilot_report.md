# 🤖 ShopNest Floating AI Copilot — Deep Dive Technical Report

> **Stack**: Next.js 16.3 · React 19 · TypeScript · Framer Motion · Lucide React  
> **Author perspective**: As if you're reading this fresh, with zero prior context.

---

## 1. The 10,000-Foot View — What Is This Thing?

The **Floating AI Copilot** is a **single React component** (`AiCommerceCopilot`) that renders as a persistent, floating widget on specific pages. It is **not a page** — it's an overlay that sits on top of everything else using CSS `position: fixed`.

It comes in **three modes** based on a `role` prop, each completely changing its personality, APIs it calls, and UI it renders:

| `role` | Identity | Who Sees It |
|---|---|---|
| `"customer"` | ShopNest **Shopping Copilot** | Customers on `/dashboard/user/*` and product pages |
| `"seller"` | **Business Intelligence Copilot** | Sellers on `/dashboard/seller` |
| `"admin"` | **Marketplace Intelligence Copilot** | Admins on `/dashboard/admin` |

It's the same ~684-line file doing three different jobs. That's worth keeping in mind.

---

## 2. File Map — Where Everything Lives

```
src/
├── components/
│   └── ai/
│       ├── AiCommerceCopilot.tsx        ← THE floating widget (all roles)
│       ├── PersonalCommerceAssistant.tsx ← Older, simpler customer-only assistant
│       └── AiAdvisorView.tsx            ← Full-page AI advisor (separate)
│
├── lib/
│   ├── core/
│   │   └── client.ts                   ← Generic HTTP fetch wrapper (clientFetch, clientMutation)
│   └── api/
│       ├── ai-commerce.ts              ← API calls for customer + seller copilot
│       └── admin-copilot.ts            ← API calls for admin copilot (richer types)
│
└── app/
    ├── (public)/products/[id]/page.tsx  ← Mounts <AiCommerceCopilot role="customer" />
    ├── dashboard/
    │   ├── user/layout.tsx              ← Mounts <AiCommerceCopilot role="customer" /> ONCE for all /user/* routes
    │   ├── seller/page.tsx              ← Mounts <AiCommerceCopilot role="seller" />
    │   └── admin/page.tsx               ← Mounts <AiCommerceCopilot role="admin" />
```

---

## 3. Mounting Strategy — Where & How It Gets Added to Pages

This is the first thing to understand. The copilot is **not part of any global layout** — it is mounted **on specific pages/layouts** only.

### Customer Dashboard (All Sub-pages at Once)

```tsx
// src/app/dashboard/user/layout.tsx
export default function UserDashboardLayout({ children }) {
  const { isPending, isAuthorized } = useDashboardGuard("user");
  if (isPending || !isAuthorized) return <LoadingState />;

  return (
    <>
      {children}
      <AiCommerceCopilot role="customer" />  {/* ← mounted once for ALL /dashboard/user/* routes */}
    </>
  );
}
```

**Why this is smart**: Instead of copy-pasting `<AiCommerceCopilot />` into every single customer page (orders, wishlist, settings, etc.), it's placed in the **layout** — Next.js's mechanism for wrapping a folder's pages with shared UI. It renders once, persists across route changes within `/dashboard/user/`, and doesn't re-mount or reset its chat history when the user navigates between pages.

### Product Detail Page (Public)

```tsx
// src/app/(public)/products/[id]/page.tsx
return (
  <>
    {/* ...product page content... */}
    <AiCommerceCopilot role="customer" />  {/* floats on every product page */}
  </>
);
```

### Admin & Seller Pages

Placed directly at the bottom of the JSX return in their respective page files — since those are single pages, no shared layout trick is needed.

---

## 4. Component Architecture — Inside `AiCommerceCopilot.tsx`

The file has **two distinct zones**: small pure subcomponents at the top, and the big main `AiCommerceCopilot` function.

### 4.1 Pure Display Subcomponents (Admin-only UI)

These are only shown when `role === "admin"` and the API returns structured data.

#### `MetricCard` (lines 81–104)
Displays a single KPI tile. Receives a `CopilotMetric` object:
```ts
interface CopilotMetric {
  label: string;        // e.g. "Total GMV"
  value: number;        // raw number
  formatted: string;    // e.g. "৳2.4M"
  changePercent?: number; // e.g. 12.5 (displayed as +12.5%)
  trend?: "up" | "down" | "neutral"; // controls icon + color
}
```
Shows a green `TrendingUp` icon if `trend === "up"`, red `TrendingDown` if down, gray dash if neutral.

#### `InsightCard` (lines 107–140)
Shows an AI-generated observation with severity color-coding:
```
critical → Red   XCircle icon
high     → Orange AlertTriangle
medium   → Yellow AlertCircle
low      → Green  CheckCircle
info     → Blue   Info
```
Also renders `evidence[]` pairs — fact/value key-value rows showing why the insight was flagged.

#### `SourceBadge` (lines 143–160)
Tiny pill badge showing WHERE the data came from. Types: `database`, `analytics`, `security`, `telemetry`, `forecast`. Each has its own Lucide icon.

#### `ExecutiveBriefing` (lines 163–207)
A composed "dashboard card" combining:
1. A health banner with a pulsing green dot
2. A horizontal scrollable row of `MetricCard`s (up to 6)
3. A filtered list of only `critical` or `high` severity `InsightCard`s (up to 3)
4. A footer row of `SourceBadge`s

This entire component is only shown for responses with `intent === "EXECUTIVE_SUMMARY"` or `"MARKETPLACE_OVERVIEW"`.

---

### 4.2 Main Component State

```ts
const [isOpen, setIsOpen] = useState(false);         // drawer open/closed
const [isMinimized, setIsMinimized] = useState(false); // header-only mode
const [query, setQuery] = useState("");               // current input value
const [loading, setLoading] = useState(false);        // request in-flight
const [messages, setMessages] = useState<Message[]>([]); // conversation history
const [showBriefing, setShowBriefing] = useState(true); // show executive briefing style
```

The `Message` type:
```ts
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;         // always the text answer
  data?: CopilotResponse;  // structured data from admin API (metrics, insights, etc.)
  isLoading?: boolean;     // true while waiting for response — shows spinner bubble
  error?: string;          // if the API call failed
  timestamp: Date;
}
```

---

### 4.3 The Message Lifecycle — What Happens When You Hit Send

This is the core loop. Here it is step by step:

```
User types query → presses Enter or clicks Send
         ↓
handleSend(prompt) runs
         ↓
1. Append userMessage to messages[]
2. Append loadingMessage (isLoading: true) to messages[] → shows spinner bubble
3. setLoading(true), clear input
         ↓
4. API BRANCH:
   if role === "admin"  → askAdminCopilot(prompt)  → POST /ai/admin-copilot
   else                 → askCommerceCopilot(prompt, role) → POST /ai/copilot
         ↓
5a. On SUCCESS:
    - Admin: use response as-is (full CopilotResponse with metrics/insights)
    - Customer/Seller: normalize BasicCopilotResponse into CopilotResponse shape
      (empty metrics[], insights[], sources[] — just answer + suggestedActions)
    - Replace loadingMessage with assistantMessage
         ↓
5b. On ERROR:
    - Replace loadingMessage with errorMessage (shows red error badge)
         ↓
6. setLoading(false)
7. Auto-scroll fires via useEffect watching messages[]
```

**The normalization step (step 5) is critical to understand**:

```ts
// Customer/seller response is SIMPLE — just text + action chips
const basicRes = await askCommerceCopilot(prompt.trim(), role);

// But the Message type expects admin-style CopilotResponse
// So we manually shape it into the same structure with empty arrays
response = {
  answer: basicRes.answer,
  summary: basicRes.answer.substring(0, 100),
  intent: "GENERAL",
  confidence: 0.8,
  timeRange: { field: "created_at", from: "", to: "", label: "all time" },
  metrics: [],       // ← empty — MetricCard won't render
  insights: [],      // ← empty — InsightCard won't render
  sources: [],       // ← empty — SourceBadge won't render
  suggestedActions: basicRes.suggestedActions || [],
  isFallback: false,
};
```

The rendering logic then gates admin-only UI behind `role === "admin"`, so customers just see the text bubble and action chips.

---

### 4.4 The Render Function — `renderMessage(m)`

Every message in `messages[]` goes through this function. Here's the decision tree:

```
renderMessage(m)
  ├── isUser?
  │     → right-aligned blue bubble + User avatar (right side)
  │     → no extra data rendering
  │
  └── isAssistant?
        ├── m.isLoading === true
        │     → Spinner + "Analyzing marketplace data..."
        │
        └── m.isLoading === false
              ├── Text bubble (bg-muted-bg, left-aligned)
              │
              ├── m.error?  → Red error badge below bubble
              │
              ├── m.data && role === "admin"?
              │     ├── intent is EXECUTIVE_SUMMARY/MARKETPLACE_OVERVIEW && showBriefing?
              │     │     → <ExecutiveBriefing data={m.data} />
              │     │
              │     └── else
              │           ├── MetricCard row (horizontal scroll, up to 6)
              │           ├── InsightCard list (up to 4)
              │           ├── SourceBadge row
              │           ├── Suggested action links (→ targetUrl)
              │           ├── Confidence + time range metadata line
              │           └── Follow-up suggestion chips (from FOLLOW_UP_SUGGESTIONS map)
              │
              └── m.data?.suggestedActions && role !== "admin"?
                    → Quick action chips (trigger "Tell me more about X" queries)
```

---

### 4.5 Quick Actions & Follow-Ups — The Static Maps

Two static lookup objects control contextual suggestions:

**`quickPrompts`** — shown when `messages.length <= 2` (only welcome message exists):
```ts
customer: [
  { label: "Build gaming setup", query: "Build a complete gaming setup under ৳50,000" },
  { label: "Check compatibility", query: "Check compatibility between Laptop and DDR5 RAM" },
  { label: "Find coupons", query: "Find best available coupons for my cart" },
]
seller: [
  { label: "Sales forecast", ... },
  { label: "Campaign sim", ... },
  { label: "Store health", ... },
]
admin: ADMIN_QUICK_ACTIONS  // 8 items — briefing, revenue, seller risk, etc.
```

**`FOLLOW_UP_SUGGESTIONS`** — shown after an admin response based on the `intent` field returned by the API:
```ts
{
  REVENUE_ANALYSIS: ["Which sellers caused the change?", "Which category was affected most?", ...],
  SELLER_RISK: ["Which risky sellers cause revenue leakage?", ...],
  ANOMALY_ANALYSIS: ["Why was this flagged?", ...],
  // ...8 intent keys total
}
```

These chips call `handleSend(suggestion)` directly when clicked — they are pre-filled queries, not navigation links.

---

### 4.6 UI Shell — The Two Visual States

#### State 1: Floating Launch Button (not open)
```tsx
<button
  className="fixed bottom-6 right-6 z-40
             bg-gradient-to-r from-primary via-indigo-600 to-accent
             rounded-full px-5 py-3.5 shadow-2xl"
  onClick={() => { setIsOpen(true); setIsMinimized(false); }}
>
  ✨ AI CUSTOMER COPILOT
</button>
```
Always visible at bottom-right. `z-40` keeps it above page content but below the open drawer (`z-50`).

#### State 2: The Open Drawer
```tsx
{/* Full-screen semi-transparent backdrop */}
<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center sm:justify-end p-4 sm:p-6">

  {/* The actual panel — animated with framer-motion */}
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    className="w-full max-w-2xl rounded-3xl border bg-surface h-[90vh] max-h-[700px] flex flex-col"
  >
    {/* Header: title + minimize + clear + close */}
    {/* Chat body: scrollable message list */}
    {/* Quick prompts bar (only when messages.length <= 2) */}
    {/* Input form */}
  </motion.div>

</div>
```

**Responsive behavior**: On mobile it anchors to the bottom of the screen (`items-end`). On `sm:` and above, it floats in the center-right (`items-center sm:justify-end`).

**Minimize**: `isMinimized` hides everything below the header — so the drawer collapses to just a title bar without closing entirely.

---

## 5. The API Layer — How Data Gets In and Out

### 5.1 The Foundation: `src/lib/core/client.ts`

Every API call in the entire app funnels through two functions:

**`clientFetch<T>(endpoint, options?)`** — for GET requests  
**`clientMutation<T>(endpoint, method, body?, options?)`** — for POST/PUT/PATCH/DELETE

They both:
1. Build the full URL. In the browser → `"/api/v1" + endpoint`. This is a **Next.js reverse proxy route** that forwards to your actual backend (Express/NestJS/Fastify) while preserving the session cookie.
2. Attach `credentials: "include"` — this sends the `better-auth` HttpOnly session cookie automatically.
3. Set `Content-Type: application/json`.
4. Call `handleResponse<T>()` which throws a typed `ApiError` on non-2xx, handles 204 No Content, and parses JSON.

> **Why the proxy?** Better Auth stores auth in an HttpOnly cookie scoped to the Next.js domain. If the browser called the backend directly (different origin/port), the cookie wouldn't be sent. Next.js proxying `/api/v1/*` to the real backend makes the cookie travel seamlessly.

### 5.2 Customer/Seller: `src/lib/api/ai-commerce.ts`

```ts
// The simple copilot endpoint
export async function askCommerceCopilot(
  query: string,
  role: string,
  context?: Record<string, unknown>
) {
  return clientMutation<CopilotResponse>("/ai/copilot", "POST", { query, role, context });
}
```

**Request body sent to backend**:
```json
{
  "query": "Build me a gaming setup under ৳50,000",
  "role": "customer",
  "context": {}  // optional — currently unused in the copilot widget
}
```

**Response shape** (`BasicCopilotResponse`):
```ts
interface CopilotResponse {
  role: string;
  query: string;
  answer: string;                           // the text response
  suggestedActions: Array<{
    label: string;
    action: string;
    targetUrl?: string;
  }>;
  mode: string;                             // e.g. "conversational"
}
```

This file also exposes other AI endpoints that the widget **currently does not use** but could:
```
detectShoppingIntent()  → POST /ai/detect-intent
negotiateDeal()         → POST /ai/negotiate
getCommerceMemory()     → GET  /ai/memory
clearCommerceMemory()   → DELETE /ai/memory
compareProductsAI()     → POST /ai/compare
visualSearchAI()        → POST /ai/visual-search
getReviewSummaryAI()    → POST /ai/review-summary
```

### 5.3 Admin: `src/lib/api/admin-copilot.ts`

```ts
export async function askAdminCopilot(query: string): Promise<CopilotResponse> {
  return clientMutation<CopilotResponse>("/ai/admin-copilot", "POST", { query });
}
```

**Request**: Just `{ query: string }`. No role needed — the backend infers "admin" from the auth session.

**Response shape** (richer than customer):
```ts
interface CopilotResponse {
  answer: string;          // natural language summary
  summary: string;         // short version
  intent: string;          // e.g. "REVENUE_ANALYSIS", "SELLER_RISK"
  confidence: number;      // 0.0–1.0
  timeRange: {             // what time period was analyzed
    field: string;
    from: string;
    to: string;
    label: string;         // e.g. "last 30 days"
  };
  metrics: CopilotMetric[];      // KPI tiles
  insights: CopilotInsight[];    // color-coded observations with evidence
  sources: CopilotSource[];      // which data systems were queried
  suggestedActions: CopilotAction[]; // actionable links
  isFallback: boolean;           // true if AI couldn't get live data
}
```

The `intent` field is what drives follow-up suggestions. The backend classifies the query into one of ~8 intents, and the frontend looks that up in `FOLLOW_UP_SUGGESTIONS` to show contextual next-step chips.

---

## 6. The Network Path — Full Request Journey

```
User types in copilot input
        ↓
handleSend() called in AiCommerceCopilot.tsx
        ↓
askAdminCopilot("revenue trends") called
        ↓
clientMutation("/ai/admin-copilot", "POST", { query })
        ↓
fetch("http://localhost:3000/api/v1/ai/admin-copilot", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query }),
  credentials: "include"   ← session cookie sent here
})
        ↓
Next.js route proxy intercepts /api/v1/*
        ↓
Forwarded to backend (Express/NestJS) with original cookies
        ↓
Backend: validates session → runs AI query → returns JSON
        ↓
handleResponse<T>() parses the JSON
        ↓
Response lands in AiCommerceCopilot as CopilotResponse
        ↓
Message state updated → UI re-renders with metrics, insights, chips
```

---

## 7. Static Data — What's Hardcoded vs. Dynamic

| Data | Source |
|---|---|
| Welcome messages | **Hardcoded** in `useEffect` — role-based strings |
| Quick prompt labels/queries | **Hardcoded** in `quickPrompts` object |
| Follow-up suggestion texts | **Hardcoded** in `FOLLOW_UP_SUGGESTIONS` map |
| Admin quick action labels | **Hardcoded** in `ADMIN_QUICK_ACTIONS` array |
| Metric values, trend direction | **Dynamic** — from admin API response |
| Insights and severity | **Dynamic** — classified by backend AI |
| Suggested actions + URLs | **Dynamic** — from API response |
| Confidence score, intent, time range | **Dynamic** — from admin API response |

---

## 8. The `compact` Mode — An Alternate Render Mode

The component accepts a `compact?: boolean` prop. When `true`:

- The floating launcher button **does not render**
- The drawer is rendered **inline** (no fixed positioning, no backdrop)
- The drawer uses a simple card style: `rounded-2xl border border-border bg-surface p-4`
- Minimize/Clear/Close buttons are hidden
- The height collapses to fit content

This mode is designed to embed the copilot directly **inside another page or panel** rather than as a floating overlay. It is not currently used anywhere in the codebase but is available for future use (e.g., embedding into an AI-dedicated dashboard tab).

---

## 9. Framer Motion — The Animation Layer

```ts
import { motion, AnimatePresence } from "framer-motion";
```

Two animation spots:

**1. The Drawer Panel entering/exiting**:
```tsx
<motion.div
  initial={{ opacity: 0, y: 20, scale: 0.95 }}   // starts: invisible, 20px below, slightly small
  animate={{ opacity: 1, y: 0, scale: 1 }}         // ends: visible, in position, full size
  exit={{ opacity: 0, y: 20, scale: 0.95 }}         // exit: reverse
>
```

**2. Each message bubble**:
```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}   // fades in from 8px below
  animate={{ opacity: 1, y: 0 }}
>
```
Wrapped in `<AnimatePresence mode="popLayout">` which lets messages animate in as they arrive.

---

## 10. The `PersonalCommerceAssistant.tsx` — The Simpler Sibling

This is an older, more basic customer assistant. Key differences from `AiCommerceCopilot`:

| Feature | `AiCommerceCopilot` | `PersonalCommerceAssistant` |
|---|---|---|
| Roles | 3 (customer, seller, admin) | 1 (customer only) |
| Admin structured data | ✅ MetricCards, InsightCards, Sources | ❌ |
| Framer Motion | ✅ | ❌ |
| API | `/ai/copilot` or `/ai/admin-copilot` | `/ai/customer/assistant` |
| Minimize button | ✅ | ❌ |
| Quick prompts | Dynamic per role | Static: 4 hardcoded strings |
| Follow-up suggestions | ✅ intent-based | ❌ |
| Icon library | Lucide | react-icons (FiCpu, FiSend) |

It's currently **not mounted anywhere in the app** — it exists in the file system but has no import in any active page or layout. It may be a leftover from an earlier iteration.

---

## 11. Known Limitations & Obvious Improvement Areas

> [!NOTE]
> These are not bugs — they are current design constraints worth knowing.

1. **No streaming** — the entire API response arrives at once. The user sees a spinner for the full duration, then the complete response appears. A streaming/typewriter effect would feel much more alive.

2. **No conversation context sent to backend** — `askCommerceCopilot` accepts a `context` param, but the copilot widget always passes nothing. Each message is stateless from the backend's perspective. Multi-turn memory would require sending message history.

3. **No live product/cart context injected** — when a customer is on a product page and opens the copilot, their currently-viewed product ID is not passed. The `context` param in `askCommerceCopilot` is the right place to send it.

4. **`PersonalCommerceAssistant` is orphaned** — the component exists but is mounted nowhere. Either wire it up or remove it.

5. **`showBriefing` state is somewhat confusing** — it starts `true`, gets set to `false` on any user send (`setShowBriefing(false)`), and never resets to `true`. This means `ExecutiveBriefing` only ever shows on the very first admin response before the user sends a follow-up.

6. **Admin quick actions don't pre-fill the input** — they call `handleSend(p.query)` directly, bypassing the input field entirely. The user never sees what was sent. Minor UX friction.

7. **`compact` mode has no live users** — implemented but not mounted anywhere.

---

## 12. Component Relationship Diagram

```mermaid
graph TD
    A["UserDashboardLayout<br/>/dashboard/user/layout.tsx"] -->|mounts once for all user pages| B["AiCommerceCopilot<br/>role='customer'"]
    C["SellerPage<br/>/dashboard/seller/page.tsx"] -->|mounts| D["AiCommerceCopilot<br/>role='seller'"]
    E["AdminPage<br/>/dashboard/admin/page.tsx"] -->|mounts| F["AiCommerceCopilot<br/>role='admin'"]
    G["ProductDetailPage<br/>/products/:id/page.tsx"] -->|mounts| H["AiCommerceCopilot<br/>role='customer'"]

    B & D & H -->|POST /ai/copilot| I["ai-commerce.ts<br/>askCommerceCopilot()"]
    F -->|POST /ai/admin-copilot| J["admin-copilot.ts<br/>askAdminCopilot()"]

    I & J -->|clientMutation()| K["core/client.ts<br/>fetch wrapper"]
    K -->|/api/v1/* proxy| L["Next.js Route Proxy"]
    L -->|forwarded with cookie| M["Backend AI Service"]

    F -->|admin response| N["MetricCard"]
    F -->|admin response| O["InsightCard"]
    F -->|admin response| P["SourceBadge"]
    F -->|EXECUTIVE_SUMMARY intent| Q["ExecutiveBriefing"]
```

---

## 13. Quick Reference — File → Responsibility

| File | What It Owns |
|---|---|
| [`AiCommerceCopilot.tsx`](file:///c:/Users/User/Projects/E-commerce/ShopNest/frontend_b/src/components/ai/AiCommerceCopilot.tsx) | All UI, all state, message loop, render logic |
| [`admin-copilot.ts`](file:///c:/Users/User/Projects/E-commerce/ShopNest/frontend_b/src/lib/api/admin-copilot.ts) | TypeScript interfaces for rich admin response + `askAdminCopilot()` |
| [`ai-commerce.ts`](file:///c:/Users/User/Projects/E-commerce/ShopNest/frontend_b/src/lib/api/ai-commerce.ts) | `askCommerceCopilot()` + all other AI endpoints (compare, negotiate, visual search, etc.) |
| [`core/client.ts`](file:///c:/Users/User/Projects/E-commerce/ShopNest/frontend_b/src/lib/core/client.ts) | HTTP fetch abstraction, URL building, cookie handling, error throwing |
| [`dashboard/user/layout.tsx`](file:///c:/Users/User/Projects/E-commerce/ShopNest/frontend_b/src/app/dashboard/user/layout.tsx) | Mounts copilot once for all customer dashboard routes |
