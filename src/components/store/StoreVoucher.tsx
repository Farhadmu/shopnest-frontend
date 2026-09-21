"use client";

import { FaCopy, FaTicketAlt, FaCheck } from "react-icons/fa";
import { FiArrowRight, FiTag } from "react-icons/fi";
import { StoreVoucher as StoreVoucherType } from "@/types/store";

interface StoreVoucherProps {
  voucher: StoreVoucherType & { terms?: string };
  copied?: boolean;
  onCopy?: () => void;
  totalCoupons?: number;
  onViewAllCoupons?: () => void;
}

const StoreVoucher = ({
  voucher,
  copied = false,
  onCopy,
  totalCoupons = 1,
  onViewAllCoupons,
}: StoreVoucherProps) => {
  return (
    <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 sm:p-5 dark:border-primary/40 dark:bg-primary/10 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FaTicketAlt className="text-primary text-sm" />
          <h2 className="text-base font-black text-slate-900 dark:text-white">
            Best Store Deal
          </h2>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
          <FiTag className="text-[9px]" />
          <span>Top Offer</span>
        </span>
      </div>

      <div className="mt-3.5">
        <p className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
          {voucher.discount}
        </p>

        {voucher.terms && (
          <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
            {voucher.terms}
          </p>
        )}

        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
          {voucher.validTill}
        </p>
      </div>

      {/* Code Box */}
      <div className="mt-3.5 flex items-center justify-between gap-2 rounded-xl border border-primary/20 bg-white p-2.5 dark:border-primary/30 dark:bg-slate-900 shadow-2xs">
        <span className="font-mono text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
          {voucher.code || "SHOPNEST"}
        </span>

        <button
          type="button"
          onClick={onCopy}
          aria-label="Copy voucher code"
          className="flex h-7.5 items-center gap-1 rounded-lg bg-primary hover:bg-primary/90 text-white text-[11px] font-bold px-2.5 transition cursor-pointer shadow-2xs"
        >
          {copied ? (
            <>
              <FaCheck className="text-[10px]" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <FaCopy className="text-[10px]" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {copied && (
        <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          Voucher code copied to clipboard!
        </p>
      )}

      {/* View All Deals button if more than 1 offer */}
      {totalCoupons > 1 && onViewAllCoupons && (
        <button
          type="button"
          onClick={onViewAllCoupons}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200/90 bg-white py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:border-primary/40 hover:text-primary dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200 cursor-pointer shadow-2xs"
        >
          <span>View All {totalCoupons} Available Deals</span>
          <FiArrowRight className="text-xs" />
        </button>
      )}
    </div>
  );
};

export default StoreVoucher;