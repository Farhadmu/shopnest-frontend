import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const price = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice;
  const discountPct = hasDiscount ? Math.round(100 - (price / product.price) * 100) : 0;

  return (
    <Link
      to={`/products/${product.slug}`}
      className="card card-hover overflow-hidden group animate-fadeInUp"
    >
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          />
        ) : (
          <span className="text-gray-300 text-sm">No image</span>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 badge bg-pink-600 text-white shadow-md animate-popIn">
            -{discountPct}%
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[2.5rem] group-hover:text-brand-600 transition-colors">
          {product.title}
        </h3>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="font-bold text-brand-600 text-base">৳{price?.toLocaleString()}</span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">৳{product.price?.toLocaleString()}</span>
          )}
        </div>
        {product.rating > 0 && (
          <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
            <span className="text-amber-500">⭐</span>
            <span className="font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-gray-400">({product.ratingCount})</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
