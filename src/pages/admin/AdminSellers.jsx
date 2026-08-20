import { useEffect, useState } from "react";
import api from "../../api/client";

const AdminSellers = () => {
  const [stores, setStores] = useState([]);
  const [filter, setFilter] = useState("PENDING");

  const load = () => api.get(`/admin/sellers?status=${filter}`).then((res) => setStores(res.data.data));

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id, status) => {
    await api.patch(`/admin/sellers/${id}/status`, { status });
    load();
  };

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Seller Verification</h1>
      <div className="flex gap-2 mb-4">
        {["PENDING", "APPROVED", "REJECTED", "SUSPENDED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm ${filter === s ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {stores.length === 0 ? (
        <p className="text-gray-400">No stores in this status.</p>
      ) : (
        <div className="card divide-y">
          {stores.map((s) => (
            <div key={s._id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-gray-500">Owner: {s.owner?.name} ({s.owner?.email})</p>
              </div>
              {s.verificationStatus === "PENDING" && (
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(s._id, "APPROVED")} className="btn-secondary text-sm text-green-700">Approve</button>
                  <button onClick={() => updateStatus(s._id, "REJECTED")} className="btn-secondary text-sm text-red-600">Reject</button>
                </div>
              )}
              {s.verificationStatus === "APPROVED" && (
                <button onClick={() => updateStatus(s._id, "SUSPENDED")} className="btn-secondary text-sm text-red-600">Suspend</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSellers;
