# ShopNest Floating AI Widget Suite — Responsive Layout Architecture

## 1. Executive Summary
This document outlines the layout coordination, clearance math, and collision avoidance architecture for floating action buttons (FABs) and interactive widgets on public routes in ShopNest.

## 2. Participating Widgets

| Widget | Component | Role / Purpose | Route Context |
|---|---|---|---|
| **Compare Vendors** | `AiAssistantFab.tsx` | Instant vendor comparison matrix | Exclusively `/products` |
| **AI Visual Search** | `AiVisualSearchWidget.tsx` | Camera & lens catalog search | `/` & `/products*` |
| **ShopNest Advisor** | `AiCommerceCopilot.tsx` | Conversational shopping assistant | All public routes (guest mode) |

## 3. Clearance Math & Stacking Order

### Desktop Breakpoint (`sm:` and above)

#### State A: Products Listing Page (`/products`)
```
┌────────────────────────────────────────────────────────┐
│ Top (Slot 3): ShopNest AI Advisor                      │
│ - Position: sm:bottom-[9.5rem] (152px)                 │
│ - Height: ~40px                                        │
├────────────────── Gap: 16px ───────────────────────────┤
│ Middle (Slot 2): AI Visual Search                      │
│ - Position: sm:bottom-[5.5rem] (88px)                  │
│ - Height: ~48px                                        │
├────────────────── Gap: 12px ───────────────────────────┤
│ Bottom (Slot 1): Smart Assistant: Compare Vendors      │
│ - Position: sm:bottom-6 (24px)                         │
│ - Height: ~52px                                        │
└────────────────────────────────────────────────────────┘
```

#### State B: Default Public Routes (Home `/`, `/cart`, etc.)
```
┌────────────────────────────────────────────────────────┐
│ Top (Slot 2): ShopNest AI Advisor                      │
│ - Position: sm:bottom-[5.5rem] (88px)                  │
│ - Height: ~40px                                        │
├────────────────── Gap: 16px ───────────────────────────┤
│ Bottom (Slot 1): AI Visual Search                      │
│ - Position: sm:bottom-6 (24px)                         │
│ - Height: ~48px                                        │
└────────────────────────────────────────────────────────┘
```

### Mobile Breakpoint (`< sm`)
- `MobileBottomNav` occupies fixed `bottom-0` with height `64px` (`h-16`).
- `AiAssistantFab` is hidden (`hidden sm:block`).
- `AiVisualSearchWidget` floats at `bottom-20 right-4` (80px), providing 16px clearance over `MobileBottomNav`.
- `AiCommerceCopilot` floats at `bottom-36 right-4` (144px), providing 20px clearance over Visual Search.
- On mobile, both widgets render as compact circular icon buttons to minimize screen footprint.

## 4. Design & Polish Updates
- **Pro AI Badge Removal:** The redundant "PRO AI" badge was stripped from `ShopNest AI Advisor` to eliminate visual noise and horizontal bulk.
- **Compact Padding:** Advisor button horizontal padding reduced from `sm:px-5` (20px) to `sm:px-3.5` (14px) and inner gap tightened to `sm:gap-2.5`.
- **Motion Transitions:** All containers feature `transition-all duration-300` for fluid position interpolation during client-side route navigation.
