import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useCart } from "../context/CartContext";

const CheckoutPage = () => {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    recipientName: "",
    phone: "",
    addressLine: "",
    city: "",
    district: "",
    postalCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const subtotal =
    cart.items?.reduce((sum, i) => sum + (i.product?.discountPrice || i.product?.price || i.priceAtAdd) * i.quantity, 0) || 0;
  const deliveryFee = subtotal > 2000 ? 0 : 60;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    setError("");
    try {
      const { data } = await api.post("/orders", { shippingAddress: address, paymentMethod });
      await refreshCart();
      navigate(`/account/orders/${data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-lg font-bold mb-4">Checkout</h1>
      <form onSubmit={handlePlaceOrder} className="space-y-6">
        <div className="card p-4">
          <h2 className="font-medium mb-3">Shipping Address</h2>
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Full Name" className="input" value={address.recipientName}
              onChange={(e) => setAddress((a) => ({ ...a, recipientName: e.target.value }))} />
            <input required placeholder="Phone Number" className="input" value={address.phone}
              onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))} />
            <input required placeholder="Address Line" className="input col-span-2" value={address.addressLine}
              onChange={(e) => setAddress((a) => ({ ...a, addressLine: e.target.value }))} />
            <input required placeholder="City" className="input" value={address.city}
              onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} />
            <input placeholder="District" className="input" value={address.district}
              onChange={(e) => setAddress((a) => ({ ...a, district: e.target.value }))} />
            <input placeholder="Postal Code" className="input" value={address.postalCode}
              onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))} />
          </div>
        </div>

        <div className="card p-4">
          <h2 className="font-medium mb-3">Payment Method</h2>
          <div className="space-y-2 text-sm">
            {["COD", "STRIPE", "LOCAL_GATEWAY"].map((pm) => (
              <label key={pm} className="flex items-center gap-2">
                <input type="radio" name="pm" checked={paymentMethod === pm} onChange={() => setPaymentMethod(pm)} />
                {pm === "COD" ? "Cash on Delivery" : pm === "STRIPE" ? "Card (Stripe)" : "Local Payment Gateway"}
              </label>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex justify-between text-sm mb-1"><span>Subtotal</span><span>৳{subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between text-sm mb-1"><span>Delivery Fee</span><span>৳{deliveryFee}</span></div>
          <div className="flex justify-between font-bold mt-2 pt-2 border-t"><span>Total</span><span>৳{(subtotal + deliveryFee).toLocaleString()}</span></div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button type="submit" disabled={placing} className="btn-primary w-full disabled:opacity-50">
          {placing ? "Placing Order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
