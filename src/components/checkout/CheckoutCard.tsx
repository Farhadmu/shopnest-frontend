import React from "react";
import type { LucideIcon } from "lucide-react";

interface CheckoutCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}

export function CheckoutCard({
  icon: Icon,
  title,
  subtitle,
  children,
  className = "",
}: CheckoutCardProps) {
  return (
    <div className={`bg-white dark:bg-[#12102A] border border-slate-200 dark:border-[#2D2250] rounded-sm overflow-hidden shadow-sm ${className}`}>
      {/* Card Header with login dark-gradient */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-[#1E124A] dark:via-[#120B2E] dark:to-[#090614] border-b border-transparent dark:border-[#2D2250] flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-sm bg-white/20 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white leading-tight">{title}</h2>
          <p className="text-[11px] text-violet-200 dark:text-purple-200/80">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
