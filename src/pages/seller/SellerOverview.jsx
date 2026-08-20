import { useEffect, useState } from "react";
import api from "../../api/client";

const StatCard = ({ label, value }) => (
  <div className="card p-4">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);

const SellerOverview = () => {
  const [stats, setStats] = useState(null);
  const [store, setStore] = useState(null);

  useEffect(() => {
    api.get("/stores/me").then((res) => setStore(res.data.data));
    api.get("/sellers/analytics").then((res) => setStats(res.data.data)).catch(() => {});
  }, []);

  if (store === null) return <p className="text-gray-400">Loading...</p>;

  if (!store) {
    return (
      <div className="card p-6 text-center">
        <h2 className="font-bold mb-2">Set up your store</h2>
        <p className="text-gray-500 text-sm mb-4">You need to create a store before you can add products.</p>
        <a href="/seller/store" className="btn-primary inline-block">Create Store</a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Welcome back, {store.name}</h1>
      {store.verificationStatus !== "APPROVED" && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-2 rounded-lg mb-4">
          Your store is <b>{store.verificationStatus}</b>. Products won't appear publicly until an admin approves your store.
        </div>
      )}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Revenue" value={`৳${stats.totalRevenue.toLocaleString()}`} />
          <StatCard label="Total Orders" value={stats.totalOrders} />
          <StatCard label="Products" value={stats.totalProducts} />
          <StatCard label="Units Sold" value={stats.unitsSold} />
        </div>
      )}
    </div>
  );
};

export default SellerOverview;
