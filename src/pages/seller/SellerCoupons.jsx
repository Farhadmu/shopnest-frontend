import { useEffect, useState } from "react";
import api from "../../api/client";

const SellerCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: "", type: "PERCENTAGE", value: "", minPurchase: "", expiresAt: "" });
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/coupons/mine").then((res) => setCoupons(res.data.data));

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/coupons", {
        ...form,
        value: Number(form.value),
        minPurchase: Number(form.minPurchase || 0),
      });
      setForm({ code: "", type: "PERCENTAGE", value: "", minPurchase: "", expiresAt: "" });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/coupons/${id}`);
    load();
  };

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Coupons</h1>

      <form onSubmit={handleCreate} className="card p-4 mb-6 grid grid-cols-2 gap-2">
        <input required placeholder="Code (e.g. SHOP10)" className="input"
          value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} />
        <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
          <option value="PERCENTAGE">Percentage</option>
          <option value="FIXED">Fixed Amount</option>
        </select>
        <input required type="number" placeholder="Value" className="input"
          value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} />
        <input type="number" placeholder="Minimum purchase" className="input"
          value={form.minPurchase} onChange={(e) => setForm((f) => ({ ...f, minPurchase: e.target.value }))} />
        <input required type="date" className="input col-span-2"
          value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} />
        <button type="submit" disabled={saving} className="btn-primary col-span-2">
          {saving ? "Creating..." : "Create Coupon"}
        </button>
      </form>

      <div className="card divide-y">
        {coupons.map((c) => (
          <div key={c._id} className="p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{c.code}</p>
              <p className="text-xs text-gray-500">
                {c.type === "PERCENTAGE" ? `${c.value}% off` : `৳${c.value} off`} • Min ৳{c.minPurchase} • Expires {new Date(c.expiresAt).toLocaleDateString()}
              </p>
            </div>
            <button onClick={() => handleDelete(c._id)} className="text-red-500 text-sm">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerCoupons;
