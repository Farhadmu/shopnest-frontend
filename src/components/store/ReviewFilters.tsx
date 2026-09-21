interface ReviewFiltersProps {
  reviewsCount: string;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

const ReviewFilters = ({
  reviewsCount,
  activeFilter = "All Reviews",
  onFilterChange,
}: ReviewFiltersProps) => {
  const filters = [
    {
      label: "All Reviews",
      count: reviewsCount,
    },
    {
      label: "5 Stars",
      count: "",
    },
    {
      label: "With Photos",
      count: "",
    },
    {
      label: "Packaging Quality",
      count: "",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.label}
          type="button"
          onClick={() => onFilterChange?.(filter.label)}
          className={`rounded-xl border px-4 py-2 text-sm font-medium transition cursor-pointer ${
            activeFilter === filter.label
              ? "border-primary bg-primary text-white shadow-xs shadow-primary/25"
              : "border-slate-200/90 bg-white text-slate-600 hover:bg-slate-50 hover:border-primary/40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          {filter.label}

          <span className="ml-1 opacity-70">
            {filter.count && `(${filter.count})`}
          </span>
        </button>
      ))}
    </div>
  );
};

export default ReviewFilters;