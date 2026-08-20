import { useEffect, useState } from "react";
import api from "../../api/client";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("PENDING");

  const load = () => api.get(`/admin/products?status=${filter}`).then((res) => setProducts(res.data.data));

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id, status) => {
    await api.patch(`/admin/products/${id}/status`, { status });
    load();
  };

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Product Moderation</h1>
      <div className="flex gap-2 mb-4">
        {["PENDING", "APPROVED", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm ${filter === s ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="text-gray-400">No products in this status.</p>
      ) : (
        <div className="card divide-y">
          {products.map((p) => (
            <div key={p._id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-sm text-gray-500">{p.store?.name} • ৳{p.price}</p>
              </div>
              {p.status === "PENDING" && (
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(p._id, "APPROVED")} className="btn-secondary text-sm text-green-700">Approve</button>
                  <button onClick={() => updateStatus(p._id, "REJECTED")} className="btn-secondary text-sm text-red-600">Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
