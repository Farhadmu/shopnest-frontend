import { ProductCard } from "@/features/products/components/ProductCard";
import  WhyShopNest  from "@/components/home/WhyShopNest";
const SAMPLE_PRODUCTS = [
  { id: "1", title: "Wireless Noise-Canceling Headphones", price: 199.99, category: "Electronics", rating: 4.8 },
  { id: "2", title: "Ergonomic Mechanical Keyboard", price: 129.5, category: "Accessories", rating: 4.6 },
  { id: "3", title: "Minimalist Leather Backpack", price: 89.0, category: "Fashion", rating: 4.9 },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="rounded-2xl bg-gradient-to-r from-primary to-secondary p-8 sm:p-12 text-white shadow-lg">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Welcome to ShopNest
        </h1>
        <p className="text-white/80 max-w-2xl text-base sm:text-lg mb-6">
          The next-generation multi-vendor marketplace connecting buyers with verified sellers.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-foreground mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {SAMPLE_PRODUCTS.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>
      <WhyShopNest /> 
    </div>
  );
}
