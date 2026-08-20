import { useEffect, useState } from "react";
import api from "../../api/client";

const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/orders/seller/mine").then((res) => setOrders(res.data.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const updateStatus = async (orderId, status) => {
    await api.patch(`/orders/${orderId}/status`, { status });
    load();
  };

  if (loading) return <p className="text-gray-400">Loading...</p>;

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Orders ({orders.length})</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o._id} className="card p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">{o.orderNumber}</p>
                <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</p>
              </div>
              <select
                className="input text-sm w-auto"
                value={o.status}
                onChange={(e) => updateStatus(o._id, e.target.value)}
              >
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {o.items.map((item) => (
              <div key={item._id} className="text-sm flex justify-between py-1 border-t">
                <span>{item.title} × {item.quantity}</span>
                <span>৳{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerOrders;
