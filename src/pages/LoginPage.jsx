import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === "ADMIN") navigate("/admin");
      else if (user.role === "SELLER") navigate("/seller");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-xl font-bold mb-1 text-center">Welcome back</h1>
      <p className="text-sm text-gray-500 text-center mb-6">Login to your ShopNest account</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input required type="email" placeholder="Email" className="input"
          value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <input required type="password" placeholder="Password" className="input"
          value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-sm text-center mt-4 text-gray-500">
        Don't have an account? <Link to="/register" className="text-brand-600 font-medium">Register</Link>
      </p>

      <div className="mt-6 text-xs text-gray-400 border-t pt-4">
        Demo accounts (after running seed script):
        <br />admin@shopnest.com / Admin@1234
        <br />seller@shopnest.com / Seller@1234
        <br />customer@shopnest.com / Customer@1234
      </div>
    </div>
  );
};

export default LoginPage;
