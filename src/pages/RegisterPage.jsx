import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "CUSTOMER" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      navigate(user.role === "SELLER" ? "/seller" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-xl font-bold mb-1 text-center">Create your account</h1>
      <p className="text-sm text-gray-500 text-center mb-6">Join ShopNest as a customer or seller</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input required placeholder="Full Name" className="input"
          value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <input required type="email" placeholder="Email" className="input"
          value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <input required type="password" placeholder="Password" className="input"
          value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />

        <div className="flex gap-3 text-sm">
          <label className="flex items-center gap-1">
            <input type="radio" checked={form.role === "CUSTOMER"} onChange={() => setForm((f) => ({ ...f, role: "CUSTOMER" }))} />
            Customer
          </label>
          <label className="flex items-center gap-1">
            <input type="radio" checked={form.role === "SELLER"} onChange={() => setForm((f) => ({ ...f, role: "SELLER" }))} />
            Seller
          </label>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="text-sm text-center mt-4 text-gray-500">
        Already have an account? <Link to="/login" className="text-brand-600 font-medium">Login</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
