"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { Info, HelpCircle, X, Sparkles, ChevronRight } from "lucide-react";

interface InfoTooltipProps {
  title?: string;
  description: string;
  whyItMatters?: string;
  actionHint?: string;
  icon?: "info" | "help" | "sparkles";
  size?: "xs" | "sm" | "md";
  className?: string;
  align?: "left" | "right" | "center";
  children?: ReactNode;
}

export function InfoTooltip({
  title,
  description,
  whyItMatters,
  actionHint,
  icon = "info",
  size = "sm",
  className = "",
  align = "center",
  children,
}: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const IconComponent =
    icon === "help" ? HelpCircle : icon === "sparkles" ? Sparkles : Info;

  const iconSizes = {
    xs: "h-3 w-3",
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
  };

  const alignClasses = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 -translate-x-1/2",
  };

  return (
    <div
      ref={tooltipRef}
      className={`relative inline-flex items-center align-middle ${className}`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        className="group inline-flex items-center justify-center rounded-full p-0.5 text-muted-foreground/80 hover:text-indigo-400 focus:outline-none transition-colors"
        aria-label={title || "Information"}
      >
        {children ? (
          <span className="inline-flex items-center gap-1 cursor-help">
            {children}
            <IconComponent
              className={`${iconSizes[size]} text-indigo-400/80 group-hover:text-indigo-400 transition-transform group-hover:scale-110 shrink-0`}
            />
          </span>
        ) : (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted/60 hover:bg-indigo-500/10 hover:text-indigo-400 transition">
            <IconComponent className={iconSizes[size]} />
          </span>
        )}
      </button>

      {/* Popover Bubble */}
      {isOpen && (
        <div
          onMouseLeave={() => setIsOpen(false)}
          className={`absolute bottom-full mb-2 z-50 w-72 sm:w-80 rounded-2xl border border-indigo-500/30 bg-card/95 p-4 text-xs shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${alignClasses[align]}`}
          style={{ maxWidth: "calc(100vw - 32px)" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
                <IconComponent className="h-3 w-3" />
              </span>
              <span className="text-xs">{title || "Option Details"}</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="text-muted-foreground hover:text-foreground rounded p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Description */}
          <p className="mt-2 text-muted-foreground text-[11px] leading-relaxed">
            {description}
          </p>

          {/* Why it matters */}
          {whyItMatters && (
            <div className="mt-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-2 text-[10.5px]">
              <span className="font-semibold text-indigo-400 block mb-0.5">
                💡 Why it matters for your store:
              </span>
              <span className="text-foreground/90">{whyItMatters}</span>
            </div>
          )}

          {/* Action Hint */}
          {actionHint && (
            <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
              <ChevronRight className="h-3 w-3 shrink-0" />
              <span>{actionHint}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
