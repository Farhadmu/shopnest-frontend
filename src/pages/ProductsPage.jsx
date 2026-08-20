import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client";
import ProductCard from "../components/ProductCard";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    sort: "",
  });

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (category) params.set("category", category);
        if (filters.minPrice) params.set("minPrice", filters.minPrice);
        if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
        if (filters.sort) params.set("sort", filters.sort);

        const { data } = await api.get(`/products?${params.toString()}`);
        setProducts(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [q, category, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid md:grid-cols-4 gap-6">
      {/* Filters */}
      <aside className="md:col-span-1 space-y-4">
        <div className="card p-4">
          <h3 className="font-medium mb-2 text-sm">Category</h3>
          <select
            className="input text-sm"
            value={category}
            onChange={(e) => setSearchParams((prev) => {
              const p = new URLSearchParams(prev);
              if (e.target.value) p.set("category", e.target.value); else p.delete("category");
              return p;
            })}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="card p-4">
          <h3 className="font-medium mb-2 text-sm">Price Range (৳)</h3>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              className="input text-sm"
              value={filters.minPrice}
              onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
            />
            <input
              type="number"
              placeholder="Max"
              className="input text-sm"
              value={filters.maxPrice}
              onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
            />
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-medium mb-2 text-sm">Sort By</h3>
          <select
            className="input text-sm"
            value={filters.sort}
            onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
          >
            <option value="">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="bestselling">Best Selling</option>
          </select>
        </div>
      </aside>

      {/* Results */}
      <div className="md:col-span-3">
        <h1 className="text-lg font-bold mb-4">
          {q ? `Search results for "${q}"` : "All Products"}{" "}
          <span className="text-sm font-normal text-gray-400">({products.length})</span>
        </h1>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-400">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
