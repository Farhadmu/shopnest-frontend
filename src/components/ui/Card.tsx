import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`rounded-xl border border-border bg-background p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
};
