import Link from "next/link";
import React from "react";

export interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface SidebarProps {
  items: SidebarItem[];
  title?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, title = "Navigation" }) => {
  return (
    <aside className="w-64 border-r border-border bg-background p-4 min-h-[calc(100vh-4rem)]">
      <h4 className="text-xs font-semibold text-muted/80 uppercase tracking-wider mb-4 px-2">
        {title}
      </h4>
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/10 rounded-lg transition-colors"
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};
