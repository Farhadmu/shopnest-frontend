"use client";

import Link from "next/link";
import { FiEdit2, FiEye, FiExternalLink, FiTrash2 } from "react-icons/fi";

interface ProductActionButtonsProps {
  productId: string;
  isBusy: boolean;
  onInspect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  mobile?: boolean;
}

export function ProductActionButtons({
  productId,
  isBusy,
  onInspect,
  onEdit,
  onDelete,
  mobile = false,
}: ProductActionButtonsProps) {
  const buttonClass = mobile
    ? "rounded-xl border border-border p-2 text-muted transition hover:bg-muted-bg hover:text-text"
    : "shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-primary/10 hover:text-primary";

  return (
    <div className={mobile ? "flex items-center gap-2" : "flex w-full flex-wrap items-center justify-start gap-1 2xl:justify-end"}>
      {mobile && (
        <button type="button" onClick={onEdit} className="flex-1 rounded-xl bg-muted-bg px-2 py-1.5 text-xs font-bold text-text transition hover:bg-primary/10 hover:text-primary">
          <span className="inline-flex items-center justify-center gap-1.5"><FiEdit2 size={12} />Edit</span>
        </button>
      )}
      <button type="button" onClick={onInspect} className={buttonClass} title="Inspect product details">
        <FiEye size={mobile ? 14 : 13} />
      </button>
      {!mobile && (
        <button type="button" onClick={onEdit} className={buttonClass} title="Edit product">
          <FiEdit2 size={13} />
        </button>
      )}
      <Link href={`/products/${productId}`} target="_blank" className={buttonClass} title="Open in store">
        <FiExternalLink size={mobile ? 14 : 13} />
      </Link>
      <button type="button" disabled={isBusy} onClick={onDelete} className={`${buttonClass} hover:bg-rose-500/10 hover:text-rose-600 disabled:opacity-40`} title="Delete product">
        <FiTrash2 size={mobile ? 14 : 13} />
      </button>
    </div>
  );
}
