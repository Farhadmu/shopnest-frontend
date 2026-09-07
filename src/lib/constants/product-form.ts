/**
 * Constants for the seller Add/Edit Product form.
 */

export const SWATCH_PALETTE = ["#0f172a", "#e5e7eb", "#1e3a8a", "#b91c1c", "#166534", "#78350f"];

let uidCounter = 0;
export const uid = () => `row_${Date.now()}_${uidCounter++}`;

// Reserved specification keys that get their own dedicated form fields
// instead of showing up as freeform rows in the tech-spec table.
export const RESERVED_SPEC_KEYS = [
  "Brand",
  "Model",
  "Master SKU",
  "Barcode",
  "Warranty",
  "Escrow Guarantee",
  "Cash on Delivery",
  "Express Dispatch",
  "Variants",
  "Package Contents",
];

export const WARRANTY_OPTIONS = [
  "1 Year Official Brand Warranty",
  "6 Months Seller Replacement",
  "No Warranty / As Is",
];

export const ESCROW_OPTIONS = [
  "7 Days Return & Full Refund Escrow",
  "14 Days Extended Replacement",
  "30 Days Premium Tech Protection",
];

export const DEFAULT_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Beauty",
  "Sports",
  "Books",
  "Gadgets",
];