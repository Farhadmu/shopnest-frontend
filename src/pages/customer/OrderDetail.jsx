import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/client";

const trackingSteps = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  const load = () => api.get(`/orders/${id}`).then((res) => setOrder(res.data.data));

  useEffect(() => { load(); }, [id]);

  const cancelOrder = async () => {
    if (!confirm("Cancel this order?")) return;
    await api.patch(`/orders/${id}/cancel`);
    load();
  };

  if (!order) return <p className="text-gray-400">Loading...</p>;

  const currentIndex = trackingSteps.indexOf(order.status);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-lg font-bold mb-1">Order {order.orderNumber}</h1>
      <p className="text-sm text-gray-500 mb-6">Placed on {new Date(order.createdAt).toLocaleString()}</p>

      {/* Tracking timeline */}
      {!["CANCELLED", "RETURNED", "REFUNDED"].includes(order.status) && (
        <div className="card p-4 mb-6">
          <div className="flex justify-between">
            {trackingSteps.map((step, i) => (
              <div key={step} className="flex-1 text-center">
                <div
                  className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs ${
                    i <= currentIndex ? "bg-brand-600 text-white" : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {i + 1}
                </div>
                <p className="text-[10px] mt-1 text-gray-500">{step.replace(/_/g, " ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-4 mb-6">
        <h2 className="font-medium mb-3">Items</h2>
        {order.items.map((item) => (
          <div key={item._id} className="flex justify-between text-sm py-2 border-b last:border-0">
            <span>{item.title} × {item.quantity}</span>
            <span>৳{(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="card p-4 mb-6 text-sm">
        <h2 className="font-medium mb-2">Shipping Address</h2>
        <p>{order.shippingAddress.recipientName} • {order.shippingAddress.phone}</p>
        <p>{order.shippingAddress.addressLine}, {order.shippingAddress.city}</p>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex justify-between text-sm mb-1"><span>Subtotal</span><span>৳{order.subtotal.toLocaleString()}</span></div>
        <div className="flex justify-between text-sm mb-1"><span>Discount</span><span>-৳{order.discount.toLocaleString()}</span></div>
        <div className="flex justify-between text-sm mb-1"><span>Delivery</span><span>৳{order.deliveryFee.toLocaleString()}</span></div>
        <div className="flex justify-between font-bold pt-2 border-t mt-2"><span>Total</span><span>৳{order.total.toLocaleString()}</span></div>
      </div>

      {["PENDING", "CONFIRMED"].includes(order.status) && (
        <button onClick={cancelOrder} className="btn-secondary text-red-600">Cancel Order</button>
      )}
    </div>
  );
};

export default OrderDetail;
