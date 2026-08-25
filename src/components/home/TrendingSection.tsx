"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { FaArrowRight, FaBolt } from "react-icons/fa";
import { ProductCard } from "@/features/products/components/ProductCard";

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  rating: number;
  imageUrl: string;
}

const products: Product[] = [
  {
    id: "1",
    title: "AeroSound Pro Headphones",
    price: 129.99,
    category: "Electronics",
    rating: 4.9,
    imageUrl: "linear-gradient(135deg,#111827,#4f46e5)",
  },
  {
    id: "2",
    title: "Orbit Mechanical Keyboard",
    price: 94.5,
    category: "Accessories",
    rating: 4.8,
    imageUrl: "linear-gradient(135deg,#0f172a,#0891b2)",
  },
  {
    id: "3",
    title: "Nordic Leather Backpack",
    price: 79,
    category: "Fashion",
    rating: 4.9,
    imageUrl: "linear-gradient(135deg,#451a03,#ea580c)",
  },
  {
    id: "4",
    title: "Aura Smart Desk Lamp",
    price: 49.99,
    category: "Home",
    rating: 4.7,
    imageUrl: "linear-gradient(135deg,#312e81,#c026d3)",
  },
];

export default function TrendingSection() {
  return (
    <section className="rounded-[2rem] border border-border bg-muted-bg p-5 sm:p-8">
      <div className="mb-7 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-warm">
            <FaBolt /> Trending now
          </div>
          <h2 className="mt-2 text-3xl font-black text-text">Customer favorites</h2>
        </div>
        <Link href="/products" className="text-sm font-bold text-primary hover:text-primary-hover">
          See more <FaArrowRight className="ml-1 inline" />
        </Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
          >
            <ProductCard product={p} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}