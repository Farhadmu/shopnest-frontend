import { FaCopy, FaTicketAlt } from "react-icons/fa";
import { StoreVoucher as StoreVoucherType } from "@/types/store";

interface StoreVoucherProps {
  voucher: StoreVoucherType;
  copied?: boolean;
  onCopy?: () => void;
}

const StoreVoucher = ({
  voucher,
  copied = false,
  onCopy,
}: StoreVoucherProps) => {
  return (
    <div className="rounded-2xl border border-dashed border-blue-300 bg-blue-50 p-5 dark:border-blue-500/40 dark:bg-blue-500/10">
      <div className="flex items-center gap-2">
        <FaTicketAlt className="text-blue-600 dark:text-blue-400" />

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Store Voucher
        </h2>
      </div>

      <div className="mt-4">
        <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
          {voucher.discount}
        </p>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {voucher.validTill}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-blue-200 bg-white p-3 dark:border-blue-500/30 dark:bg-slate-900">
        <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-200">
          {voucher.code}
        </span>

        <button
          type="button"
          onClick={onCopy}
          aria-label="Copy voucher code"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
        >
          <FaCopy />
        </button>
      </div>
      {copied && <p className="mt-2 text-xs font-semibold text-green-600">Voucher code copied</p>}
    </div>
  );
};

export default StoreVoucher;