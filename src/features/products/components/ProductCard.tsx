"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Card, CardContent } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Button } from "@heroui/react";
import { formatCurrency } from "@/lib/utils";
import { ProductCardData } from "../types";

export interface ProductCardProps {
  product: ProductCardData;
  onAddToCart?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="flex flex-col h-full">
          <div className="h-44 w-full bg-muted/10 rounded-lg flex items-center justify-center text-4xl mb-4">
            🛒
          </div>
          <div className="flex items-center justify-between mb-2">
            <Chip size="sm" variant="secondary">{product.category}</Chip>
            {product.rating && (
              <span className="text-xs text-warning font-medium">★ {product.rating}</span>
            )}
          </div>
          <Link href={`/products/${product.id}`} className="group">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
              {product.title}
            </h3>
          </Link>
          <p className="text-lg font-bold text-foreground mb-4">
            {formatCurrency(product.price)}
          </p>
          <div className="mt-auto flex items-center gap-2">
            {onAddToCart && (
              <Button onPress={() => onAddToCart(product.id)} variant="primary" size="sm" className="w-full">
                Add to Cart
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
