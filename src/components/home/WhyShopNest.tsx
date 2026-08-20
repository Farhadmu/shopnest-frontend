const features = [
  {
    icon: "🚚",
    title: "Fast & Trackable Delivery",
    description:
      "Real-time order tracking from checkout to your doorstep. Know exactly where your package is.",
    bg: "bg-brand-gradient",
  },
  {
    icon: "🤖",
    title: "AI Shopping Assistant",
    description:
      "Just describe what you need in plain language. Our AI finds the perfect products for you in seconds.",
    bg: "bg-violet-gradient",
  },
  {
    icon: "🛡️",
    title: "Verified Sellers Only",
    description:
      "Every store is carefully reviewed and moderated by our team so you can shop with full confidence.",
    bg: "bg-teal-gradient",
  },
  {
    icon: "📷",
    title: "Visual Search",
    description:
      "Upload a photo and instantly find similar products. Shopping has never been this easy.",
    bg: "bg-orange-100 text-orange-600",
  },
  {
    icon: "🏪",
    title: "Multi-Vendor Marketplace",
    description:
      "Thousands of independent sellers in one place. Discover unique products and support small businesses.",
    bg: "bg-pink-100 text-pink-600",
  },
  {
    icon: "⚡",
    title: "Smart Recommendations",
    description:
      "Personalized product suggestions based on your browsing and purchase history.",
    bg: "bg-blue-100 text-blue-600",
  },
];

const WhyShopNest = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-14">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Why Choose <span className="text-brand-600">ShopNest</span>?
        </h2>
        <p className="text-gray-500 mt-2 max-w-xl mx-auto">
          Everything you need for a smarter shopping and selling experience — powered by AI.
        </p>
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((item, index) => (
          <div
            key={index}
            className="card p-6 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 ${item.bg} ${
                item.bg.includes("gradient") ? "text-white" : ""
              }`}
            >
              {item.icon}
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">{item.title}</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyShopNest;