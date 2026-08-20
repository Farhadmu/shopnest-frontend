import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

const ProductForm = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [aiInputs, setAiInputs] = useState({ productName: "", category: "", features: "" });
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    price: "",
    discountPrice: "",
    stock: "",
    brand: "",
    category: "",
    shortDescription: "",
    description: "",
    tags: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.data));
  }, []);

  const handleGenerate = async () => {
    if (!aiInputs.productName) return alert("Enter a product name first");
    setGenerating(true);
    try {
      const { data } = await api.post("/ai/product-description", aiInputs);
      setForm((f) => ({
        ...f,
        title: f.title || aiInputs.productName,
        description: data.data.description,
        shortDescription: data.data.shortDescription,
        tags: (data.data.tags || []).join(", "),
      }));
      if (data.demo) alert("Demo mode: connect ANTHROPIC_API_KEY on the backend for real AI-generated copy.");
    } catch (err) {
      alert(err.response?.data?.message || "AI generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/products", {
        ...form,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        stock: Number(form.stock),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      navigate("/seller/products");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-bold mb-4">Add Product</h1>

      {/* AI content generator */}
      <div className="card p-4 mb-6 bg-brand-50 border-brand-100">
        <h2 className="font-medium mb-2">✨ AI Product Content Generator</h2>
        <p className="text-xs text-gray-500 mb-3">Provide the basics — AI will draft description, tags, and SEO copy for you.</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input placeholder="Product name" className="input text-sm col-span-2"
            value={aiInputs.productName} onChange={(e) => setAiInputs((a) => ({ ...a, productName: e.target.value }))} />
          <input placeholder="Category" className="input text-sm"
            value={aiInputs.category} onChange={(e) => setAiInputs((a) => ({ ...a, category: e.target.value }))} />
          <input placeholder="Main features (comma separated)" className="input text-sm"
            value={aiInputs.features} onChange={(e) => setAiInputs((a) => ({ ...a, features: e.target.value }))} />
        </div>
        <button type="button" onClick={handleGenerate} disabled={generating} className="btn-secondary text-sm">
          {generating ? "Generating..." : "Generate with AI"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input required placeholder="Product Title" className="input"
          value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        <div className="grid grid-cols-3 gap-2">
          <input required type="number" placeholder="Price (৳)" className="input"
            value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
          <input type="number" placeholder="Discount Price" className="input"
            value={form.discountPrice} onChange={(e) => setForm((f) => ({ ...f, discountPrice: e.target.value }))} />
          <input required type="number" placeholder="Stock" className="input"
            value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input placeholder="Brand" className="input"
            value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} />
          <select className="input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
            <option value="">Select Category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <input placeholder="Short description" className="input"
          value={form.shortDescription} onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))} />
        <textarea placeholder="Full description" rows={4} className="input"
          value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        <input placeholder="Tags (comma separated)" className="input"
          value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />

        <p className="text-xs text-gray-500">New products go to Pending status until an admin approves them.</p>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving..." : "Submit Product"}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
