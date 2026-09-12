"use client";

import React from "react";
import { FiMessageCircle } from "react-icons/fi";
import { useConfirm } from "@/context/ConfirmDialogContext";

export interface MessageSellerButtonProps {
  storeName: string;
}

export function MessageSellerButton({ storeName }: MessageSellerButtonProps) {
  const confirm = useConfirm();

  const handleMessageClick = () => {
    confirm({
      title: storeName ? `Message ${storeName}` : "Message Seller",
      message: "This Feature Will Be Coming Soon.",
      variant: "info",
      confirmText: "Okay",
      cancelText: null,
    });
  };

  return (
    <button
      type="button"
      onClick={handleMessageClick}
      className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-hover"
    >
      <FiMessageCircle size={16} />
      Message Seller
    </button>
  );
}