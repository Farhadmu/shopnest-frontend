import { ProductDetailSkeleton } from "@/components/products/detail/ProductDetailSkeleton";

/**
 * Route-level loading skeleton for /products/[id].
 *
 * Prevents Next.js from falling back to the parent `/products/loading.tsx`
 * (which showed product cards and filter sidebar), and instead renders
 * a skeleton matching the real product details page layout.
 */
export default function Loading() {
  return <ProductDetailSkeleton />;
}
