"use client";

import React, { useState } from "react";
import { FiMessageCircle } from "react-icons/fi";

export interface MessageSellerButtonProps {
  storeName: string;
}

/**
 * TODO(backend): there is no buyer↔seller direct-messaging route yet.
 * Swap this toast for `router.push(\`/messages/new?store=...\`)` (or similar)
 * once that surface ships.
 */
export function MessageSellerButton({ storeName }: MessageSellerButtonProps) {
  const [sent, setSent] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        setSent(true);
        setTimeout(() => setSent(false), 2500);
      }}
      className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-hover"
    >
      <FiMessageCircle size={16} />
      {sent ? `Connecting to ${storeName}...` : "Message Seller"}
    </button>
  );
}