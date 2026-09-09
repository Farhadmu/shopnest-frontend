import { FaCheckCircle, FaStar } from "react-icons/fa";
import { StoreData } from "@/types/store";

interface StoreTrustCardProps {
  store: StoreData;
}

const StoreTrustCard = ({
  store,
}: StoreTrustCardProps) => {
  const scores = [
    {
      label: "Item as Described",
      value: store.trustScore.itemAsDescribed,
    },
    {
      label: "Customer Communication",
      value: store.trustScore.communication,
    },
    {
      label: "Shipping & Packaging",
      value: store.trustScore.packaging,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Store Trust Score
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Based on customer experiences
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-yellow-50 px-3 py-1.5 text-sm font-bold text-yellow-600 dark:bg-yellow-500/10">
          <FaStar />
          {store.rating}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {scores.map((score) => {
          const percentage =
            (Number(score.value) / 5) * 100;

          return (
            <div key={score.label}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {score.label}
                </span>

                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {score.value}/5
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400">
        <FaCheckCircle />
        <span>
          99.2% of customers recommend this store
        </span>
      </div>
    </div>
  );
};

export default StoreTrustCard;