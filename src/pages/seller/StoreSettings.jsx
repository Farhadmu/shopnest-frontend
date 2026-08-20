import { useEffect, useState } from "react";
import api from "../../api/client";

const StoreSettings = () => {
  const [store, setStore] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.get("/stores/me").then((res) => setStore(res.data.data));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await api.post("/stores", form);
      setStore(data.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create store");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { data } = await api.patch("/stores/me", { name: store.name, description: store.description });
    setStore(data.data);
    alert("Store updated");
  };

  if (store === null) return <p className="text-gray-400">Loading...</p>;

  if (!store) {
    return (
      <div className="max-w-md">
        <h1 className="text-lg font-bold mb-4">Create Your Store</h1>
        <form onSubmit={handleCreate} className="space-y-3">
          <input required placeholder="Store Name" className="input"
            value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <textarea placeholder="Store description" className="input" rows={3}
            value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <button type="submit" disabled={creating} className="btn-primary">
            {creating ? "Creating..." : "Create Store"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <h1 className="text-lg font-bold mb-4">Store Settings</h1>
      <p className="text-sm text-gray-500 mb-4">
        Status: <span className="font-medium">{store.verificationStatus}</span>
      </p>
      <form onSubmit={handleUpdate} className="space-y-3">
        <input className="input" value={store.name} onChange={(e) => setStore((s) => ({ ...s, name: e.target.value }))} />
        <textarea className="input" rows={3} value={store.description || ""}
          onChange={(e) => setStore((s) => ({ ...s, description: e.target.value }))} />
        <button type="submit" className="btn-primary">Save Changes</button>
      </form>
    </div>
  );
};

export default StoreSettings;
