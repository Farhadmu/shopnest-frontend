import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import api from "../../api/client";

const SellerAnalytics = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/sellers/analytics").then((res) => setStats(res.data.data));
  }, []);

  if (!stats) return <p className="text-gray-400">Loading...</p>;

  const dailyData = Object.entries(stats.dailySales).map(([day, value]) => ({ day: day.slice(5), value }));

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4"><p className="text-xs text-gray-500">Revenue</p><p className="text-xl font-bold">৳{stats.totalRevenue.toLocaleString()}</p></div>
        <div className="card p-4"><p className="text-xs text-gray-500">Orders</p><p className="text-xl font-bold">{stats.totalOrders}</p></div>
        <div className="card p-4"><p className="text-xs text-gray-500">Units Sold</p><p className="text-xl font-bold">{stats.unitsSold}</p></div>
        <div className="card p-4"><p className="text-xs text-gray-500">Avg Rating</p><p className="text-xl font-bold">⭐ {stats.avgRating?.toFixed(1) || "—"}</p></div>
      </div>

      <div className="card p-4 mb-6">
        <h2 className="font-medium mb-3">Daily Sales (Last 14 Days)</h2>
        {dailyData.length === 0 ? (
          <p className="text-sm text-gray-400">No sales in this period yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyData}>
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#ea580c" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card p-4">
        <h2 className="font-medium mb-3">Top Products</h2>
        {stats.topProducts.length === 0 ? (
          <p className="text-sm text-gray-400">No sales data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.topProducts}>
              <XAxis dataKey="title" fontSize={10} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="qty" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default SellerAnalytics;
