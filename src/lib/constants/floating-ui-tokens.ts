/**
 * Floating UI Layout Tokens & Collision Clearance Specifications
 *
 * Coordinates vertical stacking and safe-area margins for all floating widgets:
 * 1. AiAssistantFab (Compare Vendors) - lowest desktop slot
 * 2. AiVisualSearchWidget (AI Visual Lens) - middle slot on /products, lowest on other routes
 * 3. AiCommerceCopilot (ShopNest AI Advisor) - top slot on /products, middle on other routes
 */

export interface FloatingWidgetPosition {
  mobile: string;
  desktop: string;
  combined: string;
}

export const FLOATING_UI_OFFSETS = {
  // Products Listing Route (/products, /products/[id])
  PRODUCTS_PAGE: {
    FAB_COMPARE: {
      mobile: "hidden",
      desktop: "sm:bottom-6 sm:right-6",
      combined: "bottom-6 right-4 sm:right-6 hidden sm:block",
    },
    VISUAL_SEARCH: {
      mobile: "bottom-20 right-4",
      desktop: "sm:bottom-[5.5rem] sm:right-6",
      combined: "bottom-20 right-4 sm:bottom-[5.5rem] sm:right-6",
    },
    AI_ADVISOR: {
      mobile: "bottom-36 right-4",
      desktop: "sm:bottom-[9.5rem] sm:right-6",
      combined: "bottom-36 right-4 sm:bottom-[9.5rem] sm:right-6",
    },
  },

  // Standard Public Routes (Home '/', /cart, /categories, /about, etc.)
  DEFAULT_PUBLIC: {
    VISUAL_SEARCH: {
      mobile: "bottom-20 right-4",
      desktop: "sm:bottom-6 sm:right-6",
      combined: "bottom-20 right-4 sm:bottom-6 sm:right-6",
    },
    AI_ADVISOR: {
      mobile: "bottom-36 right-4",
      desktop: "sm:bottom-[5.5rem] sm:right-6",
      combined: "bottom-36 right-4 sm:bottom-[5.5rem] sm:right-6",
    },
  },
} as const;

/**
 * Returns dynamic positionClass for AiCommerceCopilot based on pathname
 */
export function getAdvisorPositionClass(pathname: string): string {
  const isProductsPage = pathname.startsWith("/products") || pathname.startsWith("/product");
  return isProductsPage
    ? FLOATING_UI_OFFSETS.PRODUCTS_PAGE.AI_ADVISOR.combined
    : FLOATING_UI_OFFSETS.DEFAULT_PUBLIC.AI_ADVISOR.combined;
}

/**
 * Returns dynamic positionClass for AiVisualSearchWidget based on pathname
 */
export function getVisualSearchPositionClass(pathname: string): string {
  const isProductsPage = pathname.startsWith("/products") || pathname.startsWith("/product");
  return isProductsPage
    ? FLOATING_UI_OFFSETS.PRODUCTS_PAGE.VISUAL_SEARCH.combined
    : FLOATING_UI_OFFSETS.DEFAULT_PUBLIC.VISUAL_SEARCH.combined;
}
