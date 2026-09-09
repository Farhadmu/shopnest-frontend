import {
  FaCheckCircle,
  FaCommentAlt,
  FaStar,
  FaUserPlus,
} from "react-icons/fa";

import { StoreData } from "@/types/store";

interface StoreProfileHeaderProps {
  store: StoreData;
  followed?: boolean;
  onFollow?: () => void;
  onMessage?: () => void;
}

const StoreProfileHeader = ({
  store,
  followed = false,
  onFollow,
  onMessage,
}: StoreProfileHeaderProps) => {
  return (
    <div className="-mt-12 relative z-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          
          {/* Left */}
          <div className="flex items-start gap-4">
            
            {/* Store Logo */}
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-slate-100 shadow-md dark:border-slate-900 dark:bg-slate-800">
              <img
                src={store.logo}
                alt={`${store.name} logo`}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Store Info */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {store.name}
                </h1>

                <FaCheckCircle className="text-blue-500" />
              </div>

              <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                {store.tagline}
              </p>

              {/* Stats */}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                
                <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                  <FaStar className="text-yellow-400" />
                  {store.rating}
                </span>

                <span className="text-slate-500 dark:text-slate-400">
                  {store.reviewsCount}
                </span>

                <span className="text-slate-500 dark:text-slate-400">
                  {store.dispatch}
                </span>

                <span className="text-slate-500 dark:text-slate-400">
                  {store.partnerSince}
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onFollow}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <FaUserPlus className={followed ? "text-rose-500" : ""} />
              {followed ? "Following" : "Follow Store"}
            </button>

            <button
              type="button"
              onClick={onMessage}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <FaCommentAlt />
              Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreProfileHeader;