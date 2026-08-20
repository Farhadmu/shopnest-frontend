import { useEffect, useState } from "react";
import api from "../../api/client";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");

  const load = () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (role) params.set("role", role);
    api.get(`/admin/users?${params.toString()}`).then((res) => setUsers(res.data.data));
  };

  useEffect(() => { load(); }, [q, role]);

  const toggleStatus = async (user) => {
    const newStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await api.patch(`/admin/users/${user._id}/status`, { status: newStatus });
    load();
  };

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Users</h1>
      <div className="flex gap-2 mb-4">
        <input placeholder="Search by name or email" className="input" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input w-40" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All Roles</option>
          <option value="CUSTOMER">Customer</option>
          <option value="SELLER">Seller</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div className="card divide-y">
        {users.map((u) => (
          <div key={u._id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{u.name} <span className="text-xs text-gray-400">({u.role})</span></p>
              <p className="text-sm text-gray-500">{u.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-0.5 rounded-full ${u.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {u.status}
              </span>
              {u.role !== "ADMIN" && (
                <button onClick={() => toggleStatus(u)} className="text-sm text-brand-600 font-medium">
                  {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;
