import { useEffect, useState } from "react";
import api from "../../api/client";

const statusColor = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/admin/orders").then((res) => setOrders(res.data.data));
  }, []);

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">All Orders ({orders.length})</h1>
      <div className="card divide-y">
        {orders.map((o) => (
          <div key={o._id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{o.orderNumber}</p>
              <p className="text-sm text-gray-500">{o.user?.name} • {new Date(o.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">৳{o.total.toLocaleString()}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[o.status] || "bg-gray-100"}`}>{o.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;
