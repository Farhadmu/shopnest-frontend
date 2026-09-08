"use client";

type StoreCategoriesProps = {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
};

export default function StoreCategories({
  categories,
  selectedCategory,
  onCategoryChange,
}: StoreCategoriesProps) {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
      <div className="flex min-w-max gap-2">
        {categories.map((category) => {
          const isActive = selectedCategory === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={`whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-white text-slate-900 shadow-lg"
                  : "border border-white/10 bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}