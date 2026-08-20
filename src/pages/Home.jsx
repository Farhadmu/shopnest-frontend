import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import ProductCard from "../components/ProductCard";
import WhyShopNest from "../components/home/WhyShopNest";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryEmojis = ["📱", "👗", "🏠", "⚽", "💄", "🎮", "📚", "🛋️"];

  useEffect(() => {
    const load = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get("/products?sort=bestselling&limit=12"),
          api.get("/categories"),
        ]);
        setProducts(prodRes.data.data);
        setCategories(catRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient text-white">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-8 items-center relative">
          <div className="animate-fadeInUp">
            <span className="badge bg-white/20 backdrop-blur text-white mb-4">✨ AI-Powered Marketplace</span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-sm">
              Shop Smarter. <br /> Sell Better.
            </h1>
            <p className="mt-4 text-orange-50 max-w-md">
              ShopNest is an AI-powered multi-vendor marketplace — discover the right products faster, and if
              you sell, grow your store with AI-assisted tools.
            </p>
            <div className="mt-7 flex gap-3 flex-wrap">
              <Link
                to="/products"
                className="bg-white text-brand-600 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Browse Products
              </Link>
              <Link
                to="/ai-assistant"
                className="border-2 border-white/70 backdrop-blur px-6 py-3 rounded-xl font-semibold hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-200"
              >
                Ask AI Assistant →
              </Link>
            </div>
          </div>
          <div className="hidden md:block animate-floaty">
            <div className="bg-white/15 rounded-2xl p-6 backdrop-blur-md border border-white/20 shadow-2xl">
              <p className="text-sm text-orange-50 mb-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulseSoft" />
                Try asking the AI assistant:
              </p>
              <p className="italic text-white text-lg leading-snug">
                "I need a wireless headphone under ৳5,000 for gaming and music."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10">
          <h2 className="section-title mb-5">Shop by Category</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((c, i) => (
              <Link
                key={c._id}
                to={`/products?category=${c._id}`}
                className="shrink-0 card card-hover px-5 py-3.5 text-sm font-semibold text-gray-700 hover:text-brand-600 flex items-center gap-2 animate-fadeInUp"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className="text-lg">{categoryEmojis[i % categoryEmojis.length]}</span>
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trending products */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title">🔥 Trending Products</h2>
          <Link to="/products" className="btn-ghost text-sm">
            View all →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton aspect-square rounded-2xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-gray-400">
            No products yet — run <code className="bg-gray-100 px-1.5 py-0.5 rounded">npm run seed</code> in the
            backend to load demo data.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {products.map((p, i) => (
              <div key={p._id} style={{ animationDelay: `${i * 40}ms` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </section>
        {/* why shopnest */}
        <WhyShopNest />
    </div>
  );
};

export default Home;
