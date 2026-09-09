interface StoreTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const StoreTabs = ({
  activeTab,
  onTabChange,
}: StoreTabsProps) => {
  const tabs = [
    "All Products",
    "Store Reviews",
    "Vouchers & Deals",
    "About Merchant & Policies",
  ];

  return (
    <div className="my-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`px-5 py-4 text-sm font-semibold transition ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StoreTabs;