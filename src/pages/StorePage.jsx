import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";

const StorePage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    api.get(`/stores/${slug}`).then((res) => {
      setStore(res.data.data);
      setProducts(res.data.products);
    });
  }, [slug]);

  const toggleFollow = async () => {
    if (!user) return alert("Please login to follow stores");
    const { data } = await api.post(`/stores/${store._id}/follow`);
    setFollowing(data.following);
  };

  if (!store) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="h-48 bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 -mt-14 relative">
        <div className="card p-6 flex items-center justify-between animate-fadeInUp">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-brand-gradient text-white flex items-center justify-center text-2xl font-bold shadow-lg shrink-0">
              {store.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold">{store.name}</h1>
              <p className="text-sm text-gray-500">{store.description}</p>
              <p className="text-sm text-gray-500 mt-1">⭐ {store.rating?.toFixed(1) || "New"} • {store.followerCount} followers</p>
            </div>
          </div>
          <button onClick={toggleFollow} className={following ? "btn-secondary" : "btn-primary"}>
            {following ? "Following ✓" : "+ Follow Store"}
          </button>
        </div>

        <div className="mt-8 pb-10">
          <h2 className="section-title mb-4">Products ({products.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorePage;
