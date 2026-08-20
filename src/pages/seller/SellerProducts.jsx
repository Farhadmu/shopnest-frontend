import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";

const statusColor = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/products/seller/mine").then((res) => setProducts(res.data.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    load();
  };

  if (loading) return <p className="text-gray-400">Loading...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">My Products ({products.length})</h1>
        <Link to="/seller/products/new" className="btn-primary text-sm">+ Add Product</Link>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-400">No products yet.</p>
      ) : (
        <div className="card divide-y">
          {products.map((p) => (
            <div key={p._id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-sm text-gray-500">৳{p.price} • Stock: {p.stock}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[p.status]}`}>{p.status}</span>
                <button onClick={() => handleDelete(p._id)} className="text-red-500 text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
