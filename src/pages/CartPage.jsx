import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, applyCoupon } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const navigate = useNavigate();

  const subtotal =
    cart.items?.reduce((sum, i) => sum + (i.product?.discountPrice || i.product?.price || i.priceAtAdd) * i.quantity, 0) || 0;

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold mb-2">Your cart is empty</h1>
        <Link to="/products" className="btn-primary inline-block mt-4">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-3">
        <h1 className="text-lg font-bold mb-2">Your Cart</h1>
        {cart.items.map((item) => (
          <div key={item._id} className="card p-4 flex gap-4 items-center">
            <div className="w-16 h-16 bg-gray-100 rounded shrink-0 flex items-center justify-center overflow-hidden">
              {item.product?.images?.[0] ? (
                <img src={item.product.images[0]} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-gray-300">No image</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.product?.title}</p>
              <p className="text-sm text-gray-500">{item.product?.store?.name}</p>
              <p className="text-brand-600 font-bold mt-1">
                ৳{(item.product?.discountPrice || item.product?.price || item.priceAtAdd).toLocaleString()}
              </p>
            </div>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => updateQuantity(item._id, Number(e.target.value))}
              className="input w-16"
            />
            <button onClick={() => removeFromCart(item._id)} className="text-red-500 text-sm">
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="card p-4 h-fit">
        <h2 className="font-bold mb-3">Order Summary</h2>
        <div className="flex justify-between text-sm mb-2">
          <span>Subtotal</span>
          <span>৳{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex gap-2 mb-3">
          <input
            className="input text-sm"
            placeholder="Coupon code"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
          />
          <button onClick={() => applyCoupon(couponInput)} className="btn-secondary text-sm">Apply</button>
        </div>
        <button onClick={() => navigate("/checkout")} className="btn-primary w-full">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartPage;
