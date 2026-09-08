import { ReviewItem } from "@/types/store";
import ReviewCard from "./ReviewCard";

interface ReviewsListProps {
  reviews: ReviewItem[];
  storeName: string;
}

const ReviewsList = ({
  reviews,
  storeName,
}: ReviewsListProps) => {
  return (
    <div className="space-y-4">
      {reviews.map((review, index) => (
        <ReviewCard
          key={`${review.author}-${index}`}
          review={review}
          storeName={storeName}
        />
      ))}
    </div>
  );
};

export default ReviewsList;