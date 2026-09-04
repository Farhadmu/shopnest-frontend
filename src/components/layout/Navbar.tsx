/**
 * Navbar — React Server Component entry point.
 *
 * Renders the CategoryMegaMenu and MobileCategoryMenu server-side (zero client
 * JS for the category lists), then passes them as opaque ReactNode props into
 * the NavbarClient client component which manages all interactive state.
 */
import { CategoryMegaMenu } from "@/components/layout/CategoryMegaMenu/CategoryMegaMenu";
import { MobileCategoryMenu } from "@/components/layout/CategoryMegaMenu/MobileCategoryMenu";
import { NavbarClient } from "./navbar/NavbarClient";

export async function Navbar() {
  return (
    <NavbarClient
      desktopCategoryMenu={<CategoryMegaMenu />}
      mobileCategoryMenu={<MobileCategoryMenu />}
    />
  );
}