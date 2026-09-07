/**
 * Utility helper functions shared across the application.
 */

/**
 * Format currency values cleanly.
 */
export function formatCurrency(amount: number, currency: string = "BDT"): string {
  return `৳${amount.toLocaleString()}`;
}

/**
 * Merge class names conditionally.
 */
export function cn(...classes: Array<string | boolean | undefined | null>): string {
  return classes.filter(Boolean).join(" ");
}