interface ReviewFiltersProps {
  reviewsCount: string;
}

const ReviewFilters = ({
  reviewsCount,
}: ReviewFiltersProps) => {
  const filters = [
    {
      label: "All Reviews",
      count: reviewsCount,
    },
    {
      label: "5 Stars",
      count: "1,120",
    },
    {
      label: "With Photos",
      count: "486",
    },
    {
      label: "Packaging Quality",
      count: "328",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter, index) => (
        <button
          key={filter.label}
          type="button"
          className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
            index === 0
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          {filter.label}

          <span className="ml-1 opacity-70">
            ({filter.count})
          </span>
        </button>
      ))}
    </div>
  );
};

export default ReviewFilters;