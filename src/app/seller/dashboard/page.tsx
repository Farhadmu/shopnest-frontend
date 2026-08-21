export default function SellerDashboardPage() {
  const dashboardStats = [
    { title: "Total Sales", value: "BDT 0.00", description: "Overall revenue generated" },
    { title: "Inventory", value: "0 Items", description: "Total products in stock" },
    { title: "Pending Orders", value: "0", description: "Orders awaiting fulfillment" },
  ];

  return (
    <div className="flex flex-col gap-8 p-6">
      
      <div className="p-8 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-500 text-white shadow-md">
        <h1 className="text-3xl font-extrabold tracking-tight">Seller Dashboard</h1>
        <p className="mt-2 text-emerald-50 text-sm md:text-base font-medium">
          Overview of your store sales, inventory, and pending orders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="border border-emerald-100 rounded-xl p-6 shadow-sm bg-white hover:shadow-md transition-all">
            <h3 className="text-sm font-semibold text-gray-500">{stat.title}</h3>
            <p className="text-3xl font-bold mt-2 text-gray-800">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-2">{stat.description}</p>
          </div>
        ))}
      </div>

      
      <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Recent Activity</h2>
        <div className="text-sm text-gray-400 italic">
          No recent activity to display.
        </div>
      </div>
    </div>
  );
}