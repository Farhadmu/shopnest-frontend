import React from "react";
import { Button } from "@/components/ui/Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "Failed to load request. Please try again.",
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-error/20 bg-error/5 rounded-xl">
      <div className="text-3xl mb-2">⚠️</div>
      <h3 className="text-sm font-semibold text-error mb-1">{title}</h3>
      <p className="text-xs text-error/80 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="danger" size="sm">
          Try Again
        </Button>
      )}
    </div>
  );
};
