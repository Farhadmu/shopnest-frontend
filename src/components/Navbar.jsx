import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products?q=${encodeURIComponent(query)}`);
  };

  const dashboardLink =
    user?.role === "ADMIN" ? "/admin" : user?.role === "SELLER" ? "/seller" : "/account";

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="text-2xl font-extrabold shrink-0 flex items-center gap-1 group">
          <span className="gradient-text group-hover:opacity-80 transition-opacity">Shop</span>
          <span className="text-gray-900">Nest</span>
          <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulseSoft mb-3" />
        </Link>

        <form onSubmit={handleSearch} className="flex-1 hidden md:flex">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, brands, categories..."
            className="input rounded-r-none focus:ring-2"
          />
          <button type="submit" className="btn-primary rounded-l-none px-6">
            Search
          </button>
        </form>

        <nav className="flex items-center gap-4 text-sm shrink-0">
          <Link
            to="/ai-assistant"
            className="hidden sm:flex items-center gap-1 font-medium text-white bg-violet-gradient px-3 py-1.5 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            ✨ AI Assistant
          </Link>
          <Link to="/cart" className="relative text-gray-600 hover:text-brand-600 transition-colors">
            <span className="text-xl">🛒</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-gradient text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-popIn shadow-glow">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-2 font-medium text-gray-700 hover:text-brand-600 transition-colors">
                <span className="w-8 h-8 rounded-full bg-brand-gradient text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                {user.name.split(" ")[0]}
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-card-hover opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                <Link to={dashboardLink} className="block px-4 py-2.5 text-sm hover:bg-brand-50 hover:text-brand-700 transition-colors">
                  Dashboard
                </Link>
                <Link to="/account/orders" className="block px-4 py-2.5 text-sm hover:bg-brand-50 hover:text-brand-700 transition-colors">
                  My Orders
                </Link>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn-primary text-sm py-2">
              Login
            </Link>
          )}
        </nav>
      </div>
      <form onSubmit={handleSearch} className="flex md:hidden px-4 pb-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="input rounded-r-none"
        />
        <button type="submit" className="btn-primary rounded-l-none">
          Go
        </button>
      </form>
    </header>
  );
};

export default Navbar;
