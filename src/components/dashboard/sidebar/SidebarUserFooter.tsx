import React from "react";
import { FaSignOutAlt } from "react-icons/fa";

export interface SidebarUserFooterProps {
  userName: string;
  userEmail?: string;
  role: string;
  onLogout: () => void;
}

/**
 * Reusable account card pinned to the bottom of the dashboard sidebar —
 * avatar initial, name/email, and a logout button.
 */
export function SidebarUserFooter({ userName, userEmail, role, onLogout }: SidebarUserFooterProps) {
  const initial = (userName?.[0] || "U").toUpperCase();

  return (
    <div className="border-t border-border p-2.5">
      <div className="flex items-center gap-2 rounded-lg bg-muted-bg/60 p-2">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary text-xs font-black text-white">
          {initial}
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-xs font-bold text-text">{userName}</p>
          <p className="truncate text-[10px] text-muted">{userEmail || role}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          title="Log out"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted transition hover:bg-error/10 hover:text-error"
        >
          <FaSignOutAlt size={12} />
        </button>
      </div>
    </div>
  );
}
