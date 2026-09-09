import {
  FaCheckCircle,
  FaCommentDots,
} from "react-icons/fa";

import { MerchantAssuranceItem } from "@/types/store";

interface MerchantAssuranceProps {
  items: MerchantAssuranceItem[];
  onInquire?: () => void;
}

const MerchantAssurance = ({
  items,
  onInquire,
}: MerchantAssuranceProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
        Merchant Assurance
      </h2>

      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex gap-3"
          >
            <FaCheckCircle className="mt-1 shrink-0 text-green-500" />

            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {item.title}
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onInquire}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <FaCommentDots />
        Inquire About Store
      </button>
    </div>
  );
};

export default MerchantAssurance;