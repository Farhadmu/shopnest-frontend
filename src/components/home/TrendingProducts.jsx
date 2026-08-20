import ProductCard from "../ProductCard"; 

const TrendingProducts = () => {
 
  const trendingProductsData = [
    {
      id: 1,
      title: "Aura Studio Pro Wireless Headphones",
      slug: "aura-studio-pro-wireless-headphones",
      price: 25000,
      discountPrice: 21500,
      rating: 4.8,
      ratingCount: 120,
      images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60"],
    },
    {
      id: 2,
      title: "Lumina Desk Lamp with Adjustable Brightness",
      slug: "lumina-desk-lamp",
      price: 8500,
      discountPrice: 6999,
      rating: 4.7,
      ratingCount: 84,
      images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=60"],
    },
    {
      id: 3,
      title: "Mechanical Gaming Keyboard RGB Backlit",
      slug: "mechanical-gaming-keyboard",
      price: 12000,
      discountPrice: 9999,
      rating: 4.9,
      ratingCount: 210,
      images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60"],
    },
    {
      id: 4,
      title: "Handcrafted Ceramic Matcha Tea Set",
      slug: "ceramic-matcha-tea-set",
      price: 5500,
      discountPrice: null,
      rating: 4.6,
      ratingCount: 52,
      images: ["https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60"],
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Trending Products</h2>
          <p className="text-sm text-gray-500 mt-1">The most coveted items this week across all categories.</p>
        </div>
        <a href="/products" className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
          View Collection &rarr;
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {trendingProductsData.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default TrendingProducts;