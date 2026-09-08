import {
  FaCheckCircle,
  FaStar,
} from "react-icons/fa";

import { ReviewItem } from "@/types/store";

interface ReviewCardProps {
  review: ReviewItem;
  storeName: string;
}

const ReviewCard = ({
  review,
  storeName,
}: ReviewCardProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      
      {/* User */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            {review.author.charAt(0)}
          </div>

          <div>
            <div className="flex items-center gap-1">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {review.author}
              </h3>

              <FaCheckCircle className="text-xs text-blue-500" />
            </div>

            <p className="text-xs text-slate-400">
              {review.date}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-yellow-500">
          {[...Array(review.rating)].map((_, index) => (
            <FaStar key={index} />
          ))}
        </div>
      </div>

      {/* Purchased Item */}
      <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
        <p className="text-xs text-slate-400">
          Purchased item
        </p>

        <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
          {review.item}
        </p>
      </div>

      {/* Comment */}
      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {review.comment}
      </p>

      {/* Review Images */}
      {review.images &&
        review.images.length > 0 && (
          <div className="mt-4 flex gap-2">
            {review.images.map((image, index) => (
              <div
                key={index}
                className="h-16 w-16 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <img
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

      {/* Review Details */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span>
          Packaging: {review.packaging}
        </span>

        <span>
          Chat: {review.speed}
        </span>

        <span>
          Dispatch: {review.dispatchTime}
        </span>
      </div>

      {/* Seller Reply */}
      {review.reply && (
        <div className="mt-4 rounded-xl border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-blue-500/10">
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
            {storeName} replied
          </p>

          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {review.reply.text}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {review.reply.date}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;