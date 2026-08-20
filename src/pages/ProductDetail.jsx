import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  const load = async () => {
    const { data } = await api.get(`/products/${slug}`);
    setProduct(data.data);
    setRelated(data.related || []);
    const revRes = await api.get(`/reviews/product/${data.data._id}`);
    setReviews(revRes.data.data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [slug]);

  const handleAdd = async () => {
    setAdding(true);
    try {
      await addToCart(product._id, qty);
      alert("Added to cart!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const handleAiSummary = async () => {
    setSummary({ loading: true });
    try {
      const { data } = await api.post("/ai/review-summary", { productId: product._id });
      setSummary(data.data);
    } catch {
      setSummary(null);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post("/reviews", { productId: product._id, ...reviewForm });
      setReviewForm({ rating: 5, comment: "" });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review");
    }
  };

  if (!product) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  const price = product.discountPrice || product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-300">No image</span>
          )}
        </div>

        <div>
          <Link to={`/store/${product.store?.slug}`} className="text-brand-600 text-sm font-medium">
            {product.store?.name}
          </Link>
          <h1 className="text-2xl font-bold mt-1">{product.title}</h1>
          {product.rating > 0 && (
            <div className="text-sm text-gray-500 mt-1">⭐ {product.rating.toFixed(1)} ({product.ratingCount} reviews)</div>
          )}

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-brand-600">৳{price?.toLocaleString()}</span>
            {product.discountPrice && (
              <span className="text-gray-400 line-through">৳{product.price.toLocaleString()}</span>
            )}
          </div>

          <p className="mt-4 text-gray-600">{product.shortDescription}</p>

          <div className="mt-4 text-sm text-gray-500">
            Stock: {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={product.stock}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="input w-20"
            />
            <button
              onClick={handleAdd}
              disabled={adding || product.stock === 0}
              className="btn-primary disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add to Cart"}
            </button>
          </div>

          {product.specifications?.length > 0 && (
            <div className="mt-8">
              <h3 className="font-medium mb-2">Specifications</h3>
              <table className="text-sm w-full">
                <tbody>
                  {product.specifications.map((s, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-1.5 text-gray-500 w-1/3">{s.key}</td>
                      <td className="py-1.5">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mt-10 card p-6">
        <h2 className="font-bold mb-2">Product Description</h2>
        <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
      </div>

      {/* Reviews */}
      <div className="mt-8 card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Customer Reviews ({reviews.length})</h2>
          <button onClick={handleAiSummary} className="btn-secondary text-sm">
            ✨ AI Summarize Reviews
          </button>
        </div>

        {summary && (
          <div className="bg-brand-50 border border-brand-100 rounded-lg p-4 mb-4 text-sm">
            {summary.loading ? (
              <p>Summarizing...</p>
            ) : (
              <>
                <p className="font-medium mb-2">Overall: {summary.overall}</p>
                {summary.positive?.length > 0 && (
                  <div className="mb-2">
                    <p className="font-medium text-green-700">Positive</p>
                    <ul className="list-disc list-inside text-gray-700">
                      {summary.positive.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}
                {summary.negative?.length > 0 && (
                  <div>
                    <p className="font-medium text-red-700">Negative</p>
                    <ul className="list-disc list-inside text-gray-700">
                      {summary.negative.map((n, i) => <li key={i}>{n}</li>)}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {user && (
          <form onSubmit={submitReview} className="mb-6 border-b pb-6">
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm">Your rating:</label>
              <select
                className="input w-20 text-sm"
                value={reviewForm.rating}
                onChange={(e) => setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))}
              >
                {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <textarea
              className="input"
              rows={2}
              placeholder="Write a review..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
            />
            <button type="submit" className="btn-primary text-sm mt-2">Submit Review</button>
          </form>
        )}

        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="border-b pb-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{r.user?.name}</span>
                <span>⭐ {r.rating}</span>
                {r.verifiedPurchase && (
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Verified Purchase</span>
                )}
              </div>
              <p className="text-gray-600 text-sm mt-1">{r.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="font-bold mb-4">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
