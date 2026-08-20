import { useEffect, useState } from "react";
import api from "../../api/client";

const StatCard = ({ label, value }) => (
  <div className="card p-4">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard").then((res) => setStats(res.data.data));
  }, []);

  if (!stats) return <p className="text-gray-400">Loading...</p>;

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Platform Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Total Sellers" value={stats.totalSellers} />
        <StatCard label="Total Products" value={stats.totalProducts} />
        <StatCard label="Total Orders" value={stats.totalOrders} />
        <StatCard label="Total Revenue" value={`৳${stats.totalRevenue.toLocaleString()}`} />
        <StatCard label="Pending Sellers" value={stats.pendingSellers} />
        <StatCard label="Reported Products" value={stats.reportedProducts} />
        <StatCard label="Refund Requests" value={stats.refundRequests} />
      </div>
    </div>
  );
};

export default AdminDashboard;
