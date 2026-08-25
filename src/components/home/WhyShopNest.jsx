const features = [
  {
    icon: "🚚",
    title: "Fast & Trackable Delivery",
    description:
      "Real-time order tracking from checkout to your doorstep. Know exactly where your package is.",
    style: {
      background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
    },
    iconClass: "text-white",
  },
  {
    icon: "🤖",
    title: "AI Shopping Assistant",
    description:
      "Just describe what you need in plain language. Our AI finds the perfect products for you in seconds.",
    style: {
      background: "linear-gradient(135deg, var(--color-accent), var(--color-primary-hover))",
    },
    iconClass: "text-white",
  },
  {
    icon: "🛡️",
    title: "Verified Sellers Only",
    description:
      "Every store is carefully reviewed and moderated by our team so you can shop with full confidence.",
    style: {
      background: "linear-gradient(135deg, var(--color-success), #0d9668)",
    },
    iconClass: "text-white",
  },
  {
    icon: "📷",
    title: "Visual Search",
    description:
      "Upload a photo and instantly find similar products. Shopping has never been this easy.",
    style: { background: "color-mix(in srgb, var(--color-warm) 15%, transparent)" },
    iconClass: "text-[var(--color-warm)]",
  },
  {
    icon: "🏪",
    title: "Multi-Vendor Marketplace",
    description:
      "Thousands of independent sellers in one place. Discover unique products and support small businesses.",
    style: { background: "color-mix(in srgb, var(--color-accent) 15%, transparent)" },
    iconClass: "text-[var(--color-accent)]",
  },
  {
    icon: "⚡",
    title: "Smart Recommendations",
    description:
      "Personalized product suggestions based on your browsing and purchase history.",
    style: { background: "color-mix(in srgb, var(--color-primary) 15%, transparent)" },
    iconClass: "text-[var(--color-primary)]",
  },
];

const WhyShopNest = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-14 bg-background">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-secondary">
          Why Choose <span className="inline-block bg-linear-to-r from-slate-900 via-indigo-700 to-primary bg-clip-text font-extrabold text-transparent tracking-[-0.04em]">ShopNest</span>?
        </h2>
        <p className="text-muted mt-2 max-w-xl mx-auto">
          Everything you need for a smarter shopping and selling experience — powered by AI.
        </p>
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((item, index) => (
          <div
            key={index}
            className="bg-surface rounded-xl border border-border shadow-md p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl mb-4 ${item.iconClass}`}
              style={item.style}
            >
              {item.icon}
            </div>
            <h3 className="font-semibold text-text text-lg">{item.title}</h3>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyShopNest;