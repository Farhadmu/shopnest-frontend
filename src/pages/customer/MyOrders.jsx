import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";

const statusColor = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  RETURNED: "bg-gray-100 text-gray-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders").then((res) => setOrders(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400">Loading...</p>;
  if (orders.length === 0) return <p className="text-gray-400">No orders yet.</p>;

  return (
    <div className="space-y-3">
      <h1 className="text-lg font-bold mb-2">My Orders</h1>
      {orders.map((o) => (
        <Link to={`/account/orders/${o._id}`} key={o._id} className="card p-4 flex justify-between items-center hover:border-brand-400">
          <div>
            <p className="font-medium">{o.orderNumber}</p>
            <p className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()} • {o.items.length} item(s)</p>
          </div>
          <div className="text-right">
            <p className="font-bold">৳{o.total.toLocaleString()}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[o.status] || "bg-gray-100"}`}>{o.status}</span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MyOrders;
