import React from "react";
import type { UserRole } from "./NavbarLinks";

interface RoleBadgeProps {
  role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  if (role === "admin")
    return (
      <span className="rounded-md bg-purple-500/15 px-2 py-0.5 text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">
        Admin
      </span>
    );
  if (role === "seller")
    return (
      <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
        Seller
      </span>
    );
  if (role === "delivery_man" || role === "delivery")
    return (
      <span className="rounded-md bg-sky-500/15 px-2 py-0.5 text-[10px] font-black uppercase text-sky-600 dark:text-sky-400">
        Delivery Partner
      </span>
    );
  return (
    <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-black uppercase text-primary">
      Customer
    </span>
  );
}

export { RoleBadge as NavbarRoleBadge };
export default RoleBadge;
