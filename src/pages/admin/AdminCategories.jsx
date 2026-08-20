import { useEffect, useState } from "react";
import api from "../../api/client";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/categories").then((res) => setCategories(res.data.data));

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/categories", { name });
      setName("");
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    await api.delete(`/categories/${id}`);
    load();
  };

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Categories</h1>
      <form onSubmit={handleCreate} className="flex gap-2 mb-4 max-w-md">
        <input placeholder="Category name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit" disabled={saving} className="btn-primary shrink-0">Add</button>
      </form>

      <div className="card divide-y max-w-md">
        {categories.map((c) => (
          <div key={c._id} className="p-3 flex justify-between items-center">
            <span>{c.name}</span>
            <button onClick={() => handleDelete(c._id)} className="text-red-500 text-sm">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;
