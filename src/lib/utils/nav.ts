/**
 * Shared active-link matching logic for dashboard sidebars.
 * Exact match on role-root hrefs; prefix match for everything else so a
 * sub-page (e.g. /dashboard/seller/products/add) still highlights its
 * parent nav item (/dashboard/seller/products).
 */
const ROLE_ROOT_HREFS = ["/dashboard/user", "/dashboard/seller", "/dashboard/admin"];

export function isDashboardLinkActive(pathname: string, href: string): boolean {
  if (!href || href === "#") return false;
  if (pathname === href) return true;
  if (ROLE_ROOT_HREFS.includes(href)) return false;
  return pathname.startsWith(href);
}
